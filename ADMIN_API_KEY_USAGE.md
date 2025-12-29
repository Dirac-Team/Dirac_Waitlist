# Admin API Key - What It's For

## Purpose

The `ADMIN_API_KEY` is used to **reset device bindings** when users need to transfer their license to a new Mac.

---

## When You Need It

### Scenario: User Got a New Mac

**User contacts support:**
> "I bought a new MacBook and need to use Dirac on it, but it says 'Already activated on another device'"

**Your response:**
1. Verify their identity (check email matches purchase)
2. Use the admin API to reset their device binding
3. Tell them to activate on their new Mac

---

## How to Use It

### Command:

```bash
curl -X POST https://dirac.app/api/admin/reset-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY_HERE" \
  -d '{"key": "DIRAC-XXXX-YYYY"}'
```

### Success Response:

```json
{
  "success": true,
  "message": "Device ID reset successfully",
  "key": "DIRAC-XXXX-YYYY"
}
```

### Error Responses:

**Unauthorized (wrong API key):**
```json
{
  "error": "Unauthorized"
}
```

**License not found:**
```json
{
  "error": "License key not found"
}
```

---

## Security

⚠️ **Keep this key secret!** Anyone with this key can reset any license.

**Best practices:**
- Store it in a password manager
- Only share with trusted support staff
- Use it only from secure environments (not public computers)
- Rotate it if compromised (update in Netlify environment variables)

---

## Support Workflow Example

### Step 1: Verify User Identity
- Check their email matches the purchase
- Optionally ask for last 4 digits of payment method
- Check Stripe dashboard to confirm they're a customer

### Step 2: Reset Device Binding
```bash
# Replace with actual values
curl -X POST https://dirac.app/api/admin/reset-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc123xyz789..." \
  -d '{"key": "DIRAC-8V62-5GN6"}'
```

### Step 3: Confirm to User
> "Your license has been reset. Please open Dirac on your new Mac and enter your license key to activate."

### Step 4: Log the Reset
Keep a record:
- Date: 2025-12-30
- License: DIRAC-XXXX-YYYY
- Email: user@example.com
- Reason: New MacBook Pro
- Support agent: Your name

---

## Creating a Support Script (Optional)

You can create a simple script to make this easier:

```bash
#!/bin/bash
# save as: reset-license.sh

if [ -z "$1" ]; then
  echo "Usage: ./reset-license.sh DIRAC-XXXX-YYYY"
  exit 1
fi

LICENSE_KEY=$1
ADMIN_KEY="your-admin-api-key-here"

echo "Resetting device for license: $LICENSE_KEY"

curl -X POST https://dirac.app/api/admin/reset-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -d "{\"key\": \"$LICENSE_KEY\"}"

echo ""
echo "Done!"
```

**Usage:**
```bash
chmod +x reset-license.sh
./reset-license.sh DIRAC-8V62-5GN6
```

---

## Monitoring for Abuse

Watch for:
- Same license reset multiple times in short period
- Multiple licenses from same email being reset frequently
- Pattern of resets that suggests license sharing

**Red flags:**
- 3+ resets in 1 month = Possible license sharing
- 10+ resets in 6 months = Likely abuse

**Action:**
- Contact user to understand situation
- Consider limiting resets or requiring additional verification
- In extreme cases, revoke license

---

## FAQ

**Q: How often can a license be reset?**
A: Unlimited, but monitor for abuse.

**Q: Does resetting delete the license?**
A: No, it just clears the device_id so they can activate on a new device.

**Q: Can user have license on 2 Macs simultaneously?**
A: No, one license = one device. They need to purchase another license.

**Q: What if I lose the admin API key?**
A: Generate a new one and update it in Netlify environment variables.

**Q: Can I reset multiple licenses at once?**
A: Not with the current API. You'd need to call it once per license.

---

## Summary

✅ **Admin API Key = Support Tool**
- Used to reset device bindings
- Required for user support when they get new Macs
- Keep it secret and secure
- Log all resets for audit trail

