# Device Binding System - Updated Implementation

## ✅ What Changed

The license verification system has been updated to use a **cleaner schema** with better naming conventions.

---

## 🔄 Schema Changes

### **Old Fields (Deprecated)**
```javascript
{
  device_id: null,
  device_registered_at: null,
}
```

### **New Fields (Current)**
```javascript
{
  boundDeviceId: null,           // Device ID that license is bound to
  deviceBoundAt: null,            // Timestamp when device was bound
  platform: null,                 // "macOS", "Windows", "Linux" (for analytics)
  appVersion: null,               // "1.0.0", "1.1.2", etc. (for support)
  lastDeviceReset: null,          // Timestamp when admin reset device binding
}
```

---

## 📡 API Request Format

### **Endpoint:** `POST /api/license/verify`

**Old Request (Deprecated):**
```json
{
  "key": "DIRAC-XXXX-XXXX-XXXX-XXXX",
  "device_id": "ABC123XYZ"
}
```

**New Request (Required):**
```json
{
  "key": "DIRAC-XXXX-XXXX-XXXX-XXXX",
  "deviceId": "ABC123XYZ",
  "platform": "macOS",           // Optional but recommended
  "appVersion": "1.0.0"          // Optional but recommended
}
```

---

## 📥 API Response Format

### **Success Responses (HTTP 200)**

**First Activation (Device Bound):**
```json
{
  "status": "active",
  "email": "user@example.com"
}
```

**Returning User (Device Match):**
```json
{
  "status": "active",
  "email": "user@example.com"
}
```

### **Error Responses**

**HTTP 403 - Device Mismatch:**
```json
{
  "status": "invalid",
  "message": "License already activated on another device"
}
```

**HTTP 400 - Missing Required Field:**
```json
{
  "status": "invalid",
  "message": "Device ID is required"
}
```

**HTTP 200 - Invalid License:**
```json
{
  "status": "invalid",
  "message": "License key not found"
}
```

**HTTP 200 - Inactive License:**
```json
{
  "status": "inactive",
  "message": "License key is not active"
}
```

---

## 🔧 What You Need to Do (macOS App)

### **1. Update Your HTTP Request**

**Old Code (Deprecated):**
```swift
let body = [
    "key": licenseKey,
    "device_id": deviceId
]
```

**New Code (Required):**
```swift
let body: [String: Any] = [
    "key": licenseKey,
    "deviceId": deviceId,
    "platform": "macOS",
    "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
]
```

### **2. Update Response Handling**

**Old Response Parsing (Deprecated):**
```swift
if response.status == "device_mismatch" {
    // Handle device mismatch
}
```

**New Response Parsing (Required):**
```swift
// Check HTTP status code first
if httpResponse.statusCode == 403 {
    // Device already activated on another device
    showError("License already activated on another device. Contact support to reset.")
    return
}

// Then check JSON response
if response.status == "active" {
    // Success - license is valid
    print("License activated for: \(response.email)")
    allowAppAccess()
} else if response.status == "invalid" {
    // Invalid license
    showError(response.message)
} else if response.status == "inactive" {
    // Subscription canceled/expired
    showError("Your subscription is no longer active.")
}
```

---

## 🔐 Admin Reset Endpoint

### **Endpoint:** `POST /api/admin/reset-device`

**Request:**
```bash
curl -X POST https://dirac.app/api/admin/reset-device \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-XXXX-XXXX-XXXX"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Device binding reset successfully",
  "key": "DIRAC-XXXX-XXXX-XXXX-XXXX"
}
```

**What it does:**
- Sets `boundDeviceId` to `null`
- Sets `deviceBoundAt` to `null`
- Sets `lastDeviceReset` to current timestamp
- User can now activate license on a new device

---

## 🗂️ Firestore Document Example

**Before First Activation:**
```javascript
{
  key: "DIRAC-ABC1-DEF2-GHI3-JKL4",
  email: "user@example.com",
  status: "active",
  createdAt: Timestamp(2025-01-01T12:00:00Z),
  boundDeviceId: null,
  deviceBoundAt: null,
  platform: null,
  appVersion: null,
  lastDeviceReset: null,
  stripeSessionId: "cs_test_...",
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_..."
}
```

**After First Activation:**
```javascript
{
  key: "DIRAC-ABC1-DEF2-GHI3-JKL4",
  email: "user@example.com",
  status: "active",
  createdAt: Timestamp(2025-01-01T12:00:00Z),
  boundDeviceId: "ABC123XYZ",
  deviceBoundAt: Timestamp(2025-01-02T10:30:00Z),
  platform: "macOS",
  appVersion: "1.0.0",
  lastDeviceReset: null,
  stripeSessionId: "cs_test_...",
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_..."
}
```

