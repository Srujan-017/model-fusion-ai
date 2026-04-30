import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Message from "./Message";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/chat";

const modelDetails = {
  gpt: { label: "GPT-4o", accent: "from-[#B7F7CB] to-[#67E8F9]", speed: "Balanced", role: "Creative reasoning" },
  gpt41: { label: "GPT-4.1", accent: "from-[#67E8F9] to-[#A5B4FC]", speed: "Precise", role: "Structured coding" },
  deepseek: { label: "DeepSeek", accent: "from-[#FBBF24] to-[#B7F7CB]", speed: "Analytical", role: "Deep problem solving" },
  grok: { label: "Grok 3 Mini", accent: "from-[#FDA4AF] to-[#FBBF24]", speed: "Quick", role: "Fast exploration" },
  llama: { label: "Llama 4 Scout", accent: "from-[#A7F3D0] to-[#C4B5FD]", speed: "Open", role: "Broad drafting" },
};

const createMessageId = () => window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

export default function ChatWindow({ messages, setMessages, model, setModel, onNewChat, onClearChat }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesRef = useRef(null);
  const streamTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const activeModel = modelDetails[model] || modelDetails.gpt;

  useEffect(() => {
    const node = messagesRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, loading, streaming]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognition));

    return () => {
      window.clearTimeout(streamTimerRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  const createStreamUnits = (reply) => {
    const lines = reply.replace(/\r\n/g, "\n").split("\n");
    const units = [];

    lines.forEach((line, lineIndex) => {
      if (line.length > 120) {
        const words = line.split(/(\s+)/).filter(Boolean);
        let chunk = "";

        words.forEach(word => {
          chunk += word;
          if (chunk.length > 44) {
            units.push(chunk);
            chunk = "";
          }
        });

        if (chunk) units.push(chunk);
      } else if (line) {
        units.push(line);
      }

      if (lineIndex < lines.length - 1) {
        units.push("\n");
      }
    });

    return units;
  };

  const streamReply = (reply) => {
    const assistantId = createMessageId();
    const units = createStreamUnits(reply);
    let index = 0;
    let visible = "";

    setStreaming(true);
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", streaming: true }
    ]);

    const tick = () => {
      visible += units[index] || "";
      index += 1;

      setMessages(prev => {
        const next = [...prev];
        let lastIndex = -1;

        for (let i = next.length - 1; i >= 0; i -= 1) {
          if (next[i].id === assistantId) {
            lastIndex = i;
            break;
          }
        }

        if (lastIndex >= 0) {
          next[lastIndex] = {
            ...next[lastIndex],
            content: visible,
            streaming: index < units.length,
          };
        }

        return next;
      });

      if (index < units.length) {
        const previous = units[index - 1] || "";
        const delay = previous === "\n" ? 120 : Math.min(90, Math.max(26, previous.length * 3));
        streamTimerRef.current = window.setTimeout(tick, delay);
        return;
      }

      setStreaming(false);
    };

    tick();
  };

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading || streaming) return;

    const userMsg = { id: createMessageId(), role: "user", content: prompt };
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
      setLoading(false);
      streamReply(reply);
    } catch (err) {
      setLoading(false);
      streamReply("Error: " + err.message);
    }
  };

  const toggleVoiceInput = () => {
    if (!voiceSupported || loading || streaming) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setInput(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* MODEL SELECTOR */}
      <section className="model-command shrink-0 border-b border-white/10 bg-[#0A0F17]/55 px-4 py-3 backdrop-blur-2xl">
        <div className="command-deck mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="active-model-card flex min-w-0 items-center gap-3">
            <div className={`model-core bg-gradient-to-br ${activeModel.accent}`}>
              <span />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">{activeModel.label}</span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] font-medium text-[#AEBACC]">
                  {activeModel.speed}
                </span>
              </div>
              <div className="mt-1 truncate text-xs text-[#8E9AAA]">{activeModel.role}</div>
            </div>
          </div>

          <div className="control-cluster flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="chat-actions">
              <button type="button" onClick={onNewChat}>
                <span className="control-icon icon-plus" />
                New
              </button>
              <button type="button" onClick={onClearChat} disabled={!messages.length}>
                <span className="control-icon icon-spark" />
                Clear
              </button>
            </div>

            <div className="model-strip">
              {Object.entries(modelDetails).map(([value, item]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setModel(value)}
                  className={model === value ? "is-selected" : ""}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#111824] px-3 py-2 text-sm font-medium text-white shadow-sm outline-none transition hover:border-[#B7F7CB]/40 focus:border-[#B7F7CB] focus:ring-2 focus:ring-[#B7F7CB]/20 lg:hidden"
            >
              <option value="gpt">GPT-4o</option>
              <option value="gpt41">GPT-4.1</option>
              <option value="deepseek">DeepSeek</option>
              <option value="grok">Grok 3 Mini</option>
              <option value="llama">Llama 4 Scout</option>
            </select>
          </div>
        </div>
      </section>

      {/* CHAT MESSAGES */}
      <section ref={messagesRef} className="chat-canvas custom-scroll relative min-h-0 flex-1 overflow-auto px-4 py-6">
        <div className="canvas-orb orb-one" />
        <div className="canvas-orb orb-two" />
        <div className="data-grid" />
        <div className="conversation-stack mx-auto flex min-h-full max-w-6xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="empty-state mx-auto w-full max-w-3xl">
              <div className="empty-visual">
                <span className="node node-a" />
                <span className="node node-b" />
                <span className="node node-c" />
                <span className="node node-d" />
                <div className="neural-panel">
                  <div className="neural-scan" />
                  <div className="neural-title">ModelFusion AI</div>
                  <div className="neural-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#B7F7CB]">Real chat workspace</p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-5xl">
                  Start a conversation that stays saved.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#AEBACC] sm:text-base">
                  Your chats appear in the history panel, can be reopened anytime, and the prompt box stays locked at the bottom while replies stream into the conversation area.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => setInput("Write a professional product pitch for ModelFusion AI.")} className="feature-chip">Draft pitch</button>
                <button type="button" onClick={() => setModel("gpt41")} className="feature-chip">Use GPT-4.1</button>
                <button type="button" onClick={() => setInput("Explain this project like a professional product demo.")} className="feature-chip">Try prompt</button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message
              key={msg.id || `${msg.role}-${i}`}
              role={msg.role}
              text={msg.content}
              streaming={Boolean(msg.streaming)}
            />
          ))}

          {loading && (
            <div className="typing-row">
              <div className="typing-card">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* INPUT BAR */}
      <footer className="chat-composer-footer shrink-0 border-t border-white/10 bg-[#090D13]/88 px-4 py-4 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl">
          <div className="composer group">
            <textarea
              className="max-h-40 min-h-12 flex-1 resize-none rounded-lg bg-transparent px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#748094]"
              placeholder="Ask ModelFusion anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />

            <div className="composer-actions">
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={!voiceSupported || loading || streaming}
                className={`voice-button ${listening ? "is-listening" : ""}`}
                title={voiceSupported ? "Use voice input" : "Voice input is not supported in this browser"}
              >
                <span className="control-icon icon-mic" />
              </button>

              <button
                type="button"
                onClick={send}
                disabled={loading || streaming || !input.trim()}
                className="send-button"
              >
                <span>{loading ? "Thinking" : streaming ? "Writing" : "Send"}</span>
                <span className="control-icon icon-send" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-[#748094]">
            <span>{listening ? "Listening... speak now." : "Enter to send. Shift + Enter for a new line."}</span>
            <span>{activeModel.label} selected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
