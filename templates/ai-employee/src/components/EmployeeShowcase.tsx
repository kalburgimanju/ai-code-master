import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, TrendingUp, Users, BarChart3, Send, X, Loader2, ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { agentTemplates } from '../data';

const iconMap: Record<string, React.ReactNode> = {
  headphones: <Headphones size={24} />,
  'trending-up': <TrendingUp size={24} />,
  users: <Users size={24} />,
  'bar-chart-3': <BarChart3 size={24} />,
};

// ── Realistic multi-turn conversation scripts ──
interface ChatTurn {
  role: 'user' | 'ai';
  text: string;
  actions?: string[];           // simulated tool calls shown as chips
  typingDelay?: number;         // ms before AI responds
}

const conversations: Record<string, ChatTurn[]> = {
  support: [
    { role: 'ai', text: 'Welcome to TechStore Support! 👋 I\'m your AI support agent. How can I help you today?' },
    { role: 'user', text: 'Hi, I placed order #TSK-45892 three days ago and haven\'t received a shipping update yet.' },
    {
      role: 'ai',
      text: 'Let me look up your order right away. 🔍',
      actions: ['Fetching order #TSK-45892...'],
      typingDelay: 1200,
    },
    {
      role: 'ai',
      text: 'I found your order! Here\'s the status:\n\n📦 **Order #TSK-45892**\n• Status: Shipped\n• Carrier: BlueDart Express\n• Tracking: BD-9928371X\n• Estimated delivery: **June 30, 2026**\n• Item: Wireless Noise-Cancelling Headphones\n\nYour package is currently at the Mumbai sorting facility. Would you like me to send you the tracking link?',
      actions: ['Order found ✅', 'Tracking link ready 📎'],
    },
    { role: 'user', text: 'Yes please! Also, can I change the delivery address?' },
    {
      role: 'ai',
      text: 'I\'ve sent the tracking link to your registered email. ✉️\n\nRegarding the address change — since your order is already shipped, I can\'t modify the delivery address directly. However, I can:\n\n1️⃣ Contact BlueDart to request a redirect (may take 24-48 hours)\n2️⃣ Initiate a return and re-order to the new address\n\nWhich would you prefer?',
      actions: ['Tracking link sent ✉️'],
    },
    { role: 'user', text: 'Let\'s try option 1, the redirect.' },
    {
      role: 'ai',
      text: 'Done! I\'ve submitted a redirect request to BlueDart with your new address details. 📋\n\n• Request ID: RED-72834\n• You\'ll receive an update within 24-48 hours\n• I\'ll monitor this and notify you if there are any issues\n\nIs there anything else I can help with?',
      actions: ['Redirect request submitted 📋', 'Monitoring set up 🔔'],
      typingDelay: 1500,
    },
    { role: 'user', text: 'That\'s perfect, thanks!' },
    {
      role: 'ai',
      text: 'You\'re welcome! 😊 I\'ll keep an eye on your delivery and notify you if there are any updates. Have a great day!',
    },
  ],

  sales: [
    { role: 'ai', text: 'Hey there! 👋 I\'m Alex from MyAIEmployee. Thanks for checking us out. What brought you here today?' },
    { role: 'user', text: 'We\'re a mid-size e-commerce company. We get about 500 support tickets a day and our team is overwhelmed.' },
    {
      role: 'ai',
      text: 'That\'s exactly the kind of problem we solve! 500 tickets/day with a stretched team is painful. Let me ask a few questions to recommend the right solution:',
      typingDelay: 800,
    },
    {
      role: 'ai',
      text: 'Quick questions:\n\n1️⃣ What percentage of tickets are repetitive (order status, returns, FAQs)?\n2️⃣ What\'s your current average response time?\n3️⃣ Do you need multi-language support?',
      actions: ['Qualifying lead...'],
    },
    { role: 'user', text: 'Probably 70% are repetitive. Response time is about 4 hours during peak. We need Hindi and English support.' },
    {
      role: 'ai',
      text: 'Perfect — I have a clear picture now. Here\'s what I\'d recommend:\n\n🎯 **Starter Plan (₹2,999/mo)** would handle your repetitive tickets instantly.\n\nBased on your numbers:\n• 350 repetitive tickets/day → **handled by AI** in <1 second\n• Your team focuses on the 150 complex cases\n• Response time drops from **4 hours → 8 seconds**\n• Hindi + English supported out of the box\n\nROI: You\'d save roughly ₹1,50,000/month in support costs.\n\nWant me to set up a 15-minute demo call?',
      actions: ['ROI calculated 💰', 'Plan recommended 🎯'],
      typingDelay: 1800,
    },
    { role: 'user', text: 'The ROI sounds great. Let\'s do the demo call.' },
    {
      role: 'ai',
      text: 'Awesome! 🎉 Let me grab your details:\n\nI just need your preferred email and a time slot for this week. Our demos are 15 minutes and fully interactive — you\'ll see the AI agent handle real conversations.\n\nWhat works for you?',
      actions: ['Calendar checked 📅', 'Available slots: Tue 2pm, Wed 10am, Thu 3pm'],
    },
  ],

  hr: [
    { role: 'ai', text: 'Hi! 👋 I\'m the HR assistant. I can help with policies, leave requests, benefits, onboarding, and more. What do you need?' },
    { role: 'user', text: 'I\'m new here — started last Monday. I still need to complete my onboarding checklist.' },
    {
      role: 'ai',
      text: 'Welcome aboard, congrats! 🎉 Let me pull up your onboarding status...',
      actions: ['Fetching onboarding checklist...'],
      typingDelay: 1000,
    },
    {
      role: 'ai',
      text: 'Here\'s your onboarding checklist:\n\n✅ **Completed:**\n• Offer letter signed\n• Background check cleared\n• IT equipment issued\n\n⬜ **Pending:**\n• Complete compliance training (15 min video)\n• Set up benefits enrollment (health insurance)\n• Join #team-introductions Slack channel\n• Schedule 1:1 with your manager\n\nWould you like me to walk you through any of these?',
      actions: ['Onboarding status loaded ✅'],
    },
    { role: 'user', text: 'What benefits do I get? I\'m confused about the health insurance options.' },
    {
      role: 'ai',
      text: 'Great question! Here are your health insurance options:\n\n🏥 **Plan A — Individual (₹0/month)**\n• Coverage: ₹3,00,000/year\n• Hospitalization, day care, ambulance\n\n🏥 **Plan B — Family (₹800/month deduction)**\n• Coverage: ₹5,00,000/year\n• Covers spouse + 2 children\n• Dental & vision included\n\n🏥 **Plan C — Premium (₹1,500/month deduction)**\n• Coverage: ₹10,00,000/year\n• Cashless at 5,000+ hospitals\n• Mental health coverage included\n\n⚠️ **Deadline: July 5, 2026** — You have 6 more days to enroll.\n\nWant me to start the enrollment process for one of these?',
      actions: ['Benefits data loaded 📋', 'Enrollment deadline checked ⏰'],
      typingDelay: 1200,
    },
    { role: 'user', text: 'Let\'s go with Plan C.' },
    {
      role: 'ai',
      text: 'Excellent choice! 🎉 I\'ve started your enrollment for Plan C (Premium).\n\n📋 **Next steps:**\n1. Fill in dependent details (if any) — [Link]\n2. Upload ID proof — [Upload]\n3. Confirm and submit\n\nI\'ve sent the enrollment form to your work email. You can complete it anytime before July 5.\n\nAnything else I can help with?',
      actions: ['Enrollment initiated 📝', 'Email sent 📧'],
      typingDelay: 1000,
    },
  ],

  analyst: [
    { role: 'ai', text: 'Hey! 📊 I\'m your AI data analyst. I have access to your sales, marketing, and operations data. What would you like to know?' },
    { role: 'user', text: 'How did we perform in June? Give me a quick overview.' },
    {
      role: 'ai',
      text: 'Pulling up June 2026 data...',
      actions: ['Querying sales_db...', 'Querying marketing_db...', 'Querying ops_db...'],
      typingDelay: 2000,
    },
    {
      role: 'ai',
      text: '📊 **June 2026 Performance Summary**\n\n💰 **Revenue:** ₹1.24 Cr (↑ 18% vs May)\n📦 **Orders:** 8,432 (↑ 12%)\n👤 **New Customers:** 1,847 (↑ 23%)\n🔄 **Repeat Purchase Rate:** 34%\n\n**Top Products:**\n1. Wireless Earbuds Pro — ₹18.2L\n2. Smart Watch Ultra — ₹14.7L\n3. USB-C Hub — ₹9.1L\n\n**Concern:** Return rate increased from 4.2% to 5.8%. Mostly from the Smart Watch Ultra (color mismatch complaints).\n\nWant me to drill down into any of these?',
      actions: ['Revenue analyzed ✅', 'Product rankings ready 📊', 'Anomaly detected: returns ⚠️'],
      typingDelay: 1500,
    },
    { role: 'user', text: 'The returns spike on Smart Watch — can you dig deeper?' },
    {
      role: 'ai',
      text: 'Analyzing return data for Smart Watch Ultra...',
      actions: ['Filtering returns by SKU...'],
      typingDelay: 1500,
    },
    {
      role: 'ai',
      text: '🔍 **Smart Watch Ultra — Return Analysis**\n\n**Total returns:** 247 units (8.3% of 2,976 sold)\n\n**Root Cause Breakdown:**\n🔴 Color mismatch (product looks different from listing) — 62%\n🟡 Sizing issues — 21%\n🟢 Changed mind — 12%\n⚪ Other — 5%\n\n**Recommendation:**\nThe product photos on your website show the "Midnight Black" variant as lighter than it actually is. Updating the hero image would likely reduce returns by ~40%.\n\n**Estimated savings:** ₹3.2L/month in return processing costs.\n\nWant me to generate a report for the product team?',
      actions: ['Return data analyzed ✅', 'Root cause identified 🎯', 'Savings estimated 💰'],
    },
  ],
};

