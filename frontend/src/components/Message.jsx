import React from "react";

export default function Message({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[88%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className="px-1 text-[11px] font-medium uppercase text-[#7E8794]">
          {isUser ? "You" : "ModelFusion"}
        </div>
        <div
          className={`rounded-lg px-4 py-3 text-sm leading-6 shadow-sm whitespace-pre-wrap
            ${isUser
              ? "bg-[#22C55E] text-[#06130B]"
              : "border border-white/10 bg-[#171B21] text-[#D6DEE8]"
            }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
