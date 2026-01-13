import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { Resend } from "resend";
import { FieldValue } from "firebase-admin/firestore";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function requireCronAuth(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  return Boolean(secret && authHeader === `Bearer ${secret}`);
}

function toDateMaybe(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function upgradeUrlForKey(key: string) {
  // key is already normalized like DIRAC-XXXX-YYYY
  return `https://dirac.app/upgrade?key=${encodeURIComponent(key)}`;
}

function renderEmailHtml(params: {
  type: "day3" | "postExpiry";
  licenseKey: string;
  upgradeUrl: string;
  trialEndsAtIso?: string | null;
}) {
  const title =
    params.type === "day3" ? "Your Dirac trial is ending soon" : "Your Dirac trial has ended";
  const subtitle =
    params.type === "day3"
      ? "Keep using Dirac without interruption."
      : "If you want to keep using Dirac, you can upgrade in one click.";

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;color:#ededed;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;">
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#0a0a0a;">
        <tr>
          <td style="padding:0;">
            <table role="presentation" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;">
              <tr>
                <td style="padding:48px 24px 24px 24px;text-align:center;">
                  <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.02em;color:#ededed;">
                    ${title}
                  </h1>
                  <p style="margin:12px 0 0 0;font-size:16px;color:#bdbdbd;">
                    ${subtitle}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 24px 24px 24px;">
                  <div style="border:2px solid #333;padding:20px;background:#111;border-radius:12px;">
                    <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#9a9a9a;">
                      Your License Key
                    </p>
                    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:22px;font-weight:700;color:#ff6a35;letter-spacing:0.08em;">
                      ${params.licenseKey}
                    </div>
                    ${
                      params.trialEndsAtIso
                        ? `<p style="margin:12px 0 0 0;font-size:13px;color:#9a9a9a;">Trial ends: ${params.trialEndsAtIso}</p>`
                        : ""
                    }
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding:0 24px 40px 24px;text-align:center;">
                  <a href="${params.upgradeUrl}"
                     style="display:inline-block;background:#ff6a35;color:#0a0a0a;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:999px;">
                    Upgrade (keep your license)
                  </a>
                  <p style="margin:14px 0 0 0;font-size:13px;color:#9a9a9a;">
                    If the button doesn’t work, open: ${params.upgradeUrl}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px;text-align:center;border-top:1px solid #222;">
                  <p style="margin:0;font-size:12px;color:#777;">Dirac • Morning context: 30 seconds, not 20 minutes.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

export async function POST(request: NextRequest) {
  try {
    if (!requireCronAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!resend) {
      return NextResponse.json({ ok: false, error: "RESEND_API_KEY is not set" }, { status: 500 });
    }

    const db = getAdminDb();
    const licensesRef = db.collection("licenses");

    const now = new Date();
    const nowPlus24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nowMinus48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    let day3Sent = 0;
    let postExpirySent = 0;
    const errors: Array<{ phase: string; docId?: string; message: string }> = [];

    // Day 3 reminder: trial ends within 24h, and not expired yet
    const day3Snap = await licensesRef
      .where("status", "==", "trial")
      .where("trialEndsAt", "<=", nowPlus24h)
      .get();

    for (const doc of day3Snap.docs) {
      const data = doc.data() as any;
      if (data.trialReminderSentDay3 === true) continue; // treat missing as not-sent
      const trialEndsAt = toDateMaybe(data.trialEndsAt);
      if (!trialEndsAt) continue;
      if (trialEndsAt <= now) continue; // already expired

      const email = data.email as string | undefined;
      const licenseKey = (data.key as string | undefined)?.toString();
      if (!email || !licenseKey) continue;

      const upgradeUrl = upgradeUrlForKey(licenseKey);
      try {
        await resend.emails.send({
          from: "peter@dirac.app",
          to: email,
          subject: "Your Dirac trial is ending soon",
          html: renderEmailHtml({
            type: "day3",
            licenseKey,
            upgradeUrl,
            trialEndsAtIso: trialEndsAt.toISOString(),
          }),
        });

        await doc.ref.update({
          trialReminderSentDay3: true,
          trialReminderSentDay3At: FieldValue.serverTimestamp(),
        });
        day3Sent++;
      } catch (err: any) {
        console.error("Day3 reminder failed", { docId: doc.id, err });
        errors.push({
          phase: "day3_send",
          docId: doc.id,
          message: err?.message || String(err),
        });
      }
    }

    // Post-expiry reminder: trial ended at least 48h ago
    const postExpirySnap = await licensesRef
      .where("status", "==", "trial")
      .where("trialEndsAt", "<=", nowMinus48h)
      .get();

    for (const doc of postExpirySnap.docs) {
      const data = doc.data() as any;
      if (data.trialReminderSentPostExpiry === true) continue; // treat missing as not-sent
      const trialEndsAt = toDateMaybe(data.trialEndsAt);
      if (!trialEndsAt) continue;

      const email = data.email as string | undefined;
      const licenseKey = (data.key as string | undefined)?.toString();
      if (!email || !licenseKey) continue;

      const upgradeUrl = upgradeUrlForKey(licenseKey);
      try {
        await resend.emails.send({
          from: "peter@dirac.app",
          to: email,
          subject: "Your Dirac trial has ended",
          html: renderEmailHtml({
            type: "postExpiry",
            licenseKey,
            upgradeUrl,
            trialEndsAtIso: trialEndsAt.toISOString(),
          }),
        });

        await doc.ref.update({
          trialReminderSentPostExpiry: true,
          trialReminderSentPostExpiryAt: FieldValue.serverTimestamp(),
        });
        postExpirySent++;
      } catch (err: any) {
        console.error("Post-expiry reminder failed", { docId: doc.id, err });
        errors.push({
          phase: "post_expiry_send",
          docId: doc.id,
          message: err?.message || String(err),
        });
      }
    }

    return NextResponse.json(
      {
        ok: true,
        day3Candidates: day3Snap.size,
        postExpiryCandidates: postExpirySnap.size,
        day3Sent,
        postExpirySent,
        errors,
        note:
          "If this endpoint 500s with a Firestore 'requires an index' error, create a composite index for collection 'licenses' on fields: status (ASC), trialEndsAt (ASC).",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("send-trial-reminders crashed", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || String(err),
        hint:
          "Common causes: Firestore composite index needed for (status + trialEndsAt) query, missing Firebase Admin env vars, or Resend misconfiguration.",
      },
      { status: 500 }
    );
  }
}

