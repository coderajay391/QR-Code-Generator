'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  Layers,
  Lock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  QrCode,
  Tag,
} from 'lucide-react';

interface HistoryManagerProps {
  user: { name: string; email: string } | null;
  token: string | null;
  onOpenAuth: () => void;
}

interface SavedQRItem {
  id: string;
  _id?: string;
  title: string;
  type: string;
  data: any;
  formattedContent: string;
  options: any;
  imageUrl: string;
  format: string;
  createdAt: string;
}

export function HistoryManager({ user, token, onOpenAuth }: HistoryManagerProps) {
  const [items, setItems] = useState<SavedQRItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<SavedQRItem | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
      });
      if (selectedType) params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/v1/qr?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data.items || []);
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.totalPages || 1);
          setTotalCount(data.data.pagination.total || 0);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [token, page, selectedType, searchQuery]);

  useEffect(() => {
    if (!token) return;
    let active = true;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '9',
    });
    if (selectedType) params.append('type', selectedType);
    if (searchQuery) params.append('search', searchQuery);

    fetch(`/api/v1/qr?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && data.data) {
          setItems(data.data.items || []);
          if (data.data.pagination) {
            setTotalPages(data.data.pagination.totalPages || 1);
            setTotalCount(data.data.pagination.total || 0);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, page, selectedType, searchQuery]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this QR code from your history?')) return;

    try {
      const res = await fetch(`/api/v1/qr/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => (i.id || i._id) !== id));
        if (selectedItem && (selectedItem.id || selectedItem._id) === id) {
          setSelectedItem(null);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleDownload = (item: SavedQRItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    const safeTimestamp = new Date().getTime();
    if (item.format === 'svg') {
      const blob = new Blob([item.imageUrl], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
      link.download = `${item.title || 'qrcode'}-${safeTimestamp}.svg`;
    } else {
      link.href = item.imageUrl;
      link.download = `${item.title || 'qrcode'}-${safeTimestamp}.png`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || !token) {
    return (
      <div id="history-unauth-view" className="max-w-md mx-auto my-12 bg-[#0A0C10] border border-white/5 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1.5">Authentication Required</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sign in or register a developer account to persist, search, and manage your generated QR codes across sessions.
          </p>
        </div>
        <button
          id="history-signin-btn"
          onClick={onOpenAuth}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all cursor-pointer"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const typesFilterList = [
    { id: '', label: 'All Types' },
    { id: 'url', label: 'URL' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'vcard', label: 'vCard' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'sms', label: 'SMS' },
    { id: 'text', label: 'Text' },
  ];

  return (
    <div id="history-manager-container" className="max-w-7xl mx-auto space-y-6">
      {/* Search & Filters Bar */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search by title or payload content..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-[#080A0E] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {typesFilterList.map((tf) => (
              <button
                key={tf.id}
                onClick={() => { setSelectedType(tf.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === tf.id
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                    : 'bg-[#080A0E] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end text-xs text-slate-400 font-mono">
          <span>{totalCount} saved items</span>
          <button
            id="refresh-history-btn"
            onClick={fetchHistory}
            className="p-2 bg-[#080A0E] border border-white/10 rounded-lg hover:text-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Items */}
      {loading && items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
          <p className="text-xs font-mono">Loading saved QR codes from MongoDB...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#0A0C10] border border-white/5 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto border border-white/5">
            <QrCode className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-bold text-white text-sm">No QR codes found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate and save a QR code from the Studio tab to see it archived here with full metadata.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const itemId = item.id || item._id || '';
            return (
              <div
                key={itemId}
                onClick={() => setSelectedItem(item)}
                className="bg-[#0A0C10] border border-white/5 hover:border-white/15 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-4 transition-all hover:shadow-2xl cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 font-mono">
                      {item.type}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1.5 truncate group-hover:text-indigo-300 transition-colors">
                      {item.title || 'Untitled QR'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDownload(item, e)}
                      className="p-1.5 rounded-lg bg-[#080A0E] border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/20 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(itemId, e)}
                      className="p-1.5 rounded-lg bg-[#080A0E] border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* QR Image Preview */}
                <div className="w-full aspect-[4/3] rounded-xl bg-white flex items-center justify-center p-3 overflow-hidden shadow-inner">
                  {item.format === 'svg' ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: item.imageUrl }}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="font-mono uppercase text-indigo-400/80 text-[10px]">{item.format}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0C10] border border-white/10 text-slate-300 text-xs rounded-xl disabled:opacity-40 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0C10] border border-white/10 text-slate-300 text-xs rounded-xl disabled:opacity-40 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Item Modal Detail */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0C10] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="font-bold text-white text-base">{selectedItem.title}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3 flex items-center justify-center shadow-lg">
              {selectedItem.format === 'svg' ? (
                <div
                  className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: selectedItem.imageUrl }}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-contain" />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">Formatted Protocol Content</label>
              <pre className="bg-[#080A0E] p-3 rounded-xl border border-white/10 text-xs font-mono text-slate-300 break-all max-h-32 overflow-y-auto leading-relaxed">
                {selectedItem.formattedContent}
              </pre>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={(e) => handleDownload(selectedItem, e)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
