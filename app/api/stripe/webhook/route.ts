import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { generateLicenseKey, createLicense } from "@/lib/license";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// This is your Stripe webhook secret (different from API secret key)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No stripe-signature header found");
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log("Webhook event received:", event.type);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer email
        const customerEmail = session.customer_details?.email || session.customer_email;
        
        if (!customerEmail) {
          console.error("No customer email found in session:", session.id);
          break;
        }

        console.log("Processing checkout.session.completed for:", customerEmail);

        // Check if license already exists for this session (prevent duplicates)
        const { db } = await import("@/lib/firebase");
        const { collection, query, where, getDocs, addDoc, serverTimestamp } = await import("firebase/firestore");
        
        const licensesRef = collection(db, "licenses");
        const existingQuery = query(licensesRef, where("stripeSessionId", "==", session.id));
        const existingDocs = await getDocs(existingQuery);
        
        if (!existingDocs.empty) {
          console.log("License already exists for session:", session.id);
          break;
        }

        // Generate and store license key with Stripe metadata
        const licenseKey = generateLicenseKey();
        
        await addDoc(licensesRef, {
          key: licenseKey,
          email: customerEmail.toLowerCase().trim(),
          status: "active",
          createdAt: serverTimestamp(),
          device_id: null,
          device_registered_at: null,
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string || null,
          stripeSubscriptionId: session.subscription as string || null,
        });

        console.log("License created:", {
          key: licenseKey,
          email: customerEmail,
          sessionId: session.id,
        });
        break;
      }

      case "customer.subscription.deleted": {
        // Handle subscription cancellation
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription canceled:", subscription.id);
        
        // TODO: Mark license as inactive in Firestore if needed
        // You could add this functionality later
        break;
      }

      case "customer.subscription.updated": {
        // Handle subscription updates (e.g., plan changes)
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        // Handle failed payments
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed for invoice:", invoice.id);
        
        // TODO: Send email notification or deactivate license
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}

