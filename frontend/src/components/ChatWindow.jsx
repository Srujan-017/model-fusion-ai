import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Message from "./Message";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/chat";

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt"); // 🔥 model state
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
        model // 🔥 send selected model
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
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* 🔥 TOP BAR (Model Selector) */}
      <div className="p-3 border-b border-[#2A2B31] bg-[#0E0F12] flex justify-end">
       <select
  value={model}
  onChange={(e) => setModel(e.target.value)}
  className="bg-[#1E1F23] text-white px-3 py-2 rounded-lg"
>
  <option value="gpt">GPT-4o</option>
  <option value="gpt41">GPT-4.1</option>
  <option value="deepseek">DeepSeek</option>
  <option value="grok">Grok 3 Mini</option>
  <option value="llama">Llama 4 Scout</option>
</select>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} text={msg.content} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="border-t border-[#2A2B31] p-4 bg-[#0E0F12]">
        <div className="max-w-3xl mx-auto flex items-end gap-2">

          <textarea
            className="flex-1 bg-[#1E1F23] text-white p-3 rounded-lg resize-none h-14 focus:outline-none"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />

          <button
            onClick={send}
            disabled={loading}
            className="bg-[#3A3B40] hover:bg-[#4A4B50] px-4 py-2 rounded-lg text-white"
          >
            {loading ? "..." : "Send"}
          </button>

        </div>
      </div>
    </div>
  );
}