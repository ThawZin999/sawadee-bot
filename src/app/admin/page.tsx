"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageSquare, AlertCircle, RefreshCcw, Lock, Activity, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { Ticket, Booking, ChatMessage, ChatLog } from "@/lib/types";

// Extracted Components
import { StatsCards } from "@/components/admin/StatsCards";
import { BookingItem, TicketItem, ChatSessionItem } from "@/components/admin/Items";
import { AdminChat } from "@/components/admin/AdminChat";

export default function AdminDashboard() {
  // --- State ---
  const [data, setData] = useState<{ bookings: Booking[]; tickets: Ticket[]; chats: ChatLog[]; totalSessions: number }>({ 
    bookings: [], 
    tickets: [], 
    chats: [],
    totalSessions: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_pwd") || "";
    }
    return "";
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  
  const [activeChatSession, setActiveChatSession] = useState<string | null>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("bookings");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isClosingTicket, setIsClosingTicket] = useState(false);

  // --- API Actions ---
  const fetchData = useCallback(async (pwd?: string) => {
    setIsLoading(true);
    setError("");
    const currentPwd = pwd || password;
    
    try {
      const res = await fetch("/api/admin/data", {
        headers: { "Authorization": `Bearer ${currentPwd}` }
      });
      
      if (res.status === 401) {
        setIsAuthenticated(false);
        if (currentPwd) setError("Invalid password");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      setData(json);
      setIsAuthenticated(true);
      if (currentPwd) sessionStorage.setItem("admin_pwd", currentPwd);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setError("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  }, [password]);

  // --- Real-time Sync ---
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to bookings
    const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setData(prev => ({ ...prev, bookings }));
    });

    // Listen to tickets
    const ticketsQuery = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    const unsubTickets = onSnapshot(ticketsQuery, (snapshot) => {
      const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setData(prev => ({ ...prev, tickets }));
    });

    // Listen to chat sessions
    const chatsQuery = query(collection(db, "chat_logs"), orderBy("lastUpdatedAt", "desc"), limit(50));
    const unsubChats = onSnapshot(chatsQuery, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatLog));
      setData(prev => ({ ...prev, chats }));
    });

    return () => {
      unsubBookings();
      unsubTickets();
      unsubChats();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeChatSession || !isAuthenticated) return;

    const q = query(
      collection(db, "chat_logs", activeChatSession, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChatMessages(snapshot.docs.map((doc) => doc.data() as ChatMessage));
    });

    return () => unsubscribe();
  }, [activeChatSession, isAuthenticated]);

  // --- Auto-login on mount if session exists ---
  useEffect(() => {
    const savedPwd = sessionStorage.getItem("admin_pwd");
    if (savedPwd) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData(savedPwd);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleAdminReply = async (content: string) => {
    if (!activeChatSession) return;
    setIsSendingReply(true);
    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`
        },
        body: JSON.stringify({ sessionId: activeChatSession, content })
      });
      if (!res.ok) throw new Error("Failed to send reply");
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!activeChatSession) return;
    setIsClosingTicket(true);
    try {
      const res = await fetch("/api/admin/chat", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${password}`
        },
        body: JSON.stringify({ sessionId: activeChatSession, ticketId: activeTicketId })
      });
      if (!res.ok) throw new Error("Failed to close ticket");
      
      setActiveChatSession(null);
      setActiveTicketId(null);
      setActiveTab("tickets");
    } catch (error) {
      console.error("Failed to close ticket:", error);
    } finally {
      setIsClosingTicket(false);
    }
  };


  const startChat = (sessionId: string, ticketId?: string) => {
    setActiveChatSession(sessionId);
    setActiveTicketId(ticketId || null);
    setActiveTab("chat");
  };

  // --- UI Helpers ---
  const conversionRate = data.totalSessions > 0 
    ? Math.min(100, (new Set(data.bookings.map(b => b.sessionId)).size / data.totalSessions) * 100).toFixed(1) 
    : "0";

  const actionedSessionIds = new Set([
    ...data.bookings.map(b => b.sessionId),
    ...data.tickets.map(t => t.sessionId)
  ]);
  
  const now = new Date().getTime();
  const activeChats = (data.chats || []).filter(c => {
    const sId = c.id || c.sessionId;
    if (actionedSessionIds.has(sId)) return false;
    const timeDiff = now - new Date(c.lastUpdatedAt).getTime();
    return timeDiff < 2 * 60 * 60 * 1000;
  });

  const archivedChats = (data.chats || []).filter(c => {
    const sId = c.id || c.sessionId;
    if (actionedSessionIds.has(sId)) return false;
    const timeDiff = now - new Date(c.lastUpdatedAt).getTime();
    return timeDiff >= 2 * 60 * 60 * 1000;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-outfit">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold">Admin Portal</h2>
            <p className="text-slate-500 text-sm">Enter your administrator password to continue.</p>
          </div>
          <div className="space-y-4">
            <Input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              className="h-12 bg-slate-50 border-slate-200 rounded-xl"
            />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <Button 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold rounded-xl"
              onClick={() => fetchData()}
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-10 font-outfit">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">SawadeeBot Admin</h1>
            <p className="text-slate-500">Monitor student inquiries and bookings in real-time.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={isLoading} className="gap-2 rounded-xl">
              <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              sessionStorage.removeItem("admin_pwd");
              setIsAuthenticated(false);
              setPassword("");
            }}>
              Logout
            </Button>
          </div>
        </header>

        <StatsCards 
          bookingsCount={data.bookings.length} 
          ticketsCount={data.tickets.length} 
          conversionRate={conversionRate} 
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-6">
            <TabsList className="w-full flex h-auto p-1 bg-slate-200/50 rounded-xl overflow-x-auto scrollbar-hide justify-start sm:justify-center gap-1 relative">
              <TabsTrigger value="bookings" className="flex-shrink-0 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-3 sm:px-4">
                <Calendar size={16} /> <span className="hidden md:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex-shrink-0 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-3 sm:px-4">
                <AlertCircle size={16} /> <span className="hidden md:inline">Tickets</span>
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex-shrink-0 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-3 sm:px-4 relative">
                <Activity size={16} /> <span className="hidden md:inline">Monitor</span>
                {activeChats.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="archive" className="flex-shrink-0 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 px-3 sm:px-4">
                <Archive size={16} /> <span className="hidden md:inline">Archive</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className={`flex-shrink-0 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-blue-600 rounded-lg py-2 px-3 sm:px-4 ${!activeChatSession ? "hidden" : ""}`}
              >
                <MessageSquare size={16} /> <span className="hidden md:inline">Active Chat</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bookings" className="space-y-4">
            {data.bookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                No bookings found yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.bookings.map((booking) => <BookingItem key={booking.id} booking={booking} onChat={startChat} />)}
              </div>

            )}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            {data.tickets.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                No active tickets.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.tickets.map((ticket) => <TicketItem key={ticket.id} ticket={ticket} onChat={startChat} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4">
            {activeChats.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                No active live sessions right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeChats.map((chat) => <ChatSessionItem key={chat.id} chat={chat} onChat={startChat} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archive" className="space-y-4">
            {archivedChats.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                No archived chats available.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {archivedChats.map((chat) => <ChatSessionItem key={chat.id} chat={chat} onChat={startChat} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            {!activeChatSession ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                Select a support ticket to start chatting with a student.
              </div>
            ) : (
              <AdminChat 
                sessionId={activeChatSession}
                messages={chatMessages}
                onClose={handleCloseTicket}
                onReply={handleAdminReply}
                isSending={isSendingReply}
                isClosing={isClosingTicket}
                isFetching={false}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
