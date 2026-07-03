'use client';

import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { Shield, Plus, Trash2, Share2, Check, AlertTriangle, Lock, FileText, Users, Globe, Bot, Search, Download, Eye, Copy, ExternalLink, Settings, ChevronDown, ChevronRight, AlertCircle, X } from 'lucide-react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ScopeType = 'input' | 'output' | 'behavior' | 'data';

interface Rule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  scope: ScopeType;
  pattern: string;
  action: 'block' | 'warn' | 'log' | 'transform';
  enabled: boolean;
}

interface SafetyAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rules: Rule[];
  tools: string[];
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  updatedAt: string;
  runs: number;
  blocks: number;
}

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; icon: string }> = {
  critical: { label: 'Critical', color: 'red', icon: '🚨' },
  high: { label: 'High', color: 'orange', icon: '⚠️' },
  medium: { label: 'Medium', color: 'yellow', icon: '⚡' },
  low: { label: 'Low', color: 'blue', icon: 'ℹ️' },
};

const SCOPE_OPTIONS: { id: ScopeType; label: string; icon: string }[] = [
  { id: 'input', label: 'Input Guard', icon: '📥' },
  { id: 'output', label: 'Output Guard', icon: '📤' },
  { id: 'behavior', label: 'Behavior', icon: '🧠' },
  { id: 'data', label: 'Data Privacy', icon: '🔒' },
];

const RULE_TEMPLATES = [
  { name: 'No PII in Output', desc: 'Block personally identifiable information in AI responses', severity: 'critical' as Severity, scope: 'output' as ScopeType, pattern: 'email|ssn|credit card|phone|aadhaar', action: 'block' as const },
  { name: 'Toxicity Filter', desc: 'Detect and block toxic/hateful language', severity: 'high' as Severity, scope: 'input' as ScopeType, pattern: 'hate|violence|abuse|discriminat', action: 'block' as const },
  { name: 'Prompt Injection Guard', desc: 'Detect prompt injection attempts', severity: 'critical' as Severity, scope: 'input' as ScopeType, pattern: 'ignore previous|forget|system prompt|jailbreak', action: 'block' as const },
  { name: 'Hallucination Check', desc: 'Flag uncertain or speculative statements', severity: 'high' as Severity, scope: 'output' as ScopeType, pattern: 'I think|maybe|perhaps|I am not sure', action: 'warn' as const },
  { name: 'Data Leak Prevention', desc: 'Prevent leakage of sensitive internal data', severity: 'critical' as Severity, scope: 'data' as ScopeType, pattern: 'confidential|internal|secret|proprietary', action: 'block' as const },
  { name: 'Content Moderation', desc: 'Moderate harmful or unsafe content', severity: 'medium' as Severity, scope: 'behavior' as ScopeType, pattern: 'nsfw|explicit|harmful|unsafe', action: 'warn' as const },
  { name: 'SQL Injection Guard', desc: 'Prevent SQL injection in queries', severity: 'critical' as Severity, scope: 'input' as ScopeType, pattern: "drop table|delete from|union select|--", action: 'block' as const },
  { name: 'Rate Limit Warning', desc: 'Warn when tool usage exceeds limits', severity: 'low' as Severity, scope: 'behavior' as ScopeType, pattern: 'too many|repeated|excessive', action: 'log' as const },
  { name: 'URL Safety Check', desc: 'Block known malicious URLs', severity: 'high' as Severity, scope: 'input' as ScopeType, pattern: 'malware|phishing|suspicious', action: 'block' as const },
  { name: 'Bias Detection', desc: 'Flag biased or discriminatory content', severity: 'medium' as Severity, scope: 'output' as ScopeType, pattern: 'biased|stereotype|unfair', action: 'warn' as const },
];

const TOOL_PRESETS = ['GPT API', 'Claude API', 'Chat Bot', 'Code Generator', 'Data Analyzer', 'Image Generator', 'Search Tool', 'Email Composer', 'Document Parser', 'SQL Query'];

const AGENT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const AGENT_ICONS = ['🛡️', '🔐', '⚔️', '👁️', '🤖', '🔍', '📋', '🧪'];

const RULE_ACTIONS = [
  { id: 'block', label: 'Block', desc: 'Prevent execution', color: 'red' },
  { id: 'warn', label: 'Warn', desc: 'Show warning', color: 'yellow' },
  { id: 'log', label: 'Log', desc: 'Log for review', color: 'blue' },
  { id: 'transform', label: 'Transform', desc: 'Modify content', color: 'purple' },
];

