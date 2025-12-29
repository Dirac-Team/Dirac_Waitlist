# Onboarding System Setup Guide

## Overview

The onboarding system guides users through:
1. Email collection
2. Download selection (Intel vs ARM Mac)
3. Payment (Stripe checkout with 4-day trial)
4. Terms of Service acceptance
5. Preferences (apps they use, referral source)
6. Download and license key display

---

## What You Need To Do

### 1. Update Firestore Security Rules

Add these rules to allow device tracking in licenses:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Waitlist collection - allow all writes
    match /waitlist/{document=**} {
      allow read, write: if true;
    }
    
    // Licenses collection - allow server-side access
    match /licenses/{licenseId} {
      allow read, write: if true;
    }
  }
}
```

**Where to update:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab
5. Paste the rules above
6. Click **Publish**

---

### 2. Add Environment Variables to Netlify

Add this new environment variable:

```
ADMIN_API_KEY=your-secure-random-key-here
```

**How to generate a secure key:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use an online generator:
# https://randomkeygen.com/
```

**Where to add:**
1. Netlify Dashboard → Your site → Site settings
2. Environment variables → Add variable
3. Key: `ADMIN_API_KEY`
4. Value: Your generated secure key
5. Click **Save**

---

### 3. Prepare Download Files

You need to host two .dmg files for download:

**File locations:**
- `/public/downloads/dirac-intel.dmg` - For Intel Macs
- `/public/downloads/dirac-arm.dmg` - For Apple Silicon Macs

**Steps:**
1. Create the `public/downloads/` folder in your project
2. Place your built .dmg files there
3. These will be accessible at:
   - `https://dirac.app/downloads/dirac-intel.dmg`
   - `https://dirac.app/downloads/dirac-arm.dmg`

**Note:** If your .dmg files are large (>100MB), consider hosting them on:
- AWS S3
- Google Cloud Storage
- GitHub Releases

Then update the download links in `app/onboarding/page.tsx` (line ~340):
```typescript
href={selectedPlatform === "intel" 
  ? "https://your-cdn.com/dirac-intel.dmg" 
  : "https://your-cdn.com/dirac-arm.dmg"}
```

---

### 4. Update Stripe Webhook Events

In your Stripe webhook configuration, make sure you're listening to:
- ✅ `checkout.session.completed` (already configured)
- ✅ `customer.subscription.deleted` (optional)
- ✅ `invoice.payment_failed` (optional)

