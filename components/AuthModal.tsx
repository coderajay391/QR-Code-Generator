'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Key, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { user: any; token: string }) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === 'register' ? '/api/v1/auth/register' : '/api/v1/auth/login';
    const payload = mode === 'register' ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    const demoEmail = `developer_${Math.floor(Math.random() * 9000 + 1000)}@api.io`;
    const demoPass = 'DevPass123!';

    try {
      // Register demo user
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Alex Developer',
          email: demoEmail,
          password: demoPass,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }
      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1115]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div id="auth-modal-card" className="w-full max-w-md bg-[#0A0C10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{mode === 'login' ? 'Developer Sign In' : 'Create Developer Account'}</h3>
              <p className="text-[11px] text-slate-400">Authenticate for persistent cloud QR telemetry</p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 m-4 bg-[#080A0E] rounded-xl border border-white/5 text-xs font-semibold">
          <button
            id="auth-toggle-login"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            id="auth-toggle-register"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${mode === 'register' ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'text-slate-400 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Turing"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@enterprise.io"
                className="w-full bg-[#080A0E] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                id="auth-input-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min 8 chars, 1 uppercase, 1 number' : 'Your password'}
                className="w-full bg-[#080A0E] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0A0C10] px-2 text-slate-500 font-semibold">Or Instant Session</span>
            </div>
          </div>

          <button
            id="auth-demo-btn"
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold py-2.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generate Quick Test Developer Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
}
