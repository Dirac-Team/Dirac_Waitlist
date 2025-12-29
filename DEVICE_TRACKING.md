# Device Tracking Implementation Guide

## Overview

Dirac enforces **one device per license key** to prevent license sharing while allowing legitimate device transfers with support assistance.

---

## How It Works

### 1. First Activation
- User enters license key in macOS app
- App generates a unique `device_id` (hashed hardware identifier)
- App calls `/api/license/verify` with `key` and `device_id`
- API checks Firestore: `device_id` is `null` (first use)
- API stores the `device_id` and returns `"status": "active"`
- App saves license key locally and allows usage

### 2. Subsequent Launches
- App loads saved license key and device_id
- App calls `/api/license/verify` with same `key` and `device_id`
- API checks Firestore: `device_id` matches
- API returns `"status": "active"`
- App continues working

### 3. Different Device Attempt
- User tries to activate same license on another Mac
- New Mac generates different `device_id`
- App calls `/api/license/verify` with `key` and new `device_id`
- API checks Firestore: `device_id` doesn't match stored value
- API returns `"status": "device_mismatch"`
- App shows error: "Already activated on another device. Contact support."

### 4. Support Reset
- User contacts support to transfer license to new Mac
- Support verifies user identity
- Support calls `/api/admin/reset-device` with admin key
- API sets `device_id` back to `null`
- User can now activate on new device

---

## macOS App Implementation

### Device ID Generation

**Requirements:**
- Must be unique per Mac
- Must persist across app reinstalls
- Should be hashed for privacy
- Should survive OS updates

**Recommended Implementation (Swift):**

```swift
import Foundation
import CryptoKit

class DeviceIDManager {
    private let keychainService = "app.dirac.license"
    private let keychainAccount = "device_id"
    
    func getDeviceID() -> String {
        // Try to load existing device ID from Keychain
        if let existingID = loadFromKeychain() {
            return existingID
        }
        
        // Generate new device ID
        let newID = generateDeviceID()
        saveToKeychain(newID)
        return newID
    }
    
    private func generateDeviceID() -> String {
        // Use hardware UUID (survives OS reinstalls)
        let platformExpert = IOServiceGetMatchingService(
            kIOMasterPortDefault,
            IOServiceMatching("IOPlatformExpertDevice")
        )
        
        guard platformExpert > 0 else {
            // Fallback to random UUID if hardware UUID unavailable
            return UUID().uuidString.sha256()
        }
        
        let serialNumberAsCFString = IORegistryEntryCreateCFProperty(
            platformExpert,
            kIOPlatformUUIDKey as CFString,
            kCFAllocatorDefault,
            0
        )
        
        IOObjectRelease(platformExpert)
        
        guard let serialNumber = serialNumberAsCFString?.takeRetainedValue() as? String else {
            return UUID().uuidString.sha256()
        }
        
        // Hash the hardware UUID for privacy
        return serialNumber.sha256()
    }
    
    private func loadFromKeychain() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccount,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let deviceID = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return deviceID
    }
    
    private func saveToKeychain(_ deviceID: String) {
        guard let data = deviceID.data(using: .utf8) else { return }
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: keychainAccount,
            kSecValueData as String: data
        ]
        
        // Delete existing item first
        SecItemDelete(query as CFDictionary)
        
        // Add new item
        SecItemAdd(query as CFDictionary, nil)
    }
}

// SHA256 extension
extension String {
    func sha256() -> String {
        let data = Data(self.utf8)
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }
}
```

### License Verification

```swift
import Foundation

enum LicenseStatus: String, Codable {
    case active
    case invalid
    case inactive
    case deviceMismatch = "device_mismatch"
    case error
}

struct LicenseResponse: Codable {
    let status: LicenseStatus
    let message: String?
    let email: String?
    let createdAt: String?
}

class LicenseManager {
    private let apiURL = "https://dirac.app/api/license/verify"
    private let deviceIDManager = DeviceIDManager()
    
    func verifyLicense(key: String) async throws -> LicenseResponse {
        let deviceID = deviceIDManager.getDeviceID()
        
        guard let url = URL(string: apiURL) else {
            throw NSError(domain: "Invalid URL", code: -1)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: String] = [
            "key": key.uppercased().trimmingCharacters(in: .whitespaces),
            "device_id": deviceID
        ]
        
        request.httpBody = try JSONEncoder().encode(body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "Invalid response", code: -1)
        }
        
        if httpResponse.statusCode != 200 {
            throw NSError(domain: "HTTP \(httpResponse.statusCode)", code: httpResponse.statusCode)
        }
        
        let licenseResponse = try JSONDecoder().decode(LicenseResponse.self, from: data)
        return licenseResponse
    }
}
```

### UI Flow

```swift
import SwiftUI

struct LicenseActivationView: View {
    @State private var licenseKey = ""
    @State private var isVerifying = false
    @State private var errorMessage: String?
    @State private var isActivated = false
    
    private let licenseManager = LicenseManager()
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Activate Dirac")
                .font(.largeTitle)
                .bold()
            
            TextField("Enter License Key", text: $licenseKey)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.allCharacters)
                .disableAutocorrection(true)
            
            if let error = errorMessage {
                Text(error)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
            }
            
            Button(action: activateLicense) {
                if isVerifying {
                    ProgressView()
                        .progressViewStyle(.circular)
                } else {
                    Text("Activate")
                }
            }
            .disabled(licenseKey.isEmpty || isVerifying)
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
    
    private func activateLicense() {
        isVerifying = true
        errorMessage = nil
        
        Task {
            do {
                let response = try await licenseManager.verifyLicense(key: licenseKey)
                
                await MainActor.run {
                    isVerifying = false
                    
                    switch response.status {
                    case .active:
                        // Save license key locally
                        UserDefaults.standard.set(licenseKey, forKey: "license_key")
                        isActivated = true
                        
                    case .deviceMismatch:
                        errorMessage = "This license is already activated on another device. Contact support@dirac.app to transfer your license."
                        
                    case .invalid:
                        errorMessage = "Invalid license key. Please check and try again."
                        
                    case .inactive:
                        errorMessage = "This license is no longer active. Please contact support."
                        
                    case .error:
                        errorMessage = "Failed to verify license. Please try again."
                    }
                }
            } catch {
                await MainActor.run {
                    isVerifying = false
                    errorMessage = "Network error: \(error.localizedDescription)"
                }
            }
        }
    }
}
```

