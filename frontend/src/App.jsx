import React, { useEffect, useMemo, useState } from "react";
import ChatWindow from "./components/ChatWindow";

const STORAGE_KEY = "modelfusion.chatThreads.v1";
const THEME_KEY = "modelfusion.theme.v1";

const themes = [
  { id: "fusion", name: "Fusion", hint: "Dark neon" },
  { id: "midnight", name: "Midnight", hint: "Deep focus" },
  { id: "aurora", name: "Aurora", hint: "Soft color" },
  { id: "daylight", name: "Daylight", hint: "Bright clean" },
];

const createThread = () => ({
  id: window.crypto?.randomUUID?.() || String(Date.now()),
  title: "New chat",
  messages: [],
  model: "gpt",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const makeTitle = (messages) => {
  const firstPrompt = messages.find(message => message.role === "user")?.content?.trim();
  if (!firstPrompt) return "New chat";
  return firstPrompt.length > 42 ? `${firstPrompt.slice(0, 42)}...` : firstPrompt;
};

const loadWorkspace = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.threads?.length) {
      return {
        threads: saved.threads,
        activeThreadId: saved.activeThreadId || saved.threads[0].id,
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const thread = createThread();
  return { threads: [thread], activeThreadId: thread.id };
};

export default function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "fusion");

  const activeThread = useMemo(
    () => workspace.threads.find(thread => thread.id === workspace.activeThreadId) || workspace.threads[0],
    [workspace]
  );

  const totalMessages = useMemo(
    () => workspace.threads.reduce((total, thread) => total + thread.messages.length, 0),
    [workspace.threads]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const createNewChat = () => {
    setWorkspace(prev => {
      const currentThread = prev.threads.find(thread => thread.id === prev.activeThreadId);
      if (currentThread && currentThread.messages.length === 0) {
        return prev;
      }

      const thread = createThread();
      return {
        threads: [thread, ...prev.threads],
        activeThreadId: thread.id,
      };
    });
  };

  const selectThread = (threadId) => {
    setWorkspace(prev => ({ ...prev, activeThreadId: threadId }));
  };

  const deleteThread = (threadId) => {
    setWorkspace(prev => {
      if (prev.threads.length === 1) {
        const thread = createThread();
        return { threads: [thread], activeThreadId: thread.id };
      }

      const nextThreads = prev.threads.filter(thread => thread.id !== threadId);
      return {
        threads: nextThreads,
        activeThreadId: prev.activeThreadId === threadId ? nextThreads[0].id : prev.activeThreadId,
      };
    });
  };

  const clearActiveThread = () => {
    setWorkspace(prev => ({
      ...prev,
      threads: prev.threads.map(thread =>
        thread.id === prev.activeThreadId
          ? { ...thread, title: "New chat", messages: [], updatedAt: Date.now() }
          : thread
      ),
    }));
  };

  const setActiveMessages = (nextMessages) => {
    setWorkspace(prev => ({
      ...prev,
      threads: prev.threads.map(thread => {
        if (thread.id !== prev.activeThreadId) return thread;

        const messages = typeof nextMessages === "function"
          ? nextMessages(thread.messages)
          : nextMessages;

        return {
          ...thread,
          messages,
          title: makeTitle(messages),
          updatedAt: Date.now(),
        };
      }),
    }));
  };

  const setActiveModel = (model) => {
    setWorkspace(prev => ({
      ...prev,
      threads: prev.threads.map(thread =>
        thread.id === prev.activeThreadId
          ? { ...thread, model, updatedAt: Date.now() }
          : thread
      ),
    }));
  };

  return (
    <div className={`app-shell theme-${theme} relative h-[100dvh] min-h-[100dvh] w-screen overflow-hidden bg-[#07090D] text-white`}>
      <div className="mesh-layer" />
      <div className="scanline-layer" />

      <div className="relative z-10 flex h-full min-h-0 w-full">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar-shell hidden w-[318px] shrink-0 border-r border-white/10 bg-[#090D13]/78 p-4 backdrop-blur-2xl lg:flex lg:flex-col">
          <div className="brand-card mb-5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.055] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="brand-mark relative grid h-11 w-11 place-items-center rounded-lg bg-[#B7F7CB] text-sm font-black text-[#06100A]">
              MF
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">ModelFusion AI</div>
              <div className="mt-0.5 text-xs text-[#8E9AAA]">Chat history workspace</div>
            </div>
          </div>

          <div className="sidebar-actions">
            <button
              type="button"
              onClick={createNewChat}
              className="sidebar-action primary"
            >
              <span className="control-icon icon-plus" />
              <span>New Chat</span>
            </button>

            <button
              type="button"
              onClick={clearActiveThread}
              disabled={!activeThread?.messages.length}
              className="sidebar-action"
            >
              <span className="control-icon icon-spark" />
              <span>Clear Chat</span>
            </button>
          </div>

          <div className="theme-panel">
            <div className="theme-panel-head">
              <span>Theme</span>
              <small>{themes.find(item => item.id === theme)?.hint}</small>
            </div>
            <div className="theme-grid">
              {themes.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`theme-choice theme-swatch-${item.id} ${theme === item.id ? "is-active" : ""}`}
                >
                  <span />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="metric-tile">
              <span className="metric-dot bg-[#B7F7CB]" />
              <strong>{workspace.threads.length}</strong>
              <small>Chats</small>
            </div>
            <div className="metric-tile">
              <span className="metric-dot bg-[#67E8F9]" />
              <strong>{totalMessages}</strong>
              <small>Messages</small>
            </div>
            <div className="metric-tile">
              <span className="metric-dot bg-[#FBBF24]" />
              <strong>{activeThread?.model?.toUpperCase()}</strong>
              <small>Model</small>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#657184]">History</span>
            <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-[#9AA6B6]">Saved locally</span>
          </div>

          <div className="custom-scroll flex-1 space-y-2 overflow-auto pr-1">
            {workspace.threads.map(thread => (
              <div
                key={thread.id}
                className={`thread-item ${thread.id === workspace.activeThreadId ? "is-active" : ""}`}
              >
                {thread.id === workspace.activeThreadId && <div className="thread-glow" />}
                <button
                  type="button"
                  onClick={() => selectThread(thread.id)}
                  className="thread-main"
                >
                  <span className="truncate text-sm font-semibold text-white">{thread.title}</span>
                  <span className="mt-1 truncate text-xs text-[#9AA6B6]">
                    {thread.messages.length ? `${thread.messages.length} messages` : "Empty thread"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteThread(thread.id)}
                  className="thread-delete"
                  aria-label={`Delete ${thread.title}`}
                >
                  <span className="control-icon icon-trash" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-[#0B1018]/75 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Storage</span>
              <span className="pulse-chip">Local</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="pulse-bar h-full rounded-full" />
            </div>
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* TOP HEADER */}
          <header className="app-header flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#090D13]/65 px-4 backdrop-blur-2xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-sm font-black text-[#B7F7CB] lg:hidden">
                MF
              </div>
              <div className="min-w-0">
                <div className="workspace-eyebrow">ModelFusion workspace</div>
                <div className="workspace-title truncate">{activeThread?.title || "New chat"}</div>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="top-theme-switcher" aria-label="Theme switcher">
                {themes.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`theme-dot-button theme-swatch-${item.id} ${theme === item.id ? "is-active" : ""}`}
                    title={`${item.name}: ${item.hint}`}
                  >
                    <span />
                    <em>{item.name}</em>
                  </button>
                ))}
              </div>
              <div className="signal-pill">
                <span className="signal-dot" />
                Saved
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-medium text-[#C6D1DF]">
                MERN UI
              </div>
            </div>
          </header>

          {/* CHAT WINDOW */}
          <ChatWindow
            messages={activeThread?.messages || []}
            setMessages={setActiveMessages}
            model={activeThread?.model || "gpt"}
            setModel={setActiveModel}
            onNewChat={createNewChat}
            onClearChat={clearActiveThread}
          />
        </main>
      </div>
    </div>
  );
}
