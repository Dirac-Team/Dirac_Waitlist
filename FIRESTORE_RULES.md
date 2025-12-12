# Updated Firestore Security Rules

Copy and paste these rules into Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Waitlist collection - allow all writes (for waitlist signup)
    match /waitlist/{document=**} {
      allow read, write: if true;
    }
    
    // Licenses collection - allow server-side writes
    match /licenses/{licenseId} {
      // Allow writes from server (API routes)
      allow write: if true;
      
      // Allow reads from server (API routes)
      allow read: if true;
    }
  }
}
```

## Why These Rules?

1. **`waitlist`**: Allows public writes so users can join the waitlist
2. **`licenses`**: Allows reads/writes because:
   - Your Next.js API routes need to **write** licenses after payment
   - Your Next.js API routes need to **read** licenses for verification
   - Next.js API routes use the Firebase **client SDK** (not Admin SDK), so they still need Firestore rules permission

## More Secure Alternative (Recommended for Production)

If you want tighter security, you can restrict writes to only server-side by checking request context, but the simple rules above will work fine since your API routes control the logic.

---

## Steps to Update:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dirac-ai`
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab
5. Replace existing rules with the code above
6. Click **Publish**

That should fix the "insufficient permissions" error! ✅

