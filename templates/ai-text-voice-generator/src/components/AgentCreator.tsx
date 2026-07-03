'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { v4 as uuid } from 'uuid';
import { CustomAgent } from '@/types';
import {
  Bot, Plus, Trash2, Share2, Check,
  Play, Loader2, Download, Sparkles
} from 'lucide-react';

const AGENT_ROLES = [
  { id: 'telecaller', label: 'Telecaller', icon: '📞', desc: 'Make sales calls, follow-ups, lead qualification' },
  { id: 'sales-executive', label: 'Sales Executive', icon: '💼', desc: 'Product demos, pricing discussions, closing deals' },
  { id: 'customer-support', label: 'Customer Support', icon: '🎧', desc: 'Handle queries, troubleshoot issues' },
  { id: 'receptionist', label: 'Receptionist', icon: '🏢', desc: 'Answer calls, take messages, direct inquiries' },
  { id: 'interviewer', label: 'Interviewer', icon: '🎙️', desc: 'Conduct interviews, screen candidates' },
  { id: 'tutor', label: 'Tutor', icon: '📚', desc: 'Explain concepts, teach lessons, answer questions' },
  { id: 'narrator', label: 'Narrator', icon: '🎬', desc: 'Voiceovers, audio books, storytelling' },
  { id: 'custom', label: 'Custom Role', icon: '⚡', desc: 'Define your own agent role and prompt' },
];

const INDUSTRIES = ['Real Estate', 'Insurance', 'Healthcare', 'Education', 'Technology', 'Finance', 'E-commerce', 'Travel', 'Automotive', 'Legal', 'Marketing', 'Other'];
const ACCENT_COLORS = ['#4c6ef5', '#7950f2', '#e64980', '#20c997', '#fab005', '#ff6b6b', '#339af0', '#51cf66'];

function generateShareUrl(agent: CustomAgent): string {
  const data = { n: agent.name, r: agent.role, p: agent.systemPrompt, v: agent.voice, g: agent.gender, s: agent.avatarStyle, c: agent.accentColor, i: agent.industry };
  return `${window.location.origin}/agent?data=${encodeURIComponent(btoa(JSON.stringify(data)))}`;
}

function generateAgentSpeech(text: string, gender: 'male' | 'female', pitch: number): Blob {
  const sr = 44100;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return new Blob([], { type: 'audio/wav' });
  const bp = gender === 'male' ? 110 + (pitch - 1) * 60 : 200 + (pitch - 1) * 80;
  const dur = words.length * (0.26 + 0.05) + 0.3;
  const ns = Math.floor(dur * sr);
  const s = new Float32Array(ns);
  let si = Math.floor(sr * 0.03);
  for (let w = 0; w < words.length; w++) {
    const wf = Math.floor(0.26 * sr);
    const wp = bp + Math.sin(w * 1.3) * 12;
    for (let i = 0; i < wf && si < ns; i++) {
      const t = si / sr;
      const env = Math.sin(Math.PI * i / wf);
      const vib = 1 + Math.sin(2 * Math.PI * 6 * (i / sr)) * 0.03;
      let sample = 0;
      for (let h = 1; h <= 3; h++) sample += Math.sin(2 * Math.PI * wp * h * vib * t) * 0.25 / h;
      s[si] = Math.max(-0.85, Math.min(0.85, sample * env * 0.5));
      si++;
    }
    si += Math.floor(0.05 * sr);
  }
  const fl = Math.min(Math.floor(sr * 0.06), ns - 50);
  for (let i = 0; i < fl; i++) { const idx = ns - 1 - i; if (idx >= 0) s[idx] *= (fl - i) / fl; }
  const buf = new ArrayBuffer(44 + ns * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + ns * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, ns * 2, true);
  for (let i = 0; i < ns; i++) v.setInt16(44 + i * 2, Math.max(-32767, Math.min(32767, Math.round(s[i] * 32767))), true);
  return new Blob([buf], { type: 'audio/wav' });
}

