# Hosting DMG Files - GitHub Releases Solution

## 🚨 Problem
GitHub blocks files larger than 100MB. Your DMG files are:
- `Dirac-ARM.dmg`: 108.18 MB
- `Dirac-intel.dmg`: 112.27 MB

## ✅ Solution: Use GitHub Releases (Free & Recommended)

GitHub Releases are designed for hosting app binaries and have **much higher limits** (2GB per file, 10GB per release).

---

## 📋 Step-by-Step Setup

### **1. Create a GitHub Release**

#### **Option A: Via GitHub Web (Easiest)**

1. Go to your repo: https://github.com/Dirac-Team/Dirac_Waitlist
2. Click **"Releases"** (right sidebar)
3. Click **"Create a new release"**
4. Fill in:
   - **Tag version**: `v1.0.0` (or your current version)
   - **Release title**: `Dirac v1.0.0 - Initial Release`
   - **Description**:
     ```markdown
     ## Dirac macOS App - v1.0.0
     
     ### Downloads
     - **Apple Silicon (M1/M2/M3/M4)**: Download `Dirac-ARM.dmg`
     - **Intel Mac**: Download `Dirac-intel.dmg`
     
     ### Installation
     1. Download the appropriate DMG for your Mac
     2. Open the DMG file
     3. Drag Dirac.app to Applications folder
     4. Launch Dirac from Applications
     5. Enter your license key when prompted
     
     ### What's New
     - Initial release
     - Morning context in 30 seconds
     - Supports GitHub, Stripe, Gmail, Discord, Slack, and more
     
     ---
     
     **Full changelog**: https://github.com/Dirac-Team/Dirac_Waitlist/commits/v1.0.0
     ```
5. **Attach files**:
   - Drag `Dirac-ARM.dmg` and `Dirac-intel.dmg` into the upload area
   - Wait for upload to complete (might take a few minutes)
6. Check **"Set as the latest release"**
7. Click **"Publish release"**

#### **Option B: Via Command Line (Advanced)**

```powershell
# Install GitHub CLI (if not already installed)
# Download from: https://cli.github.com/

# Login to GitHub
gh auth login

# Create release and upload files
cd C:\Users\Petar\Dirac_Waitlist\dirac_waitlist

gh release create v1.0.0 `
  public/downloads/Dirac-ARM.dmg `
  public/downloads/Dirac-intel.dmg `
  --title "Dirac v1.0.0 - Initial Release" `
  --notes "macOS app for morning context in 30 seconds"
```

---

### **2. Get the Download URLs**

After creating the release, GitHub will provide permanent URLs:

```
https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/v1.0.0/Dirac-ARM.dmg
https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/v1.0.0/Dirac-intel.dmg
```

**Format:**
```
https://github.com/{org}/{repo}/releases/download/{tag}/{filename}
```

---

### **3. Update Your Website Links**

Update `app/onboarding/page.tsx`:

```typescript
// OLD (broken)
<a
  href={selectedPlatform === "intel" 
    ? "/downloads/dirac-intel.dmg" 
    : "/downloads/dirac-arm.dmg"}
  download
>
  Download Dirac
</a>

// NEW (GitHub Releases)
<a
  href={selectedPlatform === "intel"
    ? "https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/v1.0.0/Dirac-intel.dmg"
    : "https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/v1.0.0/Dirac-ARM.dmg"}
  download
  target="_blank"
  rel="noopener noreferrer"
>
  Download Dirac
</a>
```

**Better approach (use environment variable):**

Add to `.env.local` (and Netlify env vars):
```bash
NEXT_PUBLIC_DOWNLOAD_VERSION=v1.0.0
```

Then in your code:
```typescript
const downloadVersion = process.env.NEXT_PUBLIC_DOWNLOAD_VERSION || 'v1.0.0';
const downloadUrl = selectedPlatform === "intel"
  ? `https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/${downloadVersion}/Dirac-intel.dmg`
  : `https://github.com/Dirac-Team/Dirac_Waitlist/releases/download/${downloadVersion}/Dirac-ARM.dmg`;
```

---

### **4. Clean Up Local Git**

The files are already in `.gitignore`, so you're good! Just verify:

```powershell
cd C:\Users\Petar\Dirac_Waitlist\dirac_waitlist
git status
```

Should show:
```
Untracked files:
  public/downloads/
```

This is perfect - the files stay local but won't be committed.

---

### **5. Commit & Push Other Changes**

```powershell
cd C:\Users\Petar\Dirac_Waitlist\dirac_waitlist

# Stage all changes except downloads
git add .

# Commit
git commit -m "feat: updated license system, added confetti, improved onboarding"

# Push
git push origin main
```

This should now work since the DMG files are ignored!

---

## 🔄 Updating Releases (Future Versions)

When you release a new version:

1. **Create new release**: `v1.0.1`, `v1.1.0`, etc.
2. **Upload new DMG files** to that release
3. **Update env variable**: `NEXT_PUBLIC_DOWNLOAD_VERSION=v1.1.0`
4. **Deploy** to Netlify

Users will automatically get the latest version!

---

## 📊 Benefits of GitHub Releases

✅ **Free** - No storage costs
✅ **Fast** - GitHub's CDN is worldwide
✅ **Reliable** - 99.9% uptime
✅ **Version control** - Track different app versions
✅ **Analytics** - See download counts
✅ **No limits** - 2GB per file, 10GB per release
✅ **Professional** - Standard practice for open-source apps

---

## 🎯 Alternative: Cloudflare R2 (If you need private files)

If you want files to be private (only accessible to paying customers):

### **Setup:**
1. Create Cloudflare account (free)
2. Go to R2 Storage
3. Create bucket: `dirac-downloads`
4. Upload DMG files
5. Generate signed URLs in your API route

### **Cost:**
- First 10GB storage: **Free**
- First 1 million class A operations: **Free**
- First 10 million class B operations: **Free**

### **Code Example:**
```typescript
// app/api/get-download-link/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get("platform"); // "intel" or "arm"
  const licenseKey = searchParams.get("key");

  // Verify license key first
  // ... license verification logic ...

  // Generate signed URL (expires in 1 hour)
  const signedUrl = await generateR2SignedUrl(
    platform === "intel" ? "Dirac-intel.dmg" : "Dirac-ARM.dmg"
  );

  return NextResponse.json({ downloadUrl: signedUrl });
}
```

---

## 🚀 Recommended Setup (Start Simple)

**For MVP Launch:**
1. ✅ Use **GitHub Releases** (free, public downloads)
2. ✅ Update links in `app/onboarding/page.tsx`
3. ✅ Set `NEXT_PUBLIC_DOWNLOAD_VERSION` env var
4. ✅ Push changes to GitHub

**Later (if needed):**
- Switch to **Cloudflare R2** if you want private downloads
- Add download tracking
- Implement auto-update checks in macOS app

---

## ✅ What to Do Right Now

1. **Create GitHub Release**: Go to repo → Releases → Create new release
2. **Upload DMG files**: Drag both files into the release upload area
3. **Publish release**: Click "Publish release"
4. **Get URLs**: Copy the download URLs GitHub provides
5. **Update code**: Update download links in `app/onboarding/page.tsx`
6. **Deploy**: Push to GitHub (DMG files are now ignored)

---

**Last Updated:** January 2025

