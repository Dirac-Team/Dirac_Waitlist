import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { isValidLicenseKeyFormat } from "@/lib/license";

export async function POST(request: NextRequest) {
  try {
    const { key, deviceId, platform, appVersion } = await request.json();

    // Validate input
    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { 
          status: "invalid",
          message: "License key is required" 
        },
        { status: 400 }
      );
    }

    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json(
        { 
          status: "invalid",
          message: "Device ID is required" 
        },
        { status: 400 }
      );
    }

    const licenseKey = key.trim().toUpperCase();

    // Validate format
    if (!isValidLicenseKeyFormat(licenseKey)) {
      return NextResponse.json(
        { 
          status: "invalid",
          message: "Invalid license key format" 
        },
        { status: 200 }
      );
    }

    // Get Firestore instance
    const db = getDb();
    const licensesRef = collection(db, "licenses");

    // Query for the license key
    const q = query(licensesRef, where("key", "==", licenseKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { 
          status: "invalid",
          message: "License key not found" 
        },
        { status: 200 }
      );
    }

    // Get license data
    const licenseDoc = querySnapshot.docs[0];
    const licenseData = licenseDoc.data();

    // Check status
    if (licenseData.status !== "active") {
      return NextResponse.json(
        { 
          status: "inactive",
          message: "License key is not active" 
        },
        { status: 200 }
      );
    }

    // --- Device Binding Logic ---
    if (!licenseData.boundDeviceId) {
      // First activation: Store deviceId with license
      await updateDoc(doc(db, "licenses", licenseDoc.id), {
        boundDeviceId: deviceId,
        deviceBoundAt: serverTimestamp(),
        platform: platform || null,
        appVersion: appVersion || null,
      });
      
      console.log(`License ${licenseKey} activated on new device: ${deviceId}`);
      
      return NextResponse.json(
        { 
          status: "active",
          email: licenseData.email,
        },
        { status: 200 }
      );
    } else if (licenseData.boundDeviceId === deviceId) {
      // Returning user: Verify deviceId matches
      
      // Update app version if provided (for analytics/support)
      if (appVersion && appVersion !== licenseData.appVersion) {
        await updateDoc(doc(db, "licenses", licenseDoc.id), {
          appVersion: appVersion,
        });
      }
      
      return NextResponse.json(
        { 
          status: "active",
          email: licenseData.email,
        },
        { status: 200 }
      );
    } else {
      // Mismatch: Return 403
      console.warn(`License ${licenseKey} activation blocked - device mismatch. Expected: ${licenseData.boundDeviceId}, Got: ${deviceId}`);
      
      return NextResponse.json(
        { 
          status: "invalid",
          message: "License already activated on another device" 
        },
        { status: 403 }
      );
    }
    // --- End Device Binding Logic ---

  } catch (error: any) {
    console.error("Error verifying license:", error);
    return NextResponse.json(
      { 
        status: "error",
        message: "Failed to verify license" 
      },
      { status: 500 }
    );
  }
}

// Allow OPTIONS for CORS (if needed)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
