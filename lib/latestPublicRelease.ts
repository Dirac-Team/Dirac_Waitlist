import { PUBLIC_RELEASES_REPO } from "@/lib/publicReleases";

export type LatestPublicRelease = {
  tag: string | null;
  name: string | null;
  publishedAt: string | null;
  body: string | null;
  htmlUrl: string | null;
  releasePageLatestUrl: string;
  dmgArm64Url: string | null;
  dmgIntelUrl: string | null;
};

let cached: { at: number; value: LatestPublicRelease } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 min

function pickAsset(assets: any[], predicate: (name: string) => boolean): string | null {
  for (const a of assets || []) {
    const name = String(a?.name || "");
    if (predicate(name)) {
      const url = String(a?.browser_download_url || "");
      return url || null;
    }
  }
  return null;
}

export async function getLatestPublicRelease(): Promise<LatestPublicRelease> {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) return cached.value;

  const releasePageLatestUrl = `https://github.com/${PUBLIC_RELEASES_REPO}/releases/latest`;
  const apiUrl = `https://api.github.com/repos/${PUBLIC_RELEASES_REPO}/releases/latest`;

  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "dirac.app (release-info)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const value: LatestPublicRelease = {
      tag: null,
      name: null,
      publishedAt: null,
      body: null,
      htmlUrl: null,
      releasePageLatestUrl,
      dmgArm64Url: null,
      dmgIntelUrl: null,
    };
    cached = { at: now, value };
    return value;
  }

  const json: any = await res.json();
  const assets = Array.isArray(json.assets) ? json.assets : [];

  // Prefer explicit arm64 dmg; for intel, pick a .dmg that is NOT arm64.
  const dmgArm64Url = pickAsset(assets, (n) => /arm64/i.test(n) && /\.dmg$/i.test(n));
  const dmgIntelUrl =
    pickAsset(assets, (n) => !/arm64/i.test(n) && /\.dmg$/i.test(n)) ||
    pickAsset(assets, (n) => /\.dmg$/i.test(n));

  const value: LatestPublicRelease = {
    tag: json.tag_name ?? null,
    name: json.name ?? null,
    publishedAt: json.published_at ?? null,
    body: json.body ?? null,
    htmlUrl: json.html_url ?? null,
    releasePageLatestUrl,
    dmgArm64Url,
    dmgIntelUrl,
  };

  cached = { at: now, value };
  return value;
}

