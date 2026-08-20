'use client';

import React from 'react';
import { QrCode, Code2, History, Shield, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { SystemHealthBadge } from './SystemHealthBadge';

interface NavbarProps {
  activeTab: 'studio' | 'explorer' | 'history' | 'docs';
  setActiveTab: (tab: 'studio' | 'explorer' | 'history' | 'docs') => void;
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  historyCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  historyCount,
}: NavbarProps) {
  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0F1115]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] text-white font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">QR-CORE<span className="text-indigo-400">.io</span></span>
              <span className="bg-indigo-500/15 text-indigo-400 text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-indigo-500/25">
                v1.0.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono hidden sm:block">Enterprise REST API Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#0A0C10] p-1 rounded-lg border border-white/5">
          <button
            id="nav-tab-studio"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            id="nav-tab-explorer"
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'explorer'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>API Docs & Explorer</span>
          </button>

          <button
            id="nav-tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all relative ${
              activeTab === 'history'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Cloud History</span>
            {historyCount > 0 && (
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side health & auth */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <SystemHealthBadge />
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-[#0A0C10] border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono text-[11px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-200 font-medium truncate max-w-[120px]">{user.name}</span>
              </div>
              <button
                id="auth-logout-btn"
                onClick={onLogout}
                className="p-2 rounded-lg bg-[#0A0C10] border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="auth-open-modal-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
