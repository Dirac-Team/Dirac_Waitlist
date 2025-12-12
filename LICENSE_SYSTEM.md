# License System Documentation

## 🔑 Overview

The license system is entirely self-contained in the Next.js website using Firebase/Firestore. No separate backend needed.

---

## 📊 Firestore Database Structure

### Collection: `licenses`

Each document contains:

```json
{
  "key": "DIRAC-AB12-CD34",
  "email": "user@example.com",
  "status": "active",
  "createdAt": "2025-01-13T10:30:00.000Z",
  "stripeSessionId": "cs_test_xxxxxxxxxxxxx",
  "stripeSubscriptionId": "sub_xxxxxxxxxxxxx",
  "stripeCustomerId": "cus_xxxxxxxxxxxxx"
}
```

**Fields:**
- `key` (string): The license key in format `DIRAC-XXXX-YYYY`
- `email` (string): Customer's email (lowercase)
- `status` (string): `"active"`, `"inactive"`, or `"expired"`
- `createdAt` (string): ISO timestamp when license was created
- `stripeSessionId` (string): Stripe checkout session ID
- `stripeSubscriptionId` (string): Stripe subscription ID
- `stripeCustomerId` (string): Stripe customer ID

---

## 🔄 Complete Flow

### **1. User Purchases Dirac Pro**

```
User visits /pricing
    ↓
Clicks "Buy Dirac Pro"
    ↓
Website calls /api/create-checkout-session
    ↓
Redirects to Stripe Checkout
    ↓
User enters payment info
    ↓
Stripe processes payment
    ↓
Redirects to /payment/success?session_id=xxx
```

### **2. License Generation (Automatic)**

```
Success page loads
    ↓
Calls /api/get-license-for-session?session_id=xxx
    ↓
API:
  1. Retrieves Stripe session
  2. Gets customer email
  3. Generates unique key: DIRAC-XXXX-YYYY
  4. Stores in Firestore:
     {
       key: "DIRAC-AB12-CD34",
       email: "user@example.com",
       status: "active",
       createdAt: "2025-01-13...",
       stripeSessionId: "cs_...",
       stripeSubscriptionId: "sub_...",
     }
  5. Returns license key
    ↓
Success page displays key with copy button
```

### **3. User Activates Desktop App**

```
User opens Dirac macOS app
    ↓
Pastes license key: DIRAC-AB12-CD34
    ↓
Clicks "Activate"
    ↓
App makes HTTPS request:
  POST https://dirac.app/api/license/verify
  Body: { "key": "DIRAC-AB12-CD34" }
    ↓
Website API:
  1. Validates key format
  2. Queries Firestore for license
  3. Checks if status === "active"
  4. Returns response
    ↓
Response:
  ✅ Valid: { "status": "active", "email": "...", "createdAt": "..." }
  ❌ Invalid: { "status": "invalid", "message": "License key not found" }
    ↓
Desktop app unlocks if status === "active"
```

---

## 🛠️ API Endpoints

### **1. Create Checkout Session**
**Endpoint:** `POST /api/create-checkout-session`

**Purpose:** Creates a Stripe Checkout session

**Request:** None

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Usage:** Called by pricing page when user clicks "Buy Dirac Pro"

---

### **2. Get License for Session**
**Endpoint:** `GET /api/get-license-for-session?session_id=xxx`

**Purpose:** Generate and retrieve license key after successful payment

**Request:** Query parameter `session_id` (Stripe checkout session ID)

**Response:**
```json
{
  "licenseKey": "DIRAC-AB12-CD34",
  "email": "user@example.com"
}
```

**Error:**
```json
{
  "error": "No email found in session"
}
```

**Usage:** Called by success page to display license key

---

### **3. Verify License (Desktop App)**
**Endpoint:** `POST /api/license/verify`

**Purpose:** Verify if a license key is valid and active

**Request:**
```json
{
  "key": "DIRAC-AB12-CD34"
}
```

**Response (Valid):**
```json
{
  "status": "active",
  "email": "user@example.com",
  "createdAt": "2025-01-13T10:30:00.000Z"
}
```

