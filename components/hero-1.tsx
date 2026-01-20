"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"

interface HeroProps {
  eyebrow?: string
  title?: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function Hero({
  eyebrow = "Innovate Without Limits",
  title,
  subtitle,
  ctaLabel = "Explore Now",
  ctaHref = "#",
}: HeroProps) {
  const rotatingWords = useMemo(
    () => ["automated", "summarized", "condensed", "gathered", "ready", "done"],
    []
  );
  const [wordIdx, setWordIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      window.setTimeout(() => {
        setWordIdx((i) => (i + 1) % rotatingWords.length);
        setIsFading(false);
      }, 180);
    }, 1700);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const rotatingWord = rotatingWords[wordIdx] ?? "automated";
  const gradientText =
    "bg-gradient-to-br from-black from-30% to-black/40 dark:from-white dark:to-white/40 bg-clip-text text-transparent";

  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-40 px-6 text-center md:px-8 
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

      {/* Radial Accent */}
      <div
        className="absolute left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)] 
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%] 
        -translate-x-1/2 rounded-[100%] border-black dark:border-white bg-white dark:bg-black 
        bg-[radial-gradient(closest-side,#fff_82%,#000000)] 
        dark:bg-[radial-gradient(closest-side,#000_82%,#ffffff)] 
        animate-fade-up"
      />

      {/* Eyebrow */}
      {eyebrow && (
        <a href="/waitlist" className="group">
          <span
            className="text-sm text-gray-600 dark:text-gray-400 font-geist mx-auto px-5 py-2 
            bg-gradient-to-tr from-zinc-300/5 via-gray-400/5 to-transparent  
            border-[2px] border-gray-300/20 dark:border-white/5 
            rounded-3xl w-fit tracking-tight uppercase flex items-center justify-center"
          >
            {eyebrow}
            <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>
      )}

      {/* Animated Slogan */}
      <h1
        className="animate-fade-in -translate-y-4 text-balance 
        py-6 text-4xl font-bold leading-none tracking-tighter 
        sm:text-5xl md:text-6xl lg:text-7xl mb-4"
        style={{ lineHeight: '1.1' }}
      >
        <span className={gradientText}>Morning context,{" "}</span>
        <span
          className={[
            "inline-block will-change-transform transition-all duration-200 ease-out",
            gradientText,
            isFading ? "opacity-0 -translate-y-[2px]" : "opacity-100 translate-y-0",
          ].join(" ")}
        >
          {rotatingWord}
        </span>
        <span className={gradientText}>{" "}in 30 seconds.</span>
      </h1>

      {/* Title (optional) */}
      {title && (
        <h2
          className="animate-fade-in -translate-y-4 text-balance 
          bg-gradient-to-br from-black from-30% to-black/40 
          bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter 
          text-transparent opacity-0 sm:text-6xl md:text-7xl lg:text-8xl 
          dark:from-white dark:to-white/40"
        >
          {title}
        </h2>
      )}

      {/* Subtitle */}
      <p
        className="animate-fade-in mb-12 -translate-y-4 text-balance 
        text-lg tracking-tight text-gray-600 dark:text-gray-400 
        opacity-0 md:text-xl"
      >
        {subtitle}
      </p>

      {/* CTA */}
      {ctaLabel && (
        <div className="flex flex-col items-center gap-5">
          <a 
            href={ctaHref}
            className="group relative inline-flex items-center justify-center px-8 py-4 mt-[-20px] z-20 
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
            min-w-[200px]
            rotate-[-0.5deg] hover:rotate-[0.5deg] hover:scale-105"
          >
            {/* Subtle glitch layer */}
            <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-[0.1] group-hover:animate-glitch pointer-events-none transition-opacity duration-200"></span>
            
            {/* Smooth hover fill */}
            <span className="absolute inset-0 bg-[#d94e1f] dark:bg-[#ff7d4d] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out"></span>
            
            {/* Button text */}
            <span className="relative z-10 flex items-center gap-2 whitespace-nowrap transition-all duration-200">
              <span className="text-white transition-colors duration-300">
                {ctaLabel}
              </span>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
            </span>
            
            {/* Natural crack pattern */}
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none opacity-[0.15]">
              {/* Subtle vertical cracks */}
              <div className="absolute top-0 left-[15%] w-[1px] h-10 bg-white rotate-[10deg]"></div>
              <div className="absolute bottom-0 right-[20%] w-[1px] h-8 bg-white rotate-[-12deg]"></div>
              
              {/* Subtle horizontal cracks */}
              <div className="absolute top-[50%] left-[8%] w-10 h-[1px] bg-white rotate-[35deg]"></div>
              <div className="absolute top-[45%] right-[10%] w-12 h-[1px] bg-white rotate-[-38deg]"></div>
              
              {/* Slight diagonal accent */}
              <div className="absolute top-[25%] left-[48%] w-16 h-[1px] bg-white rotate-[55deg] opacity-60"></div>
            </div>
          </a>

          {/* Buttons directly under CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a 
              href="https://www.producthunt.com/products/dirac-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-dirac-2"
              target="_blank"
              rel="noopener noreferrer"
              className="block shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img 
                alt="Dirac on Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1056521&theme=light&t=1767757210891"
                className="block"
              />
            </a>

            <a
              href="https://discord.gg/FSwUGemY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-[54px] px-5 rounded-lg font-bold
                         bg-[#5865F2] text-white border border-black/10 shadow-lg
                         hover:bg-[#6b76ff] transition-colors"
            >
              Join our Discord
            </a>
          </div>
        </div>
      )}

      {/* Bottom Fade */}
      <div
        className="animate-fade-up relative mt-32 opacity-0 [perspective:2000px] 
        after:absolute after:inset-0 after:z-50 
        after:[background:linear-gradient(to_top,hsl(var(--background))_10%,transparent)]"
      />
    </section>
  )
}
