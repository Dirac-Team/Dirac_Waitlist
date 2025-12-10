import { Hero } from "@/components/hero-1";

export default function Home() {
  return (
    <Hero
      eyebrow="MVP is Coming soon"
      subtitle="Dirac checks Discord, GitHub, Stripe, Gmail, and more, delivering everything in one brief morning summary. Start informed, not overwhelmed."
      ctaLabel="Join The Waitlist"
      ctaHref="/waitlist"
    />
  );
}
