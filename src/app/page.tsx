"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, Loader2, Info } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

// Firebase Client
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Extracted Components
import { ChatBubble } from "@/components/chat/ChatBubble";

export default function Home() {
  // --- State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("chat_session_id");
      if (!id) {
        id = "session_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("chat_session_id", id);
      }
      return id;
    }
    return "";
  });
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Real-time Sync & Initialization ---
  useEffect(() => {
    if (!sessionId) return;

    const initialGreeting: ChatMessage = {
      role: "assistant",
      content: "Sawasdee kha! I&apos;m SawadeeBot. How can I help you with your Thai language learning today?",
      timestamp: new Date().toISOString(),
    };

    // Listen for database changes
    const q = query(
      collection(db, "chat_logs", sessionId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbMessages = snapshot.docs.map((doc) => doc.data() as ChatMessage);
      setMessages(dbMessages.length === 0 ? [initialGreeting] : dbMessages);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingMessage]);

  // --- Actions ---
  const handleSendMessage = async (text?: string) => {
    const messageToSend = typeof text === "string" ? text : input;
    if (!messageToSend.trim() || isLoading) return;

    if (!text) setInput("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-session-id": sessionId 
        },
        body: JSON.stringify({ message: messageToSend, history: messages }),
      });

      if (!response.ok) throw new Error("Failed to connect");

      const contentType = response.headers.get("Content-Type");
      if (contentType && !contentType.includes("text/event-stream")) {
        // Handover handled
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      setIsLoading(false);

      if (reader) {
        let fullContent = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingMessage(fullContent);
        }
        setStreamingMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      setStreamingMessage("");
    }
  };

  const isAdminActive = messages.some(m => m.role === "admin");

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] sm:min-h-0 sm:h-screen bg-slate-50 font-outfit p-0 sm:p-4 md:p-8">
      <Card className="w-full max-w-2xl h-[100dvh] sm:h-[85vh] flex flex-col shadow-none sm:shadow-sm border-0 sm:border border-slate-200 overflow-hidden bg-white rounded-none sm:rounded-3xl">
        <CardHeader className="bg-white border-b border-slate-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-50 p-2 rounded-full text-blue-600 sm:p-2.5">
                <Bot size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  SawadeeBot
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium">ThaiTalk Language School</p>
                  {isAdminActive && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] sm:text-[10px] h-4 px-1.5 animate-pulse">
                      Admin Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Dialog>
              <DialogTrigger render={
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Info size={18} className="sm:w-5 sm:h-5" />
                </Button>
              } />
              <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                      <Bot size={20} />
                    </div>
                    About SawadeeBot
                  </DialogTitle>
                  <DialogDescription className="pt-2 text-slate-600 leading-relaxed">
                    SawadeeBot is your AI-powered companion at **ThaiTalk Language School**. 
                    I'm here to make your Thai language journey smooth and enjoyable!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900">What I can do:</h4>
                    <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4">
                      <li>Answer questions about Thai grammar and vocabulary</li>
                      <li>Provide details on our **Course Pricing** and **Schedules**</li>
                      <li>Help you **Book a Class** with our expert teachers</li>
                      <li>Seamlessly connect you to a human admin for complex requests</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 italic">
                      "Whether you're a beginner or looking to polish your Thai, I'm available 24/7 to assist you."
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 bg-white">
          <ScrollArea className="h-full px-4 py-6 sm:px-6 sm:py-8">
            <div className="space-y-6 sm:space-y-8">
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} content={m.content} />
              ))}
              
              {streamingMessage && (
                <ChatBubble role="assistant" content={streamingMessage} />
              )}

              {isLoading && !streamingMessage && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
                      <Bot size={14} />
                    </div>
                    <div className="p-3 sm:p-4 rounded-2xl bg-slate-100 text-slate-400 rounded-tl-none border border-slate-50 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs font-medium">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 bg-white border-t border-slate-100">
          {!isLoading && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center w-full">
              {[
                "Available classes", 
                "Pricing info", 
                "How to book?", 
                "Class schedule",
                "About ThaiTalk"
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div className="flex w-full gap-2 relative">
            <Input
              placeholder={isAdminActive ? "Reply to admin..." : "How can I help you today?"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="bg-slate-50 border-slate-200 focus:bg-white text-slate-900 rounded-2xl h-11 sm:h-12 pr-12 transition-all text-sm sm:text-base"
            />
            <Button 
              size="icon" 
              onClick={() => handleSendMessage()} 
              disabled={isLoading || !input.trim()}
              className="absolute right-1 top-1 bottom-1 w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-transform active:scale-95"
            >
              <Send size={16} className="sm:w-4.5 sm:h-4.5" />
            </Button>
          </div>
          <p className="text-[9px] sm:text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">
            AI Assistant • ThaiTalk Language School
          </p>
        </CardFooter>
      </Card>
    </div>

  );
}
