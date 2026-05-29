"use client";

import { useState, useRef, useEffect } from "react";
import { chatWithCopilot, type ChatMessage } from "@/lib/api";

let _sessionId: string | null = null;
function getSessionId() {
  if (!_sessionId) {
    _sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return _sessionId;
}

export function CopilotChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          session_id: getSessionId(),
          role: "assistant",
          content:
            "Hello! I'm the DClaw Water AI Copilot. I can help you with leak detection, usage monitoring, water quality, and operational recommendations. What would you like to know?",
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    try {
      const resp = await chatWithCopilot(getSessionId(), text);
      setMessages((prev) => [...prev, resp.user_message, resp.assistant_message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          session_id: getSessionId(),
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white text-xl shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-105"
        style={{ background: "#7660A8" }}
        aria-label="AI Copilot"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 w-80 rounded-2xl shadow-xl flex flex-col z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid #E2DCEE", height: "420px" }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#7660A8" }}>
            <span className="text-white text-lg">🤖</span>
            <div>
              <p className="text-white font-semibold text-sm">Water AI Copilot</p>
              <p className="text-purple-200 text-xs">Powered by DClaw</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === "user" ? "self-end text-white" : "self-start"
                }`}
                style={
                  msg.role === "user"
                    ? { background: "#7660A8" }
                    : { background: "#F1EEF8", color: "#404049" }
                }
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            ))}
            {loading && (
              <div className="self-start px-3 py-2 rounded-xl text-sm" style={{ background: "#F1EEF8", color: "#7A7A85" }}>
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t flex gap-2" style={{ borderColor: "#E2DCEE" }}>
            <input
              className="flex-1 text-sm rounded-lg px-3 py-2 outline-none border focus:border-purple-400"
              style={{ borderColor: "#E2DCEE", background: "#F8F6FB" }}
              placeholder="Ask about leaks, quality…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              disabled={loading}
              className="px-3 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ background: "#7660A8" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
