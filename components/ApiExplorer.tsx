'use client';

import React, { useState } from 'react';
import {
  Code2,
  Send,
  Copy,
  Check,
  Play,
  Lock,
  Globe,
  Server,
  FileJson,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ApiExplorerProps {
  token: string | null;
}

interface EndpointDef {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  category: string;
  summary: string;
  description: string;
  authRequired: boolean;
  defaultBody?: any;
  defaultParams?: Record<string, string>;
}

const endpoints: EndpointDef[] = [
  {
    method: 'GET',
    path: '/api/v1/health',
    category: 'System & Health',
    summary: 'System health & engine status',
    description: 'Returns API health status, database engine, uptime, memory, and runtime metadata.',
    authRequired: false,
  },
  {
    method: 'POST',
    path: '/api/v1/auth/register',
    category: 'Authentication',
    summary: 'Register new user',
    description: 'Registers a new account with hashed password and generates a signed JWT token.',
    authRequired: false,
    defaultBody: {
      name: 'Jane Developer',
      email: 'jane.dev@enterprise.io',
      password: 'StrongPassword123!',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    category: 'Authentication',
    summary: 'Login user & retrieve JWT token',
    description: 'Validates user email & password, returning a JWT token with 7-day validity.',
    authRequired: false,
    defaultBody: {
      email: 'jane.dev@enterprise.io',
      password: 'StrongPassword123!',
    },
  },
  {
    method: 'GET',
    path: '/api/v1/auth/me',
    category: 'Authentication',
    summary: 'Get current user profile',
    description: 'Decodes JWT token and retrieves profile data for the authenticated user.',
    authRequired: true,
  },
  {
    method: 'POST',
    path: '/api/v1/qr/generate',
    category: 'QR Code Engine',
    summary: 'Anonymous QR generation (Rate-limited)',
    description: 'Generates a customized QR code (Wi-Fi, URL, vCard, Email, etc.) without database persistence.',
    authRequired: false,
    defaultBody: {
      type: 'wifi',
      ssid: 'Guest_Office_WiFi',
      password: 'SuperSecret2026',
      encryption: 'WPA',
      options: {
        size: 400,
        margin: 4,
        errorCorrectionLevel: 'H',
        foregroundColor: '#0f172a',
        backgroundColor: '#ffffff',
        format: 'png',
      },
    },
  },
  {
    method: 'POST',
    path: '/api/v1/qr/upload-logo',
    category: 'QR Code Engine',
    summary: 'Upload & validate logo image',
    description: 'Validates MIME types (PNG, JPEG, SVG, WebP) and size limit (<=5MB), returning safe URI.',
    authRequired: false,
    defaultBody: {
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      mimeType: 'image/png',
      filename: 'company-logo.png',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/qr',
    category: 'QR Cloud History',
    summary: 'Create and save QR code',
    description: 'Generates QR code and persists it in MongoDB associated with the user account.',
    authRequired: true,
    defaultBody: {
      title: 'Company Website QR',
      type: 'url',
      data: 'https://example.com',
      options: {
        size: 500,
        format: 'png',
        errorCorrectionLevel: 'M',
        foregroundColor: '#1e293b',
        backgroundColor: '#ffffff',
      },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/qr',
    category: 'QR Cloud History',
    summary: 'List user saved QR codes (Paginated)',
    description: 'Retrieves user saved QR codes with pagination, search, type filtering, and sorting.',
    authRequired: true,
    defaultParams: {
      page: '1',
      limit: '10',
      type: 'url',
    },
  },
];

export function ApiExplorer({ token }: ApiExplorerProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(endpoints[0].defaultBody || {}, null, 2)
  );
  const [queryParams, setQueryParams] = useState<string>('');
  const [urlParamId, setUrlParamId] = useState<string>('65cb123456789abcdef01234');
  const [authTokenOverride, setAuthTokenOverride] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentEndpoint = endpoints[selectedIdx];

  const handleSelectEndpoint = (idx: number) => {
    setSelectedIdx(idx);
    const ep = endpoints[idx];
    setRequestBody(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setQueryParams(ep.defaultParams ? new URLSearchParams(ep.defaultParams).toString() : '');
    setResponseStatus(null);
    setResponseData(null);
  };

  const activeAuthToken = authTokenOverride || token || '';

  const generateCurl = () => {
    let finalPath = currentEndpoint.path;
    if (queryParams) finalPath += `?${queryParams}`;

    let cmd = `curl -X ${currentEndpoint.method} "https://your-domain.com${finalPath}" \\\n`;
    cmd += `  -H "Content-Type: application/json"`;

    if (currentEndpoint.authRequired || activeAuthToken) {
      cmd += ` \\\n  -H "Authorization: Bearer ${activeAuthToken || '<YOUR_JWT_TOKEN>'}"`;
    }

    if (['POST', 'PUT', 'PATCH'].includes(currentEndpoint.method) && requestBody) {
      cmd += ` \\\n  -d '${requestBody.replace(/\n\s*/g, '')}'`;
    }

    return cmd;
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    const start = Date.now();

    try {
      let finalPath = currentEndpoint.path;
      if (queryParams) finalPath += `?${queryParams}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (activeAuthToken) {
        headers['Authorization'] = `Bearer ${activeAuthToken}`;
      }

      const options: RequestInit = {
        method: currentEndpoint.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(currentEndpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(finalPath, options);
      const duration = Date.now() - start;
      setResponseTime(duration);
      setResponseStatus(res.status);

      const hdrs: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        hdrs[key] = val;
      });
      setResponseHeaders(hdrs);

      const json = await res.json();
      setResponseData(json);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="api-explorer-container" className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-lg font-bold text-white">REST API Specification & Live Explorer</h2>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 uppercase tracking-wide font-mono">
              OpenAPI 3.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Execute and integrate versioned endpoints (`/api/v1/*`) with live token injection, automated cURL syntax, and schema verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            id="download-openapi-spec-btn"
            href="/api/docs/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/10 transition-colors"
          >
            <FileJson className="w-4 h-4 text-indigo-400" />
            <span>OpenAPI 3.0 JSON</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Endpoints Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-3.5 shadow-sm">
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
              Endpoints Catalog ({endpoints.length})
            </span>
            <div className="space-y-1.5">
              {endpoints.map((ep, idx) => {
                const isSelected = selectedIdx === idx;
                const methodColor =
                  ep.method === 'GET'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : ep.method === 'POST'
                    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

                return (
                  <button
                    key={idx}
                    id={`endpoint-select-btn-${idx}`}
                    onClick={() => handleSelectEndpoint(idx)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/60 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                        : 'bg-[#080A0E] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase ${methodColor}`}>
                          {ep.method}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-200 truncate">{ep.path}</span>
                      </div>
                      {ep.authRequired && (
                        <span title="JWT Auth Required" className="shrink-0 flex items-center">
                          <Lock className="w-3 h-3 text-indigo-400" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{ep.summary}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Request / Response Console (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Details Card */}
          <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border uppercase ${
                    currentEndpoint.method === 'GET'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <span className="text-sm font-mono font-bold text-white">{currentEndpoint.path}</span>
              </div>
              {currentEndpoint.authRequired && (
                <span className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-indigo-500/20 font-mono">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Bearer JWT Required</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentEndpoint.description}</p>

            {/* Auth Token Override Input */}
            {currentEndpoint.authRequired && (
              <div className="bg-[#080A0E] p-3.5 rounded-xl border border-white/10 space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Authorization Header: <span className="font-mono text-indigo-400">Bearer &lt;token&gt;</span>
                </label>
                <input
                  type="text"
                  placeholder={token ? 'Using active signed-in JWT token' : 'Paste JWT Bearer token here'}
                  value={authTokenOverride}
                  onChange={(e) => setAuthTokenOverride(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {/* Query Params if applicable */}
            {currentEndpoint.defaultParams && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">Query Parameters (URL Search Params)</label>
                <input
                  type="text"
                  value={queryParams}
                  onChange={(e) => setQueryParams(e.target.value)}
                  placeholder="e.g. page=1&limit=10&type=url"
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {/* Request Body Editor */}
            {['POST', 'PUT', 'PATCH'].includes(currentEndpoint.method) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">Request Body (JSON)</label>
                  <span className="text-[10px] text-slate-500 font-mono">application/json</span>
                </div>
                <textarea
                  id="api-request-body-input"
                  rows={8}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full bg-[#080A0E] border border-white/10 rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed transition-colors"
                />
              </div>
            )}

            {/* Action Buttons: Execute & cURL */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="api-send-request-btn"
                onClick={handleExecuteRequest}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.35)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Executing...' : 'Send Request'}</span>
              </button>

              <button
                id="api-copy-curl-btn"
                onClick={handleCopyCurl}
                className="bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'cURL Copied' : 'Copy as cURL'}</span>
              </button>
            </div>
          </div>

          {/* Response Inspector */}
          {responseStatus !== null && (
            <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white">HTTP Response</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'Created' : 'Error'}
                  </span>
                </div>
                {responseTime !== null && (
                  <span className="text-xs text-slate-400 font-mono">Latency: {responseTime}ms</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">Response Payload</label>
                <pre className="bg-[#080A0E] p-4 rounded-xl border border-white/10 text-xs font-mono text-slate-200 overflow-x-auto max-h-96 leading-relaxed">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
