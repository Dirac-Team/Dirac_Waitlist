import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-11-17.clover" });
}

export async function POST(request: NextRequest) {
  try {
    const { email, promoCode, licenseKey } = await request.json();

    const normalizedLicenseKey =
      typeof licenseKey === "string" && licenseKey.trim() ? licenseKey.trim().toUpperCase() : null;

    // This endpoint is now used for UPGRADE only (trial is created without Stripe during onboarding).
    if (!normalizedLicenseKey) {
      return NextResponse.json(
        {
          error:
            "Missing licenseKey. Start a free trial in onboarding first, then upgrade using your license key.",
        },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Prepare session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      customer_email: email || undefined,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      // Upgrade flow: charge immediately and redirect to a simple close-tab page.
      success_url: `https://dirac.app/upgrade/success`,
      cancel_url: `https://dirac.app/upgrade?key=${encodeURIComponent(normalizedLicenseKey)}`,
      metadata: {
        licenseKey: normalizedLicenseKey,
      },
      subscription_data: {
        metadata: {
          licenseKey: normalizedLicenseKey,
        },
      },
      // Note: allow_promotion_codes will be set below based on whether user provided a code
    };

    // If promo code provided, validate and apply it
    if (promoCode && promoCode.trim()) {
      try {
        // Find the promotion code in Stripe
        const promoCodes = await stripe.promotionCodes.list({
          code: promoCode.trim().toUpperCase(),
          active: true,
          limit: 1,
        });

        if (promoCodes.data.length === 0) {
          return NextResponse.json(
            { error: "Invalid promo code. Please check and try again." },
            { status: 400 }
          );
        }

        const promoCodeObj = promoCodes.data[0] as Stripe.PromotionCode;

        // Check if code is still valid (not expired, within redemption limits)
        if (promoCodeObj.restrictions?.first_time_transaction && email) {
          // Check if customer already used a promo code
          const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1,
          });
          
          if (existingCustomers.data.length > 0) {
            return NextResponse.json(
              { error: "This promo code is only valid for new customers." },
              { status: 400 }
            );
          }
        }

        // Apply the promo code via discounts
        // Note: Cannot use allow_promotion_codes when discounts is set
        sessionConfig.discounts = [{
          promotion_code: promoCodeObj.id,
        }];

        console.log("Promo code applied:", {
          code: promoCode,
          promoId: promoCodeObj.id,
        });
      } catch (promoError: any) {
        console.error("Error validating promo code:", promoError);
        return NextResponse.json(
          { error: "Unable to validate promo code. Please try again." },
          { status: 400 }
        );
      }
    } else {
      // No promo code provided - allow users to enter one at Stripe checkout
      sessionConfig.allow_promotion_codes = true;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

