# Trial-First Payment Model - Implementation Guide

## 🎯 Overview

Changed from "payment upfront with trial" to "free trial first, payment after 3 days"

---

## 📊 New User Flow

```
Step 1: Email → License Generated (4-day trial starts)
Step 2: Download App → Enter License
Step 3: Use App (Days 1-3)
Step 4: Day 3 Reminder Email: "Trial ending in 24 hours - Add payment"
Step 5: Day 4 (Trial End):
  - If Paid: License stays active
  - If Not Paid: License deactivated, app stops working
```

---

## 🗂️ Firestore Schema Changes

### **License Document (Updated)**

```javascript
{
  key: "DIRAC-XXXX-XXXX-XXXX-XXXX",
  email: "user@example.com",
  
  // Status field (changed)
  status: "trial" | "active" | "expired" | "cancelled",
  
  // Trial tracking (new)
  trialStartedAt: Timestamp,       // When trial began
  trialEndsAt: Timestamp,          // When trial expires (4 days after start)
  trialReminderSent: boolean,      // Whether day 3 reminder was sent
  
  // Subscription tracking (new)
  subscriptionStartedAt: Timestamp | null,  // When they paid
  lastPaymentCheck: Timestamp | null,       // Last time we verified payment
  
  // Device binding (existing)
  boundDeviceId: string | null,
  deviceBoundAt: Timestamp | null,
  platform: string | null,
  appVersion: string | null,
  lastDeviceReset: Timestamp | null,
  
  // Stripe info (existing - now optional)
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null,
  stripeSessionId: string | null,
  
  // Metadata (existing)
  createdAt: Timestamp,
}
```

---

## 🔄 Updated Flow Implementation

### **1. Onboarding Page Changes**

**Remove Payment Step:**
```typescript
// OLD: email → download → payment → success
// NEW: email → download → success (license generated)

Steps:
1. Email (no change)
2. Download (no change)
3. Policy (no change)
4. Preferences (no change)
5. Complete → Generate license immediately
```

### **2. License Generation API**

**Create: `/api/trial/create-license`**

```typescript
POST /api/trial/create-license
Body: { email: string, platform: string }

Response: {
  licenseKey: "DIRAC-XXXX-XXXX-XXXX-XXXX",
  trialEndsAt: "2025-01-11T12:00:00Z",
  email: "user@example.com"
}
```

**Logic:**
1. Validate email
2. Check if user already has a license
3. Generate new license key
4. Create Firestore document:
   ```javascript
   {
     key: licenseKey,
     email: email,
     status: "trial",
     trialStartedAt: now(),
     trialEndsAt: now() + 4 days,
     trialReminderSent: false,
     subscriptionStartedAt: null,
     stripeCustomerId: null,
     stripeSubscriptionId: null,
     // ... other fields
   }
   ```
5. Send welcome email with license key
6. Return license key

### **3. License Verification Changes**

**Update: `/api/license/verify`**

**Add trial check:**
```typescript
// After basic validation...

// Check trial status
if (licenseData.status === "trial") {
  const now = new Date();
  const trialEndsAt = licenseData.trialEndsAt.toDate();
  
  if (now > trialEndsAt) {
    // Trial expired
    return NextResponse.json({
      status: "expired",
      message: "Your free trial has ended. Please upgrade to continue using Dirac.",
      upgradeUrl: "https://dirac.app/upgrade"
    }, { status: 403 });
  }
  
  // Trial still valid
  return NextResponse.json({
    status: "trial",
    email: licenseData.email,
    trialEndsAt: trialEndsAt.toISOString(),
    daysRemaining: Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24))
  }, { status: 200 });
}

// Check if active subscription
if (licenseData.status === "active") {
  // Existing logic...
}
```

### **4. Upgrade Page**

**Create: `/app/upgrade/page.tsx`**

**Purpose:** Allow users to add payment and activate subscription

**Features:**
- Show trial status (days remaining or expired)
- Stripe checkout for $8.99/month
- Pre-fill email from license lookup
- After payment: Update license status from "trial" → "active"

**URL Parameters:**
```
https://dirac.app/upgrade?key=DIRAC-XXXX-XXXX-XXXX-XXXX
```

### **5. Stripe Upgrade Flow**

**New Checkout Session API: `/api/upgrade/create-checkout`**

```typescript
POST /api/upgrade/create-checkout
Body: { licenseKey: string, email: string }

Steps:
1. Verify license exists and is in trial
2. Create Stripe checkout session
3. Set metadata: { licenseKey: "DIRAC-..." }
4. Success URL: /upgrade/success?session_id={CHECKOUT_SESSION_ID}
5. Return checkout URL
```

**Webhook Handler Update:**

When `checkout.session.completed`:
```typescript
1. Get license key from session.metadata.licenseKey
2. Update Firestore license:
   {
     status: "active",
     subscriptionStartedAt: now(),
     stripeCustomerId: session.customer,
     stripeSubscriptionId: session.subscription,
   }
3. Send "Subscription Active" email
```

---

## 📧 Email Templates

### **Email 1: Welcome + License Key (Immediate)**

**Subject:** Welcome to Dirac - Your 4-Day Free Trial Starts Now!

**Content:**
```
Your License Key: DIRAC-XXXX-XXXX-XXXX-XXXX

Download Dirac: https://dirac.app/onboarding?step=download

Your free trial ends in 4 days. No payment required right now!

Next steps:
1. Download the app
2. Enter your license key
3. Configure your apps
4. Enjoy your morning summaries!

We'll remind you on day 3 to add payment if you want to continue.
```

