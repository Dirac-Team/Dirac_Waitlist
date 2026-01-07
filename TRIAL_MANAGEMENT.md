# Trial Management (Firestore) — What to Check + What to Do

## Where trials live
- **Collection**: `licenses`
- **Trial docs**: `status == "trial"`

Key fields used:
- `trialStartedAt` (Timestamp)
- `trialEndsAt` (Timestamp)
- `trialReminderSent` (boolean)
- `email` (string)
- `key` (string, the license key)
- `boundDeviceId` / `deviceBoundAt` (device binding)

## How to check trials
In Firebase Console → Firestore:
- Open **`licenses`**
- Filter: **`status` == `trial`**
- Sort/inspect **`trialEndsAt`**

## What to do
- **Trial still active (now < trialEndsAt)**:
  - Nothing required — `/api/license/verify` allows `status="trial"` until it expires.

- **Trial expired (now ≥ trialEndsAt)**:
  - Set `status` to **`inactive`** (recommended) so it’s clearly expired in the DB.
  - User should upgrade (Stripe) to continue.

- **User upgrades to paid**:
  - Set `status` to **`active`**
  - Fill Stripe fields if you have them: `stripeCustomerId`, `stripeSubscriptionId`, `stripeSessionId`
  - Optionally set `subscriptionStartedAt`

## Quick API sanity check
Use either `deviceId` or `device_id`:

```bash
curl -X POST https://YOUR_DOMAIN/api/license/verify \
  -H "Content-Type: application/json" \
  -d '{"key":"DIRAC-XXXX-YYYY","device_id":"your-device-hash"}'
```


