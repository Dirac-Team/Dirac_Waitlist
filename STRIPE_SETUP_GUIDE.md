# Stripe Payment Setup Guide for Dirac

## ✅ What's Been Done

I've created a complete payment system with:
1. **Pricing page** at `/pricing` with the hero background
2. **Payment success page** at `/payment/success` that displays license keys
3. **Payment cancel page** at `/payment/cancel`
4. **API routes** for Stripe checkout and license retrieval
5. **Updated navbar** to include Pricing link
6. **Installed Stripe package** (`stripe@20.0.0`)

---

## 🚀 What You Need to Do

### 1. Set Up Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account (or log in)
2. Complete your business profile

### 2. Create the Dirac Pro Product in Stripe

1. Go to **Products** in Stripe Dashboard
2. Click **Add product**
3. Fill in:
   - **Name**: `Dirac Pro`
   - **Description**: `Monthly subscription for Dirac - Morning context: 30 seconds, not 20 minutes`
   - **Pricing**: 
     - Type: **Recurring**
     - Price: **$15.00**
     - Billing period: **Monthly**
   - **Trial period**: Set to **4 days**
4. Click **Save product**
5. **IMPORTANT**: Copy the **Price ID** (looks like `price_xxxxxxxxxxxxx`)

### 3. Get Your Stripe API Keys

1. Go to **Developers** → **API keys** in Stripe Dashboard
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)
3. **Copy both keys** (use test keys for development, live keys for production)

### 4. Add Environment Variables

Add these to your `.env.local` file (create it if it doesn't exist):

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx

# Dirac Backend URL (where your FastAPI backend is running)
DIRAC_BACKEND_URL=http://localhost:8000
```

**For Netlify Production:**
1. Go to your Netlify site → **Site configuration** → **Environment variables**
2. Add the same variables but with **LIVE** Stripe keys:
   ```
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
   DIRAC_BACKEND_URL=https://your-backend-url.com
   ```

### 5. Test Locally

1. Start your Next.js dev server:
   ```bash
   cd Dirac_Waitlist
   npm run dev
   ```

3. Visit `http://localhost:3000/pricing`
4. Click **Buy Dirac Pro**
5. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

6. After payment, you should be redirected to `/payment/success` with a license key
7. Copy the license key and test it:
   ```bash
   curl -X POST http://localhost:3000/api/license/verify \
     -H "Content-Type: application/json" \
     -d '{"key":"DIRAC-XXXX-YYYY"}'
   ```

### 6. Set Up Firestore Security Rules

In Firebase Console → Firestore → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Licenses - server-side only
    match /licenses/{licenseId} {
      allow read, write: if false;
    }
    
    // Waitlist - allow anonymous writes
    match /waitlist/{email} {
      allow read: if false;
      allow write: if request.auth == null;
    }
  }
}
```

### 7. Set Up Stripe Webhooks (Optional - For Subscription Cancellations)

If you want to automatically deactivate licenses when subscriptions are canceled:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL to: `https://dirac.app/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Netlify environment variables as `STRIPE_WEBHOOK_SECRET`

(See LICENSE_SYSTEM.md for webhook implementation code)

### 8. Desktop App Integration

Your Dirac macOS app should call the license verification API:

```javascript
// When user clicks "Activate" with license key
const response = await fetch('https://dirac.app/api/license/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: licenseKey })
});

const data = await response.json();

if (data.status === 'active') {
  // ✅ Unlock app
} else {
  // ❌ Show error
}
```

See `LICENSE_SYSTEM.md` for complete desktop app integration guide.

### 9. Deploy to Production

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add Stripe payment integration"
   git push
   ```

2. Netlify will auto-deploy

3. Verify environment variables are set in Netlify

4. Test with live Stripe keys

---

## 📁 Files Created

1. `app/pricing/page.tsx` - Pricing page with payment button
2. `app/api/create-checkout-session/route.ts` - Creates Stripe checkout
3. `app/api/get-license-for-session/route.ts` - Retrieves license key
4. `app/payment/success/page.tsx` - Success page with license display
5. `app/payment/cancel/page.tsx` - Cancel page
6. `components/ui/mini-navbar.tsx` - Updated with Pricing link

---

## 🔗 URLs

- **Pricing**: `https://dirac.app/pricing`
- **Payment Success**: `https://dirac.app/payment/success?session_id=...`
- **Payment Cancel**: `https://dirac.app/payment/cancel`

---

## 🧪 Testing Flow

1. User visits `/pricing`
2. Clicks "Buy Dirac Pro"
3. Redirected to Stripe Checkout
4. Enters payment info (test card in dev)
5. Completes payment
6. Stripe redirects to `/payment/success?session_id=xxx`
7. Success page fetches license key from backend
8. User copies license key
9. User opens Dirac desktop app → Start My Day → pastes key → activates

---

## ⚠️ Important Notes

- **Test mode**: Use test keys for development
- **Live mode**: Switch to live keys for production
- **4-day trial**: User won't be charged until trial ends
- **Cancellation**: Users can cancel anytime in Stripe Customer Portal
- **No login required**: License key is the only authentication

---

## 🐛 Troubleshooting

### "Failed to create checkout session"
- Check `STRIPE_SECRET_KEY` is set correctly
- Check `STRIPE_PRICE_ID` is correct
- Check Stripe API version is compatible

### "Failed to generate license key"
- Check `DIRAC_BACKEND_URL` is correct
- Check backend `/license/create` endpoint exists
- Check backend is running and accessible
- Check CORS is configured correctly

### License key not showing
- Check Stripe session has customer email
- Check backend logs for errors
- Check network tab in browser DevTools

---

## 📞 Support

If you encounter issues, check:
1. Browser console for JavaScript errors
2. Network tab for API call responses
3. Backend logs for server errors
4. Stripe Dashboard → Developers → Logs

Contact: peter@dirac.app

