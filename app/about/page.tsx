import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white tracking-tight">
            About Dirac
          </h1>
          
          {/* Hero Intro */}
          <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            <p className="text-2xl font-semibold text-black dark:text-white">
              Dirac helps you automate your Mac — no coding required.
            </p>
            <p>
              We built Dirac so students, freelancers, and entrepreneurs can eliminate repetitive tasks and focus on what really matters.
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
            Dirac is a desktop automation tool for macOS that makes your computer work for you.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Whether you're sending reports, organizing files, or filling out forms, Dirac automates the clicks and keystrokes you repeat every day.
          </p>

          <div className="space-y-4 pt-6">
            <p className="font-semibold text-black dark:text-white">You can:</p>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Record tasks once and replay them anytime with <span className="font-semibold">Repeat Mode</span>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Type what you want in plain English and watch Dirac do it for you with <span className="font-semibold">Agent Mode</span>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Automate any app on your Mac — email, browser, spreadsheets, or creative tools.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-black dark:text-white font-bold mt-1">•</span>
                <span>Stay safe and private, since everything runs locally on your device.</span>
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
            We built Dirac for people who are tired of wasting hours on small, repetitive actions.
          </p>

          <p className="font-semibold text-black dark:text-white pt-2">With Dirac, you can:</p>
          
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            <div className="p-6 border-2 border-black dark:border-white/30 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-black dark:text-white">Save hours every week</span> on manual computer work
              </p>
            </div>
            <div className="p-6 border-2 border-black dark:border-white/30 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-black dark:text-white">Avoid mistakes</span> and repetitive strain
              </p>
            </div>
            <div className="p-6 border-2 border-black dark:border-white/30 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-black dark:text-white">Focus on creative work</span> that matters
              </p>
            </div>
            <div className="p-6 border-2 border-black dark:border-white/30 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-black dark:text-white">Feel in control</span> of your time
              </p>
            </div>
          </div>

          <p className="text-lg font-semibold text-black dark:text-white pt-4">
            In short — Dirac helps you work smarter, not harder.
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
            <div className="p-6 border-l-4 border-black dark:border-white rounded-lg">
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">Mission</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Make desktop automation accessible to everyone, regardless of technical ability.
              </p>
            </div>
            
            <div className="p-6 border-l-4 border-black dark:border-white rounded-lg">
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">Vision</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Become the default way non-developers automate their digital workflows — a personal assistant that lives on your Mac and understands you.
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
              Dirac was born from frustration — we were tired of wasting hours doing the same computer tasks again and again.
            </p>
            <p>
              We're a small team of builders, designers, and productivity enthusiasts who believe automation shouldn't be limited to programmers.
            </p>
            <p>
              Our goal is simple: give every Mac user the power to automate their work in minutes, not hours — no coding, no complexity, just results.
            </p>
          </div>
        </section>

        {/* Decorative Space */}
        <div className="h-32"></div>

        {/* CTA Section */}
        <section className="text-center py-20 border-t-2 border-black dark:border-white/30">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
              Ready to make your Mac work for you?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Try Dirac today and experience what true desktop automation feels like.
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

