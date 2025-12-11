import { Navbar } from "@/components/ui/mini-navbar";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 md:px-8 max-w-3xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-900 rounded-full mb-4">
            <svg className="w-16 h-16 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
            Payment Canceled
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Your payment was canceled. No charges were made.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/pricing"
            className="inline-block px-8 py-4 mx-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-block px-8 py-4 mx-2 border-2 border-black dark:border-white text-black dark:text-white font-bold rounded-full hover:scale-105 transition-transform"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-600 dark:text-gray-400">
          <p>Have questions? Contact us at <a href="mailto:peter@dirac.app" className="underline">peter@dirac.app</a></p>
        </div>
      </section>
    </div>
  );
}

