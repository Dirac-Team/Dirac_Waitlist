"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";

function OnboardingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setIsLoading(false);
      return;
    }

    // Fetch license key for this session
    fetch(`/api/get-license-for-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.licenseKey) {
          setLicenseKey(data.licenseKey);
          setEmail(data.email);
          
          // Store in localStorage for the onboarding flow
          localStorage.setItem("dirac_license_key", data.licenseKey);
          localStorage.setItem("dirac_email", data.email);
          
          // Redirect to policy step after 2 seconds
          setTimeout(() => {
            router.push("/onboarding?step=policy");
          }, 2000);
        } else {
          setError(data.error || "Failed to retrieve license key");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching license:", err);
        setError("Failed to retrieve license key");
        setIsLoading(false);
      });
  }, [searchParams, router]);

  const copyToClipboard = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

      <section className="relative z-10 pt-32 pb-20 px-6 md:px-8 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ed5b25] dark:border-[#ff6a35] border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Processing your payment...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="inline-block p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-16 h-16 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Something Went Wrong
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              {error}
            </p>
            <a
              href="/onboarding"
              className="inline-block px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold rounded-xl hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all"
            >
              Try Again
            </a>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-block p-4 bg-[#ed5b25]/10 dark:bg-[#ff6a35]/10 rounded-full mb-4">
                <svg className="w-16 h-16 text-[#ed5b25] dark:text-[#ff6a35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Your 4-day free trial has started
              </p>
            </div>

            {/* License Key Display */}
            {licenseKey && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-black dark:text-white mb-4">
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
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  We've also sent this to {email}
                </p>
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirecting to complete your setup...
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ed5b25] dark:border-[#ff6a35] border-r-transparent"></div>
      </div>
    }>
      <OnboardingSuccessContent />
    </Suspense>
  );
}

