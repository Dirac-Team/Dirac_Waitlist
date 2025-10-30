# Waitlist Setup Guide

## Environment Variables

I've created a `.env.local` file in your project root with the following configuration:

### Firebase Configuration
- All Firebase config values are prefixed with `NEXT_PUBLIC_` so they can be accessed on both client and server
- Firebase is used to store waitlist emails in Firestore

### Resend API Key
- `RESEND_API_KEY` is set as a server-side only variable (no `NEXT_PUBLIC_` prefix)

## How to Add Environment Variables

The `.env.local` file has been created automatically. If you need to recreate it manually:

1. Create a file named `.env.local` in the root of your project (`C:\Users\ivanz\MVP\.env.local`)
2. Add the following content:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBfejcUxR2_0mBHO3H_FKzgK2Xmtuu9EpQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dirac-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dirac-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dirac-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=378406806713
NEXT_PUBLIC_FIREBASE_APP_ID=1:378406806713:web:7e1b5bb5e8cdc7e7c46768
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-F6Z1SHS207

# Resend API Key
RESEND_API_KEY=re_awwtTSbn_Dfg9rK7byL5TaBP3siYGFMRb
```

3. **Important**: After creating or modifying `.env.local`, restart your dev server:
   ```bash
   npm run dev
   ```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dirac-ai`
3. Go to Firestore Database
4. Create a database if you haven't already
5. Start in **test mode** (for development) or set up proper security rules for production

## Resend Email Setup

1. The current "from" email in `app/api/waitlist/route.ts` is set to `onboarding@resend.dev`
2. For production, you need to:
   - Verify your domain with Resend, OR
   - Use a verified email address
3. Update the `from` field in `app/api/waitlist/route.ts` with your verified email

## Features Implemented

✅ Email validation
✅ Duplicate email checking
✅ Firestore storage
✅ Automatic confirmation email
✅ Success/error messages
✅ Loading states

## Testing

1. Start your dev server: `npm run dev`
2. Navigate to `/waitlist`
3. Enter an email address
4. Submit the form
5. Check:
   - Firebase Firestore for the stored email
   - Your email inbox for the confirmation email

## Security Notes

- The `.env.local` file is automatically ignored by git (via `.gitignore`)
- Never commit API keys to version control
- For production, use environment variables in your hosting platform (Vercel, etc.)

