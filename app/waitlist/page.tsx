"use client";

import { HeroWave } from "@/components/ai-input-hero";
import { useState, useEffect } from "react";

export default function WaitlistPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setShowConfetti(true);
      setMessage({
        type: "success",
        text: "Successfully joined! Check your email for confirmation.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="relative overflow-hidden">
      <HeroWave
        title="Join The Waitlist"
        subtitle="Get early access to Dirac — morning context in 30 seconds, not 20 minutes"
        placeholder="xxxxxxx@gmail.com"
        buttonText={isSubmitting ? "Joining..." : "Join"}
        onPromptSubmit={handleSubmit}
      />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiParticles.map((i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.2}s`,
                animationDuration: `${1 + Math.random() * 1}s`,
                background: ['#ed5b25', '#ff6a35', '#d94e1f'][Math.floor(Math.random() * 3)],
                width: '8px',
                height: '8px',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      )}

      {message && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-8 py-5 rounded-full border-2 animate-slide-up ${
            message.type === "success"
              ? "bg-white dark:bg-black border-[#ed5b25] dark:border-[#ff6a35] text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(237,91,37,0.4)]"
              : "bg-red-500 border-red-700 text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)]"
          }`}
          style={{ maxWidth: "90%", width: "auto" }}
        >
          <p className="text-base font-bold flex items-center gap-3">
            {message.type === "success" && (
              <span className="text-2xl animate-bounce">✓</span>
            )}
            {message.type === "error" && (
              <span className="text-2xl">✕</span>
            )}
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}
