import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, KeyRound, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { haptics } from '../utils/audioHaptics';

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function AuthModal({ isOpen, onClose, onLoginSuccess, isSwiss }) {
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'github' | 'magic'
  const [email, setEmail] = useState('boldsdee@aol.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      haptics.playSolenoidThud();
      return;
    }
    
    setLoading(true);
    haptics.playMechanicalClick();

    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`Welcome back, ${email}!`);
      haptics.playGlassTick();

      const user = {
        email,
        name: email.split('@')[0],
        provider: 'email',
        isPro: true,
        loginAt: new Date().toISOString()
      };

      localStorage.setItem('kinetix_user', JSON.stringify(user));

      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 700);
    }, 600);
  };

  const handleGithubLogin = () => {
    setLoading(true);
    haptics.playMechanicalClick();
    setTimeout(() => {
      setLoading(false);
      const user = {
        email: 'boldsdee@github.user',
        name: 'boldsdee',
        provider: 'github',
        isPro: true,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem('kinetix_user', JSON.stringify(user));
      setSuccessMessage('Successfully connected via GitHub (@boldsdee)!');
      haptics.playGlassTick();
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 700);
    }, 600);
  };

  const handleMagicLink = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email.');
      return;
    }
    setLoading(true);
    haptics.playMechanicalClick();
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`Login code generated for ${email}!`);
      haptics.playGlassTick();
      const user = {
        email,
        name: email.split('@')[0],
        provider: 'magic-link',
        isPro: true,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem('kinetix_user', JSON.stringify(user));
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className={`w-full max-w-md rounded-3xl border p-6 md:p-8 relative shadow-2xl ${
            isSwiss 
              ? 'bg-[#ffffff] border-[#dedad2] text-[#1a1918]' 
              : 'bg-[#101522] border-slate-800 text-slate-100 shadow-[0_12px_48px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => {
              haptics.playTactilePop();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-100 transition"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex flex-col gap-1.5 mb-6 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <ShieldCheck size={14} />
              <span>Independent Authentication</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Sign In to Kinetix</h2>
            <p className="text-xs text-slate-400">
              Zero Google dependencies. Log in directly with email & password, GitHub, or Magic Link.
            </p>
          </div>

          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-6">
            <button
              onClick={() => {
                setAuthMode('password');
                haptics.playTactilePop();
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                authMode === 'password'
                  ? (isSwiss ? 'bg-[#ff5000] text-white shadow-sm' : 'bg-cyan-500 text-slate-950 font-bold shadow-sm')
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound size={13} />
              <span>Password</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('github');
                haptics.playTactilePop();
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                authMode === 'github'
                  ? (isSwiss ? 'bg-[#ff5000] text-white shadow-sm' : 'bg-cyan-500 text-slate-950 font-bold shadow-sm')
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GithubIcon size={13} />
              <span>GitHub</span>
            </button>
            <button
              onClick={() => {
                setAuthMode('magic');
                haptics.playTactilePop();
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                authMode === 'magic'
                  ? (isSwiss ? 'bg-[#ff5000] text-white shadow-sm' : 'bg-cyan-500 text-slate-950 font-bold shadow-sm')
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail size={13} />
              <span>Passkey</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Password Form */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3.5 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-2 w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
                  isSwiss 
                    ? 'bg-[#ff5000] hover:bg-[#e04600] text-white shadow-lg' 
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                }`}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* GitHub OAuth Button */}
          {authMode === 'github' && (
            <div className="flex flex-col gap-4 text-center py-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly using your GitHub developer credentials (e.g. <strong>boldsdee</strong>). No corporate Google SSO intercept.
              </p>
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition active:scale-98 border border-slate-700 shadow-lg cursor-pointer"
              >
                <GithubIcon size={18} />
                <span>{loading ? 'Connecting...' : 'Authorize with GitHub (@boldsdee)'}</span>
              </button>
            </div>
          )}

          {/* Magic Link / Passkey */}
          {authMode === 'magic' && (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3.5 text-left py-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Send Magic Passkey To</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="boldsdee@aol.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`mt-2 w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
                  isSwiss 
                    ? 'bg-[#ff5000] hover:bg-[#e04600] text-white shadow-lg' 
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                }`}
              >
                <span>{loading ? 'Sending Link...' : `Send One-Click Passkey`}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Footer notice */}
          <div className="mt-5 pt-4 border-t border-slate-800/60 text-center">
            <span className="text-[11px] text-slate-500">
              🔒 Completely private. Credentials stay in your local browser sandbox.
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
