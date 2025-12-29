"use client";

import { Navbar } from "@/components/ui/mini-navbar";
import { useState } from "react";

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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
      
      <section
        className="relative mx-auto w-full pt-40 pb-20 px-6 text-center md:px-8 
        min-h-[calc(100vh-40px)] overflow-hidden 
        bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)]  
        dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)] 
        rounded-b-xl"
      >
        {/* Grid BG */}
        <div
          className="absolute -z-10 inset-0 opacity-80 h-[600px] w-full 
          bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] 
          dark:bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]
          bg-[size:6rem_5rem] 
          [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white tracking-tight mb-4">
            Simple Pricing
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-12">
            One plan. Everything included.
          </p>

          {/* Pricing Card */}
          <div className="max-w-md mx-auto">
            <div className="relative p-8 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-2xl bg-white dark:bg-black">
              {/* Plan Name */}
              <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
                Dirac Pro
              </h2>
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-black dark:text-white">$8.99</span>
                <span className="text-xl text-gray-600 dark:text-gray-400">/month</span>
              </div>

              {/* Trial Badge */}
              <div className="inline-block px-4 py-2 mb-6 bg-[#ed5b25] dark:bg-[#ff6a35] text-white text-sm font-semibold rounded-full">
                4-Day Free Trial
              </div>

              {/* Features */}
              <ul className="text-left space-y-3 mb-8 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#ed5b25] dark:text-[#ff6a35] font-bold mt-1">✓</span>
                  <span>One-click morning routine automation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ed5b25] dark:text-[#ff6a35] font-bold mt-1">✓</span>
                  <span>Check Discord, GitHub, Stripe, Gmail, and more</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ed5b25] dark:text-[#ff6a35] font-bold mt-1">✓</span>
                  <span>Single summary view every morning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ed5b25] dark:text-[#ff6a35] font-bold mt-1">✓</span>
                  <span>Works locally on your Mac</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ed5b25] dark:text-[#ff6a35] font-bold mt-1">✓</span>
                  <span>Cancel anytime</span>
                </li>
              </ul>

              {/* CTA Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full relative px-10 py-5 z-20 
                bg-[#ed5b25] dark:bg-[#ff6a35]
                text-white font-bold text-lg tracking-tight rounded-full
                border-2 border-[#ed5b25] dark:border-[#ff6a35]
                shadow-[5px_5px_0px_0px_rgba(237,91,37,0.4)] dark:shadow-[5px_5px_0px_0px_rgba(255,106,53,0.4)]
                hover:shadow-[7px_7px_0px_0px_rgba(237,91,37,0.6)] dark:hover:shadow-[7px_7px_0px_0px_rgba(255,106,53,0.6)]
                hover:translate-x-[-2px] hover:translate-y-[-2px]
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d]
                active:shadow-[2px_2px_0px_0px_rgba(237,91,37,0.3)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,106,53,0.3)]
                active:translate-x-[2px] active:translate-y-[2px]
                transition-all duration-200 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
                rotate-[-0.5deg] hover:rotate-[0.5deg]"
              >
                {isLoading ? "Loading..." : "Buy Dirac Pro"}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

