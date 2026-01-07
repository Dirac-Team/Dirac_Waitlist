import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { isValidLicenseKeyFormat } from "@/lib/license";

export async function POST(request: NextRequest) {
  try {
    const { key, deviceId, device_id, platform, appVersion } = await request.json();
    const resolvedDeviceId = (deviceId ?? device_id) as unknown;

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

    if (!resolvedDeviceId || typeof resolvedDeviceId !== "string") {
      return NextResponse.json(
        { 
          status: "invalid",
          message: "Device ID is required" 
        },
        { status: 400 }
      );
    }

    const licenseKey = key.trim().toUpperCase();
    const normalizedDeviceId = resolvedDeviceId.trim();

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
    const db = getAdminDb();
    const licensesRef = db.collection("licenses");

    // Query for the license key
    const querySnapshot = await licensesRef.where("key", "==", licenseKey).get();

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
    const licenseData = licenseDoc.data() as any;

    // Check status (active OR trial that hasn't expired)
    const status = licenseData.status;
    if (status !== "active") {
      if (status === "trial") {
        const rawTrialEndsAt = licenseData.trialEndsAt;
        let trialEndsAt: Date | null = null;

        // Firestore Timestamp has toDate()
        if (rawTrialEndsAt?.toDate && typeof rawTrialEndsAt.toDate === "function") {
          trialEndsAt = rawTrialEndsAt.toDate();
        } else if (rawTrialEndsAt instanceof Date) {
          trialEndsAt = rawTrialEndsAt;
        } else if (typeof rawTrialEndsAt === "string") {
          const parsed = new Date(rawTrialEndsAt);
          trialEndsAt = Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        if (trialEndsAt && new Date() <= trialEndsAt) {
          // Valid trial → allow activation/verification
        } else {
          return NextResponse.json(
            {
              status: "inactive",
              message: "Trial expired",
            },
            { status: 200 }
          );
        }
      } else {
        return NextResponse.json(
          {
            status: "inactive",
            message: "License key is not active",
          },
          { status: 200 }
        );
      }
    }

    // --- Device Binding Logic ---
    if (!licenseData.boundDeviceId) {
      // First activation: Store deviceId with license
      await licenseDoc.ref.update({
        boundDeviceId: normalizedDeviceId,
        deviceBoundAt: FieldValue.serverTimestamp(),
        platform: platform || null,
        appVersion: appVersion || null,
      });
      
      console.log(`License ${licenseKey} activated on new device: ${normalizedDeviceId}`);
      
      return NextResponse.json(
        { 
          status: "active",
          email: licenseData.email,
        },
        { status: 200 }
      );
    } else if (licenseData.boundDeviceId === normalizedDeviceId) {
      // Returning user: Verify deviceId matches
      
      // Update app version if provided (for analytics/support)
      if (appVersion && appVersion !== licenseData.appVersion) {
        await licenseDoc.ref.update({
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
      console.warn(`License ${licenseKey} activation blocked - device mismatch. Expected: ${licenseData.boundDeviceId}, Got: ${normalizedDeviceId}`);
      
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
