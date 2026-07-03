'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { v4 as uuid } from 'uuid';
import { Play, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    // Client-side auth — auto-create account
    const stored = localStorage.getItem('users');
    const users: Record<string, { id: string; name: string; email: string; password: string }> = stored ? JSON.parse(stored) : {};

    let user = users[email];
    if (!user) {
      // Auto-create
      user = { id: uuid(), name: email.split('@')[0], email, password };
      users[email] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }

    if (user.password !== password) {
      setError('Invalid password');
      setLoading(false);
      return;
    }

    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    localStorage.setItem('token', token);
    setUser({ id: user.id, name: user.name, email: user.email });
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <Play className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Log in to your AI Video Studio</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/auth/signup')} className="text-primary-400 hover:text-primary-300 font-medium">
              Sign up free
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Demo mode: any email/password combo works
        </p>
      </div>
    </div>
  );
}
