import { Hero } from "@/components/hero-1";
import { Navbar } from "@/components/ui/mini-navbar";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero
        eyebrow="4-Day Free Trial"
        subtitle="No more checking all your daily tabs manually. One click -> one summary with everything you need to know to start your work."
        ctaLabel="Try for Free"
        ctaHref="/onboarding"
      />
      
      {/* Product Hunt Badge */}
      <div className="fixed bottom-8 right-8 z-50 animate-fade-up opacity-0 hover:scale-105 transition-transform duration-200">
        <a 
          href="https://www.producthunt.com/products/dirac-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-dirac-2" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <img 
            alt="Dirac - Start your day with full context, zero tab-hopping | Product Hunt" 
            width="250" 
            height="54" 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1056521&theme=light&t=1767757210891"
            className="block"
          />
        </a>
      </div>

      {/* Founder note */}
      <section className="mx-auto w-full px-6 md:px-8 py-20 bg-black">
        <div className="max-w-4xl mx-auto grid md:grid-cols-[160px_1fr] gap-8 items-center border border-[#333] rounded-2xl p-8 bg-[#0b0b0b]">
          <div className="flex justify-center md:justify-start">
            <Image
              src="/founder/Founder_Image.png"
              alt="Founder"
              width={140}
              height={140}
              className="rounded-2xl border border-[#333] object-cover"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white">A note from the founder</h2>
            <p className="text-gray-300 text-base leading-relaxed">
              I built Dirac because I was tired of starting my day by tab-hopping across GitHub, email, Stripe, and analytics.
              Dirac turns that into one click and one summary—so you can get into real work faster.
            </p>
            <p className="text-gray-400 text-sm">
              — Peter
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
