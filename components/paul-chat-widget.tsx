"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export function PaulChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey — I’m Paul. Ask me anything about Dirac (trial, license key, downloads, updates, privacy).",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  async function send() {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    setError(null);

    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setIsSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Chat failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "" }]);
    } catch (e: any) {
      setError(e?.message || "Chat failed");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[60] rounded-full bg-[#ff6a35] text-black font-bold px-5 py-3 shadow-lg
                   hover:bg-[#ff7d4d] transition-colors border-2 border-black/20"
        aria-label="Open Paul chat"
      >
        Ask Paul
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-[60] w-[92vw] max-w-[380px] h-[520px] bg-black border border-[#333] rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#0b0b0b]">
            <div className="text-white font-bold">Paul</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-white"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="px-4 py-3 h-[390px] overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-[#ff6a35] text-black px-3 py-2 text-sm whitespace-pre-wrap"
                    : "mr-auto max-w-[85%] rounded-2xl bg-[#141414] text-white px-3 py-2 text-sm whitespace-pre-wrap border border-[#222]"
                }
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div className="mr-auto max-w-[85%] rounded-2xl bg-[#141414] text-white px-3 py-2 text-sm border border-[#222]">
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-[#222] bg-[#0b0b0b]">
            {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask Paul…"
                className="flex-1 rounded-xl bg-black text-white border border-[#333] px-3 py-2 text-sm focus:outline-none focus:border-[#ff6a35]"
              />
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="rounded-xl px-4 py-2 bg-[#ff6a35] text-black font-bold disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] text-gray-500">
              Don’t paste passwords, 2FA codes, or API keys.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

