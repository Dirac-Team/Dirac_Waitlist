import Link from "next/link";
import { Navbar } from "@/components/ui/mini-navbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white tracking-tight">
            Contact Us
          </h1>
          
          {/* Hero Intro */}
          <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            <p className="text-2xl font-semibold text-black dark:text-white">
              Get in touch with the Dirac team
            </p>
            <p>
              Have questions, feedback, or want to learn more? We'd love to hear from you.
            </p>
          </div>
        </div>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* Contact Information */}
        <section className="space-y-6 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
            Reach Out
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 border-2 border-black dark:border-white/30 rounded-xl">
              <h3 className="text-xl font-bold text-black dark:text-white mb-3">Email</h3>
              <a 
                href="mailto:peter@dirac.app"
                className="text-lg text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              >
                peter@dirac.app
              </a>
            </div>
          </div>
        </section>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* CTA Section */}
        <section className="text-center py-20 border-t-2 border-black dark:border-white/30">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
              Ready to automate your Mac?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Join the waitlist and be among the first to experience Dirac.
            </p>
            
            <div className="pt-6">
              <Link 
                href="/waitlist"
                className="inline-block relative px-10 py-5 z-20 
                bg-white dark:bg-white/10
                text-black dark:text-white font-bold text-lg tracking-tight rounded-full
                border-2 border-black dark:border-white/30
                shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.3)]
                hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.9)] dark:hover:shadow-[7px_7px_0px_0px_rgba(255,255,255,0.4)]
                hover:translate-x-[-2px] hover:translate-y-[-2px]
                active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.7)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]
                active:translate-x-[2px] active:translate-y-[2px]
                transition-all duration-200 ease-out
                overflow-hidden
                rotate-[-0.5deg] hover:rotate-[0.5deg] hover:scale-105"
              >
                <span className="relative z-10">Join The Waitlist</span>
              </Link>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

