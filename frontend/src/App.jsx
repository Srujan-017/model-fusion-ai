import React from "react";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  return (
    <div className="app-shell h-screen w-screen flex bg-[#0B0D10] text-white overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="hidden md:flex w-[286px] shrink-0 bg-[#111419]/90 border-r border-white/10 flex-col p-4">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#22C55E] text-[#06130B] grid place-items-center font-bold shadow-[0_0_24px_rgba(34,197,94,0.25)]">
            MF
          </div>
          <div>
            <div className="text-sm font-semibold text-white">ModelFusion AI</div>
            <div className="text-xs text-[#9CA3AF]">Multi-model chat</div>
          </div>
        </div>

        <button className="group mb-5 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-left text-sm font-medium text-white transition hover:border-[#22C55E]/40 hover:bg-[#22C55E]/10">
          <span>New Chat</span>
          <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10 text-base leading-none transition group-hover:bg-[#22C55E] group-hover:text-[#06130B]">
            +
          </span>
        </button>

        <div className="flex-1 overflow-auto space-y-2 pr-1">
          <div className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-3 text-sm text-gray-100 shadow-sm">
            <div className="truncate font-medium">Previous chat 1</div>
            <div className="mt-1 text-xs text-[#8C939F]">Recent conversation</div>
          </div>
          <div className="rounded-lg border border-transparent px-3 py-3 text-sm text-[#AEB6C2] transition hover:border-white/10 hover:bg-white/[0.05]">
            <div className="truncate font-medium">Previous chat 2</div>
            <div className="mt-1 text-xs text-[#7E8794]">Saved thread</div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-[#0B0D10]/70 p-3 text-xs text-[#AEB6C2]">
          <div className="font-medium text-white">ModelFusion AI</div>
          <div className="mt-1">Multi-Model workspace</div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex min-w-0 flex-col">
        {/* TOP HEADER */}
        <div className="h-16 border-b border-white/10 bg-[#0B0D10]/80 px-5 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-white">ModelFusion AI</div>
            <div className="text-xs text-[#8C939F]">Compare and continue across models</div>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-3 py-1.5 text-xs font-medium text-[#86EFAC]">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.85)]" />
            Online
          </div>
        </div>

        {/* CHAT WINDOW */}
        <ChatWindow />
      </div>
    </div>
  );
}
