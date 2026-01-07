"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";

function UpgradeContent() {
  const searchParams = useSearchParams();
  const keyParam = searchParams.get("key");
  
  const [licenseKey, setLicenseKey] = useState(keyParam || "");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          promoCode: promoCode.trim().toUpperCase() || undefined,
          licenseKey: licenseKey.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Navbar />
      
      {/* Fixed Radial Accent Background */}
      <div
        className="fixed left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] 
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] border-white bg-black 
        bg-[radial-gradient(closest-side,#000_82%,#ffffff)] 
        pointer-events-none -z-10"
      />

      <section className="relative z-10 pt-32 pb-20 px-6 md:px-8 max-w-2xl mx-auto">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upgrade to Dirac Pro
            </h1>
            <p className="text-lg text-gray-300">
              Continue using Dirac after your free trial
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-8 border-2 border-[#ff6a35] rounded-xl bg-[#ff6a35]/5 text-center">
            <div className="text-6xl font-bold text-white mb-2">$8.99</div>
            <div className="text-gray-300 text-lg">per month</div>
            <div className="mt-4 text-sm text-[#ff6a35] font-semibold">
              Cancel Anytime • No Commitment
            </div>
          </div>

          {/* Features */}
          <div className="p-6 border-2 border-gray-700 rounded-xl bg-gray-900/30">
            <h3 className="font-bold text-white mb-4">What You Get:</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#ff6a35] text-xl">✓</span>
                <span>Morning context in 30 seconds, not 20 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ff6a35] text-xl">✓</span>
                <span>Unlimited app integrations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ff6a35] text-xl">✓</span>
                <span>Daily automated summaries</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ff6a35] text-xl">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          {/* Upgrade Form */}
          <form onSubmit={handleUpgrade} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl
                  bg-black text-white focus:outline-none focus:border-[#ff6a35]"
              />
            </div>

            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-300 mb-2">
                License Key (Optional)
              </label>
              <input
                id="licenseKey"
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="DIRAC-XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl
                  bg-black text-white uppercase font-mono focus:outline-none focus:border-[#ff6a35]"
              />
              <p className="mt-2 text-xs text-gray-500">
                If you have an existing trial license, enter it here to upgrade it
              </p>
            </div>

            <div>
              <label htmlFor="promo" className="block text-sm font-medium text-gray-300 mb-2">
                Promo Code (Optional)
              </label>
              <input
                id="promo"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="DIRAC-PH50"
                className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl
                  bg-black text-white uppercase focus:outline-none focus:border-[#ff6a35]"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#ff7d4d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Upgrade Now"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Questions? Email <a href="mailto:peter@dirac.app" className="text-[#ff6a35] hover:underline">peter@dirac.app</a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#ff6a35] border-r-transparent"></div>
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  );
}

