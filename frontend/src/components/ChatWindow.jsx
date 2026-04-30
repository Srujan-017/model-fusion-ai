import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Message from "./Message";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/chat";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(API_BASE, {
        messages: updated,
        model,
      });

      const reply = res.data.reply || "Error: Empty response";

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: reply }
      ]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Error: " + err.message }
      ]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex-1 flex min-h-0 flex-col overflow-hidden bg-[#080A0D]/70">
      {/* MODEL SELECTOR */}
      <div className="border-b border-white/10 bg-[#0D1014]/85 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase text-[#8C939F]">Active model</div>
            <div className="truncate text-sm text-[#D6DEE8]">Route this chat through your selected AI</div>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="min-w-[160px] rounded-lg border border-white/10 bg-[#171B21] px-3 py-2 text-sm font-medium text-white shadow-sm outline-none transition hover:border-[#22C55E]/40 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
          >
            <option value="gpt">GPT-4o</option>
            <option value="gpt41">GPT-4.1</option>
            <option value="deepseek">DeepSeek</option>
            <option value="grok">Grok 3 Mini</option>
            <option value="llama">Llama 4 Scout</option>
          </select>
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div className="custom-scroll flex-1 overflow-auto px-4 py-6">
        <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="m-auto w-full max-w-2xl rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-[#22C55E] text-lg font-bold text-[#06130B]">
                MF
              </div>
              <h1 className="text-xl font-semibold text-white">Start a smarter model conversation</h1>
              <p className="mt-2 text-sm leading-6 text-[#AEB6C2]">
                Choose a model, ask your question, and keep the thread focused in one clean workspace.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} role={msg.role} text={msg.content} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* INPUT BAR */}
      <div className="border-t border-white/10 bg-[#0D1014]/95 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-xl border border-white/10 bg-[#15191F] p-2 shadow-[0_-12px_40px_rgba(0,0,0,0.22)]">
          <textarea
            className="max-h-40 min-h-12 flex-1 resize-none rounded-lg bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#7E8794]"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />

          <button
            onClick={send}
            disabled={loading}
            className="h-11 shrink-0 rounded-lg bg-[#22C55E] px-4 text-sm font-semibold text-[#06130B] transition hover:bg-[#4ADE80] disabled:cursor-not-allowed disabled:bg-[#2A3330] disabled:text-[#77817B]"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
