export interface ThaiClass {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  price: string;
  schedule: string;
  description: string;
}

export interface Booking {
  id?: string;
  sessionId: string;
  fullName: string;
  email: string;
  classInterest: string;
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: string; // ServerTimestamp ISO string
}

export interface Ticket {
  id?: string;
  sessionId: string;
  type: "Refund" | "Complaint" | "Escalation" | "Handover Request";
  details: string;
  status: "Open" | "In Progress" | "Closed";
  createdAt: string; // ServerTimestamp ISO string
}

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "admin";
  content: string;
  timestamp: string;
}

export interface ChatLog {
  id?: string;
  sessionId: string;
  messages?: ChatMessage[];
  lastUpdatedAt: string; // ServerTimestamp ISO string
  lastMessageSnippet?: string;
  handoverActive?: boolean;
  handoverReason?: string;
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}
