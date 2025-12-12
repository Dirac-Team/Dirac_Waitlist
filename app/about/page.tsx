import Link from "next/link";
import { Navbar } from "@/components/ui/mini-navbar";

export default function AboutPage() {
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
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-8 max-w-4xl mx-auto relative">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white tracking-tight">
            About Dirac
          </h1>
          
          {/* Hero Intro */}
          <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            <p className="text-2xl font-semibold text-black dark:text-white">
              Dirac automatically checks all your morning apps with one click.
            </p>
            <p>
              Instead of manually opening GitHub, Stripe, Gmail, and analytics across dozens of platforms, Dirac visits each app, captures the important information, and presents everything in a single summary view.
            </p>
          </div>
        </div>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* What We Do */}
        <section className="space-y-6 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
            What We Do
          </h2>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Dirac automatically checks all your morning apps with one click.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Instead of manually opening GitHub, Stripe, Gmail, and analytics across dozens of platforms, Dirac visits each app, captures the important information, and presents everything in a single summary view. Your entire morning routine in 60 seconds.
          </p>

          <div className="space-y-4 pt-6">
            <p className="font-semibold text-black dark:text-white">With Dirac, you can:</p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Check all your morning apps with <span className="font-semibold">one click</span> — no more opening 10+ tabs manually.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Get a <span className="font-semibold">single summary view</span> of everything important from GitHub, Stripe, Gmail, and analytics.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Complete your entire morning routine in <span className="font-semibold">60 seconds</span> instead of 20+ minutes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Stay safe and private, since everything runs locally on your Mac.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* How We Help You */}
        <section className="space-y-6 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
            How We Help You
          </h2>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            We built Start My Day for people who are tired of wasting time every morning opening the same apps and checking the same information.
          </p>

          <p className="font-semibold text-black dark:text-white pt-2">With Start My Day, you can:</p>
          
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="p-6 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-[#ed5b25] dark:text-[#ff6a35]">Start your day faster</span> — complete your morning routine in 60 seconds
              </p>
            </div>
            <div className="p-6 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-[#ed5b25] dark:text-[#ff6a35]">See everything at once</span> — all your important info in one summary view
              </p>
            </div>
            <div className="p-6 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-[#ed5b25] dark:text-[#ff6a35]">No more tab chaos</span> — stop opening 10+ tabs every morning
              </p>
            </div>
            <div className="p-6 border-2 border-[#ed5b25] dark:border-[#ff6a35] rounded-xl bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-[#ed5b25] dark:text-[#ff6a35]">One click</span> to check GitHub, Stripe, Gmail, and analytics
              </p>
            </div>
          </div>

          <p className="text-lg font-semibold text-black dark:text-white pt-4">
            In short — Start My Day gives you your mornings back.
          </p>
        </section>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* Mission & Vision */}
        <section className="space-y-6 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
            Our Mission & Vision
          </h2>
          
          <div className="space-y-4">
            <div className="p-6 border-l-4 border-[#ed5b25] dark:border-[#ff6a35] rounded-lg bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5">
              <h3 className="text-xl font-bold text-[#ed5b25] dark:text-[#ff6a35] mb-2">Mission</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Make morning routines effortless — one click to check everything that matters.
              </p>
            </div>
            
            <div className="p-6 border-l-4 border-[#ed5b25] dark:border-[#ff6a35] rounded-lg bg-[#ed5b25]/5 dark:bg-[#ff6a35]/5">
              <h3 className="text-xl font-bold text-[#ed5b25] dark:text-[#ff6a35] mb-2">Vision</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Become the default way people start their day — eliminating the chaos of opening multiple tabs and apps every morning.
              </p>
            </div>
          </div>
        </section>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* Our Story */}
        <section className="space-y-6 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
            Our Story
          </h2>
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Dirac was born from frustration — we were tired of wasting time every morning opening the same apps, checking the same tabs, and gathering the same information.
            </p>
            <p>
              We're a small team of builders, designers, and productivity enthusiasts who believe your morning routine shouldn't take 10+ minutes when it can be done in 60 seconds.
            </p>
            <p>
              Our goal is simple: one click to check all your morning apps and see everything that matters in a single summary view.
            </p>
          </div>
        </section>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* CTA Section */}
        <section className="text-center py-20 border-t-2 border-black dark:border-white/30">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
              Ready to start your day in 60 seconds?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Join the waitlist and be among the first to experience Start My Day.
            </p>
            
            <div className="pt-6">
              <Link 
                href="/waitlist"
                className="inline-block relative px-10 py-5 z-20 
                bg-[#ed5b25] dark:bg-[#ff6a35]
                text-white dark:text-white font-bold text-lg tracking-tight rounded-full
                border-2 border-[#ed5b25] dark:border-[#ff6a35]
                shadow-[5px_5px_0px_0px_rgba(237,91,37,0.4)] dark:shadow-[5px_5px_0px_0px_rgba(255,106,53,0.4)]
                hover:shadow-[7px_7px_0px_0px_rgba(237,91,37,0.6)] dark:hover:shadow-[7px_7px_0px_0px_rgba(255,106,53,0.6)]
                hover:translate-x-[-2px] hover:translate-y-[-2px]
                hover:bg-[#d94e1f] dark:hover:bg-[#ff7d4d]
                active:shadow-[2px_2px_0px_0px_rgba(237,91,37,0.3)] dark:active:shadow-[2px_2px_0px_0px_rgba(255,106,53,0.3)]
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