### **Email 2: Trial Reminder (Day 3)**

**Subject:** Your Dirac Trial Ends Tomorrow - Upgrade to Keep Your Morning Magic

**Content:**
```
Hi there,

Your Dirac free trial ends in 24 hours.

To keep using Dirac after your trial:
👉 Upgrade now: https://dirac.app/upgrade?key=DIRAC-XXXX-XXXX-XXXX-XXXX

Only $8.99/month - Cancel anytime.

If you don't upgrade, your license will be deactivated tomorrow.

Questions? Reply to this email.

- The Dirac Team
```

### **Email 3: Trial Expired (Day 4)**

**Subject:** Your Dirac Trial Has Ended

**Content:**
```
Hi there,

Your Dirac free trial has ended.

To continue using Dirac:
👉 Upgrade now: https://dirac.app/upgrade?key=DIRAC-XXXX-XXXX-XXXX-XXXX

Your license key is waiting - just add payment to reactivate.

- The Dirac Team
```

---

## 🤖 Automated Trial Management

### **Option 1: Netlify Scheduled Functions (Recommended)**

**Create: `/netlify/functions/scheduled-trial-check.ts`**

**Schedule:** Runs daily at 9 AM UTC

**Tasks:**
1. Query all licenses where:
   - `status === "trial"`
   - `trialEndsAt <= now() + 24 hours`
   - `trialReminderSent === false`
2. Send day 3 reminder emails
3. Mark `trialReminderSent = true`

4. Query all licenses where:
   - `status === "trial"`
   - `trialEndsAt <= now()`
5. Update status to "expired"
6. Send trial expired emails

**Configure in `netlify.toml`:**
```toml
[[functions]]
  name = "scheduled-trial-check"
  schedule = "0 9 * * *"
```

### **Option 2: Manual Cron (Alternative)**

Use a service like:
- Vercel Cron
- GitHub Actions
- External cron service (cron-job.org)

Hits endpoint: `POST /api/admin/check-trials`

---

## 🔐 Security Considerations

1. **Prevent Abuse:**
   - One trial per email address
   - Check for existing licenses before creating new one
   - Rate limit license creation API

2. **Admin Endpoints:**
   - Require `ADMIN_API_KEY` for trial management endpoints
   - Log all trial status changes

---

## 📋 Implementation Checklist

### **Phase 1: Onboarding Changes**
- [ ] Remove payment step from onboarding flow
- [ ] Update complete step to generate license immediately
- [ ] Create `/api/trial/create-license` endpoint
- [ ] Update welcome email template

### **Phase 2: License Management**
- [ ] Update Firestore license schema
- [ ] Update `/api/license/verify` to check trial status
- [ ] Return trial info to macOS app (days remaining)

### **Phase 3: Upgrade Flow**
- [ ] Create `/app/upgrade/page.tsx`
- [ ] Create `/api/upgrade/create-checkout` endpoint
- [ ] Update Stripe webhook to handle upgrades
- [ ] Send "subscription active" email after upgrade

### **Phase 4: Trial Automation**
- [ ] Create scheduled function for trial checks
- [ ] Implement day 3 reminder email logic
- [ ] Implement trial expiration logic
- [ ] Create "trial expired" email template

### **Phase 5: Testing**
- [ ] Test full trial flow (create → use → expire)
- [ ] Test upgrade flow (trial → paid)
- [ ] Test email delivery (all 3 emails)
- [ ] Test macOS app with trial status

---

## 🔄 Migration Plan

### **For Existing Users (Already Paid)**

**No changes needed** - their licenses already have:
- `status: "active"`
- `stripeSubscriptionId: "sub_..."`

### **For New Users (After This Change)**

They get:
- `status: "trial"`
- `trialEndsAt: now() + 4 days`
- No Stripe info until they upgrade

---

## 📊 Firestore Rules Update

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Licenses collection
    match /licenses/{licenseId} {
      // Allow server-side access (API routes)
      allow read, write: if true;
    }
  }
}
```

No changes needed - already allows full access for server operations.

---

## 🎯 Advantages of New Flow

✅ **Lower friction** - No payment required to try
✅ **Higher conversion** - Users try before buying
✅ **Better UX** - Start using app immediately
✅ **Email engagement** - Reminder emails drive conversions
✅ **Fair trial** - 4 days to evaluate fully

---

## ⚠️ Disadvantages to Consider

⚠️ **More complexity** - Need to manage trials yourself
⚠️ **Email dependency** - Must send reminders reliably
⚠️ **Potential abuse** - Users might create multiple trials
⚠️ **Dev overhead** - Scheduled jobs, trial tracking, etc.

---

## 🚀 Rollout Strategy

1. **Implement on staging first**
2. **Test full flow end-to-end**
3. **Set up scheduled function**
4. **Monitor first few trials closely**
5. **Deploy to production**
6. **Update marketing materials** (mention 4-day free trial)

---

**Estimated Implementation Time:** 4-6 hours

**Files to Create:**
- `/api/trial/create-license/route.ts`
- `/api/upgrade/create-checkout/route.ts`
- `/api/admin/check-trials/route.ts`
- `/app/upgrade/page.tsx`
- `/netlify/functions/scheduled-trial-check.ts`

**Files to Update:**
- `/app/onboarding/page.tsx` (remove payment step)
- `/app/api/license/verify/route.ts` (add trial checking)
- `/app/api/stripe/webhook/route.ts` (handle upgrade payments)

---

**Last Updated:** January 2026

