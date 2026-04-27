"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, MessageSquare } from "lucide-react";
import { Booking, Ticket, ChatLog } from "@/lib/types";

interface BookingItemProps {
  booking: Booking;
  onChat: (sessionId: string, ticketId: string) => void;
}

export function BookingItem({ booking, onChat }: BookingItemProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-2.5 sm:p-3 rounded-2xl text-blue-600">
                <User size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg text-slate-900 leading-tight">{booking.fullName}</div>
                <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail size={12} /> {booking.email}
                </div>
              </div>
            </div>
            {/* Mobile Chat Button */}
            <div className="sm:hidden">
              <Button 
                size="sm" 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 h-7 text-[11px] rounded-full px-3 gap-1 shadow-sm"
                onClick={() => onChat(booking.sessionId, booking.id || "")}
              >
                Chat
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 border-t sm:border-none pt-3 sm:pt-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Class</div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none px-2 py-0.5 text-[11px] sm:text-xs">
                {booking.classInterest}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Registered</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
            {/* Desktop Chat Button */}
            <div className="hidden sm:block">
              <Button 
                size="sm" 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 h-7 text-[11px] rounded-full px-3 gap-1 shadow-sm"
                onClick={() => onChat(booking.sessionId, booking.id || "")}
              >
                Chat
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


interface TicketItemProps {
  ticket: Ticket;
  onChat: (sessionId: string, ticketId: string) => void;
}

export function TicketItem({ ticket, onChat }: TicketItemProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-800">
            <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
              <MessageSquare size={18} />
            </div>
            {ticket.type}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-3">
              {ticket.status || "Open"}
            </Badge>
            {ticket.sessionId && (
              <Button 
                size="sm" 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 h-7 text-[11px] rounded-full px-3 gap-1"
                onClick={() => ticket.id && onChat(ticket.sessionId, ticket.id)}
              >
                Chat
              </Button>
            )}
          </div>
        </div>

        <CardDescription className="pt-1">
          Case ID: {ticket.id ? ticket.id.slice(0, 8) : "N/A"} • Created on {new Date(ticket.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-slate-700 bg-white p-5 rounded-2xl border border-slate-100 leading-relaxed italic">
          &quot;{ticket.details}&quot;
        </div>
      </CardContent>
    </Card>
  );
}

interface ChatSessionItemProps {
  chat: ChatLog;
  onChat: (sessionId: string, ticketId?: string) => void;
}

export function ChatSessionItem({ chat, onChat }: ChatSessionItemProps) {
  const isLive = new Date().getTime() - new Date(chat.lastUpdatedAt).getTime() < 5 * 60 * 1000;

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-2.5 sm:p-3 rounded-2xl text-slate-600 relative">
                <MessageSquare size={20} className="sm:w-6 sm:h-6" />
                {isLive && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                  </span>
                )}
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                  Session: {chat.id?.slice(0, 8)}
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-[400px]">
                  {chat.lastMessageSnippet || "No preview available"}
                </div>
              </div>
            </div>
            {/* Mobile Chat Button */}
            <div className="sm:hidden">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-[11px] rounded-full px-3 shadow-sm"
                onClick={() => chat.id && onChat(chat.id)}
              >
                View
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 border-t sm:border-none pt-3 sm:pt-0">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Last Active</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                {new Date(chat.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {/* Desktop Chat Button */}
            <div className="hidden sm:block">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-[11px] rounded-full px-3 shadow-sm"
                onClick={() => chat.id && onChat(chat.id)}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
