import { NextResponse } from "next/server";

type LatestRelease = {
  tag: string;
  name?: string | null;
  publishedAt?: string | null;
  body?: string | null;
  htmlUrl?: string | null;
};

let cached: { at: number; value: LatestRelease } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 min

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) {
    return NextResponse.json(cached.value, { status: 200 });
  }

  const repo = "PeterZZZNZ/Dirac";
  const url = `https://api.github.com/repos/${repo}/releases/latest`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "User-Agent": "dirac.app (release-notes)",
    },
    // Netlify/edge caching varies; we manage our own in-memory TTL too.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Failed to fetch latest release (${res.status})`, details: text.slice(0, 500) },
      { status: 502 }
    );
  }

  const json: any = await res.json();
  const value: LatestRelease = {
    tag: json.tag_name,
    name: json.name ?? null,
    publishedAt: json.published_at ?? null,
    body: json.body ?? null,
    htmlUrl: json.html_url ?? null,
  };

  cached = { at: now, value };
  return NextResponse.json(value, { status: 200 });
}

