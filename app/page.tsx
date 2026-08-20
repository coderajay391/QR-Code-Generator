'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { QRStudio } from '@/components/QRStudio';
import { ApiExplorer } from '@/components/ApiExplorer';
import { HistoryManager } from '@/components/HistoryManager';
import { AuthModal } from '@/components/AuthModal';
import {
  QrCode,
  Shield,
  Layers,
  Zap,
  Lock,
  Cpu,
  Database,
  Terminal,
  FileCode,
  CheckCircle2,
  Server,
  FolderGit2,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'studio' | 'explorer' | 'history' | 'docs'>('studio');
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('qr_api_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('qr_api_token');
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState<number>(0);
  const [historyCount, setHistoryCount] = useState<number>(0);

  // Fetch count of user's saved QR codes
  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    fetch('/api/v1/qr?limit=1', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.meta?.total !== undefined) {
          setHistoryCount(data.meta.total);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [token, historyRefreshKey]);

  const handleAuthSuccess = (data: { user: any; token: string }) => {
    setUser(data.user);
    setToken(data.token);
    try {
      localStorage.setItem('qr_api_token', data.token);
      localStorage.setItem('qr_api_user', JSON.stringify(data.user));
    } catch {
      // Ignore
    }
    setHistoryRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('qr_api_token');
      localStorage.removeItem('qr_api_user');
    } catch {
      // Ignore
    }
    if (activeTab === 'history') {
      setActiveTab('studio');
    }
  };

  const handleQRSaved = () => {
    setHistoryRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        historyCount={historyCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Feature Strip */}
        <div className="mb-8 p-6 rounded-2xl bg-[#0A0C10] border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold font-mono">
                  PRODUCTION REST BACKEND • v1.0.4
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                QR Code Engine & REST API
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Generate, customize, and persist dynamic QR codes (Wi-Fi, vCard 3.0, Web URLs, Email, SMS, Crypto) with JWT bearer authentication, rate limiting, and OpenAPI 3.0 specs.
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
              <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                <span className="block text-lg font-bold text-indigo-400 font-mono">9 Types</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Protocols</span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                <span className="block text-lg font-bold text-white font-mono">SVG/PNG</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Formats</span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                <span className="block text-lg font-bold text-emerald-400 font-mono">Level H</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Resilience</span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl text-center">
                <span className="block text-lg font-bold text-indigo-300 font-mono">JWT + Zod</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab View Content */}
        {activeTab === 'studio' && (
          <QRStudio
            user={user}
            token={token}
            onSaved={handleQRSaved}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'explorer' && <ApiExplorer token={token} />}

        {activeTab === 'history' && (
          <HistoryManager
            user={user}
            token={token}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Backend Architecture & Technical Details Section */}
        <section id="architecture-overview" className="mt-16 pt-12 border-t border-white/5 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold font-mono">
              Clean Architecture & System Design
            </p>
            <h2 className="text-xl font-bold text-white">
              Production Backend Stack Specifications
            </h2>
            <p className="text-xs text-slate-400">
              Modular separation of concerns strictly complying with enterprise engineering standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Security & Authentication</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Stateless JWT Bearer Authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Bcrypt password hashing (10 salt rounds)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Helmet HTTP security headers & CORS</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tiered rate limiting (Public vs Auth)</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Database & Persistence</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>MongoDB & Mongoose Schema models</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Indexed queries (userId, createdAt, type)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pagination, search, and type filtering</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Resilient in-memory fallback adapter</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0A0C10] border border-white/5 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Testing & DevOps</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Jest & Supertest automated test suite</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Multi-stage production Dockerfile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Docker Compose (API + MongoDB cluster)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Winston structured JSON logger</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#080A0E] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <span>&copy; 2026 QR-CORE INFRASTRUCTURE SOLUTIONS</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('explorer')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              OpenAPI 3.0 Spec
            </button>
            <span className="text-white/10">•</span>
            <button
              onClick={() => setActiveTab('studio')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Generator Studio
            </button>
            <span className="text-white/10">•</span>
            <span className="text-indigo-400/80">SECURED BY JWT v2</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
