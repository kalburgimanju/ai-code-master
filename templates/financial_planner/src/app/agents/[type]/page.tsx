'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Bot, Wallet, TrendingUp, Scale, Megaphone, Users, BarChart3, MessageSquare, Sparkles } from 'lucide-react';
import { AGENTS, AgentType, ChatMessage } from '@/lib/types';
import { callOpenRouter, getAgentSystemPrompt } from '@/lib/openrouter';
import { getItem, setItem, CHATS_KEY, generateId } from '@/lib/storage';

const iconMap: Record<string, React.ElementType> = { Wallet: Wallet, TrendingUp, Scale, Megaphone, Users, BarChart3 };

export default function AgentChatPage() {
  const { type } = useParams();
  const router = useRouter();
  const agentType = type as AgentType;
  const agent = AGENTS.find(a => a.id === agentType);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);

  useEffect(() => {
    const settings = getItem('settings', { openRouterKey: '' });
    if (settings.openRouterKey) setApiKey(settings.openRouterKey);
    // Load saved chat
    const saved = getItem(`${CHATS_KEY}_${agentType}`, []);
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      const welcome: ChatMessage = { id: generateId(), role: 'agent', content: `👋 Welcome to ${agent?.name || 'AI Agent'}! How can I help you today?`, timestamp: new Date().toISOString(), agentType };
      setMessages([welcome]);
    }
  }, [agentType]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: input, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const systemPrompt = getAgentSystemPrompt(agentType, context);
      const response = await callOpenRouter(apiKey, [
        { role: 'system', content: systemPrompt },
        ...newMessages.map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.content })),
      ]);
      const agentMsg: ChatMessage = { id: generateId(), role: 'agent', content: response, timestamp: new Date().toISOString(), agentType };
      const final = [...newMessages, agentMsg];
      setMessages(final);
      setItem(`${CHATS_KEY}_${agentType}`, final);
    } catch (e: any) {
      setMessages(prev => [...prev, { id: generateId(), role: 'agent', content: `❌ Error: ${e.message}`, timestamp: new Date().toISOString(), agentType }]);
    } finally { setLoading(false); }
  };

  if (!agent) return (
    <div className="text-center py-16"><Bot className="w-12 h-12 text-dark-600 mx-auto mb-4" /><p className="text-dark-400">Agent not found</p><button onClick={() => router.push('/agents')} className="btn-primary mt-4"><ArrowLeft /> Back</button></div>
  );

  const Icon = iconMap[agent.icon] || Bot;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="card shrink-0 flex items-center gap-4 mb-4">
        <button onClick={() => router.push('/agents')} className="btn-ghost p-1.5"><ArrowLeft className="w-4 h-4" /></button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${agent.color}20` }}><Icon className="w-5 h-5" style={{ color: agent.color }} /></div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-white">{agent.name}</h1>
          <p className="text-xs text-dark-400">{agent.title}</p>
        </div>
        <button onClick={() => setShowContext(!showContext)} className="btn-ghost text-xs">Add Context</button>
      </div>

      {/* Chat */}
      <div className="card flex-1 flex flex-col min-h-0">
        {showContext && (
          <div className="mb-3 p-3 rounded-xl bg-dark-800 border border-dark-700">
            <label className="label text-[10px]">Add context for the agent (your situation, goals, etc.)</label>
            <textarea value={context} onChange={e => setContext(e.target.value)} className="input text-xs min-h-[60px]" placeholder="e.g., I earn ₹75k/month, looking for 3BHK in Bangalore under ₹1.2Cr..." />
            <button onClick={() => setShowContext(false)} className="btn-primary text-xs mt-2 py-1.5">Save Context</button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-finance-600/20 text-finance-200 border border-finance-500/20 rounded-br-md'
                  : 'bg-dark-800 text-dark-200 border border-dark-700 rounded-bl-md'
              }`}>
                {msg.role === 'agent' && <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-dark-500"><Bot className="w-3 h-3" />{agent.name}</div>}
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[9px] text-dark-600 mt-2 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-dark-800 border border-dark-700">
                <div className="flex items-center gap-2 text-dark-400 text-sm"><Bot className="w-4 h-4 animate-pulse" /> Thinking...</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-3 mt-3 border-t border-dark-800">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder={`Ask ${agent.name} about ${agent.expertise[0]?.toLowerCase()}...`} className="input" />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary shrink-0"><Send className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {agent.expertise.map(e => (
          <button key={e} onClick={() => setInput(`Tell me about ${e.toLowerCase()} in real estate`)} className="px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-[10px] text-dark-400 hover:text-dark-200 hover:border-dark-600 transition-all">{e}</button>
        ))}
      </div>
    </div>
  );
}
