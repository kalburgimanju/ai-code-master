'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { generateAIResponse } from '@/lib/ai';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: "Hello! 👋 I'm your AI travel assistant. I can help you with destinations, hotels, trip plans, cost estimates, and bookings. Where would you like to travel?",
      timestamp: Date.now(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const aiResponse = generateAIResponse(input);
    setInput('');

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        role: 'ai',
        text: aiResponse,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600 + Math.random() * 800);
  };

  const quickActions = [
    'Tell me about Bali',
    'Show hotels in Paris',
    'Cost of Tokyo trip',
    'Plan a Goa trip',
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-ocean-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 transition-all flex items-center justify-center hover:scale-105"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-2xl border border-dark-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-ocean-500 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AI Travel Assistant</p>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  Online · Ready to help
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white rounded-br-md'
                    : 'bg-dark-50 text-dark-700 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    setInput(action);
                    setTimeout(() => {
                      const userMsg: ChatMessage = { role: 'user', text: action, timestamp: Date.now() };
                      setMessages((prev) => [...prev, userMsg]);
                      const aiResponse = generateAIResponse(action);
                      setInput('');
                      setTimeout(() => {
                        const aiMsg: ChatMessage = { role: 'ai', text: aiResponse, timestamp: Date.now() };
                        setMessages((prev) => [...prev, aiMsg]);
                      }, 600);
                    }, 100);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors border border-brand-100"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-dark-100">
            <div className="flex items-center gap-2 bg-dark-50 rounded-xl px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about destinations, hotels, pricing..."
                className="flex-1 bg-transparent text-sm text-dark-800 placeholder-dark-400 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
