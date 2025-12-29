import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { generateLicenseKey } from "@/lib/license";

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

    const email = (session.customer_email || session.customer_details?.email)!;
    const subscriptionId = session.subscription as string;

    // Get Firestore instance
    const db = getDb();
    const licensesRef = collection(db, "licenses");

    // Check if this session already has a license (webhook should have created it)
    const existingQuery = query(
      licensesRef,
      where("stripeSessionId", "==", sessionId)
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      // Return existing license key created by webhook
      const existingLicense = existingDocs.docs[0].data();
      return NextResponse.json(
        { 
          licenseKey: existingLicense.key,
          email: email 
        },
        { status: 200 }
      );
    }

    // If webhook hasn't created it yet, wait and retry a few times
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const retryQuery = query(licensesRef, where("stripeSessionId", "==", sessionId));
      const retryDocs = await getDocs(retryQuery);
      
      if (!retryDocs.empty) {
        const license = retryDocs.docs[0].data();
        return NextResponse.json(
          { 
            licenseKey: license.key,
            email: email 
          },
          { status: 200 }
        );
      }
    }

    // Webhook failed - create license as fallback
    console.warn("Webhook did not create license, creating as fallback for session:", sessionId);
    
    let licenseKey = generateLicenseKey();
    
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 10) {
      const keyQuery = query(licensesRef, where("key", "==", licenseKey));
      const keyDocs = await getDocs(keyQuery);
      
      if (keyDocs.empty) {
        break;
      }
      
      licenseKey = generateLicenseKey();
      attempts++;
    }

    // Store license in Firestore
    await addDoc(licensesRef, {
      key: licenseKey,
      email: email.toLowerCase().trim(),
      status: "active",
      createdAt: new Date().toISOString(),
      device_id: null,
      device_registered_at: null,
      stripeSessionId: sessionId,
      stripeSubscriptionId: subscriptionId || null,
      stripeCustomerId: session.customer as string || null,
    });

    console.log("License created (fallback):", {
      key: licenseKey,
      email: email,
      sessionId: sessionId,
    });

    return NextResponse.json(
      { 
        licenseKey: licenseKey,
        email: email 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error getting license for session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve license" },
      { status: 500 }
    );
  }
}
