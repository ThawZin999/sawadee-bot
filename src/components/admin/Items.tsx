"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, MessageSquare } from "lucide-react";
import { Booking, Ticket } from "@/lib/types";

interface BookingItemProps {
  booking: Booking;
}

export function BookingItem({ booking }: BookingItemProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <User size={24} />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900">{booking.fullName}</div>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Mail size={12} /> {booking.email}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Class Interest</div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none px-3 py-1">
                {booking.classInterest}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Registered</div>
              <div className="text-sm font-semibold text-slate-700">
                {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
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
                Chat with Student
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
