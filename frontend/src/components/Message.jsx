import React from "react";

export default function Message({ role, text }) {
  const isUser = role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-lg text-sm whitespace-pre-wrap
          ${isUser ? 
            "bg-[#3A3B40] text-white" : 
            "bg-[#1E1F23] text-gray-200"
          }`}
      >
        {text}
      </div>
    </div>
  );
}