// ── Typing indicator component ──
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5 px-4 py-3 bg-dark-700 rounded-2xl rounded-bl-md w-fit">
    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// ── Action chip component ──
const ActionChip: React.FC<{ text: string; delay: number }> = ({ text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400 font-medium"
  >
    {text.includes('✅') ? <CheckCircle2 size={12} /> :
     text.includes('⚠️') ? <AlertCircle size={12} /> :
     text.includes('...') ? <Loader2 size={12} className="animate-spin" /> :
     <Clock size={12} />}
    {text}
  </motion.div>
);

const EmployeeShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; actions?: string[] }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // Cleanup auto-play on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, []);

  const startDemo = (id: string) => {
    setActiveDemo(id);
    setChatMessages([]);
    setDemoIndex(0);
    setIsAutoPlaying(true);
    setIsTyping(true);

    const convo = conversations[id];
    if (!convo) return;

    // Show first message after delay
    autoPlayRef.current = setTimeout(() => {
      setChatMessages([{ role: convo[0].role, text: convo[0].text, actions: convo[0].actions }]);
      setIsTyping(false);
      setDemoIndex(1);
    }, convo[0].typingDelay || 800);
  };

  // Auto-advance conversation
  useEffect(() => {
    if (!isAutoPlaying || !activeDemo) return;

    const convo = conversations[activeDemo];
    if (!convo || demoIndex >= convo.length) {
      setIsAutoPlaying(false);
      return;
    }

    const turn = convo[demoIndex];
    if (turn.role === 'user') {
      // Show user message with a small delay
      autoPlayRef.current = setTimeout(() => {
        setChatMessages((prev) => [...prev, { role: 'user', text: turn.text }]);
        setDemoIndex((prev) => prev + 1);
      }, 1500);
    } else {
      // Show typing, then AI response
      setIsTyping(true);
      autoPlayRef.current = setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev) => [...prev, { role: 'ai', text: turn.text, actions: turn.actions }]);
        setDemoIndex((prev) => prev + 1);
      }, turn.typingDelay || 1200);
    }

    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [isAutoPlaying, demoIndex, activeDemo]);

  const handleSend = () => {
    if (!chatInput.trim() || !activeDemo) return;

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: chatInput },
      { role: 'ai', text: 'Thanks for your message! In production, this AI employee would search your knowledge base and respond with real data from your systems. Try the auto-play demo above to see a full conversation flow! 🚀' },
    ]);
    setChatInput('');
    setIsAutoPlaying(false);
  };

  const stopAutoPlay = () => {
    setIsAutoPlaying(false);
    setIsTyping(false);
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
  };

  const agentData = activeDemo ? agentTemplates.find((t) => t.id === activeDemo) : null;

  return (
    <section className="py-20 md:py-28 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3"
          >
            See It In Action
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            AI employees at work
          </motion.h2>
          <p className="mt-4 text-lg text-dark-400 max-w-2xl mx-auto">
            Click any agent below to watch a real conversation — orders, data lookups, scheduling, and more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agentTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 group hover:border-brand-500/30 transition-all duration-300 cursor-pointer"
              onClick={() => startDemo(template.id)}
            >
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${template.color} text-white shadow-lg w-fit mb-4`}>
                {iconMap[template.icon]}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
              <p className="text-sm text-dark-400 mb-4">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-dark-300">
                  {template.category}
                </span>
                <span className="text-sm text-brand-400 font-medium group-hover:text-brand-300 transition-colors flex items-center gap-1">
                  Watch demo →
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Live Demo Chat Modal ── */}
        <AnimatePresence>
          {activeDemo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { stopAutoPlay(); setActiveDemo(null); }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg glass-card overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agentData?.color} flex items-center justify-center text-white font-bold text-sm`}>
                      AI
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{agentData?.name}</p>
                      <p className="text-xs text-brand-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                        Live Demo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAutoPlaying && (
                      <button
                        onClick={stopAutoPlay}
                        className="text-xs px-3 py-1 rounded-full bg-dark-700 text-dark-300 hover:text-white transition-colors"
                      >
                        Pause
                      </button>
                    )}
                    <button
                      onClick={() => { stopAutoPlay(); setActiveDemo(null); }}
                      className="p-1 text-dark-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {chatMessages.map((msg, i) => (
                    <div key={i}>
                      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl max-w-[88%] text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-brand-500/20 text-white rounded-br-md'
                            : 'bg-dark-700 text-dark-200 rounded-bl-md'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                      {/* Action chips below AI messages */}
                      {msg.role === 'ai' && msg.actions && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5 ml-1">
                          {msg.actions.map((action, j) => (
                            <ActionChip key={j} text={action} delay={j * 0.2} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <TypingIndicator />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 shrink-0">
                  <div className="flex items-center gap-2 bg-dark-800 rounded-xl px-4 py-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={isAutoPlaying ? 'Auto-playing demo...' : 'Type a message...'}
                      disabled={isAutoPlaying}
                      className="flex-1 bg-transparent text-sm text-white placeholder-dark-500 outline-none disabled:opacity-50"
                    />
                    <button onClick={handleSend} disabled={isAutoPlaying} className="text-brand-400 hover:text-brand-300 disabled:opacity-30">
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-dark-500 mt-2 text-center">
                    {isAutoPlaying ? '⏸ Click Pause to try typing yourself' : 'Demo — powered by MyAIEmployee'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EmployeeShowcase;
