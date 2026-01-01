# Subscription Management & Cancellation

## ✅ What's Implemented

Users can now **fully manage their subscriptions** including canceling their free trial or active subscription.

---

## 🎯 How Users Cancel/Manage Subscription

### Method 1: Through Your Website (NEW!)

**URL:** `https://dirac.app/account`

**How it works:**
1. User goes to `/account` page
2. Enters their email
3. Gets redirected to **Stripe Customer Portal**
4. Can cancel, update payment, view invoices, etc.

**Added to navbar:** "Account" link now appears in the navigation bar.

---

### Method 2: From Receipt Email (Already Working)

When users receive Stripe receipt emails, there's a link to the **Stripe Customer Portal** where they can manage everything.

---

## 🔒 What Happens When Users Cancel/Fail Payment

### Scenario 1: User Cancels Subscription
**Webhook Event:** `customer.subscription.deleted`

**What happens:**
1. ✅ Stripe stops charging them
2. ✅ License key is **deactivated** in Firestore (`status: "inactive"`)
3. ✅ Next time Dirac app verifies the license, it will fail
4. ✅ User loses access to the app

---

### Scenario 2: Payment Fails (Card Declined)
**Webhook Event:** `invoice.payment_failed`

**What happens:**
1. ✅ License key is **deactivated** in Firestore
2. ✅ User receives email notification about the failed payment
3. ✅ App stops working
4. ✅ They can reactivate by updating payment method in Stripe portal

---

## 📋 Files Changed/Created

### New Files:
1. **`app/api/create-portal-session/route.ts`**
   - API route to create Stripe Customer Portal sessions
   - Takes user email, finds their Stripe customer ID, redirects to portal

2. **`app/account/page.tsx`**
   - User-facing page to access subscription management
   - Clean UI with email input form
   - Lists what users can do (cancel, update payment, view invoices)

### Modified Files:
1. **`app/api/stripe/webhook/route.ts`**
   - Implemented `customer.subscription.deleted` handler (deactivates license)
   - Implemented `invoice.payment_failed` handler (deactivates license + sends email)

2. **`components/ui/mini-navbar.tsx`**
   - Added "Account" link to navigation

---

## 🧪 Testing Checklist

### Test Cancellation Flow:
1. ✅ Sign up for Dirac with a test card (`4242 4242 4242 4242`)
2. ✅ Go to `/account` page
3. ✅ Enter your test email
4. ✅ Get redirected to Stripe portal
5. ✅ Cancel the subscription
6. ✅ Check Firestore - license should have `status: "inactive"`
7. ✅ Try using the license key in Dirac app - should fail verification

### Test Payment Failure Flow:
1. ✅ Use a test card that will decline: `4000 0000 0000 0341`
2. ✅ Wait for trial to end (or manually trigger webhook in Stripe)
3. ✅ Check Firestore - license should be deactivated
4. ✅ Check email - should receive "Payment Failed" notification

---

## 🎨 Stripe Portal Customization (Optional)

You can customize what appears in the Stripe Customer Portal:

1. Go to [Stripe Dashboard → Settings → Customer Portal](https://dashboard.stripe.com/settings/billing/portal)
2. Customize:
   - Brand colors
   - Logo
   - Which actions users can take (cancel, update payment, etc.)
   - Cancellation survey/feedback
   - Proration settings

---

## 🚨 Important Notes

### During Free Trial (First 4 Days):
- If they cancel **before** the trial ends → **No charge at all** ✅
- If they cancel **after** trial ends → **Charged for that month**, then stops

### Active Subscriptions:
- If they cancel → **Access until end of current billing period** (optional, configurable in Stripe)
- Or → **Immediate cancellation** (what we implemented)

You can change this behavior in:
- `app/api/stripe/webhook/route.ts` → Add grace period logic if desired
- Stripe Dashboard → Product settings

---

## 📧 Email Notifications

### Users Receive Emails For:
1. ✅ **Welcome email** (with license key) - after payment
2. ✅ **Payment failed** - when card is declined
3. ✅ **Stripe receipts** - automatically from Stripe
4. **Cancellation confirmation** - from Stripe (automatic)

### Optional: Add Custom Cancellation Email
If you want to send a custom email when they cancel, add this to the webhook handler:

```typescript
case "customer.subscription.deleted": {
  // ... existing code ...
  
  // Send cancellation email
  await resend.emails.send({
    from: "peter@dirac.app",
    to: licenseData.email,
    subject: "Your Dirac Subscription Has Been Canceled",
    html: `...custom HTML...`,
  });
}
```

---

## ✅ Summary

**Before:** Users could cancel via Stripe receipts, but licenses stayed active indefinitely (security issue!)

**Now:** 
- ✅ Users have a dedicated `/account` page to manage subscriptions
- ✅ Licenses are automatically deactivated when users cancel
- ✅ Payment failures are handled properly with email notifications
- ✅ Clean, user-friendly UI
- ✅ Fully integrated with Stripe Customer Portal

**Deploy and it's ready to go!** 🚀

