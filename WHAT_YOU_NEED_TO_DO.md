# Quick Setup Checklist - What You Need To Do

## 🔥 Critical - Do These First

### 1. Update Firestore Security Rules ⚠️
**Where:** [Firebase Console](https://console.firebase.google.com/) → Your Project → Firestore Database → Rules tab

**Add this:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /waitlist/{document=**} {
      allow read, write: if true;
    }
    match /licenses/{licenseId} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**.

---

### 2. Add Environment Variable to Netlify
**Where:** Netlify Dashboard → Your Site → Site Settings → Environment Variables

**Add:**
- **Key:** `ADMIN_API_KEY`
- **Value:** Generate a secure random key (use `openssl rand -base64 32` or https://randomkeygen.com/)

**Save** and **redeploy** your site.

---

### 3. Update Stripe Webhook Success URL
**Where:** [Stripe Dashboard](https://dashboard.stripe.google.com/webhooks) → Your Webhook → Edit

**Change success_url to:**
```
https://dirac.app/onboarding/success?session_id={CHECKOUT_SESSION_ID}
```

**Save**.

---

### 4. Prepare Download Files
**Option A - Small Files (<100MB):**
1. Create folder: `public/downloads/`
2. Place your .dmg files:
   - `dirac-intel.dmg` (for Intel Macs)
   - `dirac-arm.dmg` (for Apple Silicon)
3. Commit and push

**Option B - Large Files (>100MB):**
1. Upload .dmg files to AWS S3, Google Cloud Storage, or GitHub Releases
2. Get public download URLs
3. Update `app/onboarding/page.tsx` line ~340:
   ```typescript
   href={selectedPlatform === "intel" 
     ? "https://your-cdn.com/dirac-intel.dmg" 
     : "https://your-cdn.com/dirac-arm.dmg"}
   ```

---

## 📱 macOS App Changes Required

### Update License Verification
Your macOS app needs to send `device_id` along with the license key.

**Current API call (OLD):**
```json
POST /api/license/verify
{
  "key": "DIRAC-XXXX-YYYY"
}
```

**New API call (REQUIRED):**
```json
POST /api/license/verify
{
  "key": "DIRAC-XXXX-YYYY",
  "device_id": "unique-device-hash"
}
```

**Implementation:**
See `DEVICE_TRACKING.md` for complete Swift code examples including:
- Device ID generation using hardware UUID
- Keychain storage for persistence
- License verification with device tracking
- UI for activation and error handling

---

## 🧪 Testing

### Test Onboarding Flow
1. Go to your homepage
2. Click "Try for Free"
3. Enter email → Select platform → Pay with test card `4242 4242 4242 4242`
4. Verify you get license key
5. Accept terms → Fill preferences → See download button

### Test Device Tracking
```bash
# First device (should work)
curl -X POST https://dirac.app/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-YYYY", "device_id": "device-1"}'

# Same device (should work)
curl -X POST https://dirac.app/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-YYYY", "device_id": "device-1"}'

# Different device (should fail)
curl -X POST https://dirac.app/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key": "DIRAC-XXXX-YYYY", "device_id": "device-2"}'
```

### Test Admin Reset
```bash
curl -X POST https://dirac.app/api/admin/reset-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -d '{"key": "DIRAC-XXXX-YYYY"}'
```

---

## 📋 Complete Checklist

**Website (Netlify):**
- [ ] Update Firestore rules
- [ ] Add `ADMIN_API_KEY` environment variable
- [ ] Update Stripe webhook success URL
- [ ] Add .dmg files to `/public/downloads/` or update CDN URLs
- [ ] Deploy and test onboarding flow

**macOS App:**
- [ ] Implement device ID generation (see `DEVICE_TRACKING.md`)
- [ ] Store device ID in Keychain
- [ ] Update license verification to send `device_id`
- [ ] Handle `device_mismatch` error in UI
- [ ] Test activation on multiple devices

**Support Process:**
- [ ] Save `ADMIN_API_KEY` in secure location
- [ ] Create support script/tool for device resets
- [ ] Document support process for team

---

## 🆘 Support - Resetting Device for Users

When a user says "I got a new Mac, can you transfer my license?":

1. **Verify their identity** (check email matches purchase)
2. **Run this command:**
   ```bash
   curl -X POST https://dirac.app/api/admin/reset-device \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
     -d '{"key": "DIRAC-XXXX-YYYY"}'
   ```
3. **Tell user:** "Your license has been reset. Please activate on your new Mac."

---

## 📚 Full Documentation

- **`ONBOARDING_SETUP.md`** - Complete onboarding system guide
- **`DEVICE_TRACKING.md`** - Device tracking implementation with Swift code
- **`STRIPE_SETUP_GUIDE.md`** - Stripe configuration
- **`LICENSE_SYSTEM.md`** - License system overview

---

## 🎯 What Changed

### 1. Homepage
- ✅ Added navbar to top
- ✅ Changed button from "Join Waitlist" to "Try for Free"
- ✅ Button now goes to `/onboarding`

### 2. New Onboarding Flow
- ✅ Multi-step wizard: Email → Download → Payment → Policy → Preferences
- ✅ Integrated with Stripe checkout
- ✅ Shows Terms of Service
- ✅ Collects user preferences (apps they use, referral source)
- ✅ Displays license key and download button

### 3. Device Tracking
- ✅ `/api/license/verify` now requires `device_id`
- ✅ Enforces one device per license
- ✅ Returns `device_mismatch` error if different device
- ✅ New admin endpoint `/api/admin/reset-device` for support

### 4. Database Schema
- ✅ Added `device_id` field to licenses
- ✅ Added `device_registered_at` timestamp

---

## ⚡ Quick Start

1. Update Firestore rules (5 min)
2. Add `ADMIN_API_KEY` to Netlify (2 min)
3. Update Stripe webhook URL (2 min)
4. Add .dmg files or update URLs (10 min)
5. Deploy to Netlify (auto)
6. Test onboarding flow (10 min)
7. Update macOS app (see `DEVICE_TRACKING.md`) (1-2 hours)

**Total time:** ~2-3 hours including macOS app changes

---

## 🐛 Troubleshooting

**"Device mismatch" but user only has one Mac:**
→ Use admin reset endpoint

**License key not found after payment:**
→ Check Stripe webhook logs, verify webhook is hitting `/api/stripe/webhook`

**Download links not working:**
→ Verify .dmg files are in `/public/downloads/` or check CDN URLs

**Admin reset returns "Unauthorized":**
→ Check `ADMIN_API_KEY` is set correctly in Netlify and matches your request header

---

## 🎉 You're Done!

Once you complete the checklist above, your onboarding system is live and ready to convert users!

**Questions?** Check the detailed docs or contact support.

