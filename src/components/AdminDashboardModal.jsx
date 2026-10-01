import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Shield, Lock, Unlock, Download, Users, Monitor, 
  Terminal, RefreshCw, FileSpreadsheet, Check, ArrowUpRight, 
  Sparkles, Clock, Globe, Laptop, HardDrive
} from 'lucide-react';
import { fetchTelemetryStats, exportEventsToCSV } from '../utils/telemetry';

export default function AdminDashboardModal({ isOpen, onClose, isSwiss }) {
  const [password, setPassword] = useState(() => {
    try {
      return sessionStorage.getItem('kinetix_admin_pass') || '';
    } catch {
      return '';
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedVisitorId, setCopiedVisitorId] = useState(null);

  // Check existing session on open
  useEffect(() => {
    if (isOpen && password) {
      handleAuthenticate(password);
    }
  }, [isOpen]);

  // Keyboard dismiss on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAuthenticate = async (passToTest) => {
    setLoading(true);
    setErrorMsg('');
    const targetPass = passToTest || password;

    try {
      const data = await fetchTelemetryStats(targetPass);
      if (data && data.success) {
        setIsAuthenticated(true);
        setStatsData(data);
        try {
          sessionStorage.setItem('kinetix_admin_pass', targetPass);
        } catch {}
      } else {
        setErrorMsg('Invalid password. Default is "kinetix2026"');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to analytics server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (password) handleAuthenticate(password);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedVisitorId(id);
    setTimeout(() => setCopiedVisitorId(null), 1500);
  };

  const filteredEvents = useMemo(() => {
    if (!statsData?.recentEvents) return [];
    if (!searchQuery) return statsData.recentEvents;
    return statsData.recentEvents.filter(ev => 
      ev.visitorId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.referrer?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [statsData, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md select-none"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border flex flex-col relative shadow-2xl overflow-hidden ${
              isSwiss
                ? 'bg-[#ffffff] border-[#dedad2] text-[#1a1918]'
                : 'bg-[#0e121c] border-slate-800 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.95)]'
            }`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight">Kinetix Telemetry Studio</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      Private Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Confidential download activity and anonymous visitor analytics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition"
                    title="Refresh Stats"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            {!isAuthenticated ? (
              // Password Gate
              <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Lock size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-100">Admin Authentication</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                  Enter your admin passkey to decrypt and view live download counts and visitor telemetry.
                </p>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAuthenticate(password);
                  }}
                  className="w-full flex flex-col gap-3"
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passkey (default: kinetix2026)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    autoFocus
                  />
                  {errorMsg && (
                    <div className="text-[11px] text-rose-400 text-left px-1">
                      {errorMsg}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Unlock size={14} />}
                    <span>Unlock Dashboard</span>
                  </button>
                </form>

                <div className="mt-6 text-[10px] text-slate-500 font-mono">
                  Default: <span className="text-slate-400">kinetix2026</span> • Shortcut: <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">Cmd+Shift+A</kbd>
                </div>
              </div>
            ) : (
              // Authenticated Dashboard
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  
                  {/* Total Downloads */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <span>Total Downloads</span>
                      <Download size={14} className="text-cyan-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-100 mt-1">
                      {statsData?.totalDownloads || 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      All-time download clicks
                    </span>
                  </div>

                  {/* Unique Visitors */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <span>Unique Visitors</span>
                      <Users size={14} className="text-purple-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-100 mt-1">
                      {statsData?.uniqueVisitors || 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Distinct tracked sessions
                    </span>
                  </div>

                  {/* macOS (.dmg) */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <span>macOS (.dmg)</span>
                      <Laptop size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-100 mt-1">
                      {statsData?.platforms?.mac_dmg || 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Apple Silicon installer
                    </span>
                  </div>

                  {/* Windows (.exe) */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <span>Windows (.exe)</span>
                      <HardDrive size={14} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-100 mt-1">
                      {statsData?.platforms?.windows_exe || 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Windows 64-bit installer
                    </span>
                  </div>

                </div>

                {/* Event Activity Stream */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 flex flex-col overflow-hidden">
                  
                  {/* Toolbar */}
                  <div className="px-4 py-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Clock size={14} className="text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200">Recent Download Stream</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {filteredEvents.length} events
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by visitor or platform..."
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-48"
                      />
                      <button
                        onClick={() => exportEventsToCSV(statsData?.recentEvents || [])}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                        title="Export CSV Spreadsheet"
                      >
                        <FileSpreadsheet size={13} className="text-emerald-400" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Table / List */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                    {filteredEvents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        No downloads recorded yet. As visitors click "Download macOS" or "Windows", their anonymous telemetry will appear here in real-time.
                      </div>
                    ) : (
                      filteredEvents.map((ev) => {
                        const isMac = ev.platform === 'mac_dmg';
                        const isWin = ev.platform === 'windows_exe';
                        const dateFormatted = new Date(ev.timestamp).toLocaleString();

                        return (
                          <div 
                            key={ev.id}
                            className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 transition group"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                                isMac 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : isWin
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              }`}>
                                {isMac ? 'macOS DMG' : isWin ? 'Windows EXE' : ev.platform}
                              </span>

                              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                                <span>{ev.visitorId}</span>
                                <button
                                  onClick={() => handleCopyId(ev.visitorId)}
                                  className="text-slate-500 hover:text-slate-300 p-0.5 transition"
                                  title="Copy Visitor ID"
                                >
                                  {copiedVisitorId === ev.visitorId ? (
                                    <Check size={11} className="text-emerald-400" />
                                  ) : (
                                    <span className="text-[10px]">[copy]</span>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-slate-500 text-[11px] font-mono">
                              <span className="hidden md:inline">{ev.screen || 'Desktop'}</span>
                              <span>{dateFormatted}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* Pro-Tip Footer */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400 shrink-0" />
                    <span>
                      Private storage active: Events are recorded serverlessly and synced to your admin view.
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    Source: {statsData?.source || (statsData?.isLocalFallback ? 'Local Mirror' : 'Serverless')}
                  </span>
                </div>

              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
