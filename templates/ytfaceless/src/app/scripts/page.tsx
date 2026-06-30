'use client';

import { useState } from 'react';
import { FileText, Sparkles, Copy, Clock, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { scripts } from '@/data/content';

const niches = ['All', 'Tech & AI', 'Psychology', 'Motivation', 'Finance', 'Entertainment'];

export default function ScriptsPage() {
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');

  const filtered = scripts.filter((s) => {
    if (selectedNiche !== 'All' && s.niche !== selectedNiche) return false;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-fire-500 to-accent-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <FileText size={16} />
            AI Script Generator
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Script Generator</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Generate viral hooks, full outlines, and complete scripts optimized for watch time and engagement.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Custom Generator */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-dark-800 mb-4">Generate a Custom Script</h2>
          <p className="text-sm text-dark-500 mb-6">Enter a topic and our AI will create a full script with hook, sections, and CTA.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. 5 AI tools that replaced my 9-5 job"
              className="flex-1 px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400"
            />
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2">
              <Sparkles size={18} />
              Generate
            </button>
          </div>
        </div>

        {/* Niche filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {niches.map((n) => (
            <button
              key={n}
              onClick={() => setSelectedNiche(n)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedNiche === n
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-dark-500 border border-dark-200 hover:border-brand-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Scripts */}
        <div className="space-y-4">
          {filtered.map((script) => {
            const isExpanded = expandedId === script.id;
            const fullText = `HOOOK:\n${script.hook}\n\n${script.sections.map((s) => `${s.heading}\n\n${s.content}`).join('\n\n')}\n\nCTA:\n${script.cta}`;

            return (
              <div key={script.id} className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : script.id)}
                  className="w-full p-6 text-left flex items-center gap-4 hover:bg-dark-50/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-fire-500 flex items-center justify-center text-white shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark-800">{script.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-600">{script.niche}</span>
                      <span className="text-xs text-dark-400 flex items-center gap-1"><Clock size={12} /> {script.duration}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-dark-400" /> : <ChevronDown size={20} className="text-dark-400" />}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-dark-100 pt-6">
                    {/* Hook */}
                    <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 mb-6">
                      <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">Hook (First 15 seconds)</p>
                      <p className="text-sm text-dark-700 italic">&ldquo;{script.hook}&rdquo;</p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-4 mb-6">
                      {script.sections.map((section, i) => (
                        <div key={i}>
                          <h4 className="text-sm font-bold text-dark-800 mb-1">{section.heading}</h4>
                          <p className="text-sm text-dark-600 leading-relaxed">{section.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="p-4 rounded-xl bg-fire-50 border border-fire-100 mb-6">
                      <p className="text-xs font-bold text-fire-600 uppercase tracking-wide mb-2">Call to Action</p>
                      <p className="text-sm text-dark-700">{script.cta}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopy(fullText, script.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 text-dark-700 text-sm font-medium hover:bg-dark-200 transition-colors"
                      >
                        {copied === script.id ? <Check size={16} className="text-neon-500" /> : <Copy size={16} />}
                        {copied === script.id ? 'Copied!' : 'Copy Full Script'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