function generateShareUrl(id: string): string {
  return `${window.location.origin}/safety?id=${id}`;
}

// ─── Rule Card Component ─────────────────────────────────
function RuleCard({ rule, onToggle, onDelete, onEdit }: { rule: Rule; onToggle: () => void; onDelete: () => void; onEdit: () => void }) {
  const sev = SEVERITY_CONFIG[rule.severity];
  const scopeObj = SCOPE_OPTIONS.find((s) => s.id === rule.scope);
  const actionObj = RULE_ACTIONS.find((a) => a.id === rule.action);
  const badgeClass = sev.color === 'red' ? 'badge-red' : sev.color === 'orange' || sev.color === 'yellow' ? 'badge-yellow' : sev.color === 'blue' ? 'badge-blue' : 'badge-green';

  return (
    <div className={`card py-3 px-4 transition-all ${rule.enabled ? 'opacity-100' : 'opacity-50'} ${sev.color === 'red' ? 'border-red-500/20 bg-red-500/5' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{sev.icon}</span>
            <h4 className="text-sm font-semibold text-white truncate">{rule.name}</h4>
            <span className={`${badgeClass} text-[10px]`}>{sev.label}</span>
            <span className="badge-blue text-[10px]">{scopeObj?.icon} {scopeObj?.label}</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{rule.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-[10px] bg-dark-800 px-1.5 py-0.5 rounded text-gray-400 font-mono">{rule.pattern}</code>
            <span className="text-[10px] text-gray-600 capitalize">{actionObj?.label || rule.action}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onEdit} className="text-gray-500 hover:text-primary-400 transition-colors"><Settings className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          <button onClick={onToggle} className={`w-8 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-primary-500' : 'bg-dark-500'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Card Component ────────────────────────────────
function AgentCard({ agent, onSelect, onDelete, onDuplicate }: { agent: SafetyAgent; onSelect: () => void; onDelete: () => void; onDuplicate: () => void }) {
  const activeRules = agent.rules.filter((r) => r.enabled).length;
  return (
    <div className="card-glow cursor-pointer group relative overflow-hidden" onClick={onSelect} style={{ borderLeft: `3px solid ${agent.color}` }}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: agent.color + '20' }}>{agent.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-white truncate">{agent.name}</h3>
            <span className={`text-[10px] badge ${agent.status === 'active' ? 'badge-green' : agent.status === 'paused' ? 'badge-yellow' : 'badge-blue'}`}>{agent.status}</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{agent.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-600">
            <span>{activeRules}/{agent.rules.length} rules</span>
            <span>{agent.tools.length} tools</span>
            <span>{agent.runs} runs</span>
            <span className="text-red-400">{agent.blocks > 0 ? `${agent.blocks} blocks` : ''}</span>
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={onDuplicate} className="w-6 h-6 rounded bg-dark-600 flex items-center justify-center text-gray-400 hover:text-white"><Copy className="w-3 h-3" /></button>
        <button onClick={onDelete} className="w-6 h-6 rounded bg-dark-600 flex items-center justify-center text-gray-400 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function Home() {
  const [agents, setAgents] = useState<SafetyAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SafetyAgent | null>(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [view, setView] = useState<'agents' | 'rules'>('agents');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [agentForm, setAgentForm] = useState({ name: '', description: '', icon: '🛡️', color: '#22c55e', tools: [] as string[] });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-safety-agents');
    if (saved) { try { setAgents(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-safety-agents', JSON.stringify(agents));
  }, [agents]);

  function createAgent() {
    if (!agentForm.name.trim()) return;
    const a: SafetyAgent = {
      id: uuid(), name: agentForm.name.trim(), description: agentForm.description, icon: agentForm.icon, color: agentForm.color,
      rules: [], tools: agentForm.tools, status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), runs: 0, blocks: 0,
    };
    setAgents([...agents, a]);
    setAgentForm({ name: '', description: '', icon: '🛡️', color: '#22c55e', tools: [] });
    setShowAgentForm(false);
  }

  function deleteAgent(id: string) {
    if (window.confirm('Delete this safety agent permanently?')) {
      setAgents(agents.filter((a) => a.id !== id));
      if (selectedAgent?.id === id) setSelectedAgent(null);
    }
  }

  function duplicateAgent(agent: SafetyAgent) {
    const copy: SafetyAgent = { ...agent, id: uuid(), name: agent.name + ' (Copy)', status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), runs: 0, blocks: 0 };
    setAgents([...agents, copy]);
  }

  function updateAgent(id: string, updates: Partial<SafetyAgent>) {
    setAgents(agents.map((a) => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    setSelectedAgent((prev) => prev?.id === id ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
  }

  function addRuleToAgent(agentId: string, rule: Rule) {
    setAgents(agents.map((a) => a.id === agentId ? { ...a, rules: [...a.rules, rule], updatedAt: new Date().toISOString() } : a));
    setSelectedAgent((prev) => prev?.id === agentId ? { ...prev, rules: [...prev.rules, rule], updatedAt: new Date().toISOString() } : prev);
  }

  function updateRule(agentId: string, ruleId: string, updates: Partial<Rule>) {
    setAgents(agents.map((a) => a.id === agentId ? { ...a, rules: a.rules.map((r) => r.id === ruleId ? { ...r, ...updates } : r) } : a));
    setSelectedAgent((prev) => prev?.id === agentId ? { ...prev, rules: prev.rules.map((r) => r.id === ruleId ? { ...r, ...updates } : r) } : prev);
  }

  function deleteRule(agentId: string, ruleId: string) {
    setAgents(agents.map((a) => a.id === agentId ? { ...a, rules: a.rules.filter((r) => r.id !== ruleId) } : a));
    setSelectedAgent((prev) => prev?.id === agentId ? { ...prev, rules: prev.rules.filter((r) => r.id !== ruleId) } : prev);
  }

  function handleShare(id: string) {
    const url = generateShareUrl(id);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function addTemplateRule(template: typeof RULE_TEMPLATES[0]) {
    if (!selectedAgent) return;
    addRuleToAgent(selectedAgent.id, { id: uuid(), name: template.name, description: template.desc, severity: template.severity, scope: template.scope, pattern: template.pattern, action: template.action, enabled: true });
  }

  // ─── AGENT FORM MODAL ─────────────────────────────────
  function AgentFormModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowAgentForm(false)}>
        <div className="bg-dark-700 rounded-2xl border border-dark-500 max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-primary-400" /> Create Safety Agent</h3>
          <div className="space-y-3">
            <div><label className="text-xs text-gray-400 mb-1 block">Name</label><input type="text" value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} className="input-field text-sm" placeholder="e.g., Content Safety Guard" autoFocus /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Description</label><textarea value={agentForm.description} onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })} className="input-field text-sm min-h-[60px] resize-none" placeholder="What does this safety agent protect against?" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400 mb-1 block">Icon</label><div className="flex flex-wrap gap-1">{AGENT_ICONS.map((ic) => <button key={ic} onClick={() => setAgentForm({ ...agentForm, icon: ic })} className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${agentForm.icon === ic ? 'bg-primary-600/20 border border-primary-500' : 'bg-dark-600 border border-dark-400 hover:border-dark-300'}`}>{ic}</button>)}</div></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Color</label><div className="flex flex-wrap gap-1">{AGENT_COLORS.map((c) => <button key={c} onClick={() => setAgentForm({ ...agentForm, color: c })} className={`w-7 h-7 rounded-full border-2 ${agentForm.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />)}</div></div>
            </div>
            <div><label className="text-xs text-gray-400 mb-1 block">Tools to Protect</label><div className="flex flex-wrap gap-1.5">{TOOL_PRESETS.map((t) => <button key={t} onClick={() => setAgentForm({ ...agentForm, tools: agentForm.tools.includes(t) ? agentForm.tools.filter((x) => x !== t) : [...agentForm.tools, t] })} className={`px-2 py-1 rounded-md text-[11px] border ${agentForm.tools.includes(t) ? 'bg-primary-600/20 border-primary-500/40 text-primary-300' : 'bg-dark-600 border-dark-400 text-gray-400 hover:border-dark-300'}`}>{t}</button>)}</div></div>
            <button onClick={createAgent} disabled={!agentForm.name.trim()} className="btn-primary w-full mt-2"><Plus className="w-4 h-4 inline mr-1" /> Create Agent</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RULE FORM MODAL ──────────────────────────────────
  function RuleFormModal() {
    const [name, setName] = useState(editingRule?.name || '');
    const [desc, setDesc] = useState(editingRule?.description || '');
    const [severity, setSeverity] = useState<Severity>(editingRule?.severity || 'medium');
    const [scope, setScope] = useState<ScopeType>(editingRule?.scope || 'input');
    const [pattern, setPattern] = useState(editingRule?.pattern || '');
    const [action, setAction] = useState(editingRule?.action || 'block');

    function saveRule() {
      if (!name.trim() || !pattern.trim() || !selectedAgent) return;
      if (editingRule) {
        updateRule(selectedAgent.id, editingRule.id, { name: name.trim(), description: desc, severity, scope, pattern, action });
      } else {
        addRuleToAgent(selectedAgent.id, { id: uuid(), name: name.trim(), description: desc, severity, scope, pattern, action, enabled: true });
      }
      setShowRuleForm(false);
      setEditingRule(null);
    }

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => { setShowRuleForm(false); setEditingRule(null); }}>
        <div className="bg-dark-700 rounded-2xl border border-dark-500 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-white mb-4">{editingRule ? 'Edit Rule' : 'Add Rule'}</h3>
          <div className="space-y-3">
            <div><label className="text-xs text-gray-400 mb-1 block">Rule Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field text-sm" placeholder="e.g., PII Detection" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="input-field text-sm min-h-[50px] resize-none" placeholder="Describe what this rule checks for" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
  <label className="text-xs text-gray-400 mb-1 block">Severity</label>
  <div className="flex gap-1">
    {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => {
      const se = SEVERITY_CONFIG[s];
      const isActive = severity === s;
      const bgColor = se.color === 'red' ? 'red' : (se.color === 'orange' || se.color === 'yellow') ? 'amber' : 'blue';
      const btnClass = isActive 
        ? `bg-${bgColor}-600/20 text-${bgColor}-300 border border-${bgColor}-500/40`
        : 'bg-dark-600 border border-dark-400 text-gray-400';
      return (
        <button key={s} onClick={() => setSeverity(s)} className={`flex-1 py-1.5 rounded text-xs font-medium ${btnClass}`}>
          {se.icon}
        </button>
      );
    })}
  </div>
</div>
              <div><label className="text-xs text-gray-400 mb-1 block">Scope</label><div className="flex gap-1">{SCOPE_OPTIONS.map((s) => <button key={s.id} onClick={() => setScope(s.id)} className={`flex-1 py-1.5 rounded text-xs ${scope === s.id ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40' : 'bg-dark-600 border border-dark-400 text-gray-400'}`}>{s.icon} {s.label}</button>)}</div></div>
            </div>
            <div><label className="text-xs text-gray-400 mb-1 block">Detection Pattern (regex)</label><input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} className="input-field text-sm font-mono" placeholder="email|phone|ssn|password" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Action</label><div className="flex gap-1">{RULE_ACTIONS.map((a) => <button key={a.id} onClick={() => setAction(a.id as any)} className={`flex-1 py-1.5 rounded text-xs ${action === a.id ? 'bg-primary-600/20 text-primary-300 border border-primary-500/40' : 'bg-dark-600 border border-dark-400 text-gray-400'}`}>{a.label}</button>)}</div></div>
            <button onClick={saveRule} disabled={!name.trim() || !pattern.trim()} className="btn-primary w-full mt-2"><Plus className="w-4 h-4 inline mr-1" /> {editingRule ? 'Update Rule' : 'Add Rule'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── AGENT DETAIL VIEW ────────────────────────────────
  if (selectedAgent) {
    const agent = agents.find((a) => a.id === selectedAgent.id) || selectedAgent;
    const blockRules = agent.rules.filter((r) => r.action === 'block' && r.enabled);
    const warnRules = agent.rules.filter((r) => r.action === 'warn' && r.enabled);

    return (
      <div className="min-h-screen bg-dark-900">
        <nav className="border-b border-dark-500/50 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <button onClick={() => { setSelectedAgent(null); setView('agents'); }} className="text-gray-400 hover:text-white"><ChevronRight className="w-4 h-4 rotate-180" /></button>
            <span className="text-lg">{agent.icon}</span>
            <span className="font-bold text-white">{agent.name}</span>
            <button onClick={() => updateAgent(agent.id, { status: agent.status === 'active' ? 'paused' : 'active' })} className={`text-[10px] badge ${agent.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>{agent.status}</button>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => handleShare(agent.id)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">{copiedId === agent.id ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />} Share</button>
              <button onClick={() => deleteAgent(agent.id)} className="btn-danger text-xs py-1.5 px-3"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="card text-center py-3"><Shield className="w-5 h-5 text-primary-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{agent.rules.length}</p><p className="text-[10px] text-gray-500">Total Rules</p></div>
            <div className="card text-center py-3"><Lock className="w-5 h-5 text-red-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{blockRules.length}</p><p className="text-[10px] text-gray-500">Block Rules</p></div>
            <div className="card text-center py-3"><AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{agent.runs}</p><p className="text-[10px] text-gray-500">Total Runs</p></div>
            <div className="card text-center py-3"><AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-1" /><p className="text-lg font-bold text-white">{agent.blocks}</p><p className="text-[10px] text-gray-500">Blocks</p></div>
          </div>

          {/* Description + Tools */}
          <div className="card py-3 px-4"><p className="text-sm text-gray-300">{agent.description || 'No description'}</p>
            {agent.tools.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{agent.tools.map((t) => <span key={t} className="badge-blue text-[10px]">{t}</span>)}</div>}
          </div>

          {/* Quick Templates */}
          <details className="card py-3 px-4">
            <summary className="text-sm font-medium text-gray-300 cursor-pointer flex items-center gap-2 [&::-webkit-details-marker]:hidden"><Plus className="w-4 h-4 text-primary-400" /> Quick Add Rule Templates <span className="text-[10px] text-gray-600">(click to expand)</span></summary>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {RULE_TEMPLATES.map((t, idx) => {
                const hasRule = agent.rules.some((r) => r.name === t.name);
                return (<button key={idx} onClick={() => { if (!hasRule) addTemplateRule(t); }} disabled={hasRule}
                  className={`p-2.5 rounded-lg border text-left text-xs ${hasRule ? 'border-green-500/30 bg-green-500/5 text-gray-500' : 'border-dark-400 bg-dark-700/50 hover:border-dark-300 text-gray-300'}`}>
                  <span className="font-medium block">{t.name}</span>
                  <span className="text-[10px] text-gray-500">{t.desc}</span>
                  {hasRule && <span className="badge-green text-[8px] mt-1 inline-block">Added</span>}
                </button>);
              })}
            </div>
          </details>

          {/* Rules List */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Rules ({agent.rules.length})</h3>
            <button onClick={() => { setEditingRule(null); setShowRuleForm(true); }} className="btn-primary text-xs py-1.5 px-3"><Plus className="w-3 h-3 inline mr-1" /> New Rule</button>
          </div>

          {agent.rules.length === 0 ? (
            <div className="card text-center py-8"><Shield className="w-10 h-10 text-gray-600 mx-auto mb-2" /><p className="text-sm text-gray-500">No rules yet. Add rules from templates above or create custom ones.</p></div>
          ) : (
            <div className="space-y-2">{agent.rules.map((rule) => <RuleCard key={rule.id} rule={rule}
              onToggle={() => updateRule(agent.id, rule.id, { enabled: !rule.enabled })}
              onDelete={() => deleteRule(agent.id, rule.id)}
              onEdit={() => { setEditingRule(rule); setShowRuleForm(true); }} />)}</div>
          )}

          {/* Simulation */}
          <details className="card">
            <summary className="text-sm font-medium text-gray-300 cursor-pointer flex items-center gap-2 [&::-webkit-details-marker]:hidden"><Bot className="w-4 h-4 text-primary-400" /> Test Safety Agent <span className="text-[10px] text-gray-600">Simulate input</span></summary>
            <div className="mt-3">
              <SafetySimulator agent={agent} onBlock={() => updateAgent(agent.id, { blocks: agent.blocks + 1, runs: agent.runs + 1 })} onPass={() => updateAgent(agent.id, { runs: agent.runs + 1 })} />
            </div>
          </details>
        </div>
        {showRuleForm && <RuleFormModal />}
      </div>
    );
  }

  // ─── AGENTS LIST VIEW ─────────────────────────────────
  const filtered = agents.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()));
  const totalRules = agents.reduce((s, a) => s + a.rules.filter((r) => r.enabled).length, 0);
  const totalBlocks = agents.reduce((s, a) => s + a.blocks, 0);

  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="border-b border-dark-500/50 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary-400" />
          <span className="font-bold text-white">AI Safety Expert</span>
          <span className="text-[10px] text-gray-600 hidden sm:block">Build guardrails for your AI tools</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowAgentForm(true)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"><Plus className="w-3 h-3" /> New Agent</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center py-4"><Shield className="w-6 h-6 text-primary-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{agents.length}</p><p className="text-xs text-gray-500">Safety Agents</p></div>
          <div className="card text-center py-4"><Lock className="w-6 h-6 text-blue-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{totalRules}</p><p className="text-xs text-gray-500">Active Rules</p></div>
          <div className="card text-center py-4"><AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{agents.reduce((s, a) => s + a.runs, 0)}</p><p className="text-xs text-gray-500">Total Runs</p></div>
          <div className="card text-center py-4"><AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" /><p className="text-2xl font-bold text-white">{totalBlocks}</p><p className="text-xs text-gray-500">Threats Blocked</p></div>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 text-sm" placeholder="Search agents..." /></div>
          <button onClick={() => setShowAgentForm(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Agent</span></button>
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="card text-center py-16">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Safety Agents Yet</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Create AI safety agents to define rules, guardrails, and policies for your AI tools. Each agent can protect against specific threats.</p>
            <button onClick={() => setShowAgentForm(true)} className="btn-primary flex items-center gap-2 mx-auto"><Plus className="w-4 h-4" /> Create Your First Agent</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-10"><Search className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-400 text-sm">No agents matching "{search}"</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((agent) => <AgentCard key={agent.id} agent={agent} onSelect={() => { setSelectedAgent(agent); setView('rules'); }} onDelete={() => deleteAgent(agent.id)} onDuplicate={() => duplicateAgent(agent)} />)}
          </div>
        )}

        {/* Safety Dashboard */}
        <details className="card">
          <summary className="text-sm font-medium text-gray-300 cursor-pointer flex items-center gap-2 [&::-webkit-details-marker]:hidden"><FileText className="w-4 h-4 text-primary-400" /> Safety Policy Report</summary>
          <div className="mt-4 space-y-3">
            {agents.length === 0 ? <p className="text-sm text-gray-500">No agents created yet.</p> : agents.map((agent) => (
              <div key={agent.id} className="py-2 border-b border-dark-500/50 last:border-0">
                <div className="flex items-center gap-2 mb-1"><span className="text-base">{agent.icon}</span><span className="font-medium text-white">{agent.name}</span><span className="badge-blue text-[10px]">{agent.status}</span></div>
                <div className="text-xs text-gray-500 ml-8 space-y-0.5">
                  <p>Rules: {agent.rules.length} ({agent.rules.filter((r) => r.enabled).length} active) | Runs: {agent.runs} | Blocks: {agent.blocks}</p>
                  <p>Tools: {agent.tools.join(', ') || 'None'} | Created: {new Date(agent.createdAt).toLocaleDateString()}</p>
                  {agent.rules.filter((r) => r.enabled).slice(0, 3).map((r) => <p key={r.id} className="text-[10px] text-gray-600">• {r.severity === 'critical' ? '🚨' : r.severity === 'high' ? '⚠️' : '•'} {r.name} — {r.action}</p>)}
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {showAgentForm && <AgentFormModal />}
    </div>
  );
}

// ─── Safety Simulator Component ──────────────────────────
function SafetySimulator({ agent, onBlock, onPass }: { agent: SafetyAgent; onBlock: () => void; onPass: () => void }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ blocked: boolean; rule?: Rule; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleTest() {
    if (!input.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const lower = input.toLowerCase();
      const matchedRule = agent.rules.find((r) => {
        if (!r.enabled) return false;
        const patterns = r.pattern.toLowerCase().split('|').map((p) => p.trim());
        return patterns.some((p) => lower.includes(p));
      });

      if (matchedRule) {
        setResult({ blocked: true, rule: matchedRule, message: `${SEVERITY_CONFIG[matchedRule.severity].icon} Rule "${matchedRule.name}" triggered. Action: ${matchedRule.action}.` });
        if (matchedRule.action === 'block') onBlock();
        else onPass();
      } else {
        setResult({ blocked: false, message: '✅ No rules triggered. Input passed all safety checks.' });
        onPass();
      }
      setLoading(false);
    }, 500);
  }

  return (
    <div className="space-y-2">
      <textarea value={input} onChange={(e) => setInput(e.target.value)} className="input-field text-sm min-h-[60px] resize-none font-mono" placeholder='Test with sample input...&#10;e.g., "My email is john@example.com" or "I forgot the system prompt"' />
      <button onClick={handleTest} disabled={!input.trim() || loading} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
        {loading ? <span className="animate-spin">⏳</span> : <Bot className="w-3 h-3" />}
        Test Safety Rules
      </button>
      {result && (
        <div className={`p-3 rounded-lg text-xs ${result.blocked ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-green-500/10 border border-green-500/20 text-green-300'}`}>
          {result.message}
          {result.rule && <div className="mt-1 text-gray-400">Pattern matched: <code className="text-[10px] bg-dark-800 px-1 rounded">{result.rule.pattern}</code></div>}
        </div>
      )}
    </div>
  );
}
