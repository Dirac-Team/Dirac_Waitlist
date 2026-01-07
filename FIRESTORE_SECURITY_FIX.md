# Firestore Security Fix (URGENT)

## 1) Paste this into Firebase → Firestore → Rules (immediately)

This **stops public internet access** to your DB.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Your app will still work **after** you set up Firebase Admin credentials (below), because Admin bypasses rules.

## 2) Add Firebase Admin credentials (Netlify + local)

Use **one** of these approaches:

### Option A (recommended): single JSON env var
- **Env var**: `FIREBASE_SERVICE_ACCOUNT_KEY`
- **Value**: the full service account JSON (as a single line string)

### Option B: split env vars
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (important: keep `\n` as literal `\\n` in env var; code converts to newlines)

## 3) Confirm it’s fixed
- After publishing rules, try opening Firestore from an unauthenticated script / browser SDK: it should fail with **insufficient permissions**.
- Your website API routes should still work (waitlist submit, trial license creation, license verify).


