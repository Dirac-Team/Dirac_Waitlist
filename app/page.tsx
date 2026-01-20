import { Hero } from "@/components/hero-1";
import { Navbar } from "@/components/ui/mini-navbar";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero
        eyebrow="10-Day Free Trial"
        subtitle="No more checking all your daily tabs manually. One click -> one summary with everything you need to know to start your work."
        ctaLabel="Try for Free"
        ctaHref="/onboarding"
      />

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
              Hey, I’m Peter, founder of Dirac. Just like you (maybe) I'm a sucker for efficiency, but most tools made me spend more time figuring out “how to use them” than actually saving time.
              Hopefully, you'll find that Dirac is the exception: it fits into your workflow, not the other way around.
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
