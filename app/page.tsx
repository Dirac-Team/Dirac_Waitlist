import { Hero } from "@/components/hero-1";

export default function Home() {
  return (
    <Hero
      eyebrow="MVP is Coming soon"
      subtitle="Dirac automatically checks all your daily apps - Discord messages, GitHub Commits, Stripe revenue, Gmail inbox, etc - and puts everything into one a brief morning summary to help you start your day informed, not overwhelmed."
      ctaLabel="Join The Waitlist"
      ctaHref="/waitlist"
    />
  );
}
