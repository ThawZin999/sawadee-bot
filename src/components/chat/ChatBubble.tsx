"use client";

import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  role: "user" | "assistant" | "admin" | "system";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";
  const isAdmin = role === "admin";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-slate-800 text-white" : 
          isAdmin ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {isUser ? <User size={12} className="sm:w-3.5 sm:h-3.5" /> : <Bot size={12} className="sm:w-3.5 sm:h-3.5" />}
        </div>
        <div className={`p-3 sm:p-4 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-sm ${
          isUser 
            ? "bg-blue-600 text-white rounded-tr-none" 
            : isAdmin
            ? "bg-blue-50 text-slate-800 rounded-tl-none border border-blue-100"
            : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-50"
        }`}>
          {!isUser ? (
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.replace(/\[ACTION:.*?\]/g, "")}
              </ReactMarkdown>
              {isAdmin && (
                <p className="text-[10px] text-blue-600 font-bold mt-2 uppercase tracking-tighter">Admin Response</p>
              )}
            </div>
          ) : (
            content.replace(/\[ACTION:.*?\]/g, "")
          )}
        </div>
      </div>
    </div>
  );
}
