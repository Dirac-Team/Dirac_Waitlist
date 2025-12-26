import { Hero } from "@/components/hero-1";

export default function Home() {
  return (
    <Hero
      eyebrow="MVP is Coming soon"
      subtitle="Stop checking all your daily tabs manually. One click -> one summary with everything you need to know to start your work."
      ctaLabel="Join The Waitlist"
      ctaHref="/waitlist"
    />
  );
}
