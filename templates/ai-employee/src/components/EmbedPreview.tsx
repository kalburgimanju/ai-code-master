import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, ExternalLink } from 'lucide-react';

const EmbedPreview: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const code = `<!-- MyAI Employee Widget -->
<script src="https://cdn.myaiemployee.com/widget.js"></script>
<div id="myaiemployee-widget"
  data-agent-id="YOUR_AGENT_ID"
  data-theme="dark"
  data-position="bottom-right">
</div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Code */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                <Code2 size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                One line to deploy
              </h2>
            </div>
            <p className="text-dark-400 mb-6 leading-relaxed">
              Drop a single script tag into your website and your AI employee is live. No complex setup, no DevOps needed.
            </p>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-dark-400">HTML</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-dark-800 rounded-2xl p-6 text-sm text-dark-300 overflow-x-auto border border-white/5">
                {code}
              </pre>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <span className="text-xs px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Works with any website
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                React, Next.js, WordPress, Shopify
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                No page reload needed
              </span>
            </div>
          </motion.div>

          {/* Right: Live widget preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-card p-8 glow">
              <div className="bg-dark-800 rounded-2xl p-6 border border-white/5">
                {/* Browser mockup */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 bg-dark-700 rounded-lg px-3 py-1.5 text-xs text-dark-400">
                    yourwebsite.com
                  </div>
                </div>

                {/* Fake page content */}
                <div className="space-y-3 mb-8">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                  <div className="h-3 bg-dark-700 rounded w-2/3" />
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="h-16 bg-dark-700 rounded-lg" />
                    <div className="h-16 bg-dark-700 rounded-lg" />
                    <div className="h-16 bg-dark-700 rounded-lg" />
                  </div>
                </div>

                {/* Widget button */}
                <div className="flex justify-end">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-emerald-300 flex items-center justify-center shadow-lg shadow-brand-500/30 cursor-pointer"
                  >
                    <span className="text-dark-900 font-bold text-lg">AI</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-4 left-8 glass-card p-3 flex items-center gap-2"
            >
              <ExternalLink size={14} className="text-brand-400" />
              <span className="text-xs text-dark-300">Works on any page</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EmbedPreview;
