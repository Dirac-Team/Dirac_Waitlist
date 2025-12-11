"use client";

import { Navbar } from "@/components/ui/mini-navbar";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setError("No session ID found");
      setIsLoading(false);
      return;
    }

    // Fetch license key
    fetch(`/api/get-license-for-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setLicenseKey(data.licenseKey);
          setEmail(data.email);
        }
      })
      .catch((err) => {
        console.error("Error fetching license:", err);
        setError("Failed to retrieve license key");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchParams]);

  const copyToClipboard = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 md:px-8 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent"></div>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
              Generating your license key...
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              {error}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please contact support at <a href="mailto:peter@dirac.app" className="underline">peter@dirac.app</a> with your payment confirmation.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <svg className="w-16 h-16 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                Welcome to Dirac Pro
              </p>
              {email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Confirmation sent to {email}
                </p>
              )}
            </div>

            {/* License Key Display */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                Your License Key
              </h2>
              <div className="relative p-6 bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white rounded-xl">
                <code className="block text-lg md:text-xl font-mono text-black dark:text-white break-all mb-4">
                  {licenseKey}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
                >
                  {copied ? "Copied!" : "Copy License Key"}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-left max-w-2xl mx-auto mb-8 p-6 border-2 border-black dark:border-white/30 rounded-xl">
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                How to Activate Dirac
              </h3>
              <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-black dark:text-white">1.</span>
                  <span>Download the Dirac desktop app (.dmg) if you haven't already</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-black dark:text-white">2.</span>
                  <span>Open Dirac on your Mac</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-black dark:text-white">3.</span>
                  <span>Go to <strong>Start My Day</strong> section</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-black dark:text-white">4.</span>
                  <span>Paste your license key into the License Key field</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-black dark:text-white">5.</span>
                  <span>Click <strong>Activate</strong></span>
                </li>
              </ol>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              <p className="mb-2">Your 4-day free trial starts now. You won't be charged until the trial ends.</p>
              <p>Need help? Contact us at <a href="mailto:peter@dirac.app" className="underline">peter@dirac.app</a></p>
            </div>

            <Link
              href="/"
              className="inline-block px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
              Back to Home
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

