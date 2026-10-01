import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Kinetix ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 rounded-3xl bg-[#101522] border border-cyan-500/30 max-w-md shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl font-bold">
              ⚡
            </div>
            <h2 className="text-xl font-bold text-white">Interactive Session Restored</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected render glitch occurred. Click below to reload the studio state without losing your setup.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Restart Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
