import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Admin endpoint to reset device_id for a license key
// Requires admin API key for security
export async function POST(request: NextRequest) {
  try {
    // Check admin API key
    const authHeader = request.headers.get("authorization");
    const adminKey = process.env.ADMIN_API_KEY?.trim();
    const match = (authHeader || "").match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();

    if (!adminKey || !token || token !== adminKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { key } = await request.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 }
      );
    }

    const licenseKey = key.trim().toUpperCase();

    // Get Firestore instance
    const db = getAdminDb();
    const licensesRef = db.collection("licenses");

    // Query for the license key
    const querySnapshot = await licensesRef.where("key", "==", licenseKey).get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "License key not found" },
        { status: 404 }
      );
    }

    // Get license document
    const licenseDoc = querySnapshot.docs[0];

    // Reset device binding fields
    await licenseDoc.ref.update({
      boundDeviceId: null,
      deviceBoundAt: null,
      lastDeviceReset: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Device binding reset successfully",
        key: licenseKey
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error resetting device ID:", error);
    return NextResponse.json(
      { error: "Failed to reset device ID" },
      { status: 500 }
    );
  }
}

