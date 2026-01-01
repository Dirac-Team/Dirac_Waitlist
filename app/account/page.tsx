"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/mini-navbar";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to access subscription portal");
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Portal error:", err);
      setError(err.message);
      setIsLoading(false);
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

      <section className="relative z-10 pt-32 pb-20 px-6 md:px-8 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
            Manage Your Subscription
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Cancel your trial, update payment info, view invoices, and more
          </p>
        </div>

        <div className="p-8 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900">
          <form onSubmit={handleManageSubscription} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 border-2 border-gray-300 dark:border-gray-700 rounded-xl
                  bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:border-[#ed5b25]"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-xl text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Manage Subscription"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-2 border-gray-300 dark:border-gray-700">
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">
              What You Can Do:
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-[#ed5b25] mr-2">✓</span>
                Cancel your free trial or subscription
              </li>
              <li className="flex items-start">
                <span className="text-[#ed5b25] mr-2">✓</span>
                Update payment method
              </li>
              <li className="flex items-start">
                <span className="text-[#ed5b25] mr-2">✓</span>
                View and download invoices
              </li>
              <li className="flex items-start">
                <span className="text-[#ed5b25] mr-2">✓</span>
                View billing history
              </li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Note:</strong> You'll be redirected to Stripe's secure customer portal to manage your subscription. 
              If you cancel during your free trial, you won't be charged at all.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Need help? Contact us at{" "}
            <a 
              href="mailto:peter@dirac.app" 
              className="text-[#ed5b25] dark:text-[#ff6a35] hover:underline"
            >
              peter@dirac.app
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

