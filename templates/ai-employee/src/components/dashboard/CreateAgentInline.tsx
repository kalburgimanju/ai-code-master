import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useAgentContext } from '../../context/AgentContext';
import type { AIEmployee } from '../../types';

const departments = ['Support', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations', 'Engineering'];

const promptSuggestions = [
  'You are a friendly customer support agent. Answer product questions, help with orders, and resolve issues.',
  'You are a sales development representative. Qualify leads, handle objections, and book demo calls.',
  'You are an HR assistant. Help with onboarding, explain policies, and manage leave requests.',
  'You are a data analyst. Answer business questions from company data and provide actionable insights.',
  'You are a technical support engineer. Debug issues, provide solutions, and escalate complex bugs.',
];

interface Props {
  onClose: () => void;
}

const CreateAgentInline: React.FC<Props> = ({ onClose }) => {
  const { addAgent } = useAgentContext();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: '',
    department: '',
    systemPrompt: '',
  });

  const canCreate = form.name.trim().length > 0 && form.systemPrompt.trim().length > 5;

  const handleCreate = async () => {
    if (!canCreate) return;
    setIsCreating(true);

    // Simulate creation delay
    await new Promise((r) => setTimeout(r, 1500));

    const agent: AIEmployee = {
      id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: form.name,
      role: form.role || form.department + ' Agent',
      department: form.department || 'General',
      avatar: '',
      status: 'active',
      conversations: 0,
      resolutionRate: 95,
      avgResponseTime: '0.8',
      createdAt: new Date().toISOString(),
      systemPrompt: form.systemPrompt,
      knowledgeBase: '',
    };

    addAgent(agent);
    setIsCreating(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-dark-900 rounded-2xl p-6 border border-brand-500/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-white">Create New AI Employee</h4>
        <button onClick={onClose} className="p-1 text-dark-400 hover:text-white rounded-lg hover:bg-white/5">
          <X size={18} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-dark-300 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Support Bot, Sales Closer"
            className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-dark-500 outline-none focus:border-brand-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-300 mb-1">Department</label>
          <select
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white outline-none focus:border-brand-500 text-sm"
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-dark-300 mb-1">System Prompt *</label>
        <textarea
          value={form.systemPrompt}
          onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
          rows={3}
          placeholder="Describe what this AI employee should do..."
          className="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-dark-500 outline-none focus:border-brand-500 text-sm resize-none"
        />
      </div>

      <div className="mb-4">
        <p className="text-[10px] text-dark-500 mb-2 flex items-center gap-1">
          <Sparkles size={10} className="text-brand-400" /> Quick templates
        </p>
        <div className="flex flex-wrap gap-1.5">
          {promptSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setForm({ ...form, systemPrompt: s })}
              className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-dark-300 hover:bg-brand-500/20 hover:border-brand-500/30 hover:text-brand-400 transition-all"
            >
              {s.slice(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-dark-500">
          {form.systemPrompt.length} characters
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-dark-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 text-dark-900 font-semibold text-sm hover:bg-brand-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Create Agent
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateAgentInline;
