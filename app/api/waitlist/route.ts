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
        await resend.emails.send({
        from: "onboarding@resend.dev", // Update this with your verified domain
        to: email,
        subject: "Welcome to the Waitlist!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Welcome to the Waitlist</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🎉 You're on the Waitlist!</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; margin-bottom: 20px;">Hi there,</p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Thank you for joining our waitlist! We're excited to have you on board.
                </p>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We'll notify you as soon as our MVP is available. Stay tuned for updates!
                </p>
                <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0; font-weight: bold;">What's Next?</p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>You'll receive priority access when we launch</li>
                    <li>We'll keep you updated on our progress</li>
                    <li>Expect exclusive early access opportunities</li>
                  </ul>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Best regards,<br>
                  The Team
                </p>
              </div>
            </body>
          </html>
        `,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
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

