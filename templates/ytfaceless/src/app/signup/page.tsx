'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');

    // Simulate signup — in production, this would call an auth API
    setTimeout(() => {
      setLoading(false);
      setError('Authentication not configured yet. This is a demo.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-2xl text-dark-900">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-fire-500 flex items-center justify-center">
              <Play size={20} className="text-white fill-white" />
            </span>
            FaceFlow
          </Link>
          <h1 className="text-2xl font-extrabold text-dark-900 mt-6">Create your account</h1>
          <p className="text-sm text-dark-500 mt-2">Start building faceless YouTube channels today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="bg-white rounded-2xl shadow-sm border border-dark-100 p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-fire-50 border border-fire-100 flex items-center gap-2 text-sm text-fire-700">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-dark-700 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-dark-700 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-dark-700 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-dark-500">
            <CheckCircle2 size={14} className="text-neon-500 mt-0.5 shrink-0" />
            <span>Free forever — no credit card required. Upgrade anytime.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-dark-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
