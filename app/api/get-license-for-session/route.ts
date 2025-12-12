import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer_email && !session.customer_details?.email) {
      return NextResponse.json(
        { error: "No email found in session" },
        { status: 400 }
      );
    }

    const email = session.customer_email || session.customer_details?.email;

    // Call your Dirac backend to create a license
    // Option 1: If you have a backend endpoint
    const backendUrl = process.env.DIRAC_BACKEND_URL || "http://localhost:8000";
    
    try {
      const response = await fetch(`${backendUrl}/license/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to create license from backend");
      }

      const data = await response.json();
      
      return NextResponse.json(
        { 
          licenseKey: data.license_key,
          email: email 
        },
        { status: 200 }
      );
    } catch (backendError) {
      console.error("Backend error:", backendError);
      return NextResponse.json(
        { error: "Failed to generate license key. Please contact support." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error getting license for session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve license" },
      { status: 500 }
    );
  }
}

