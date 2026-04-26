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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? "bg-slate-800 text-white" : 
          isAdmin ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {isUser ? <User size={14} /> : <Bot size={14} />}
        </div>
        <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
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
