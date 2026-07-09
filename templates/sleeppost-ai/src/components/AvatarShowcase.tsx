import React from 'react';
import { motion } from 'framer-motion';
import { generateAvatarSVG } from '../utils/avatarGenerator';
import type { AvatarStyle } from '../types';

const styles: { style: AvatarStyle; label: string; description: string }[] = [
  { style: 'professional', label: 'Professional', description: 'Clean, corporate-ready avatar' },
  { style: 'creative', label: 'Creative', description: 'Bold, artistic personality' },
  { style: 'fantasy', label: 'Fantasy', description: 'Magical, whimsical character' },
  { style: 'minimal', label: 'Minimal', description: 'Sleek, modern simplicity' },
  { style: 'cyberpunk', label: 'Cyberpunk', description: 'Neon-lit futuristic look' },
];

const AvatarShowcase: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            5 Unique <span className="gradient-text">Avatar Styles</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Each avatar is uniquely generated to represent your brand identity
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8">
          {styles.map((s, i) => {
            const svg = generateAvatarSVG(s.style, `Showcase-${s.style}`);
            return (
              <motion.div
                key={s.style}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-2xl p-6 text-center glow-card cursor-pointer"
              >
                <div
                  className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <h3 className="text-white font-semibold mb-1">{s.label}</h3>
                <p className="text-gray-400 text-sm">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AvatarShowcase;
