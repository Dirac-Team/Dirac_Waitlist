export const PUBLIC_RELEASES_REPO = "Dirac-Team/Dirac_Waitlist" as const;

// Current website-pinned release (update when you ship a new DMG version)
export const CURRENT_PUBLIC_VERSION = "v1.1.2" as const;

export const CURRENT_DOWNLOAD_URLS = {
  // Apple Silicon (arm64)
  arm: `https://github.com/${PUBLIC_RELEASES_REPO}/releases/download/${CURRENT_PUBLIC_VERSION}/Dirac-1.1.2-arm64.dmg`,
  // Intel
  intel: `https://github.com/${PUBLIC_RELEASES_REPO}/releases/download/${CURRENT_PUBLIC_VERSION}/Dirac-1.1.2.dmg`,
} as const;

export const CURRENT_RELEASE_PAGE_URL = `https://github.com/${PUBLIC_RELEASES_REPO}/releases/tag/${CURRENT_PUBLIC_VERSION}` as const;