// ─── Agent Card ──────────────────────────────────────────
function AgentCard({ agent, onRun, onShare, onDelete }: {
  agent: CustomAgent; onRun: () => void; onShare: () => void; onDelete: () => void;
}) {
  return (
    <div className="card-glow group" style={{ borderLeft: `3px solid ${agent.accentColor}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: agent.accentColor + '20', color: agent.accentColor }}>
          {AGENT_ROLES.find((r) => r.id === agent.role)?.icon || '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{agent.name}</h4>
          <span className="badge-blue text-[10px]">{agent.role.replace('-', ' ')} · {agent.industry}</span>
        </div>
        <span className="text-[10px] text-gray-600">{agent.runs} runs</span>
      </div>
      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-3">{agent.systemPrompt}</p>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dark-500/50">
        <button onClick={onRun} className="btn-primary text-[11px] py-1 px-3 flex items-center gap-1">
          <Play className="w-3 h-3" /> Run
        </button>
        <button onClick={onShare} className="btn-secondary text-[11px] py-1 px-2 flex items-center gap-1">
          <Share2 className="w-3 h-3" /> Share
        </button>
        <button onClick={onDelete} className="text-gray-500 hover:text-red-400 transition-colors ml-auto">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Agent Runner ────────────────────────────────────────
function AgentRunner({ agent, onClose }: { agent: CustomAgent; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleRun() {
    if (!input.trim()) return;
    setRunning(true);
    await new Promise((r) => setTimeout(r, 1500));
    const response = `[${agent.name} - ${agent.role}]\n\nThank you for reaching out. As a ${agent.role.replace('-', ' ')} specialist, I've received your message and prepared a response.\n\n${input}\n\nI understand your requirements. I would be happy to assist further with this. Please let me know if you have any additional questions or need clarification on any points.`;
    setOutput(response);
    const blob = generateAgentSpeech(response.slice(0, 200), agent.gender, 1.0);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    if (audioRef.current) { audioRef.current.src = url; audioRef.current.play().catch(() => {}); setPlaying(true); }
    setRunning(false);
  }

  function handleDownload() {
    if (!audioUrl) return;
    const a = document.createElement('a'); a.href = audioUrl; a.download = `agent-${agent.id.slice(0, 8)}.wav`; a.click();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl border border-dark-500 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-dark-700 border-b border-dark-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: agent.accentColor + '20', color: agent.accentColor }}>
              {AGENT_ROLES.find((r) => r.id === agent.role)?.icon || '🤖'}
            </div>
            <div><h3 className="text-lg font-semibold text-white">{agent.name}</h3><p className="text-xs text-gray-500 capitalize">{agent.role.replace('-', ' ')} · {agent.industry}</p></div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-dark-800/50 rounded-lg p-3 border border-dark-500">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Agent Instructions</p>
            <p className="text-xs text-gray-400 italic">{agent.systemPrompt}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Your message for the agent:</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input-field min-h-[80px] resize-y text-sm"
              placeholder={`Type what you'd say to a ${agent.role.replace('-', ' ')}...`} />
          </div>
          <button onClick={handleRun} disabled={!input.trim() || running}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Agent is responding...' : `Run ${agent.name}`}
          </button>
          {output && (
            <div className="space-y-3">
              <div className="bg-dark-800/50 rounded-lg p-4 border border-primary-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{AGENT_ROLES.find((r) => r.id === agent.role)?.icon}</span>
                  <span className="text-sm font-medium text-white">{agent.name}</span>
                  <span className="badge-green text-[10px]">Responded</span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{output}</p>
              </div>
              <audio ref={audioRef} onEnded={() => setPlaying(false)} className="hidden" />
              <div className="flex gap-2">
                <button onClick={() => { if (audioRef.current) { audioRef.current.play(); setPlaying(true); } }}
                  className="btn-primary flex items-center gap-2 text-sm"><Play className="w-4 h-4" /> Play Response</button>
                <button onClick={handleDownload} className="btn-secondary flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> Download Audio</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Agent Creator Form ──────────────────────────────────
function AgentCreatorForm({ onClose, editAgent }: { onClose: () => void; editAgent?: CustomAgent }) {
  const { addCustomAgent, updateCustomAgent } = useStore();
  const [name, setName] = useState(editAgent?.name || '');
  const [role, setRole] = useState(editAgent?.role || 'telecaller');
  const [systemPrompt, setSystemPrompt] = useState(editAgent?.systemPrompt || '');
  const [voice, setVoice] = useState(editAgent?.voice || 'en-US-Standard');
  const [gender, setGender] = useState<'male' | 'female'>(editAgent?.gender || 'male');
  const [avatarStyle, setAvatarStyle] = useState(editAgent?.avatarStyle || 'professional');
  const [accentColor, setAccentColor] = useState(editAgent?.accentColor || '#4c6ef5');
  const [industry, setIndustry] = useState(editAgent?.industry || 'Technology');

  function autoPrompt(roleId: string, agentName: string): string {
    const rd = AGENT_ROLES.find((r) => r.id === roleId);
    if (!rd) return '';
    return `You are an AI ${rd.label} named "${agentName || rd.label}". You specialize in ${rd.desc} for the ${industry} sector. Communicate professionally with a ${gender === 'male' ? 'professional male' : 'professional female'} tone. Always be polite, clear, and focused. Adapt to the conversation context and provide helpful, accurate responses.`;
  }

  function handleSave() {
    if (!name.trim() || !systemPrompt.trim()) return;
    const agent: CustomAgent = {
      id: editAgent?.id || uuid(), name: name.trim(), role, systemPrompt: systemPrompt.trim(),
      voice, gender, avatarStyle, accentColor, industry, runs: editAgent?.runs || 0,
      createdAt: editAgent?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    if (editAgent) updateCustomAgent(agent.id, agent);
    else addCustomAgent(agent);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-700 rounded-2xl border border-dark-500 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-dark-700 border-b border-dark-500 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-400" /> {editAgent ? 'Edit Agent' : 'Create New Agent'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          {/* Role */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Role</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {AGENT_ROLES.map((r) => (
                <button key={r.id} onClick={() => { setRole(r.id); if (!name) setName(r.label); if (!editAgent) setSystemPrompt(autoPrompt(r.id, name || r.label)); }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${role === r.id ? 'border-primary-500 bg-primary-600/10' : 'border-dark-400 bg-dark-700/50 hover:border-dark-300'}`}>
                  <span className="text-lg block mb-0.5">{r.icon}</span>
                  <span className="text-xs font-medium text-white block">{r.label}</span>
                  <span className="text-[9px] text-gray-500">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Agent Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field text-sm" placeholder="e.g., Sarah - Sales Rep" />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">Industry</label>
            <select value={industry} onChange={(e) => { setIndustry(e.target.value); if (!editAgent) setSystemPrompt(autoPrompt(role, name)); }} className="input-field text-sm">
              {INDUSTRIES.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
            </select>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 font-medium">System Prompt</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="input-field min-h-[100px] resize-y text-sm font-mono"
              placeholder="Describe what this agent does, how it should behave..." />
          </div>

          {/* Voice & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Voice</label>
              <select value={voice} onChange={(e) => setVoice(e.target.value)} className="input-field text-sm">
                <option value="en-US-Standard">US English</option>
                <option value="en-GB-Standard">British English</option>
                <option value="en-AU-Standard">Australian English</option>
                <option value="hi-IN-Standard">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Gender</label>
              <div className="flex rounded-lg border border-dark-400 overflow-hidden mt-1">
                <button onClick={() => setGender('male')} className={`flex-1 py-1.5 text-xs font-medium transition-all ${gender === 'male' ? 'bg-primary-600/20 text-primary-300' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>👨 Male</button>
                <button onClick={() => setGender('female')} className={`flex-1 py-1.5 text-xs font-medium transition-all ${gender === 'female' ? 'bg-primary-600/20 text-primary-300' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'}`}>👩 Female</button>
              </div>
            </div>
          </div>

          {/* Avatar & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Avatar Style</label>
              <select value={avatarStyle} onChange={(e) => setAvatarStyle(e.target.value)} className="input-field text-sm">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="anime">Anime</option>
                <option value="realistic">Realistic</option>
                <option value="cartoon">Cartoon</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-medium">Accent Color</label>
              <div className="flex gap-1.5 mt-1">
                {ACCENT_COLORS.map((c) => (<button key={c} onClick={() => setAccentColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${accentColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={!name.trim() || !systemPrompt.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            <Plus className="w-4 h-4" /> {editAgent ? 'Update Agent' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────────
export default function AgentsPanel() {
  const { customAgents, deleteCustomAgent, updateCustomAgent } = useStore();
  const [showCreator, setShowCreator] = useState(false);
  const [editAgent, setEditAgent] = useState<CustomAgent | undefined>();
  const [runAgent, setRunAgent] = useState<CustomAgent | undefined>();

  function handleShare(agent: CustomAgent) {
    const url = generateShareUrl(agent);
    navigator.clipboard.writeText(url).then(() => {
      // Brief feedback
    }).catch(() => { prompt('Copy this URL to share:', url); });
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this agent?')) deleteCustomAgent(id);
  }

  function handleRun(agent: CustomAgent) {
    updateCustomAgent(agent.id, { runs: agent.runs + 1 });
    setRunAgent(agent);
  }

  return (
    <div className="space-y-6">
      <div className="card-glow border-primary-500/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary-400" /> Custom Agents
            </h3>
            <p className="text-xs text-gray-500 mt-1">Create AI agents for specific roles. Each agent has its own personality, voice, and behavior. Share them with others.</p>
          </div>
          <button onClick={() => { setEditAgent(undefined); setShowCreator(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Agent
          </button>
        </div>
      </div>

      {customAgents.length === 0 && !showCreator ? (
        <div className="card text-center py-8">
          <Bot className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-300 mb-2">Create your first agent</h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">Build a custom AI agent for telecalling, sales, support, or any role. Give it instructions, a voice, and share it.</p>
          <button onClick={() => { setEditAgent(undefined); setShowCreator(true); }} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Create Agent
          </button>
        </div>
      ) : customAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onRun={() => handleRun(agent)} onShare={() => handleShare(agent)} onDelete={() => handleDelete(agent.id)} />
          ))}
        </div>
      ) : null}

      {showCreator && <AgentCreatorForm onClose={() => setShowCreator(false)} editAgent={editAgent} />}
      {runAgent && <AgentRunner agent={runAgent} onClose={() => setRunAgent(undefined)} />}
    </div>
  );
}