**Response (Invalid):**
```json
{
  "status": "invalid",
  "message": "License key not found"
}
```

**Response (Inactive):**
```json
{
  "status": "inactive",
  "message": "License key is not active"
}
```

**Usage:** Called by Dirac macOS app when user clicks "Activate"

**CORS:** Enabled for desktop app to call from any origin

---

## 🎯 Desktop App Integration

### **Example: Activate License in Desktop App**

```javascript
// In your Dirac macOS app (Electron/Swift/etc.)

async function activateLicense(licenseKey) {
  try {
    const response = await fetch('https://dirac.app/api/license/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: licenseKey.trim().toUpperCase()
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'active') {
      // License is valid - unlock app
      console.log('✅ License activated!');
      console.log('Email:', data.email);
      return true;
    } else {
      // License is invalid
      console.log('❌ Invalid license:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error verifying license:', error);
    return false;
  }
}

// Usage
const isValid = await activateLicense('DIRAC-AB12-CD34');
if (isValid) {
  // Show success message
  // Enable app features
} else {
  // Show error message
  // Keep app locked
}
```

---

## 🔐 Security Considerations

### **License Key Generation**
- Uses cryptographically secure random generation
- Format: `DIRAC-XXXX-YYYY` (36^8 = 2.8 trillion combinations)
- Uniqueness checked before storage
- Impossible to guess or brute force

### **Verification**
- All checks happen server-side
- Desktop app cannot bypass validation
- No sensitive data exposed to client
- HTTPS required for all API calls

### **Status Management**
- Licenses can be deactivated (set status to "inactive")
- Can track subscription status via Stripe webhooks
- Can revoke licenses if subscription is canceled

---

## 🚫 Handling Subscription Cancellations

### **Stripe Webhook (To Be Implemented)**

When a subscription is canceled, Stripe sends a webhook. You should:

1. Listen for `customer.subscription.deleted` event
2. Find license by `stripeSubscriptionId`
3. Update status to `"inactive"`

**Example webhook handler:**

```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  let event;
  
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  // Handle subscription cancellation
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    
    // Find and deactivate license
    const db = getDb();
    const licensesRef = collection(db, "licenses");
    const q = query(licensesRef, where("stripeSubscriptionId", "==", subscriptionId));
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { status: "inactive" });
      console.log(`Deactivated license: ${doc.data().key}`);
    }
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 🧪 Testing

### **Test License Generation**
1. Use Stripe test card: `4242 4242 4242 4242`
2. Complete checkout
3. Check success page shows license key
4. Check Firestore for new document in `licenses` collection

### **Test License Verification**
```bash
curl -X POST https://dirac.app/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key":"DIRAC-TEST-1234"}'
```

Expected response:
```json
{
  "status": "invalid",
  "message": "License key not found"
}
```

---

## 📝 Firestore Security Rules

Add these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Licenses collection - read/write only via server
    match /licenses/{licenseId} {
      allow read, write: if false; // No direct client access
    }
    
    // Waitlist collection (your existing collection)
    match /waitlist/{email} {
      allow read: if false;
      allow write: if request.auth == null; // Allow anonymous writes for waitlist
    }
  }
}
```

This ensures licenses can only be accessed via your API routes (server-side), not directly from clients.

---

## 🎉 Summary

✅ **Website generates and stores licenses in Firestore**
✅ **Desktop app verifies via HTTPS API call**
✅ **No local backend needed**
✅ **Secure, scalable, and simple**
✅ **Ready for production**

---

## 🆘 Troubleshooting

### License not showing on success page
- Check browser console for errors
- Verify Stripe session has customer email
- Check Firestore for new license document

### Desktop app can't verify license
- Ensure using HTTPS (not HTTP)
- Check API endpoint is accessible: `https://dirac.app/api/license/verify`
- Verify license key format: `DIRAC-XXXX-YYYY`
- Check Firestore has license with status "active"

### License shows as invalid when it should be active
- Check Firestore document status field
- Verify key is uppercase when querying
- Check for typos in license key

---

Contact: peter@dirac.app

