"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot } from "lucide-react";
import { ChatMessage } from "@/lib/types";

interface AdminChatProps {
  sessionId: string;
  messages: ChatMessage[];
  onClose: () => Promise<void>;
  onReply: (content: string) => Promise<void>;
  isSending: boolean;
  isClosing: boolean;
  isFetching: boolean;
}

export function AdminChat({
  sessionId,
  messages,
  onClose,
  onReply,
  isSending,
  isClosing,
  isFetching,
}: AdminChatProps) {
  const [adminReply, setAdminReply] = useState("");

  const handleSend = async () => {
    if (!adminReply.trim()) return;
    await onReply(adminReply);
    setAdminReply("");
  };

  return (
    <Card className="border-none shadow-sm h-[500px] sm:h-[600px] flex flex-col overflow-hidden">
      <CardHeader className="bg-blue-50/50 border-b border-blue-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-bold text-blue-900">
              <Bot size={20} />
              <span className="truncate">Session: {sessionId.slice(-8)}</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Review history and respond directly.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2 w-full sm:w-auto text-xs"
            onClick={onClose}
            disabled={isClosing}
          >
            {isClosing ? "Closing..." : "Close & Re-enable AI"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    : msg.role === "admin"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-200 text-slate-700 rounded-tr-none"
                }`}
              >
                <div className="font-bold text-[10px] uppercase mb-1 opacity-70">
                  {msg.role} • {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                {msg.content}
              </div>
            </div>
          ))}
          {isFetching && <div className="text-center text-slate-400 text-xs italic">Loading history...</div>}
        </div>
      </CardContent>
      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <Input
          placeholder="Type your reply to the student..."
          value={adminReply}
          onChange={(e) => setAdminReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-slate-50 border-slate-200"
          disabled={isSending}
        />
        <Button onClick={handleSend} disabled={isSending || !adminReply.trim()} className="bg-blue-600 hover:bg-blue-700">
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </Card>
  );
}
