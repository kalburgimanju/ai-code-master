import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { AvatarStyle, Platform } from '../types';
import { useApp } from '../context/AppContext';
import { createAvatar } from '../utils/avatarGenerator';
import GradientButton from './shared/GradientButton';

interface CreateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles: { value: AvatarStyle; label: string; desc: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Clean, corporate look' },
  { value: 'creative', label: 'Creative', desc: 'Bold, artistic vibe' },
  { value: 'fantasy', label: 'Fantasy', desc: 'Magical character' },
  { value: 'minimal', label: 'Minimal', desc: 'Sleek simplicity' },
  { value: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon futuristic' },
];

const platforms: { value: Platform; label: string }[] = [
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
];

const CreateAvatarModal: React.FC<CreateAvatarModalProps> = ({ isOpen, onClose }) => {
  const { addAvatar } = useApp();
  const [name, setName] = useState('');
  const [style, setStyle] = useState<AvatarStyle>('professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter']);
  const [step, setStep] = useState(1);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const avatar = createAvatar(name.trim(), style, selectedPlatforms);
    addAvatar(avatar);
    onClose();
    setName('');
    setStyle('professional');
    setSelectedPlatforms(['twitter']);
    setStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass rounded-2xl p-8 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Create Avatar</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    s <= step ? 'bg-brand-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Avatar Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Tech Influencer, Brand Ambassador..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 mb-6"
                />
                <GradientButton onClick={() => name.trim() && setStep(2)} className="w-full">
                  Next: Choose Style
                </GradientButton>
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm text-gray-400 mb-3">Choose Style</label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {styles.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        style === s.value
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-white text-sm font-medium">{s.label}</p>
                      <p className="text-gray-400 text-xs">{s.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <GradientButton variant="secondary" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </GradientButton>
                  <GradientButton onClick={() => setStep(3)} className="flex-1">
                    Next: Platforms
                  </GradientButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm text-gray-400 mb-3">Select Platforms</label>
                <div className="space-y-2 mb-6">
                  {platforms.map(p => (
                    <button
                      key={p.value}
                      onClick={() => togglePlatform(p.value)}
                      className={`w-full p-3 rounded-xl border text-left text-sm transition-all flex items-center gap-3 ${
                        selectedPlatforms.includes(p.value)
                          ? 'border-brand-500 bg-brand-500/10 text-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                        selectedPlatforms.includes(p.value) ? 'border-brand-500 bg-brand-500' : 'border-gray-500'
                      }`}>
                        {selectedPlatforms.includes(p.value) && (
                          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </div>
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <GradientButton variant="secondary" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </GradientButton>
                  <GradientButton
                    onClick={handleCreate}
                    disabled={selectedPlatforms.length === 0}
                    className="flex-1"
                  >
                    <Sparkles size={16} /> Create Avatar
                  </GradientButton>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateAvatarModal;
