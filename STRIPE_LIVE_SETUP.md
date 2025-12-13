# Stripe Live Account Setup Checklist

## ✅ What You Need To Do

### 1. Get Your Price ID from Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Products** in the left sidebar
3. Find your **Dirac Pro** product
4. Click on it to see the pricing details
5. Copy the **Price ID** (starts with `price_`)
   - It should look like: `price_1AbCdEfGhIjKlMnO`

---

### 2. Add Environment Variables to Netlify

Go to your Netlify dashboard → Site settings → Environment variables → Add:

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**Where to find these:**
- `STRIPE_SECRET_KEY`: Stripe Dashboard → Developers → API keys → Secret key (starts with `sk_live_`)
- `STRIPE_PRICE_ID`: From step 1 above (starts with `price_`)
- `STRIPE_WEBHOOK_SECRET`: From step 3 below (starts with `whsec_`)

---

### 3. Set Up Stripe Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://dirac.app/api/stripe/webhook
   ```
   
4. Click **Select events** and choose these events:
   - ✅ `checkout.session.completed` (REQUIRED - creates license)
   - ✅ `customer.subscription.deleted` (optional - track cancellations)
   - ✅ `customer.subscription.updated` (optional - track plan changes)
   - ✅ `invoice.payment_failed` (optional - track failed payments)

5. Click **Add endpoint**
6. Click on your newly created webhook
7. Click **Reveal** next to "Signing secret"
8. Copy the webhook secret (starts with `whsec_`)
9. Add it to Netlify as `STRIPE_WEBHOOK_SECRET` (see step 2)

---

### 4. Product Catalog (Already Done ✅)

You've already created your product since you have the checkout link. Nothing more needed here!

---

### 5. Test the Flow

After deploying with the new environment variables:

1. Go to https://dirac.app/pricing
2. Click **Buy Dirac Pro**
3. Use a [Stripe test card](https://stripe.com/docs/testing#cards):
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Complete the checkout
5. You should be redirected to the success page with your license key
6. Check Stripe Dashboard → Webhooks → Your endpoint → Should show a successful `checkout.session.completed` event

---

## Endpoint URL Format

For Next.js with `app` directory:
- ✅ **Correct:** `https://dirac.app/api/stripe/webhook`
- ❌ **Wrong:** `https://dirac.app/stripe/webhook`

The `/api/` prefix is required for Next.js API routes.

---

## Why You Need the Webhook

Your current setup creates licenses when users visit the success page. **This has a problem:**

- If a user closes the browser after payment but before the success page loads, no license is created!

**The webhook solves this:**
- Stripe sends a server-to-server notification when payment succeeds
- Your webhook handler creates the license automatically
- Even if the user never visits the success page, they get their license
- The success page can still fetch and display the license via `session_id`

This makes your system more reliable.

---

## Summary

1. ✅ Copy **Price ID** from Stripe Dashboard
2. ✅ Add **3 environment variables** to Netlify
3. ✅ Create **webhook endpoint** in Stripe pointing to `https://dirac.app/api/stripe/webhook`
4. ✅ Select **webhook events** (especially `checkout.session.completed`)
5. ✅ Deploy and test!

---

## Need Help?

If webhooks fail, check:
- Stripe Dashboard → Webhooks → Your endpoint → Event logs
- Netlify Functions logs
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly

