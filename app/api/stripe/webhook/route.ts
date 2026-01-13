import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { generateLicenseKey } from "@/lib/license";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-11-17.clover" });
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return secret;
}

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
      const stripe = getStripe();
      const webhookSecret = getWebhookSecret();
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

        const db = getAdminDb();
        const licensesRef = db.collection("licenses");
        const existingDocs = await licensesRef.where("stripeSessionId", "==", session.id).get();
        
        if (!existingDocs.empty) {
          console.log("License already exists for session:", session.id);
          break;
        }

        const metadataLicenseKey = (session.metadata?.licenseKey || "").trim().toUpperCase();
        
        if (metadataLicenseKey) {
          // Upgrade flow: update existing trial license rather than creating a new key.
          const snap = await licensesRef.where("key", "==", metadataLicenseKey).limit(1).get();
          if (snap.empty) {
            console.error("Upgrade checkout completed, but license key not found:", metadataLicenseKey);
            break;
          }
          const licenseDoc = snap.docs[0];
          await licenseDoc.ref.update({
            status: "active",
            subscriptionStartedAt: FieldValue.serverTimestamp(),
            stripeSessionId: session.id,
            stripeCustomerId: (session.customer as string) || null,
            stripeSubscriptionId: (session.subscription as string) || null,
          });
          console.log("License upgraded to active:", {
            key: metadataLicenseKey,
            email: customerEmail,
            sessionId: session.id,
          });
          break;
        }

        // Legacy/non-upgrade checkout: keep behavior of creating a new license (no extra email).
        const licenseKey = generateLicenseKey();
        await licensesRef.add({
          key: licenseKey,
          email: customerEmail.toLowerCase().trim(),
          status: "active",
          createdAt: FieldValue.serverTimestamp(),
          boundDeviceId: null,
          deviceBoundAt: null,
          platform: null,
          appVersion: null,
          lastDeviceReset: null,
          stripeSessionId: session.id,
          stripeCustomerId: session.customer as string || null,
          stripeSubscriptionId: session.subscription as string || null,
        });
        console.log("License created (legacy checkout):", {
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

