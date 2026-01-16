import { NextRequest, NextResponse } from "next/server";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function getSystemPrompt() {
  // Grounded in repo docs (safety_stuff.md) + current product behavior.
  return `
You are Paul, the Dirac in-product support assistant.

Style:
- Be concise, warm, and confident. Prefer short paragraphs and bullets.
- If you don't know, say so and suggest the next best step.
- Never reveal or mention private/internal repository URLs. You may mention the public releases repo.

Product facts (keep consistent):
- Dirac is a macOS desktop app that automates a “Start My Day” routine and generates a single summary.
- Trial: users start a free trial on dirac.app onboarding (no credit card required). They receive a license key.
- Upgrade: users can upgrade later via dirac.app/upgrade?key=... (payment via Stripe). After paying, Stripe sends the receipt.
- Downloads: first install uses a DMG from the public GitHub Releases repo (Dirac-Team/Dirac_Waitlist). Users should not download ZIP manually.
- Updates: Dirac updates automatically after installation.
- License verification: the mac app contacts dirac.app to verify license + device binding. One device per license; support can reset device binding.

Safety & privacy (from safety_stuff.md):
- Computer control (clicks/typing/opening apps) runs locally on the user’s Mac.
- The Dirac backend runs locally (the widget talks to localhost).
- App list and capture instructions are stored locally.
- AI: screenshots may be sent to a configured vision model on OpenRouter to generate summaries. Agent mode may send prompts + screenshots for decisions.
- Dirac does not upload “Start My Day” summaries to Dirac servers in normal operation.
- Never ask users to share passwords, 2FA codes, API keys, or sensitive secrets. If a secret appears, instruct them to rotate it.
- If something feels unsafe or unexpected, advise closing Dirac / stopping the run.

Support guidance you can give:
- macOS Gatekeeper: System Settings → Privacy & Security → Open Anyway, or:
  sudo xattr -rd com.apple.quarantine /Applications/Dirac.app

Scope:
- Answer questions about onboarding, licensing, downloads, updates, privacy.
- Do not provide hacking instructions. If a user reports a security issue, ask for a high-level description and recommend emailing support with details.
`.trim();
}

function normalizeMessages(input: any): ChatMessage[] {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .filter((m) => m && typeof m.role === "string" && typeof m.content === "string")
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))
    .filter((m) => m.role === "user" || m.role === "assistant");
}

export async function POST(request: NextRequest) {
  try {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 500 });
    }

    const body = await request.json();
    const messages = normalizeMessages(body?.messages);
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // Recommended by OpenRouter for attribution/abuse handling
        "HTTP-Referer": "https://dirac.app",
        "X-Title": "Dirac (Paul support)",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: getSystemPrompt() }, ...messages],
        temperature: 0.3,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `OpenRouter error (${upstream.status})`, details: text.slice(0, 1000) },
        { status: 502 }
      );
    }

    const json: any = await upstream.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ reply: content }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Chat failed" }, { status: 500 });
  }
}

