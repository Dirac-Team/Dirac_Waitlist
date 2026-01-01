import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { email, promoCode } = await request.json();

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
      success_url: `https://dirac.app/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://dirac.app/onboarding?step=payment`,
      subscription_data: {
        trial_period_days: 4,
      },
      // Enable customer portal for subscription management
      customer_update: {
        address: "auto",
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

