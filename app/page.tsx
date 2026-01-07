import { Hero } from "@/components/hero-1";
import { Navbar } from "@/components/ui/mini-navbar";

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
    </>
  );
}
