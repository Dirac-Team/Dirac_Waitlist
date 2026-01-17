import { NextResponse } from "next/server";
import { getLatestPublicRelease } from "@/lib/latestPublicRelease";

type LatestRelease = {
  tag: string;
  name?: string | null;
  publishedAt?: string | null;
  body?: string | null;
  htmlUrl?: string | null;
  releasePageLatestUrl?: string | null;
  dmgArm64Url?: string | null;
  dmgIntelUrl?: string | null;
};

let cached: { at: number; value: LatestRelease } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 min

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) {
    return NextResponse.json(cached.value, { status: 200 });
  }

  const latest = await getLatestPublicRelease();
  if (!latest.tag) {
    return NextResponse.json(
      { error: "Failed to fetch latest release" },
      { status: 502 }
    );
  }

  const value: LatestRelease = {
    tag: latest.tag,
    name: latest.name ?? null,
    publishedAt: latest.publishedAt ?? null,
    body: latest.body ?? null,
    htmlUrl: latest.htmlUrl ?? null,
    releasePageLatestUrl: latest.releasePageLatestUrl,
    dmgArm64Url: latest.dmgArm64Url,
    dmgIntelUrl: latest.dmgIntelUrl,
  };

  cached = { at: now, value };
  return NextResponse.json(value, { status: 200 });
}