**Where to check:**
1. [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Verify events are selected

---

## New API Endpoints

### 1. `/api/license/verify` (Updated)

**Purpose:** Verify license keys and enforce one-device-per-license

**Request:**
```json
{
  "key": "DIRAC-XXXX-YYYY",
  "device_id": "unique-device-hash"
}
```

**Responses:**

**Success - First Use:**
```json
{
  "status": "active",
  "email": "user@example.com",
  "createdAt": "2025-12-29T..."
}
```

**Success - Same Device:**
```json
{
  "status": "active",
  "email": "user@example.com",
  "createdAt": "2025-12-29T..."
}
```

**Error - Different Device:**
```json
{
  "status": "device_mismatch",
  "message": "Already activated on another device. Contact support to reset."
}
```

**Error - Invalid Key:**
```json
{
  "status": "invalid",
  "message": "License key not found"
}
```

---

### 2. `/api/admin/reset-device` (New)

**Purpose:** Admin endpoint to reset device_id for support cases

**Authentication:** Requires `Authorization: Bearer <ADMIN_API_KEY>` header

**Request:**
```json
{
  "key": "DIRAC-XXXX-YYYY"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Device ID reset successfully",
  "key": "DIRAC-XXXX-YYYY"
}
```

**Error Responses:**
```json
{
  "error": "Unauthorized"
}
```
```json
{
  "error": "License key not found"
}
```

**Example Usage (cURL):**
```bash
curl -X POST https://dirac.app/api/admin/reset-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-api-key" \
  -d '{"key": "DIRAC-XXXX-YYYY"}'
```

---

## Firestore Database Schema

### `licenses/{licenseId}` Collection

```typescript
{
  key: string;                    // "DIRAC-XXXX-YYYY"
  email: string;                  // "user@example.com"
  status: "active" | "inactive";  // License status
  createdAt: Timestamp;           // When license was created
  device_id: string | null;       // Unique device hash (null = not activated yet)
  device_registered_at: Timestamp | null; // When device was first registered
  stripeSessionId?: string;       // Optional: Stripe checkout session ID
  stripeSubscriptionId?: string;  // Optional: Stripe subscription ID
}
```

---

## Onboarding Flow

### User Journey:

1. **Homepage** → Click "Try for Free" → `/onboarding`
2. **Step 1: Email** → User enters email
3. **Step 2: Download** → User selects Intel or ARM Mac
4. **Step 3: Payment** → Redirects to Stripe Checkout
5. **Stripe Success** → Redirects to `/onboarding/success?session_id=...`
6. **Success Page** → Fetches license key, shows it, redirects to policy
7. **Step 4: Policy** → User reads and accepts Terms of Service
8. **Step 5: Preferences** → User selects apps and referral source
9. **Complete** → Shows download button and license key

---

## macOS App Integration

### Device ID Generation

The macOS app should generate a unique device ID. Recommended approach:

```swift
// Swift example
import Foundation

func getDeviceID() -> String {
    let service = "app.dirac.license"
    let account = "device_id"
    
    // Try to retrieve existing device ID from Keychain
    if let existingID = KeychainHelper.load(service: service, account: account) {
        return existingID
    }
    
    // Generate new device ID using hardware UUID
    let deviceID = ProcessInfo.processInfo.hostName + "-" + UUID().uuidString
    let hash = deviceID.sha256() // Hash for privacy
    
    // Save to Keychain
    KeychainHelper.save(hash, service: service, account: account)
    
    return hash
}
```

### License Verification Flow

```swift
func verifyLicense(key: String, deviceID: String) async throws -> LicenseStatus {
    let url = URL(string: "https://dirac.app/api/license/verify")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = ["key": key, "device_id": deviceID]
    request.httpBody = try JSONEncoder().encode(body)
    
    let (data, _) = try await URLSession.shared.data(for: request)
    let response = try JSONDecoder().decode(LicenseResponse.self, from: data)
    
    return response.status
}
```

---

## Testing the Flow

### 1. Test Onboarding
1. Go to `http://localhost:3000/` (or your dev URL)
2. Click "Try for Free"
3. Enter a test email
4. Select a platform (Intel or ARM)
5. Click "Continue to Payment"
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete checkout
8. Verify you're redirected to success page with license key
9. Accept terms
10. Fill preferences
11. See download button

### 2. Test Device Tracking
Use the API endpoint directly:

```bash
# First activation (should succeed)
curl -X POST http://localhost:3000/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-YYYY", "device_id": "device-hash-1"}'

# Same device (should succeed)
curl -X POST http://localhost:3000/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-YYYY", "device_id": "device-hash-1"}'

# Different device (should fail with device_mismatch)
curl -X POST http://localhost:3000/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-YYYY", "device_id": "device-hash-2"}'
```

### 3. Test Admin Reset
```bash
curl -X POST http://localhost:3000/api/admin/reset-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-api-key" \
  -d '{"key": "DIRAC-XXXX-YYYY"}'
```

---

## Support Workflow

When a user contacts support saying "I got a new Mac and need to transfer my license":

1. Verify their identity (check email matches license)
2. Use the admin reset endpoint:
   ```bash
   curl -X POST https://dirac.app/api/admin/reset-device \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-admin-api-key" \
     -d '{"key": "DIRAC-XXXX-YYYY"}'
   ```
3. Tell the user to activate on their new device
4. The next activation will register the new device

---

## Important Notes

1. **Device ID Privacy:** The device_id should be a hash, not raw hardware info
2. **Keychain Storage:** Store device_id in macOS Keychain so it persists across app reinstalls
3. **Admin Key Security:** Keep `ADMIN_API_KEY` secret - only use it server-side or in secure scripts
4. **Download Hosting:** If .dmg files are large, use a CDN for better performance
5. **Terms Updates:** If you update `Policy.txt`, also update `/app/terms/page.tsx`

---

## Troubleshooting

### "Device mismatch" error but user only has one Mac
- User may have reinstalled macOS or the app
- Use admin reset endpoint to allow re-activation

### License key not found after payment
- Check Stripe webhook logs in dashboard
- Verify webhook is hitting `/api/stripe/webhook`
- Check Firestore for the license document

### Download links not working
- Verify .dmg files are in `/public/downloads/`
- Check file permissions
- Try accessing directly: `https://dirac.app/downloads/dirac-intel.dmg`

---

## Summary Checklist

- [ ] Update Firestore security rules
- [ ] Add `ADMIN_API_KEY` to Netlify environment variables
- [ ] Place .dmg files in `/public/downloads/` (or update URLs)
- [ ] Update Stripe webhook to include new success URL
- [ ] Test onboarding flow end-to-end
- [ ] Test device tracking with multiple device IDs
- [ ] Test admin reset endpoint
- [ ] Update macOS app to send device_id in license verification

