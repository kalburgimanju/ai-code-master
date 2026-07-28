export interface Email {
  id: string;
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  labels?: string[];
  unread?: boolean;
  body?: string;
  accountEmail?: string;
}

export interface EmailDetail extends Email {
  headers?: Record<string, string>;
}

export interface Account {
  email: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
}
