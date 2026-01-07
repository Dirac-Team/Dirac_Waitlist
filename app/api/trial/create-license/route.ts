import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { generateLicenseKey } from "@/lib/license";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const DOWNLOAD_URLS = {
  intel: "https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/v1.0.0/Dirac-intel.dmg",
  arm: "https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/v1.0.0/Dirac-ARM.dmg",
} as const;

export async function POST(request: NextRequest) {
  try {
    const { email, platform, preferences } = await request.json();

    // Validate input
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getDb();
    const licensesRef = collection(db, "licenses");

    // Check if user already has a license
    const existingQuery = query(licensesRef, where("email", "==", normalizedEmail));
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      // User already has a license - return existing one
      const existingLicense = existingDocs.docs[0].data();
      return NextResponse.json(
        {
          licenseKey: existingLicense.key,
          trialEndsAt: existingLicense.trialEndsAt,
          email: normalizedEmail,
          existing: true
        },
        { status: 200 }
      );
    }

    // Generate new license key
    const licenseKey = generateLicenseKey();

    // Calculate trial end date (4 days from now)
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + (4 * 24 * 60 * 60 * 1000)); // 4 days

    // Create license document
    await addDoc(licensesRef, {
      key: licenseKey,
      email: normalizedEmail,
      status: "trial",
      
      // Trial tracking
      trialStartedAt: serverTimestamp(),
      trialEndsAt: trialEndsAt,
      trialReminderSent: false,
      
      // Subscription tracking
      subscriptionStartedAt: null,
      lastPaymentCheck: null,
      
      // Device binding
      boundDeviceId: null,
      deviceBoundAt: null,
      platform: platform || null,
      appVersion: null,
      lastDeviceReset: null,
      
      // Stripe info (will be added when they upgrade)
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripeSessionId: null,
      
      // User preferences
      preferences: preferences || null,
      
      // Metadata
      createdAt: serverTimestamp(),
    });

    console.log("Trial license created:", {
      key: licenseKey,
      email: normalizedEmail,
      trialEndsAt: trialEndsAt.toISOString(),
    });

    // Send welcome email with license key
    try {
      const primaryDownloadUrl =
        platform === "intel" ? DOWNLOAD_URLS.intel : platform === "arm" ? DOWNLOAD_URLS.arm : null;

      await resend.emails.send({
        from: "peter@dirac.app",
        to: normalizedEmail,
        subject: "Welcome to Dirac - Your 4-Day Free Trial Starts Now!",
        html: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Dirac</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #ededed;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #0a0a0a;">
                <tr>
                  <td style="padding: 0;">
                    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 60px 40px 40px 40px; text-align: center;">
                          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #ededed; line-height: 1.2;">
                            Welcome to Dirac!
                          </h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 0 40px;">
                          <div style="background-image: linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px); background-size: 24px 24px; padding: 40px; border: 2px solid #ededed;">
                            <p style="margin: 0 0 24px 0; font-size: 18px; color: #ededed; font-weight: 500;">
                              Your 4-day free trial has started!
                            </p>
                            
                            <!-- License Key Box -->
                            <div style="border: 3px solid #ff6a35; padding: 24px; margin: 32px 0; background-color: #1a1a1a; text-align: center;">
                              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #ededed; text-transform: uppercase; letter-spacing: 0.05em;">
                                Your License Key
                              </p>
                              <p style="margin: 0; font-size: 28px; font-weight: 700; color: #ff6a35; font-family: 'Courier New', monospace; letter-spacing: 0.1em;">
                                ${licenseKey}
                              </p>
                            </div>
                            
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #ededed; line-height: 1.7;">
                              You're all set! Here's how to get started:
                            </p>
                            
                            <!-- Instructions -->
                            <div style="border: 2px solid #ededed; padding: 24px; margin: 32px 0; background-color: #0a0a0a;">
                              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #ededed; text-transform: uppercase; letter-spacing: 0.05em;">
                                Setup Instructions
                              </p>
                              <ol style="margin: 0; padding-left: 20px; color: #ededed; font-size: 15px; line-height: 1.8;">
                                <li style="margin-bottom: 12px;"><strong>Download Dirac</strong> ${
                                  primaryDownloadUrl
                                    ? `for your Mac here: <a href="${primaryDownloadUrl}" style="color: #ff6a35;">Download</a>`
                                    : `using one of the links below`
                                }</li>
                                <li style="margin-bottom: 12px;"><strong>Install</strong>: Open the DMG and drag Dirac to Applications</li>
                                <li style="margin-bottom: 12px;"><strong>Open the app</strong> and paste your license key</li>
                                <li style="margin-bottom: 12px;"><strong>Configure your apps</strong> (GitHub, Gmail, Stripe, Discord, etc.)</li>
                                <li><strong>Start your day</strong> - Click one button to check everything in 30 seconds!</li>
                              </ol>
                            </div>

                            <!-- macOS Gatekeeper Help -->
                            <div style="border: 2px solid #333; padding: 20px; margin: 24px 0; background-color: #111;">
                              <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #ededed; text-transform: uppercase; letter-spacing: 0.05em;">
                                If macOS blocks the app
                              </p>
                              <p style="margin: 0 0 10px 0; font-size: 14px; color: #999; line-height: 1.6;">
                                If you see “can’t be opened” / “unidentified developer”, open <strong>System Settings → Privacy &amp; Security</strong> and click <strong>Open Anyway</strong>, or run:
                              </p>
                              <pre style="margin: 0; padding: 12px; background: #000; color: #ededed; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.5;"><code>sudo xattr -rd com.apple.quarantine /Applications/Dirac.app</code></pre>
                            </div>

                            <!-- Downloads (backup) -->
                            <div style="border: 2px solid #333; padding: 20px; margin: 24px 0; background-color: #111; text-align: center;">
                              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #ededed; text-transform: uppercase; letter-spacing: 0.05em;">
                                Download Links (Backup)
                              </p>
                              <p style="margin: 0 0 10px 0; font-size: 14px; color: #999;">
                                Apple Silicon (M1/M2/M3/M4): <a href="${DOWNLOAD_URLS.arm}" style="color: #ff6a35; text-decoration: none;">Download</a>
                              </p>
                              <p style="margin: 0; font-size: 14px; color: #999;">
                                Intel Mac: <a href="${DOWNLOAD_URLS.intel}" style="color: #ff6a35; text-decoration: none;">Download</a>
                              </p>
                            </div>
                            
                            <!-- Trial Info -->
                            <div style="background-color: #1a1a1a; padding: 20px; margin: 32px 0; border-left: 4px solid #ff6a35;">
                              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #ededed;">
                                Trial Details
                              </p>
                              <p style="margin: 0; font-size: 14px; color: #999; line-height: 1.6;">
                                Your 4-day free trial started today. No payment required right now. If you want to keep using Dirac after the trial, you can upgrade any time.
                              </p>
                            </div>
                            
                            <p style="margin: 32px 0 0 0; font-size: 15px; color: #999; line-height: 1.6;">
                              Need help? Reply to this email or contact us at <a href="mailto:peter@dirac.app" style="color: #ff6a35; text-decoration: none;">peter@dirac.app</a>
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 40px 40px 60px 40px; text-align: center; border-top: 1px solid #333;">
                          <p style="margin: 0 0 8px 0; font-size: 14px; color: #ededed; font-weight: 600;">
                            Dirac
                          </p>
                          <p style="margin: 0; font-size: 13px; color: #999;">
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
      
      console.log("Welcome email sent to:", normalizedEmail);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        licenseKey,
        trialEndsAt: trialEndsAt.toISOString(),
        email: normalizedEmail,
        existing: false
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error creating trial license:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create trial license" },
      { status: 500 }
    );
  }
}

