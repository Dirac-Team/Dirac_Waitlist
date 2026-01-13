"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/ui/mini-navbar";

function OnboardingSuccessContent() {
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
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-block p-4 bg-[#ed5b25]/10 dark:bg-[#ff6a35]/10 rounded-full mb-4">
              <svg className="w-16 h-16 text-[#ed5b25] dark:text-[#ff6a35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
              Payment Successful
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              You can close this tab.
            </p>
          </div>

          <a
            href="/account"
            className="inline-block w-full px-8 py-4 bg-[#ed5b25] dark:bg-[#ff6a35] text-white font-bold text-lg rounded-xl
              hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d] transition-all mt-6"
          >
            Manage Subscription
          </a>
        </div>
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

