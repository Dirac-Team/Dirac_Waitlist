import { Navbar } from "@/components/ui/mini-navbar";

export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Navbar />

      <div
        className="fixed left-1/2 top-[calc(100%-90px)] lg:top-[calc(100%-150px)]
        h-[500px] w-[700px] md:h-[500px] md:w-[1100px] lg:h-[750px] lg:w-[140%]
        -translate-x-1/2 rounded-[100%] border-white bg-black
        bg-[radial-gradient(closest-side,#000_82%,#ffffff)]
        pointer-events-none -z-10"
      />

      <section className="relative z-10 pt-32 pb-20 px-6 md:px-8 max-w-2xl mx-auto text-center">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-block p-4 bg-[#ff6a35]/10 rounded-full mb-2">
            <svg className="w-16 h-16 text-[#ff6a35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Payment successful
          </h1>
          <p className="text-lg text-gray-300">
            You can close this tab and return to the Dirac app.
          </p>
        </div>
      </section>
    </div>
  );
}

