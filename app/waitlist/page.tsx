"use client";

import { HeroWave } from "@/components/ai-input-hero";
import { useState } from "react";

export default function WaitlistPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  return (
    <div>
      <HeroWave
        title="Join The Waitlist"
        subtitle="Join the waitlist to test our MVP"
        placeholder="xxxxxxx@gmail.com"
        buttonText={isSubmitting ? "Joining..." : "Join"}
        onPromptSubmit={handleSubmit}
      />
      {message && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-lg ${
            message.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
          style={{ maxWidth: "90%", width: "auto" }}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}
    </div>
  );
}
