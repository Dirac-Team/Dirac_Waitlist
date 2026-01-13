import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";
import { CURRENT_DOWNLOAD_URLS, CURRENT_PUBLIC_VERSION, CURRENT_RELEASE_PAGE_URL } from "@/lib/publicReleases";

const resend = new Resend(process.env.RESEND_API_KEY);

function requireAdminAuth(request: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  const authHeader = request.headers.get("authorization");
  return Boolean(adminKey && authHeader === `Bearer ${adminKey}`);
}

function renderUpdateEmail(toEmail: string) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dirac Update</title></head>
    <body style="margin:0;padding:0;background:#0a0a0a;color:#ededed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;">
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#0a0a0a;">
        <tr><td>
          <table role="presentation" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;">
            <tr><td style="padding:48px 24px 24px 24px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.02em;">Dirac update</h1>
              <p style="margin:12px 0 0 0;color:#bdbdbd;">If you’re stuck on an older build, downloading the latest DMG once will get you onto auto-updating builds.</p>
            </td></tr>

            <tr><td style="padding:0 24px 24px 24px;">
              <div style="border:2px solid #333;padding:18px;background:#111;border-radius:12px;">
                <p style="margin:0 0 10px 0;font-size:13px;color:#999;">
                  Dirac updates automatically after installation. (First install uses a DMG — you never need to download a ZIP manually.)
                </p>
                <p style="margin:0 0 10px 0;font-size:13px;color:#777;">
                  Current release: <a style="color:#777;text-decoration:underline;" href="${CURRENT_RELEASE_PAGE_URL}">${CURRENT_PUBLIC_VERSION}</a>
                </p>
                <p style="margin:0 0 8px 0;color:#ededed;font-weight:700;">Download latest DMG:</p>
                <ul style="margin:0;padding-left:18px;color:#bdbdbd;">
                  <li><a style="color:#ff6a35;text-decoration:none;" href="${CURRENT_DOWNLOAD_URLS.arm}">Apple Silicon (M1/M2/M3/M4)</a></li>
                  <li><a style="color:#ff6a35;text-decoration:none;" href="${CURRENT_DOWNLOAD_URLS.intel}">Intel Mac</a></li>
                </ul>
              </div>
            </td></tr>

            <tr><td style="padding:24px;text-align:center;border-top:1px solid #222;">
              <p style="margin:0;font-size:12px;color:#777;">Sent to ${toEmail}</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>`;
}

export async function POST(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const limit = Math.min(Number(body?.limit ?? 200), 1000);

  // Target: users likely on old builds (appVersion missing)
  const db = getAdminDb();
  const licensesRef = db.collection("licenses");
  const snap = await licensesRef
    .where("status", "in", ["active", "trial"])
    .where("appVersion", "==", null)
    .limit(limit)
    .get();

  let sent = 0;
  const errors: Array<{ docId: string; message: string }> = [];

  for (const doc of snap.docs) {
    const data = doc.data() as any;
    const email = data.email as string | undefined;
    if (!email) continue;
    try {
      await resend.emails.send({
        from: "peter@dirac.app",
        to: email,
        subject: "Dirac update: download the latest build once",
        html: renderUpdateEmail(email),
      });
      await doc.ref.update({
        updateNudgeSentAt: FieldValue.serverTimestamp(),
      });
      sent++;
    } catch (e: any) {
      errors.push({ docId: doc.id, message: e?.message || String(e) });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      candidates: snap.size,
      sent,
      errors,
      note: "This targets licenses with appVersion == null (often older clients).",
    },
    { status: 200 }
  );
}

