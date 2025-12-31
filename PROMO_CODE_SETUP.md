# Promo Code Setup Guide

## What Was Implemented ✅

Your onboarding now supports promo codes! Users can:
1. Enter codes manually on the payment step
2. Use special URLs like `dirac.app/onboarding?promo=PRODUCTHUNT50`
3. Codes are validated before checkout
4. Invalid codes show helpful error messages

---

## What YOU Need To Do (5 Minutes)

### Create Promo Codes in Stripe Dashboard

I've set up the code to work with these recommended promo codes:

---

### 1. **Product Hunt Launch** 🚀

**For:** Product Hunt launch (main promo)

**Steps:**
1. Go to [Stripe Dashboard → Coupons](https://dashboard.stripe.com/coupons)
2. Click **Create coupon**
3. Fill in:
   - **Name:** `Product Hunt Launch - 50% Off`
   - **ID:** `ph-launch-50` (optional, makes it easier to find)
   - **Discount type:** Percentage
   - **Percentage off:** `50`
   - **Duration:** `Once` (applies to first payment only)
4. Click **Create coupon**
5. Click on the coupon you just created
6. Click **Create promotion code**
7. Fill in:
   - **Code:** `DIRAC-PH50` (this is what users type)
   - **Active:** ✅ Yes
   - **Expires:** Set to 7 days after your PH launch date
   - **Maximum redemptions:** `500` (or unlimited)
   - **First-time customers only:** ✅ Yes (recommended)
8. Click **Create**

**✅ You've already created this! It's ready to use.**

**Share on Product Hunt:**
```
🎁 Special launch offer: Use code DIRAC-PH50 for 50% off your first month!
→ dirac.app/onboarding?promo=DIRAC-PH50
```

---

### 2. **Friend Referral** 🤝

**For:** Word-of-mouth marketing

**Steps:**
1. Create coupon:
   - **Name:** `Friend Referral`
   - **Percentage off:** `20`
   - **Duration:** `Forever` (every payment gets 20% off)
2. Create promotion code:
   - **Code:** `FRIEND20`
   - **No expiration**
   - **Unlimited redemptions**
   - **First-time customers only:** ❌ No

**Share URL:**
```
dirac.app/onboarding?promo=FRIEND20
```

---

### 3. **Free First Month** 🎉

**For:** Special occasions, influencer partnerships

**Steps:**
1. Create coupon:
   - **Name:** `Free First Month`
   - **Discount type:** Amount off
   - **Amount off:** `8.99` USD
   - **Duration:** `Once`
2. Create promotion code:
   - **Code:** `FREEMONTH`
   - **Expires:** Set expiration date
   - **Maximum redemptions:** `100`
   - **First-time customers only:** ✅ Yes

---

### 4. **Content Creator Special** 📹

**For:** YouTubers, bloggers, etc.

**Steps:**
1. Create coupon:
   - **Name:** `Content Creator`
   - **Percentage off:** `30`
   - **Duration:** `Repeating`
   - **Duration in months:** `3` (30% off for first 3 months)
2. Create promotion code:
   - **Code:** `CREATOR30`
   - **No expiration**
   - **Limited redemptions:** `50` per creator

---

## How Users Will See It

### Option 1: Manual Entry

1. User goes to payment step
2. Sees "Have a promo code? 🎁" input field
3. Types `PRODUCTHUNT50`
4. Sees "✓ Code will be applied at checkout"
5. Clicks "Continue to Payment"
6. Stripe checkout shows the discount applied

### Option 2: Special URL

1. You share: `dirac.app/onboarding?promo=PRODUCTHUNT50`
2. User clicks link
3. Code is auto-filled in the promo field
4. User proceeds through onboarding
5. Discount automatically applied

---

## URL Examples for Sharing

### Product Hunt:
```
https://dirac.app/onboarding?promo=DIRAC-PH50
```

### Twitter/Social Media:
```
🚀 Dirac is live! Get 50% off with code DIRAC-PH50
👉 dirac.app/onboarding?promo=DIRAC-PH50

Morning context: 30 seconds, not 20 minutes.
```

### Email Signature:
```
Try Dirac - Use code FRIEND20 for 20% off forever
→ dirac.app/onboarding?promo=FRIEND20
```

---

## Testing Your Promo Codes

### Test with Stripe Test Mode:

1. Create test coupons in Stripe **Test Mode**
2. Go to `http://localhost:3000/onboarding?promo=TESTCODE`
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify discount is applied

### Test URLs:
```bash
# Test Product Hunt code
http://localhost:3000/onboarding?promo=DIRAC-PH50

# Test invalid code
http://localhost:3000/onboarding?promo=INVALID

# Test without code
http://localhost:3000/onboarding
```

---

## Tracking & Analytics

### In Stripe Dashboard:

1. **View promo code usage:**
   - Go to [Stripe Dashboard → Promotion Codes](https://dashboard.stripe.com/promotion_codes)
   - See redemption counts, revenue impact

2. **View by customer:**
   - Go to Customers → Select customer
   - See which promo code they used

3. **Revenue impact:**
   - Dashboard shows total discounts given
   - Track MRR with/without discounts

### Add to Your Analytics:

The promo code is stored in the Stripe session metadata. You can track:
- Which codes drive the most signups
- Conversion rate by promo code
- Customer LTV by acquisition source

---

## Error Handling

Users will see helpful errors:

**Invalid code:**
> "Invalid promo code. Please check and try again."

**First-time only code:**
> "This promo code is only valid for new customers."

**Expired code:**
> Stripe automatically blocks it

**Redemption limit reached:**
> Stripe automatically blocks it

---

## Advanced: Multiple Promo Codes

You can create variations:

### Product Hunt variations:
- `DIRAC-PH50` - Main code (50% off first month) ✅ Active
- `DIRAC-PH30` - Backup code (30% off first month)
- `PH50` - Short code (50% off)

### Time-limited codes:
- `LAUNCH2025` - Year-specific
- `NEWYEAR25` - Holiday special
- `SUMMER50` - Seasonal

### Partner codes:
- `YOUTUBE50` - YouTuber promo
- `PODCAST30` - Podcast listener promo
- `TWITTER20` - Twitter follower promo

All codes work with the same system - just create them in Stripe!

---

## FAQ

**Q: Can users stack multiple codes?**
A: No, Stripe allows only one promo code per checkout.

**Q: What if someone uses an expired code?**
A: Stripe automatically rejects it, user sees "Invalid promo code" error.

**Q: Can I change a code after creating it?**
A: You can deactivate it and create a new one. Can't edit the code itself.

**Q: How do I see who used which code?**
A: In Stripe Dashboard → Customers, or in the subscription details.

**Q: Can I limit to specific email domains?**
A: Not directly in Stripe, but you could add custom validation in the API.

**Q: What's the difference between a coupon and a promotion code?**
A: 
- **Coupon** = The discount rules (50% off, $5 off, etc.)
- **Promotion Code** = The customer-facing code (PRODUCTHUNT50)
- One coupon can have multiple promotion codes

---

## Recommended Promo Strategy

### Launch Week (7 days):
```
DIRAC-PH50 - 50% off first month ✅ Active
Expire after 7 days
Max 500 redemptions
```

### Always Available:
```
FRIEND20 - 20% off forever
No expiration
Unlimited redemptions
```

### Special Occasions:
```
Create time-limited codes for:
- Black Friday
- New Year
- Your company anniversary
- Milestone achievements (10K users, etc.)
```

---

## Summary Checklist

- [x] Create coupon (50% off once) ✅ Done
- [x] Create `DIRAC-PH50` promotion code ✅ Done
- [ ] Set expiration date (7 days after launch)
- [ ] Test with Stripe test mode
- [ ] Create `FRIEND20` for referrals (optional)
- [ ] Test the URL: `dirac.app/onboarding?promo=DIRAC-PH50`
- [ ] Add promo code to Product Hunt launch post
- [ ] Add promo code to social media bio
- [ ] Monitor redemptions in Stripe Dashboard

---

## Product Hunt Launch Template

Use this in your PH launch:

**Title:**
> Dirac - Morning context: 30 seconds, not 20 minutes

**Description:**
> Dirac automatically checks all your daily apps with one click. GitHub, Stripe, Gmail, Discord, and more — all in a single morning summary.

**Launch Offer:**
> 🎁 **Product Hunt Special**: Use code **DIRAC-PH50** for 50% off your first month!
> 
> Try it free for 4 days: [dirac.app/onboarding?promo=DIRAC-PH50](https://dirac.app/onboarding?promo=DIRAC-PH50)

---

---

## 🔑 About the API ID (Promotion Code ID)

When you created the promo code in Stripe, you got an **API ID** that looks like:
```
promo_1AbCdEfGhIjKlMnO
```

### **What is it?**
- This is Stripe's internal identifier for your promotion code
- It's automatically generated by Stripe
- Different from the customer-facing code (`DIRAC-PH50`)

### **Do you need to do anything with it?**
**No!** ✅ You don't need to copy it or configure it anywhere.

**How our code works:**
1. User enters `DIRAC-PH50` in your website
2. Your API calls Stripe: "Find promotion code with code = DIRAC-PH50"
3. Stripe returns the promotion code object (with the API ID)
4. Your API uses that ID to apply the discount
5. **All automatic!** 🎉

**When you might use it:**
- If you need to deactivate a code via API (rare)
- If you're building custom admin tools (advanced)
- For debugging in Stripe logs

**For normal use:** Just ignore it. The customer-facing code (`DIRAC-PH50`) is all that matters.

---

**You're all set!** Your code `DIRAC-PH50` is ready to use. 🚀
