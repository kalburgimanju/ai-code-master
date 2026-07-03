'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-react';
import { setItem, USER_KEY } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@finplanner.com');
  const [password, setPassword] = useState('demo123');
  const [showPw, setShowPw] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('Demo User');
  const [phone, setPhone] = useState('+91-9876543210');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setItem(USER_KEY, { id: 'user1', name: name || 'Demo User', email, phone: phone || '+91-9876543210', city: 'Hubli', isLoggedIn: true });
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-finance-500 to-prop-500 flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">FinPlanner</h1>
          <p className="text-dark-400 text-sm mt-1">AI-Powered Financial & Real Estate Platform</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-dark-500">
            <Building2 className="w-3 h-3" /> Hubli • Bangalore • Mysore
          </div>
        </div>

        {/* Form */}
        <div className="card border-finance-500/20">
          <h2 className="text-lg font-semibold text-white mb-1">{showRegister ? 'Create Account' : 'Sign In'}</h2>
          <p className="text-xs text-dark-400 mb-5">{showRegister ? 'Register to access all features' : 'Access your financial dashboard'}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {showRegister && (
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Your name" required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input pl-10" placeholder="you@email.com" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input pl-10 pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {showRegister && (
              <div>
                <label className="label">Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="+91-9876543210" />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Loading...' : showRegister ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center">
            <button onClick={() => setShowRegister(!showRegister)} className="text-xs text-finance-400 hover:text-finance-300">
              {showRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-dark-800 border border-dark-700">
            <p className="text-[10px] text-dark-500 text-center">Demo credentials pre-filled. Click Sign In to continue.</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Projects', value: '14+' },
            { label: 'AI Agents', value: '6' },
            { label: 'Cities', value: '3' },
          ].map((f, i) => (
            <div key={i} className="card p-3"><div className="text-sm font-bold text-white">{f.value}</div><div className="text-[10px] text-dark-500">{f.label}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
