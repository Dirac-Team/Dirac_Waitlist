import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { Resend } from "resend";

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not set in environment variables");
}
const resend = new Resend(resendApiKey);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Get Firestore instance
    const db = getDb();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const waitlistRef = collection(db, "waitlist");
    const q = query(waitlistRef, where("email", "==", email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    // Add email to Firestore
    const docRef = await addDoc(waitlistRef, {
      email: email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    // Send confirmation email (only if Resend is configured)
    if (resendApiKey) {
      try {
        const emailResult = await resend.emails.send({
          from: "peter@dirac.app",
        to: email,
          subject: "You're on the Dirac Waitlist",
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
                    <!-- Container -->
                    <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
                      <!-- Header Spacer -->
                      <tr>
                        <td style="padding: 60px 40px 40px 40px; text-align: center;">
                          <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: #000000; line-height: 1.2;">
                            You're on the<br>Waitlist
                          </h1>
                        </td>
                      </tr>
                      
                      <!-- Grid Pattern Background -->
                      <tr>
                        <td style="padding: 0 40px; position: relative;">
                          <div style="position: relative; background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px); background-size: 24px 24px; padding: 40px; border: 2px solid #000000;">
                            <!-- Content -->
                            <div style="position: relative; z-index: 1;">
                              <p style="margin: 0 0 24px 0; font-size: 18px; color: #000000; font-weight: 500;">
                                Thank you for joining the Dirac waitlist.
                </p>
                              <p style="margin: 0 0 32px 0; font-size: 16px; color: #333333; line-height: 1.7;">
                                We're building Start My Day — automatically check all your morning apps with one click. Instead of manually opening GitHub, Stripe, Gmail, and analytics across 10+ tabs, Dirac visits each app and presents everything in a single summary view. Morning context: 30 seconds, not 20 minutes.
                              </p>
                              
                              <!-- Info Box -->
                              <div style="border: 2px solid #000000; padding: 24px; margin: 32px 0; background-color: #ffffff;">
                                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">
                                  What's Next
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                                  <li style="margin-bottom: 8px;">Priority access when we launch</li>
                                  <li style="margin-bottom: 8px;">Updates on our progress</li>
                                  <li>Exclusive early access opportunities</li>
                  </ul>
                </div>
                              
                              <p style="margin: 32px 0 0 0; font-size: 15px; color: #666666; line-height: 1.6;">
                                We'll be in touch soon.
                </p>
              </div>
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
        
        console.log("Email sent successfully:", {
          to: email,
          id: emailResult?.data?.id ?? undefined,
          from: "peter@dirac.app"
        });
      } catch (emailError: any) {
        console.error("Error sending email:", {
          error: emailError,
          message: emailError?.message,
          to: email,
          stack: emailError?.stack
        });
        // Don't fail the request if email fails, just log it
      }
    } else {
      console.warn("Resend API key not configured, skipping email send");
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully added to waitlist",
        id: docRef.id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    // Log detailed error for debugging
    console.error("Error details:", errorDetails);
    
    return NextResponse.json(
      { 
        error: "Failed to add email to waitlist",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

