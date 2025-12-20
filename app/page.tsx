import { Hero } from "@/components/hero-1";

export default function Home() {
  return (
    <Hero
      eyebrow="MVP is Coming soon"
      subtitle="Dirac checks all your daily apps - Discord, GitHub, Stripe, Gmail, and more, delivering everything in one brief morning summary."
      ctaLabel="Join The Waitlist"
      ctaHref="/waitlist"
    />
  );
}
