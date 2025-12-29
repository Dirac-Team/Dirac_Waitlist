import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email || undefined,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // Your Dirac Pro price ID
          quantity: 1,
        },
      ],
      success_url: `https://dirac.app/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://dirac.app/onboarding?step=payment`,
      subscription_data: {
        trial_period_days: 4,
      },
      allow_promotion_codes: true, // Optional: allow discount codes
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

