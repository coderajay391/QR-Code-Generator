'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Database, Server, CheckCircle2, RefreshCw } from 'lucide-react';

interface HealthData {
  status: string;
  uptime: string;
  database: {
    connected: boolean;
    engine: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    memoryUsageMb: number;
  };
  timestamp: string;
}

export function SystemHealthBadge() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/health');
      const data = await res.json();
      if (data.success && data.data) {
        setHealth(data.data);
      }
    } catch {
      // Error fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.data) {
          setHealth(data.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    const interval = setInterval(() => {
      fetch('/api/v1/health')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.success && data.data) {
            setHealth(data.data);
          }
        })
        .catch(() => {});
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div id="system-health-panel" className="flex items-center gap-3 text-xs bg-[#0A0C10] border border-white/10 text-slate-300 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
        </span>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">ACTIVE SYSTEM</span>
      </div>

      <span className="text-white/10">|</span>

      <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
        <Database className="w-3.5 h-3.5 text-indigo-400" />
        <span>{health?.database.engine || 'MongoDB/Engine'}</span>
      </div>

      <span className="hidden sm:inline text-white/10">|</span>

      <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
        <Server className="w-3.5 h-3.5 text-indigo-400" />
        <span>v1.0.4 REST</span>
      </div>

      <button
        id="refresh-health-btn"
        onClick={fetchHealth}
        className="text-slate-400 hover:text-white transition-colors ml-0.5 cursor-pointer"
        title="Refresh health status"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
      </button>
    </div>
  );
}
