import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Volume2, Sparkles, Check, Copy, Play, Disc3, 
  Layers, Sliders, ArrowUpRight, Radio, Bell
} from 'lucide-react';
import { haptics, SOUND_LIBRARY } from '../utils/audioHaptics';

const CATEGORIES = [
  { id: 'all', name: 'All Sounds', count: 52 },
  { id: 'clicks', name: 'Clicks & Switches', count: 12 },
  { id: 'swipes', name: 'Swipes & Gestures', count: 10 },
  { id: 'fluids', name: 'Fluids & Pops', count: 10 },
  { id: 'thuds', name: 'Solenoids & Thuds', count: 10 },
  { id: 'signals', name: 'Signals & Chimes', count: 10 },
];

export default function SoundStudioModal({ isOpen, onClose, activeSound, onSelectSound, isSwiss }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [lastPlayedId, setLastPlayedId] = useState(null);

  if (!isOpen) return null;

  // Filter sounds
  const filteredSounds = useMemo(() => {
    return SOUND_LIBRARY.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handlePlaySound = (sound) => {
    setLastPlayedId(sound.id);
    haptics.play(sound.id);
  };

  const handleAssignActive = (sound) => {
    handlePlaySound(sound);
    onSelectSound(sound.id);
  };

  const handleCopyCode = (sound) => {
    const code = `// Web Audio Haptic Trigger: ${sound.name}
window.kinetixHaptics?.play('${sound.id}');`;
    navigator.clipboard.writeText(code);
    setCopiedId(sound.id);
    haptics.playGlassTick();
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
        
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className={`w-full max-w-5xl max-h-[90vh] rounded-3xl border flex flex-col relative shadow-2xl overflow-hidden ${
            isSwiss 
              ? 'bg-[#ffffff] border-[#dedad2] text-[#1a1918]' 
              : 'bg-[#0f1422] border-slate-800 text-slate-100 shadow-[0_16px_64px_rgba(0,0,0,0.9)]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Disc3 size={20} className="animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold tracking-tight">Audio-Haptic Sound Lab</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    52 Hand-Crafted Models
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  100% Procedural Web Audio API synthesis. Zero external MP3 files • &lt;2ms latency • Instant test bench preview.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                haptics.playTactilePop();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-slate-700/40 text-slate-400 hover:text-slate-100 transition"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="px-6 py-3.5 border-b border-slate-800/60 flex flex-col md:flex-row items-center gap-3 bg-slate-950/40">
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 52 sounds (e.g. mouse, whoosh, coin)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      haptics.playSliderTick();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? (isSwiss ? 'bg-[#ff5000] text-white shadow-sm' : 'bg-cyan-500 text-slate-950 font-bold shadow-sm')
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Grid Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredSounds.map((sound) => {
              const isCurrentActive = activeSound === sound.id;
              const isPlaying = lastPlayedId === sound.id;

              return (
                <div
                  key={sound.id}
                  onClick={() => handlePlaySound(sound)}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer group relative overflow-hidden select-none ${
                    isCurrentActive
                      ? 'bg-cyan-500/10 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : isPlaying
                        ? 'bg-slate-800/80 border-cyan-400/50 scale-[1.02]'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Active Indicator Pin */}
                  {isCurrentActive && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      Active
                    </div>
                  )}

                  <div>
                    {/* Icon & Name */}
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xl group-hover:scale-110 transition-transform">{sound.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {sound.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 capitalize">
                          {sound.category}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-1">
                      {sound.desc}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySound(sound);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition"
                      title="Play Sound Preview"
                    >
                      <Play size={11} />
                      <span>Test</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(sound);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                        title="Copy JavaScript Trigger Code"
                      >
                        {copiedId === sound.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignActive(sound);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                          isCurrentActive
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Assign to Test Bench primitives"
                      >
                        {isCurrentActive ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Footer Info Bar */}
          <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Pro-Tip: Click any card to preview. Click <strong>Apply</strong> to wire it into the Magnetic Button and Switches!</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500 mt-1 sm:mt-0">
              Showing {filteredSounds.length} of 52 Models
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
