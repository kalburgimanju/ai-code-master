'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle2, Clock, AlertCircle, Search, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: number;
}

interface BookingInfo {
  id: string;
  destination: string;
  status: 'confirmed' | 'pending' | 'completed';
  checkIn: string;
  guests: number;
  totalCost: number;
}

const sampleBookings: BookingInfo[] = [
  { id: 'ATL-7X2K9M', destination: 'Bali, Indonesia', status: 'confirmed', checkIn: '2026-07-15', guests: 2, totalCost: 90000 },
  { id: 'ATL-3P8N4L', destination: 'Paris, France', status: 'pending', checkIn: '2026-08-20', guests: 4, totalCost: 260000 },
  { id: 'ATL-9W5T2J', destination: 'Tokyo, Japan', status: 'completed', checkIn: '2026-05-10', guests: 2, totalCost: 156000 },
];

function generateFollowUpResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('status') || lower.includes('where') || lower.includes('track')) {
    return `📋 **Your Bookings:**\n\n1. **ATL-7X2K9M** — Bali, Indonesia\n   Status: ✅ Confirmed | Check-in: July 15, 2026\n   Guests: 2 | Total: ₹90,000\n\n2. **ATL-3P8N4L** — Paris, France\n   Status: ⏳ Pending | Check-in: Aug 20, 2026\n   Guests: 4 | Total: ₹2,60,000\n\n3. **ATL-9W5T2J** — Tokyo, Japan\n   Status: ✅ Completed | May 10, 2026\n\nNeed help with any specific booking?`;
  }

  if (lower.includes('cancel')) {
    return `I can help you with cancellation. Please provide your booking ID (e.g., ATL-7X2K9M) and I'll process the request.\n\n📋 **Cancellation Policy:**\n• 30+ days before check-in: Full refund\n• 15-29 days: 50% refund\n• Less than 15 days: No refund\n\nWhich booking would you like to cancel?`;
  }

  if (lower.includes('change') || lower.includes('modify') || lower.includes('update')) {
    return `I can help you modify your booking. What would you like to change?\n\n• 📅 **Dates** — Change check-in/check-out\n• 👥 **Guests** — Add or remove travelers\n• 🏨 **Hotel** — Upgrade or switch accommodation\n• 📋 **Itinerary** — Add activities or tours\n\nJust tell me your booking ID and what you'd like to modify.`;
  }

  if (lower.includes('weather') || lower.includes('pack')) {
    return `🌤️ **Weather Update:**\n\nBali in July: Warm & dry (27°C avg)\n• Pack: Light clothes, sunscreen, sunglasses\n• Rain gear: Unlikely but pack a light jacket\n\nParis in August: Pleasant (22°C avg)\n• Pack: Layers, comfortable shoes, light rain jacket\n• Tip: Evenings can be cool (15°C)\n\nNeed packing tips for a specific destination?`;
  }

  if (lower.includes('visa') || lower.includes('document')) {
    return `📄 **Travel Documents Checklist:**\n\n✅ Passport (valid 6+ months)\n✅ Visa (if required)\n✅ Travel insurance\n✅ Hotel confirmation\n✅ Flight tickets\n✅ Emergency contacts\n\n🇮🇩 Bali: Visa on arrival (₹2,500)\n🇫🇷 France: Schengen visa required\n🇯🇵 Japan: Visa required for Indians\n\nNeed help with visa application?`;
  }

  if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('help')) {
    return `🚨 **Emergency Support**\n\nFor urgent travel assistance:\n📞 **24/7 Hotline:** +91 98765 43210\n📧 **Email:** emergency@aitravel.com\n💬 **Live Chat:** Available now\n\nI can immediately:\n• Contact your hotel\n• Arrange alternative transport\n• Connect you with local embassy\n• Process emergency refund\n\nWhat do you need?`;
  }

  return `I'm here to help with your travel bookings! Here's what I can do:\n\n📋 **Track booking** — "What's my booking status?"\n🔄 **Modify booking** — "Change my Bali dates"\n❌ **Cancel booking** — "Cancel ATL-7X2K9M"\n🌤️ **Weather info** — "Weather in Bali?"\n📄 **Visa info** — "Do I need a visa for Japan?"\n🚨 **Emergency** — "I need urgent help"\n\nHow can I assist you today?`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function FollowUpPage() {
  const [bookingId, setBookingId] = useState('');
  const [foundBooking, setFoundBooking] = useState<BookingInfo | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSearch = () => {
    const found = sampleBookings.find((b) => b.id.toLowerCase() === bookingId.trim().toLowerCase());
    setFoundBooking(found || null);
    setSearchDone(true);
    if (found) {
      setMessages([{
        id: '1',
        role: 'agent',
        text: `Found your booking **${found.id}**!\n\n📍 **${found.destination}**\n📅 Check-in: ${found.checkIn}\n👥 Guests: ${found.guests}\n💰 Total: ₹${found.totalCost.toLocaleString('en-IN')}\n📊 Status: ${found.status === 'confirmed' ? '✅ Confirmed' : found.status === 'pending' ? '⏳ Pending' : '✅ Completed'}\n\nHow can I help you with this booking?`,
        timestamp: Date.now(),
      }]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: `m-${Date.now()}`, role: 'user', text: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const aiResponse = generateFollowUpResponse(input);
      const agentMsg: Message = { id: `m-${Date.now() + 1}`, role: 'agent', text: aiResponse, timestamp: Date.now() };
      setMessages((prev) => [...prev, agentMsg]);
    }, 500 + Math.random() * 700);
  };

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="bg-gradient-to-br from-brand-600 to-ocean-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Follow-up & Support</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Track your bookings, get travel updates, and chat with our AI support agent.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Booking lookup */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
              <h3 className="text-lg font-bold text-dark-800 mb-4 flex items-center gap-2">
                <Search size={18} className="text-brand-500" />
                Find Your Booking
              </h3>
              <div className="space-y-3">
                <input type="text" value={bookingId} onChange={(e) => setBookingId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter booking ID (e.g., ATL-7X2K9M)"
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" />
                <button onClick={handleSearch}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-500 text-white font-semibold text-sm hover:shadow-lg transition-all">
                  Search Booking
                </button>
              </div>

              {searchDone && !foundBooking && (
                <p className="text-sm text-red-500 mt-3">Booking not found. Try: ATL-7X2K9M, ATL-3P8N4L, or ATL-9W5T2J</p>
              )}
            </div>

            {/* All bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
              <h3 className="text-sm font-bold text-dark-600 mb-3 uppercase tracking-wide">Your Bookings</h3>
              <div className="space-y-2">
                {sampleBookings.map((b) => (
                  <button key={b.id} onClick={() => { setBookingId(b.id); handleSearch(); }}
                    className="w-full text-left p-3 rounded-xl border border-dark-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-dark-500">{b.id}</span>
                      {b.status === 'confirmed' ? <CheckCircle2 size={14} className="text-green-500" /> :
                       b.status === 'pending' ? <Clock size={14} className="text-amber-500" /> :
                       <CheckCircle2 size={14} className="text-blue-500" />}
                    </div>
                    <p className="text-sm font-semibold text-dark-800 mt-1">{b.destination}</p>
                    <p className="text-xs text-dark-400">{b.checkIn} · {b.guests} guests</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
              <h3 className="text-sm font-bold text-dark-600 mb-3 uppercase tracking-wide">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Check booking status', icon: '📋' },
                  { label: 'Request cancellation', icon: '❌' },
                  { label: 'Modify booking', icon: '🔄' },
                  { label: 'Weather forecast', icon: '🌤️' },
                  { label: 'Visa information', icon: '📄' },
                  { label: 'Emergency support', icon: '🚨' },
                ].map((action) => (
                  <button key={action.label} onClick={() => { setInput(action.label); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-dark-600 hover:bg-dark-50 flex items-center gap-2 transition-colors">
                    <span>{action.icon}</span> {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-dark-100 h-[600px] flex flex-col">
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-dark-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-ocean-500 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-dark-800 text-sm">AI Travel Support</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online · Average response: 2s
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-dark-400">
                    <MessageSquare size={40} className="mb-3" />
                    <p className="text-sm">Search for a booking to start chatting</p>
                    <p className="text-xs mt-1">Or ask any travel-related question</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-brand-500 text-white rounded-br-md'
                          : 'bg-dark-50 text-dark-700 rounded-bl-md'
                      }`}>
                        {msg.text}
                        <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-dark-400'}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-dark-100">
                <div className="flex items-center gap-2 bg-dark-50 rounded-xl px-4 py-3">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your booking..."
                    className="flex-1 bg-transparent text-sm text-dark-800 placeholder-dark-400 outline-none" />
                  <button onClick={handleSend} disabled={!input.trim()}
                    className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
