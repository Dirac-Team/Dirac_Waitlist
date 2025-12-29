import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { generateLicenseKey, createLicense } from "@/lib/license";

const resend = new Resend(process.env.RESEND_API_KEY);

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

        // Send welcome email with license key
        try {
          await resend.emails.send({
            from: "peter@dirac.app",
            to: customerEmail,
            subject: "Welcome to Dirac - Your License Key",
            html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Dirac</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #000000;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
                  <tr>
                    <td style="padding: 0;">
                      <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
                        <!-- Header -->
                        <tr>
                          <td style="padding: 60px 40px 40px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #000000; line-height: 1.2;">
                              Welcome to Dirac!
                            </h1>
                          </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                          <td style="padding: 0 40px;">
                            <div style="background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px); background-size: 24px 24px; padding: 40px; border: 2px solid #000000;">
                              <p style="margin: 0 0 24px 0; font-size: 18px; color: #000000; font-weight: 500;">
                                Your 4-day free trial has started!
                              </p>
                              
                              <!-- License Key Box -->
                              <div style="border: 3px solid #ed5b25; padding: 24px; margin: 32px 0; background-color: #fff8f5; text-align: center;">
                                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">
                                  Your License Key
                                </p>
                                <p style="margin: 0; font-size: 28px; font-weight: 700; color: #ed5b25; font-family: 'Courier New', monospace; letter-spacing: 0.1em;">
                                  ${licenseKey}
                                </p>
                              </div>
                              
                              <p style="margin: 0 0 24px 0; font-size: 16px; color: #333333; line-height: 1.7;">
                                You're all set! Here's how to get started:
                              </p>
                              
                              <!-- Instructions -->
                              <div style="border: 2px solid #000000; padding: 24px; margin: 32px 0; background-color: #ffffff;">
                                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">
                                  Setup Instructions
                                </p>
                                <ol style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                                  <li style="margin-bottom: 12px;"><strong>Download Dirac</strong> from the link in your onboarding flow</li>
                                  <li style="margin-bottom: 12px;"><strong>Open the app</strong> and enter your license key when prompted</li>
                                  <li style="margin-bottom: 12px;"><strong>Configure your apps</strong> - Add Discord, GitHub, Stripe, Gmail, etc.</li>
                                  <li><strong>Start your day</strong> - Click one button to check everything in 30 seconds!</li>
                                </ol>
                              </div>
                              
                              <!-- Trial Info -->
                              <div style="background-color: #f5f5f5; padding: 20px; margin: 32px 0; border-left: 4px solid #ed5b25;">
                                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">
                                  Trial Details
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                                  Your 4-day free trial started today. After the trial, you'll be charged $8.99/month. Cancel anytime from your Stripe customer portal.
                                </p>
                              </div>
                              
                              <p style="margin: 32px 0 0 0; font-size: 15px; color: #666666; line-height: 1.6;">
                                Need help? Reply to this email or contact us at <a href="mailto:peter@dirac.app" style="color: #ed5b25; text-decoration: none;">peter@dirac.app</a>
                              </p>
                            </div>
                          </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                          <td style="padding: 40px 40px 60px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #000000; font-weight: 600;">
                              Dirac
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #666666;">
                              Morning context: 30 seconds, not 20 minutes.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            `,
          });
          
          console.log("Welcome email sent to:", customerEmail);
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail the webhook if email fails
        }
        
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

