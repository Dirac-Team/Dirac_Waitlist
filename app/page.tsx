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
    </>
  );
}
