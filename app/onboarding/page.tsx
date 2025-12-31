"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";

type OnboardingStep = "email" | "download" | "payment" | "policy" | "preferences" | "complete";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step") as OnboardingStep | null;
  const promoParam = searchParams.get("promo");
  
  const [step, setStep] = useState<OnboardingStep>(stepParam || "email");
  const [email, setEmail] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<"intel" | "arm" | null>(null);
  const [promoCode, setPromoCode] = useState(promoParam || "");
  const [promoError, setPromoError] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [bestApps, setBestApps] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);

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
    setStep("payment");
  };

  const handlePayment = async () => {
    setPromoError("");
    
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          promoCode: promoCode.trim().toUpperCase() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes("promo") || data.error?.includes("code")) {
          setPromoError(data.error);
          return;
        }
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    }
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
    // Save preferences to database if needed
    console.log({
      email,
      platform: selectedPlatform,
      bestApps,
      referralSource
    });
    
    setStep("complete");
  };

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
            {["email", "download", "payment", "policy", "preferences"].map((s, i) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-all ${
                  step === s
                    ? "bg-[#ed5b25] dark:bg-[#ff6a35]"
                    : i < ["email", "download", "payment", "policy", "preferences"].indexOf(step)
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
              Let's get you started with your 4-day free trial
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
              Choose Your Download
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
              Select your Mac processor type
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

        {/* Step 3: Payment */}
        {step === "payment" && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Start Your Free Trial
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Try Dirac free for 4 days, then $8.99/month
            </p>

            <div className="p-6 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5 mb-8">
              <div className="text-5xl font-bold text-black dark:text-white mb-2">$8.99</div>
              <div className="text-gray-600 dark:text-gray-400">per month after trial</div>
              <div className="mt-4 text-sm text-[#ed5b25] dark:text-[#ff6a35] font-semibold">
                4-Day Free Trial • Cancel Anytime
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="max-w-md mx-auto">
              <label htmlFor="promo" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Have a promo code? 🎁
              </label>
              <input
                id="promo"
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError("");
                }}
                placeholder="DIRAC-PH50"
                className="w-full px-4 py-3 text-center border-2 border-gray-300 dark:border-gray-700 rounded-xl
                  bg-white dark:bg-black text-black dark:text-white uppercase
                  focus:border-[#ed5b25] dark:focus:border-[#ff6a35] focus:outline-none
                  placeholder:text-gray-400 placeholder:normal-case"
              />
              {promoError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {promoError}
                </p>
              )}
              {promoCode && !promoError && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Code will be applied at checkout
                </p>
              )}
            </div>

            <button
              onClick={handlePayment}
              className="w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all"
            >
              Continue to Payment
            </button>

            <button
              onClick={() => setStep("download")}
              className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 4: Privacy Policy (shown after payment success redirect) */}
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
          </div>
        )}

        {/* Step 5: Preferences */}
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
              disabled={bestApps.length === 0 || !referralSource}
              className="w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Setup
            </button>

            <button
              onClick={() => setStep("policy")}
              className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 6: Complete */}
        {step === "complete" && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="inline-block p-4 bg-[#ed5b25]/10 dark:bg-[#ff6a35]/10 rounded-full mb-4">
              <svg className="w-16 h-16 text-[#ed5b25] dark:text-[#ff6a35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              You're All Set!
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Download Dirac and start your 4-day free trial
            </p>

            <div className="p-6 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5 mb-8 text-left">
              <h3 className="font-bold text-black dark:text-white mb-4">Next Steps:</h3>
              <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#ed5b25] dark:text-[#ff6a35]">1.</span>
                  <span>Download Dirac for {selectedPlatform === "intel" ? "Intel Mac" : "Apple Silicon"}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#ed5b25] dark:text-[#ff6a35]">2.</span>
                  <span>Open the app and enter your license key when prompted</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#ed5b25] dark:text-[#ff6a35]">3.</span>
                  <span>Configure your daily apps and enjoy your morning summaries!</span>
                </li>
              </ol>
            </div>

            <a
              href={selectedPlatform === "intel" ? "/downloads/dirac-intel.dmg" : "/downloads/dirac-arm.dmg"}
              className="inline-block w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all"
              download
            >
              Download Dirac
            </a>

            <p className="text-sm text-gray-500">
              Check your email ({email}) for your license key
            </p>
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

