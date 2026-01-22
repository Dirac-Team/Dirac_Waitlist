"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";
import { CURRENT_DOWNLOAD_URLS, CURRENT_PUBLIC_VERSION, CURRENT_RELEASE_PAGE_URL, LATEST_RELEASE_PAGE_URL } from "@/lib/publicReleases";

type OnboardingStep = "email" | "download" | "policy" | "preferences" | "complete";

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

function OnboardingContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step") as OnboardingStep | null;
  
  const [step, setStep] = useState<OnboardingStep>(stepParam || "email");
  const [email, setEmail] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"intel" | "arm" | null>(null);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [bestApps, setBestApps] = useState<string[]>([]);
  const [otherApp, setOtherApp] = useState(""); // For custom app input
  const [referralSource, setReferralSource] = useState("");
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isCreatingLicense, setIsCreatingLicense] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latestRelease, setLatestRelease] = useState<LatestRelease | null>(null);
  const [latestReleaseError, setLatestReleaseError] = useState<string | null>(null);

  const appOptions = [
    "GitHub",
    "Stripe",
    "Gmail",
    "Google Analytics",
    "Discord",
    "Slack",
    "Linear",
    "Notion",
    "Calendar",
    "Twitter/X"
  ];

  const referralOptions = [
    "Social Media (Twitter/X, LinkedIn, etc.)",
    "Friend or Colleague",
    "Search Engine (Google, etc.)",
    "Product Hunt",
    "Reddit",
    "Tech Blog/Newsletter",
    "Other"
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStep("download");
    }
  };

  const handleDownloadSelect = (platform: "intel" | "arm") => {
    setSelectedPlatform(platform);
    setStep("policy");
  };

  const handlePolicyAccept = () => {
    if (acceptedPolicy) {
      setStep("preferences");
    }
  };

  const toggleApp = (app: string) => {
    setBestApps(prev => 
      prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]
    );
  };

  const handleComplete = async () => {
    // Compile final app list (including "other" if specified)
    const finalApps = otherApp.trim() 
      ? [...bestApps, `Other: ${otherApp.trim()}`] 
      : bestApps;
    
    if (!selectedPlatform) {
      setCreateError("Please select your Mac chip type first.");
      setStep("download");
      return;
    }

    setIsCreatingLicense(true);
    setCreateError(null);

    try {
      const response = await fetch("/api/trial/create-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
      email,
      platform: selectedPlatform,
          preferences: {
            apps: finalApps,
            referralSource,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create your trial license. Please try again.");
      }

      if (!data?.licenseKey) {
        throw new Error("No license key returned. Please try again.");
      }

      setLicenseKey(data.licenseKey);
      setTrialEndsAt(data.trialEndsAt ?? null);

      // Store for convenience
      localStorage.setItem("dirac_license_key", data.licenseKey);
      localStorage.setItem("dirac_email", data.email ?? email);
    
    setStep("complete");
    } catch (err: any) {
      console.error("Error creating trial license:", err);
      setCreateError(err?.message || "Failed to create your trial license. Please try again.");
    } finally {
      setIsCreatingLicense(false);
    }
  };

  const handleDownloadClick = () => {
    // Trigger confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const copyToClipboard = () => {
    if (!licenseKey) return;
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const effectiveVersion = latestRelease?.tag || CURRENT_PUBLIC_VERSION;
  const releasePageUrl = latestRelease?.releasePageLatestUrl || LATEST_RELEASE_PAGE_URL;
  const effectiveDownloadUrls = {
    intel: latestRelease?.dmgIntelUrl || CURRENT_DOWNLOAD_URLS.intel,
    arm: latestRelease?.dmgArm64Url || CURRENT_DOWNLOAD_URLS.arm,
  };

  const downloadUrl =
    selectedPlatform === "intel"
      ? effectiveDownloadUrls.intel
      : selectedPlatform === "arm"
        ? effectiveDownloadUrls.arm
        : null;

  useEffect(() => {
    // Optional UX: show latest version + notes (no token; public API)
    fetch("/api/github/latest-release")
      .then((r) => r.json())
      .then((data) => {
        if (data?.tag) setLatestRelease(data as LatestRelease);
        else if (data?.error) setLatestReleaseError(String(data.error));
      })
      .catch((e) => setLatestReleaseError(e?.message || "Failed to fetch release info"));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      <Navbar />
      
      {/* Fixed Radial Accent Background */}
      <div
        className="fixed left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] 
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] border-black dark:border-white bg-white dark:bg-black 
        bg-[radial-gradient(closest-side,#fff_82%,#000000)] 
        dark:bg-[radial-gradient(closest-side,#000_82%,#ffffff)] 
        pointer-events-none -z-10"
      />

      <section className="relative z-10 pt-32 pb-20 px-6 md:px-8 max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-center gap-2">
            {["email", "download", "policy", "preferences"].map((s, i) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-all ${
                  step === s
                    ? "bg-[#ed5b25] dark:bg-[#ff6a35]"
                    : i < ["email", "download", "policy", "preferences"].indexOf(step)
                    ? "bg-[#ed5b25]/50 dark:bg-[#ff6a35]/50"
                    : "bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Welcome to Dirac
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Let's get you started with your 10-day free trial
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-700 rounded-xl
                  bg-white dark:bg-black text-black dark:text-white
                  focus:border-[#ed5b25] dark:focus:border-[#ff6a35] focus:outline-none"
                required
              />
              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                  hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Download */}
        {step === "download" && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4 text-center">
              Select Your Mac Chip
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
              This ensures you download the right build
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleDownloadSelect("intel")}
                className="p-8 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl
                  hover:bg-[#ed5b25]/5 dark:hover:bg-[#ff6a35]/5 transition-all text-left"
              >
                <div className="text-2xl font-bold text-black dark:text-white mb-2">
                  Intel Mac
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  For Macs with Intel processors
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Not sure? Check: Apple menu → About This Mac
                </div>
              </button>

              <button
                onClick={() => handleDownloadSelect("arm")}
                className="p-8 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl
                  hover:bg-[#ed5b25]/5 dark:hover:bg-[#ff6a35]/5 transition-all text-left"
              >
                <div className="text-2xl font-bold text-black dark:text-white mb-2">
                  Apple Silicon (M1/M2/M3/M4)
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  For Macs with Apple chips
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  Most Macs from 2020 onwards
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep("email")}
              className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Privacy Policy */}
        {step === "policy" && (
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4 text-center">
              Terms of Service
            </h1>
            
            <div className="max-h-[400px] overflow-y-auto p-6 border-2 border-gray-300 dark:border-gray-700 rounded-xl
              bg-gray-50 dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 space-y-4">
              <iframe
                src="/terms"
                className="w-full h-[400px] border-0"
                title="Terms of Service"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(e) => setAcceptedPolicy(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#ed5b25]"
              />
              <span className="text-gray-700 dark:text-gray-300">
                I have read and agree to the Terms of Service
              </span>
            </label>

            <button
              onClick={handlePolicyAccept}
              disabled={!acceptedPolicy}
              className="w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>

            <button
              onClick={() => setStep("download")}
              className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === "preferences" && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4 text-center">
                Customize Your Experience
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
                Help us personalize Dirac for you
              </p>
            </div>

            {/* Best Apps */}
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                Which apps do you check most often? (Select all that apply)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {appOptions.map((app) => (
                  <button
                    key={app}
                    onClick={() => toggleApp(app)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      bestApps.includes(app)
                        ? "bg-[#ed5b25] dark:bg-[#ff6a35] text-white border-2 border-[#ed5b25] dark:border-[#ff6a35]"
                        : "bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700 hover:border-[#ed5b25] dark:hover:border-[#ff6a35]"
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
              
              {/* Other App Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Other app not listed?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Jira, Trello, Asana..."
                  value={otherApp}
                  onChange={(e) => setOtherApp(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl
                    bg-white dark:bg-black text-black dark:text-white
                    focus:outline-none focus:border-[#ed5b25] dark:focus:border-[#ff6a35]
                    placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Referral Source */}
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                How did you hear about Dirac?
              </h3>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-700 rounded-xl
                  bg-white dark:bg-black text-black dark:text-white
                  focus:border-[#ed5b25] dark:focus:border-[#ff6a35] focus:outline-none"
              >
                <option value="">Select an option</option>
                {referralOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleComplete}
              disabled={bestApps.length === 0 || !referralSource || isCreatingLicense}
              className="w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingLicense ? "Creating your trial..." : "Complete Setup"}
            </button>

            {createError && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-xl text-red-700 dark:text-red-300 text-sm">
                {createError}
              </div>
            )}

            <button
              onClick={() => setStep("policy")}
              className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && (
          <div className="space-y-6 text-center animate-fade-in">
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none z-50">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '-10px',
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${2 + Math.random() * 1}s`,
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: ['#ed5b25', '#ff6a35', '#ffaa00', '#fff'][Math.floor(Math.random() * 4)],
                        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                        transform: `rotate(${Math.random() * 360}deg)`,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="inline-block p-4 bg-[#ed5b25]/10 dark:bg-[#ff6a35]/10 rounded-full mb-4">
              <svg className="w-16 h-16 text-[#ed5b25] dark:text-[#ff6a35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              You're All Set!
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Download Dirac and start your free trial
            </p>

            {licenseKey && (
              <div className="mb-4">
                <h2 className="text-xl font-bold text-black dark:text-white mb-3">
                  Your License Key
                </h2>
                <div className="relative p-6 bg-gray-100 dark:bg-gray-900 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl">
                  <code className="text-2xl font-mono text-black dark:text-white block mb-4">
                    {licenseKey}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-3 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold rounded-full hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all"
                  >
                    {copied ? "Copied!" : "Copy License Key"}
                  </button>
                  {trialEndsAt && (
                    <p className="text-sm text-gray-500 mt-4">
                      Trial ends: {new Date(trialEndsAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5 mb-8 text-left">
              <h3 className="font-bold text-black dark:text-white mb-4">Next Steps:</h3>
              <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#ed5b25] dark:text-[#ff6a35]">1.</span>
                  <span>Download Dirac for {selectedPlatform === "intel" ? "Intel Mac" : "Apple Silicon"}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#ed5b25] dark:text-[#ff6a35]">2.</span>
                  <span>Open the DMG and drag Dirac to your Applications folder</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#ed5b25] dark:text-[#ff6a35]">3.</span>
                  <span>Open Dirac and paste your license key</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#ed5b25] dark:text-[#ff6a35]">4.</span>
                  <span>Configure your daily apps and enjoy your morning summaries!</span>
                </li>
              </ol>
            </div>

            {downloadUrl && (
                <a
                  href={downloadUrl}
              onClick={handleDownloadClick}
              className="inline-block w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all"
            >
                Download Dirac ({effectiveVersion})
            </a>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dirac updates automatically after installation. (First install uses a DMG — you never need to download a ZIP manually.)
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest public release:{" "}
              <a className="underline" href={releasePageUrl} target="_blank" rel="noopener noreferrer">
                {releasePageUrl}
              </a>
            </p>

            {latestRelease?.tag && (
              <details className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-left">
                <summary className="cursor-pointer font-bold text-black dark:text-white">
                  Latest version: {latestRelease.tag}
                </summary>
                {latestRelease.body && (
                  <pre className="mt-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {latestRelease.body}
                  </pre>
                )}
                {latestRelease.htmlUrl && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Full release:{" "}
                    <a className="underline" href={latestRelease.htmlUrl} target="_blank" rel="noopener noreferrer">
                      {latestRelease.htmlUrl}
                    </a>
                  </p>
                )}
              </details>
            )}
            {latestReleaseError && (
              <p className="text-xs text-gray-500">Release info unavailable: {latestReleaseError}</p>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400">
              No xattr step required (signed + notarized).
            </p>

            <div className="text-sm text-gray-500 space-y-1">
              <p>We emailed a copy of your license key and download links to {email}.</p>
              <p>
                Join our Discord (support + updates):{" "}
                <a
                  className="underline"
                  href="https://discord.gg/FSwUGemY"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://discord.gg/FSwUGemY
                </a>
              </p>
              <p>
                Need the other build?{" "}
                <a className="underline" href={effectiveDownloadUrls.intel}>
                  Intel
                </a>{" "}
                /{" "}
                <a className="underline" href={effectiveDownloadUrls.arm}>
                  Apple Silicon
                </a>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ed5b25] dark:border-[#ff6a35] border-r-transparent"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