**After Admin Reset:**
```javascript
{
  key: "DIRAC-ABC1-DEF2-GHI3-JKL4",
  email: "user@example.com",
  status: "active",
  createdAt: Timestamp(2025-01-01T12:00:00Z),
  boundDeviceId: null,
  deviceBoundAt: null,
  platform: "macOS",
  appVersion: "1.0.0",
  lastDeviceReset: Timestamp(2025-01-03T15:45:00Z),
  stripeSessionId: "cs_test_...",
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_..."
}
```

---

## 🔄 Migration Notes

### **Do You Need to Migrate Existing Licenses?**

**No!** The code handles both old and new schemas automatically:
- Old licenses with `device_id` field will continue to work
- New licenses created after this update will use `boundDeviceId`
- If you want to clean up old fields, you can run a Firestore migration (optional)

### **Optional: Clean Up Old Fields**

If you want to migrate existing licenses to the new schema:

1. Go to Firebase Console → Firestore Database
2. Open the `licenses` collection
3. For each document:
   - Rename `device_id` → `boundDeviceId`
   - Rename `device_registered_at` → `deviceBoundAt`
   - Add `platform: null`
   - Add `appVersion: null`
   - Add `lastDeviceReset: null`

**Or use this migration script (Node.js):**
```javascript
// migrate-licenses.js
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

async function migrateLicenses() {
  const snapshot = await db.collection('licenses').get();
  
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    
    // Only migrate if old schema exists
    if ('device_id' in data) {
      batch.update(doc.ref, {
        boundDeviceId: data.device_id,
        deviceBoundAt: data.device_registered_at,
        platform: null,
        appVersion: null,
        lastDeviceReset: null,
        // Delete old fields
        device_id: admin.firestore.FieldValue.delete(),
        device_registered_at: admin.firestore.FieldValue.delete(),
      });
    }
  });
  
  await batch.commit();
  console.log(`Migrated ${snapshot.size} licenses`);
}

migrateLicenses();
```

---

## 📋 Testing Checklist

### **Test on macOS App:**

1. **First Activation:**
   - [ ] Install app on Device A
   - [ ] Enter valid license key
   - [ ] Verify API returns `status: "active"`
   - [ ] Check Firestore: `boundDeviceId` is set

2. **Returning User (Same Device):**
   - [ ] Restart app on Device A
   - [ ] Verify license is automatically validated
   - [ ] Verify API returns `status: "active"`

3. **Different Device (Should Block):**
   - [ ] Install app on Device B
   - [ ] Enter same license key
   - [ ] Verify API returns HTTP 403
   - [ ] Verify error message: "License already activated on another device"

4. **Admin Reset:**
   - [ ] Call admin reset endpoint
   - [ ] Verify Firestore: `boundDeviceId` is now `null`
   - [ ] Verify `lastDeviceReset` timestamp is set
   - [ ] Install app on Device B
   - [ ] Enter license key
   - [ ] Verify API returns `status: "active"`

---

## ✅ Summary

**Changes Made:**
- ✅ Renamed `device_id` → `boundDeviceId`
- ✅ Renamed `device_registered_at` → `deviceBoundAt`
- ✅ Added `platform` field (for analytics)
- ✅ Added `appVersion` field (for support)
- ✅ Added `lastDeviceReset` field (for tracking admin resets)
- ✅ Changed HTTP 200 → 403 for device mismatch
- ✅ Changed `device_mismatch` → `invalid` status

**What You Need to Do:**
1. Update macOS app to send `deviceId` instead of `device_id`
2. Add `platform` and `appVersion` to the request (optional but recommended)
3. Update response handling to check HTTP 403 status code
4. Test all 4 scenarios (first activation, returning user, device mismatch, admin reset)

**Backward Compatibility:**
- ✅ Old licenses with `device_id` field will continue to work
- ✅ API accepts both old and new request formats during transition
- ⚠️ Update your app soon to use the new format

---

## 🆘 Support

If users report "License already activated on another device":

1. Verify the license key in Firestore
2. Check `boundDeviceId` field
3. Use admin reset endpoint to unbind the device
4. User can then activate on new device

**Admin Reset Command:**
```bash
curl -X POST https://dirac.app/api/admin/reset-device \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-XXXX-XXXX-XXXX"}'
```

---

**Last Updated:** January 2025

