import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bootcampName: string;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, onClose, bootcampName }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    // Simulate API call
    setTimeout(() => setStep('success'), 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep('form');
      setForm({ name: '', email: '', phone: '', experience: '' });
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Header gradient */}
            <div className="h-2 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-500" />

            <div className="p-8">
              {step === 'form' && (
                <>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Enroll in {bootcampName}
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Fill in your details and we'll get you started within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                          placeholder="you@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                      <select
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm text-slate-700"
                      >
                        <option value="">Select your experience</option>
                        <option value="student">Student</option>
                        <option value="fresher">Fresher (0-1 years)</option>
                        <option value="mid">Mid-level (2-5 years)</option>
                        <option value="senior">Senior (5+ years)</option>
                        <option value="career-switch">Career switcher</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-primary !w-full text-base mt-2">
                      <ArrowRight size={18} />
                      Complete Enrollment
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                      No payment required now. We'll reach out to confirm your spot.
                    </p>
                  </form>
                </>
              )}

              {step === 'loading' && (
                <div className="text-center py-16">
                  <Loader2 size={48} className="text-brand-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Processing your enrollment...</h3>
                  <p className="text-slate-500">This will only take a moment.</p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  >
                    <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">You're in! 🎉</h3>
                  <p className="text-slate-500 mb-2">
                    Welcome to <strong>{bootcampName}</strong>
                  </p>
                  <p className="text-sm text-slate-400 mb-8">
                    Check your email for next steps. We'll also send you a WhatsApp confirmation shortly.
                  </p>
                  <button onClick={handleClose} className="btn-primary">
                    Got it!
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnrollmentModal;
