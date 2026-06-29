import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Sparkles, Copy, Check } from 'lucide-react';
import { useAgent } from '../hooks/useAgent';
import type { WizardStep } from '../types';

const steps: { key: WizardStep; label: string; number: number }[] = [
  { key: 'role', label: 'Role', number: 1 },
  { key: 'prompt', label: 'Prompt', number: 2 },
  { key: 'knowledge', label: 'Knowledge', number: 3 },
  { key: 'launch', label: 'Launch', number: 4 },
];

const departments = ['Support', 'Sales', 'HR', 'Marketing', 'Finance', 'Operations', 'Engineering', 'Legal', 'Other'];

const promptSuggestions = [
  'You are a friendly customer support agent. Answer product questions, help with orders, and resolve issues empathetically.',
  'You are a sales development representative. Qualify leads, handle objections, and book demo calls.',
  'You are an HR assistant. Help with onboarding, explain policies, manage leave requests, and answer benefits questions.',
  'You are a data analyst. Answer business questions from company data, provide insights with supporting numbers.',
];

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onCreated }) => {
  const {
    step, formData, isCreating, createdAgent, error,
    updateForm, canProceed, nextStep, prevStep, launchAgent, reset,
  } = useAgent();
  const [copied, setCopied] = React.useState(false);

  const stepIndex = steps.findIndex((s) => s.key === step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleClose = () => {
    onClose();
    setTimeout(() => reset(), 300);
  };

  const handleDone = () => {
    onCreated?.();
    handleClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = `<script src="https://cdn.myaiemployee.com/widget.js"></script>
<div id="myaiemployee-widget"
  data-agent-id="${createdAgent?.id || 'demo'}"
  data-theme="dark">
</div>`;

  return (
    <AnimatePresence>
      {isOpen && (
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
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl glass-card overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-dark-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Progress bar */}
            <div className="h-1 bg-dark-800">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 pt-6 pb-2">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    stepIndex >= i
                      ? 'bg-brand-500 text-dark-900'
                      : 'bg-dark-700 text-dark-400'
                  }`}>
                    {stepIndex > i ? <CheckCircle2 size={16} /> : s.number}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${
                    stepIndex >= i ? 'text-white' : 'text-dark-500'
                  }`}>
                    {s.label}
                  </span>
                  {i < steps.length - 1 && <div className="w-6 h-px bg-dark-600 mx-1" />}
                </div>
              ))}
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Role */}
                {step === 'role' && (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-1">Name your AI employee</h3>
                    <p className="text-dark-400 mb-6">Give it a name and assign a department.</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Employee Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateForm('name', e.target.value)}
                          placeholder="e.g., Support Bot, Sales Genie"
                          className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-dark-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Department</label>
                        <select
                          value={formData.department}
                          onChange={(e) => updateForm('department', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                        >
                          <option value="">Select department</option>
                          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Role</label>
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => updateForm('role', e.target.value)}
                          placeholder="e.g., Customer Support Agent, Sales Closer"
                          className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-dark-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Prompt */}
                {step === 'prompt' && (
                  <motion.div
                    key="prompt"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-1">Write the system prompt</h3>
                    <p className="text-dark-400 mb-4">Describe what the AI employee should do, how it should behave, and what it needs to know.</p>

                    {/* Prompt suggestions */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-dark-400 mb-2 flex items-center gap-1">
                        <Sparkles size={12} className="text-brand-400" /> Quick start templates
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {promptSuggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => updateForm('systemPrompt', s)}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-dark-300 hover:bg-brand-500/20 hover:border-brand-500/30 hover:text-brand-400 transition-all"
                          >
                            {s.slice(0, 40)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={formData.systemPrompt}
                      onChange={(e) => updateForm('systemPrompt', e.target.value)}
                      rows={8}
                      placeholder="You are a helpful AI employee for [Company Name]..."
                      className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-dark-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm resize-none"
                    />

                    <p className="mt-2 text-xs text-dark-500">
                      {formData.systemPrompt.length} characters · Be specific for best results
                    </p>
                  </motion.div>
                )}

                {/* Step 3: Knowledge */}
                {step === 'knowledge' && (
                  <motion.div
                    key="knowledge"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-1">Add knowledge base</h3>
                    <p className="text-dark-400 mb-6">Paste content, FAQs, or product info your AI employee should know.</p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Knowledge Content</label>
                        <textarea
                          value={formData.knowledgeBase}
                          onChange={(e) => updateForm('knowledgeBase', e.target.value)}
                          rows={6}
                          placeholder="Paste your FAQ, product descriptions, policies, or any text your AI should know..."
                          className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-dark-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="glass-card p-4 text-center hover:border-brand-500/30 transition-all cursor-pointer">
                          <div className="text-2xl mb-2">📄</div>
                          <p className="text-xs font-medium text-dark-300">Upload Files</p>
                          <p className="text-[10px] text-dark-500">PDF, TXT, MD</p>
                        </div>
                        <div className="glass-card p-4 text-center hover:border-brand-500/30 transition-all cursor-pointer">
                          <div className="text-2xl mb-2">🔗</div>
                          <p className="text-xs font-medium text-dark-300">Add URL</p>
                          <p className="text-[10px] text-dark-500">Crawl website</p>
                        </div>
                        <div className="glass-card p-4 text-center hover:border-brand-500/30 transition-all cursor-pointer">
                          <div className="text-2xl mb-2">💬</div>
                          <p className="text-xs font-medium text-dark-300">Import FAQ</p>
                          <p className="text-[10px] text-dark-500">Auto-format</p>
                        </div>
                      </div>

                      <p className="text-xs text-dark-500">
                        Knowledge base helps your AI employee give accurate, context-aware answers. You can update it anytime.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Launch */}
                {step === 'launch' && (
                  <motion.div
                    key="launch"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {isCreating ? (
                      <div className="text-center py-12">
                        <Loader2 size={48} className="text-brand-400 mx-auto mb-4 animate-spin" />
                        <h3 className="text-xl font-bold text-white mb-2">Building your AI employee...</h3>
                        <p className="text-dark-400">Training on your knowledge base and configuring the agent.</p>
                      </div>
                    ) : createdAgent ? (
                      <div>
                        <div className="text-center mb-6">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                          >
                            <CheckCircle2 size={48} className="text-brand-400 mx-auto mb-3" />
                          </motion.div>
                          <h3 className="text-2xl font-bold text-white mb-1">{createdAgent.name} is live! 🎉</h3>
                          <p className="text-dark-400">Your AI employee is ready to handle conversations.</p>
                        </div>

                        {/* Embed code */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-dark-300">Embed Code</p>
                            <button
                              onClick={handleCopy}
                              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <pre className="bg-dark-800 rounded-xl p-4 text-xs text-dark-300 overflow-x-auto border border-white/5">
                            {embedCode}
                          </pre>
                        </div>

                        {/* Shareable link */}
                        <div className="glass-card p-4">
                          <p className="text-sm font-medium text-dark-300 mb-2">Shareable Link</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`https://myaiemployee.com/chat/${createdAgent.id}`}
                              className="flex-1 bg-dark-800 rounded-lg px-3 py-2 text-xs text-dark-300 border border-white/5 outline-none"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`https://myaiemployee.com/chat/${createdAgent.id}`);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="btn-secondary !py-2 !px-4 text-xs"
                            >
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button onClick={launchAgent} className="btn-primary cursor-pointer">
                          <Sparkles size={18} />
                          Launch Agent
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && step !== 'launch' && (
                <p className="text-red-400 text-sm mt-4">{error}</p>
              )}
            </div>

            {/* Navigation */}
            {step !== 'launch' || !createdAgent ? (
              <div className="flex items-center justify-between p-6 pt-0">
                <button
                  onClick={prevStep}
                  disabled={step === 'role'}
                  className="btn-ghost !py-2 !px-4 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                {step === 'knowledge' ? (
                  <button
                    onClick={launchAgent}
                    disabled={isCreating}
                    className="btn-primary !py-2.5 !px-6 text-sm cursor-pointer"
                  >
                    <Sparkles size={16} />
                    {isCreating ? 'Creating...' : 'Create AI Employee'}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="btn-primary !py-2.5 !px-6 text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex justify-center p-6 pt-0">
                <button onClick={handleDone} className="btn-primary cursor-pointer">
                  Done — Go to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateAgentModal;