---

## API Reference

### POST `/api/license/verify`

**Request:**
```json
{
  "key": "DIRAC-ABCD-1234",
  "device_id": "a1b2c3d4e5f6..."
}
```

**Response - Active (First Use):**
```json
{
  "status": "active",
  "email": "user@example.com",
  "createdAt": "2025-12-29T12:00:00Z"
}
```

**Response - Active (Same Device):**
```json
{
  "status": "active",
  "email": "user@example.com",
  "createdAt": "2025-12-29T12:00:00Z"
}
```

**Response - Device Mismatch:**
```json
{
  "status": "device_mismatch",
  "message": "Already activated on another device. Contact support to reset."
}
```

**Response - Invalid:**
```json
{
  "status": "invalid",
  "message": "License key not found"
}
```

---

## Support Process

### User Scenario: "I got a new Mac"

**User Request:**
> "I bought a new MacBook and need to use Dirac on it. Can you transfer my license?"

**Support Response:**
1. Verify user identity:
   - Ask for email used for purchase
   - Check Stripe customer email matches
   - Optionally ask for last 4 digits of payment method

2. Reset device binding:
   ```bash
   curl -X POST https://dirac.app/api/admin/reset-device \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
     -d '{"key": "DIRAC-ABCD-1234"}'
   ```

3. Confirm to user:
   > "Your license has been reset. Please activate Dirac on your new Mac using the same license key."

4. Log the reset:
   - Keep a support ticket record
   - Note date and reason for reset
   - Monitor for abuse (multiple resets in short time)

---

## Security Considerations

### 1. Device ID Privacy
- ✅ Hash hardware identifiers before sending to server
- ✅ Don't send raw serial numbers or MAC addresses
- ✅ Use SHA256 or similar one-way hash

### 2. Keychain Storage
- ✅ Store device_id in macOS Keychain
- ✅ Use `kSecAttrAccessibleAfterFirstUnlock` for availability
- ✅ Don't store in UserDefaults (can be easily cleared)

### 3. Admin API Security
- ✅ Require strong API key (32+ random characters)
- ✅ Only use in secure environments (server-side scripts)
- ✅ Rotate key if compromised
- ✅ Log all reset requests for audit trail

### 4. Rate Limiting
Consider adding rate limiting to prevent abuse:
- Max 5 verification attempts per minute per IP
- Max 3 failed attempts per license key per hour
- Alert if same license has 10+ verification attempts in 24h

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Activation Rate**
   - How many licenses are activated within 24h of purchase?
   - Track in Firestore: `device_id !== null`

2. **Device Mismatch Rate**
   - How often do users hit device_mismatch error?
   - High rate may indicate confusion or attempted sharing

3. **Support Reset Frequency**
   - How many device resets per month?
   - Identify patterns (seasonal device upgrades?)

4. **Verification Failures**
   - Track invalid license attempts
   - May indicate piracy attempts or user confusion

### Implementation

Add logging to your API routes:

```typescript
// In verify route
console.log("License verification:", {
  key: licenseKey.substring(0, 10) + "...", // Partial key for privacy
  result: response.status,
  timestamp: new Date().toISOString()
});

// In reset route
console.log("Device reset:", {
  key: licenseKey,
  admin_ip: request.headers.get("x-forwarded-for"),
  timestamp: new Date().toISOString()
});
```

---

## Testing Checklist

- [ ] Generate device ID on first launch
- [ ] Device ID persists after app restart
- [ ] Device ID survives app reinstall (Keychain)
- [ ] First activation succeeds
- [ ] Subsequent launches on same device succeed
- [ ] Activation on different device fails with device_mismatch
- [ ] Admin reset allows re-activation
- [ ] Error messages are user-friendly
- [ ] Network errors are handled gracefully
- [ ] Invalid license key shows appropriate error

---

## FAQ

**Q: What if user reinstalls macOS?**
A: Hardware UUID survives OS reinstalls, so device_id remains the same.

**Q: What if user upgrades their Mac (new logic board)?**
A: Hardware UUID changes. User needs to contact support for device reset.

**Q: Can user have license on multiple Macs?**
A: No, one license = one device. They need to purchase additional licenses.

**Q: What if Keychain is corrupted?**
A: New device_id is generated, causing device_mismatch. User contacts support.

**Q: How to handle family sharing?**
A: Not supported. Each family member needs their own license.

**Q: What about virtual machines?**
A: Each VM has unique hardware UUID, counts as separate device.

---

## Summary

✅ **Implemented:**
- One device per license enforcement
- Device ID tracking in Firestore
- Admin reset endpoint for support
- Graceful error handling

✅ **macOS App Needs:**
- Device ID generation and Keychain storage
- License verification with device_id parameter
- UI for activation and error states

✅ **Support Needs:**
- Access to admin API key
- Process for verifying user identity
- Script/tool to reset device bindings

