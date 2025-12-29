import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { isValidLicenseKeyFormat } from "@/lib/license";

export async function POST(request: NextRequest) {
  try {
    const { key, device_id } = await request.json();

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

    if (!device_id || typeof device_id !== "string") {
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

    // 1. License not found
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

    // 2. First use - device_id is null
    if (!licenseData.device_id) {
      await updateDoc(doc(db, "licenses", licenseDoc.id), {
        device_id: device_id,
        device_registered_at: serverTimestamp(),
      });

      return NextResponse.json(
        { 
          status: "active",
          email: licenseData.email,
          createdAt: licenseData.createdAt,
        },
        { status: 200 }
      );
    }

    // 3. Device ID matches - same device
    if (licenseData.device_id === device_id) {
      return NextResponse.json(
        { 
          status: "active",
          email: licenseData.email,
          createdAt: licenseData.createdAt,
        },
        { status: 200 }
      );
    }

    // 4. Device ID mismatch - different device
    return NextResponse.json(
      { 
        status: "device_mismatch",
        message: "Already activated on another device. Contact support to reset."
      },
      { status: 200 }
    );

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

