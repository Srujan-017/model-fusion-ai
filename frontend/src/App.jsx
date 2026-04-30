import React from "react";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  return (
    <div className="h-screen w-screen flex bg-[#0E0F12] text-white overflow-hidden">

      {/* LEFT SIDEBAR */}
      <div className="w-[260px] bg-[#1E1F23] border-r border-[#2A2B31] flex flex-col p-4">
        <button className="bg-[#343541] hover:bg-[#3F4046] text-left px-3 py-2 rounded-lg mb-4">
          + New Chat
        </button>

        <div className="flex-1 overflow-auto space-y-2">
          <div className="bg-[#2A2B31] px-3 py-2 rounded-md text-sm text-gray-300">
            Previous chat 1
          </div>
          <div className="bg-[#2A2B31] px-3 py-2 rounded-md text-sm text-gray-300">
            Previous chat 2
          </div>
        </div>

        <div className="mt-4 text-gray-400 text-sm">
        ModelFusion AI • Multi-Model
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        
        {/* TOP HEADER */}
        <div className="h-[55px] border-b border-[#2A2B31] flex items-center justify-center text-lg font-semibold">
         ModelFusion AI
        </div>

        {/* CHAT WINDOW */}
        <ChatWindow />
      </div>
    </div>
  );
}
