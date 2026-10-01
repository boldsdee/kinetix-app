import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Sparkles, Volume2, VolumeX, Copy, Check, Info, 
  RotateCcw, Sliders, Activity, Layers, Play, Zap, ToggleRight, 
  Square, ShieldAlert, Monitor, Terminal, Code2, ArrowRight,
  Maximize2, Minus, X, Sun, Moon, Cpu, User, LogOut, ShieldCheck,
  Plus, MousePointerClick
} from 'lucide-react';
import { haptics } from './utils/audioHaptics';
import AuthModal from './components/AuthModal';

// Preset configurations
const PRESETS = {
  snappy: {
    name: 'Snappy Switch',
    stiffness: 480,
    damping: 32,
    mass: 0.9,
    velocity: 2,
    sound: 'mechanical',
    description: 'Ultra-crisp confirmation for high-frequency toggles & buttons.'
  },
  fluidPill: {
    name: 'Fluid Pill',
    stiffness: 380,
    damping: 26,
    mass: 1.0,
    velocity: 0,
    sound: 'pop',
    description: 'Smooth organic gliding motion for segmented tabs & pills.'
  },
  butteryModal: {
    name: 'Buttery Sheet',
    stiffness: 260,
    damping: 22,
    mass: 1.2,
    velocity: 1,
    sound: 'thud',
    description: 'Natural inertial weight for modals, drawers, and popovers.'
  },
  jellyBounce: {
    name: 'Jelly Rebound',
    stiffness: 210,
    damping: 13,
    mass: 1.4,
    velocity: 4,
    sound: 'rebound',
    description: 'Playful kinetic bounce for celebrations, badges, and FABs.'
  },
  glassPrecision: {
    name: 'Glass Precision',
    stiffness: 620,
    damping: 42,
    mass: 0.6,
    velocity: 0,
    sound: 'glass',
    description: 'High-tension crystalline feedback for fine dials & controls.'
  }
};

export default function App() {
  const isWeb = typeof window !== 'undefined' && !window.electronAPI;

  // Theme state: 'obsidian' (dark) vs 'swiss' (industrial craft light)
  const [theme, setTheme] = useState('obsidian');
  const isSwiss = theme === 'swiss';

  // Sound & Volume state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState('mechanical'); // mechanical, pop, glass, thud, rebound
  const [volume, setVolume] = useState(0.3);

  // Spring Physics parameters
  const [stiffness, setStiffness] = useState(480);
  const [damping, setDamping] = useState(32);
  const [mass, setMass] = useState(0.9);
  const [activePreset, setActivePreset] = useState('snappy');

  // Test bench interactive state
  const [toggleState, setToggleState] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sliderVal, setSliderVal] = useState(65);
  const [abTestMode, setAbTestMode] = useState('craft'); // 'craft' vs 'sterile'
  const [copiedToken, setCopiedToken] = useState(false);

  // Authentication State (Independent of Google SSO)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kinetix_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('kinetix_user');
    setCurrentUser(null);
    haptics.playTactilePop();
  };

  // Magnetic button state
  const [magnetPos, setMagnetPos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  // Trigger sound based on current selection
  const triggerAudio = (overrideType) => {
    if (abTestMode === 'sterile' || !soundEnabled) return;
    const type = overrideType || soundType;
    if (type === 'mechanical') haptics.playMechanicalClick();
    else if (type === 'pop') haptics.playTactilePop();
    else if (type === 'glass') haptics.playGlassTick();
    else if (type === 'thud') haptics.playSolenoidThud();
    else if (type === 'rebound') haptics.playSpringRebound(stiffness, damping);
  };

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setActivePreset(key);
    setStiffness(p.stiffness);
    setDamping(p.damping);
    setMass(p.mass);
    setSoundType(p.sound);
    triggerAudio(p.sound);
  };

  // Math simulation for spring oscilloscope curve
  const { curvePoints, dampingRatio, angularFreq, settlingTime } = useMemo(() => {
    const k = stiffness;
    const c = damping;
    const m = Math.max(0.1, mass);
    
    // Natural angular frequency
    const w0 = Math.sqrt(k / m);
    // Damping ratio zeta
    const zeta = c / (2 * Math.sqrt(k * m));
    // Settling time (~2% envelope)
    const ts = zeta > 0 ? (4 / (zeta * w0)).toFixed(2) : '∞';

    // Generate 60 plot points across t: 0 -> 0.8s
    const points = [];
    const width = 440;
    const height = 120;
    const midY = height / 2;
    const amp = height * 0.38;

    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * 0.8;
      let y = 0;
      if (zeta < 1) {
        // Underdamped oscillation
        const wd = w0 * Math.sqrt(1 - zeta * zeta);
        y = Math.exp(-zeta * w0 * t) * Math.cos(wd * t);
      } else {
        // Critically damped / overdamped
        y = Math.exp(-w0 * t) * (1 + w0 * t);
      }
      const plotX = (i / 60) * width;
      const plotY = midY - y * amp;
      points.push(`${plotX.toFixed(1)},${plotY.toFixed(1)}`);
    }

    return {
      curvePoints: points.join(' '),
      dampingRatio: zeta.toFixed(2),
      angularFreq: w0.toFixed(1),
      settlingTime: ts
    };
  }, [stiffness, damping, mass]);

  // Interactive Wave Control Pins / Dots
  const [controlPins, setControlPins] = useState([
    { id: 'start', tNorm: 0.03, label: 'Tension (k)', role: 'stiffness' },
    { id: 'crest', tNorm: 0.22, label: 'Overshoot (c)', role: 'damping' },
    { id: 'node', tNorm: 0.50, label: 'Frequency (m)', role: 'mass' }
  ]);
  const [activeDraggingPin, setActiveDraggingPin] = useState(null);
  const [hoveredPin, setHoveredPin] = useState(null);
  const svgRef = useRef(null);

  // Convert client pointer event to SVG viewBox (440x120) coordinates
  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const x = ((clientX - rect.left) / rect.width) * 440;
    const y = ((clientY - rect.top) / rect.height) * 120;
    return {
      x: Math.max(0, Math.min(440, x)),
      y: Math.max(0, Math.min(120, y))
    };
  };

  // Compute exact coordinates of all pins on the wave line
  const pinPositions = useMemo(() => {
    const k = stiffness;
    const c = damping;
    const m = Math.max(0.1, mass);
    const w0 = Math.sqrt(k / m);
    const zeta = c / (2 * Math.sqrt(k * m));
    const width = 440;
    const height = 120;
    const midY = height / 2;
    const amp = height * 0.38;

    return controlPins.map((pin) => {
      const t = pin.tNorm * 0.8;
      let yNorm = 0;
      if (zeta < 1) {
        const wd = w0 * Math.sqrt(1 - zeta * zeta);
        yNorm = Math.exp(-zeta * w0 * t) * Math.cos(wd * t);
      } else {
        yNorm = Math.exp(-w0 * t) * (1 + w0 * t);
      }
      const cx = pin.tNorm * width;
      const cy = midY - yNorm * amp;
      return {
        ...pin,
        cx,
        cy,
        yNorm
      };
    });
  }, [controlPins, stiffness, damping, mass]);

  // Pointer drag listener for dragging pins up and down
  useEffect(() => {
    if (!activeDraggingPin) return;

    const handlePointerMove = (e) => {
      const { x, y } = getSvgCoordinates(e);
      const pin = controlPins.find(p => p.id === activeDraggingPin);
      if (!pin) return;

      // Invert Y coordinate relative to center line midY=60
      // y=14 is max top amplitude (+1.0), y=60 is 0, y=106 is max bottom (-1.0)
      const displacement = (60 - y) / 45.6;

      if (pin.role === 'damping') {
        // Dragging the rebound crest up/down alters damping
        // Higher crest (displacement > 0.3) -> lower damping (bouncy)
        // Flatter crest (displacement near 0) -> higher damping (no bounce)
        const targetDamping = Math.round(Math.max(6, Math.min(60, 46 - displacement * 36)));
        setDamping(prev => {
          if (Math.abs(prev - targetDamping) >= 1) {
            haptics.playSliderTick();
            return targetDamping;
          }
          return prev;
        });
        setActivePreset('');
      } else if (pin.role === 'stiffness') {
        // Dragging initial tension up/down alters stiffness
        const targetStiffness = Math.round(Math.max(120, Math.min(880, 160 + (1 - y / 120) * 720)));
        setStiffness(prev => {
          if (Math.abs(prev - targetStiffness) >= 10) {
            haptics.playSliderTick();
            return targetStiffness;
          }
          return prev;
        });
        setActivePreset('');
      } else if (pin.role === 'mass') {
        // Dragging horizontally adjusts mass/period
        const targetMass = Number(Math.max(0.3, Math.min(2.8, (x / 440) * 3.2)).toFixed(1));
        setMass(prev => {
          if (prev !== targetMass) {
            haptics.playSliderTick();
            return targetMass;
          }
          return prev;
        });
        setActivePreset('');
      } else {
        // Custom user-added dot: dragging vertically bends damping/overshoot
        const targetDamping = Math.round(Math.max(8, Math.min(58, 44 - Math.abs(displacement) * 32)));
        setDamping(targetDamping);
        haptics.playSliderTick();
        setActivePreset('');
      }
    };

    const handlePointerUp = () => {
      setActiveDraggingPin(null);
      haptics.playMechanicalClick();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDraggingPin, controlPins]);

  // Click on SVG to drop a new control point
  const handleSvgCanvasClick = (e) => {
    if (activeDraggingPin) return;
    const { x } = getSvgCoordinates(e);
    const tNorm = Math.max(0.06, Math.min(0.94, x / 440));
    
    // Check if clicking close to an existing pin
    const isNear = pinPositions.some(p => Math.abs(p.cx - x) < 22);
    if (isNear) return;

    const newPin = {
      id: `pin_${Date.now()}`,
      tNorm,
      label: `Point ${controlPins.length + 1}`,
      role: 'custom'
    };
    setControlPins(prev => [...prev, newPin]);
    haptics.playGlassTick();
  };

  const handleAddPoint = (e) => {
    e.stopPropagation();
    const randT = Number((0.15 + Math.random() * 0.65).toFixed(2));
    const newPin = {
      id: `pin_${Date.now()}`,
      tNorm: randT,
      label: `Point ${controlPins.length + 1}`,
      role: 'custom'
    };
    setControlPins(prev => [...prev, newPin]);
    haptics.playGlassTick();
  };

  const handleResetPoints = (e) => {
    e.stopPropagation();
    setControlPins([
      { id: 'start', tNorm: 0.03, label: 'Tension (k)', role: 'stiffness' },
      { id: 'crest', tNorm: 0.22, label: 'Overshoot (c)', role: 'damping' },
      { id: 'node', tNorm: 0.50, label: 'Frequency (m)', role: 'mass' }
    ]);
    haptics.playTactilePop();
  };

  // Framer Motion spring config depending on A/B mode
  const springTransition = useMemo(() => {
    if (abTestMode === 'sterile') {
      return { duration: 0 }; // Flat dead UI (0ms transition)
    }
    return {
      type: 'spring',
      stiffness,
      damping,
      mass
    };
  }, [abTestMode, stiffness, damping, mass]);

  // Magnetic button mouse move handler
  const handleMouseMove = (e) => {
    if (abTestMode === 'sterile') return;
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    setMagnetPos({ x: distX * 0.22, y: distY * 0.22 });
  };

  const handleMouseLeave = () => {
    setMagnetPos({ x: 0, y: 0 });
  };

  // Copy generated token snippet
  const copyTokenSnippet = () => {
    const code = `// Kinetix Kinetic Token Spec
export const kineticTransition = {
  type: "spring",
  stiffness: ${stiffness},
  damping: ${damping},
  mass: ${mass}
};

// Web Audio Haptic Hook
export const triggerHaptic = () => {
  // Sound preset: ${soundType}
  window.kinetixHaptics?.play('${soundType}');
};`;
    navigator.clipboard.writeText(code);
    setCopiedToken(true);
    triggerAudio('glass');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Electron IPC handlers
  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.maximize();
  const handleClose = () => window.electronAPI?.close();

  // Dynamic Theme Colors
  const themeStyles = isSwiss
    ? {
        bg: 'bg-[#f4f2ee]',
        surface: 'bg-[#ffffff]',
        surfaceSubtle: 'bg-[#eae7e1]',
        border: 'border-[#dedad2]',
        borderHighlight: 'border-[#ff5000]',
        textMain: 'text-[#1a1918]',
        textMuted: 'text-[#6b6762]',
        accent: 'bg-[#ff5000]',
        accentText: 'text-[#ff5000]',
        accentHover: 'hover:bg-[#e04600]',
        panelGlow: 'shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
      }
    : {
        bg: 'bg-[#0a0d14]',
        surface: 'bg-[#101522]',
        surfaceSubtle: 'bg-[#161c2e]',
        border: 'border-slate-800/80',
        borderHighlight: 'border-cyan-500/50',
        textMain: 'text-slate-100',
        textMuted: 'text-slate-400',
        accent: 'bg-cyan-500',
        accentText: 'text-cyan-400',
        accentHover: 'hover:bg-cyan-400',
        panelGlow: 'shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
      };

  return (
    <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.textMain} transition-colors duration-300 flex flex-col items-center justify-center p-4 md:p-8 select-none`}>
      
      {/* Top Split Layout Container */}
      <div className={`w-full max-w-7xl flex ${isWeb ? 'flex-col xl:flex-row gap-12 xl:gap-16' : 'flex-col'} items-center xl:items-start justify-center`}>
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Landing Page Story & Download Panel (Shown on Web) */}
        {/* ========================================================================= */}
        {isWeb && (
          <div className="w-full xl:max-w-md flex flex-col gap-6 pt-4 text-center xl:text-left">
            
            {/* Live Interactive Badge */}
            <div className="inline-flex items-center self-center xl:self-start gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Live Interactive Demo
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-3">
                Kinetix<span className={themeStyles.accentText}>.</span>
              </h1>
              <p className={`text-lg sm:text-xl font-medium ${themeStyles.textMuted} leading-relaxed`}>
                The Tactile Micro-Interaction & Audio-Haptic Studio. Dial in organic spring physics, sculpt zero-latency sound, and ship interfaces people can feel.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5 py-2">
              <div className={`p-3 rounded-xl ${themeStyles.surface} border ${themeStyles.border} text-center`}>
                <div className="text-xl font-mono font-bold text-cyan-400">&lt;2ms</div>
                <div className={`text-[11px] font-semibold uppercase ${themeStyles.textMuted}`}>Acoustic Latency</div>
              </div>
              <div className={`p-3 rounded-xl ${themeStyles.surface} border ${themeStyles.border} text-center`}>
                <div className="text-xl font-mono font-bold text-amber-400">0 KB</div>
                <div className={`text-[11px] font-semibold uppercase ${themeStyles.textMuted}`}>Audio Files</div>
              </div>
              <div className={`p-3 rounded-xl ${themeStyles.surface} border ${themeStyles.border} text-center`}>
                <div className="text-xl font-mono font-bold text-emerald-400">1-Click</div>
                <div className={`text-[11px] font-semibold uppercase ${themeStyles.textMuted}`}>Code Export</div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center xl:justify-start">
              <a 
                href="https://github.com/boldsdee/kinetix-app/releases/latest/download/Kinetix-1.0.0-arm64.dmg" 
                className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[14px] shadow-lg shadow-cyan-500/20 transition active:scale-95" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download size={18} />
                <span>Download macOS (.dmg)</span>
              </a>
              <a 
                href="https://github.com/boldsdee/kinetix-app/releases/latest/download/Kinetix-Setup-1.0.0.exe" 
                className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl border ${themeStyles.border} hover:border-slate-500 ${themeStyles.surface} font-semibold text-[14px] transition active:scale-95`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download size={18} />
                <span>Windows (.exe)</span>
              </a>
            </div>

            {/* Explicit Light-Blue Installation Guide Box (Mandatory Requirement) */}
            <div className="mt-2 p-5 rounded-2xl border border-sky-400/30 bg-sky-500/10 text-sky-200 text-left shadow-lg">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-sky-300">
                <Info size={18} className="text-sky-400 shrink-0" />
                Installation Guide & Gatekeeper Bypass
              </h3>
              <p className="text-xs font-normal leading-relaxed text-sky-200/90 mb-3">
                Since Kinetix is an independent open-source creative build, macOS and Windows may show an unrecognized developer flag:
              </p>
              <ul className="text-xs space-y-2 pl-4 list-disc text-sky-100/90">
                <li>
                  <strong>macOS:</strong> If it says "damaged" or developer cannot be verified, click <strong>Cancel</strong>. Open <strong>System Settings &gt; Privacy &amp; Security</strong>, scroll down and click <strong>Open Anyway</strong>.
                </li>
                <li>
                  <strong>Windows:</strong> If SmartScreen appears, click <strong>More Info</strong> &gt; <strong>Run Anyway</strong>.
                </li>
              </ul>
            </div>

            {/* A/B Psychological Test Explainer */}
            <div className={`p-4 rounded-xl border ${themeStyles.border} ${themeStyles.surface} text-left flex items-start gap-3`}>
              <Zap size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">The "Craft Gap" Test</span>
                <p className={`text-xs ${themeStyles.textMuted} mt-1 leading-relaxed`}>
                  Toggle the <strong>"A/B Compare"</strong> switch in the studio header to test the exact difference between flat, dead default web interactions and organic spring-haptic physics.
                </p>
              </div>
            </div>

            {/* Account / Pro Authentication Status Box */}
            <div className={`p-4 rounded-xl border ${themeStyles.border} ${themeStyles.surface} text-left flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {currentUser ? `Pro Account: ${currentUser.email}` : 'Independent Auth'}
                  </div>
                  <p className={`text-[11px] ${themeStyles.textMuted}`}>
                    {currentUser ? 'Zero Google dependencies active' : 'Log in with Email/Password or GitHub'}
                  </p>
                </div>
              </div>
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`px-3 py-1.5 rounded-lg ${themeStyles.accent} text-slate-950 text-xs font-bold transition hover:opacity-90 cursor-pointer`}
                >
                  Sign In
                </button>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: The Interactive Kinetix Studio Workbench */}
        {/* ========================================================================= */}
        <div className={`w-full ${isWeb ? 'xl:flex-1' : 'max-w-5xl'} ${themeStyles.surface} rounded-3xl border ${themeStyles.border} ${themeStyles.panelGlow} overflow-hidden flex flex-col`}>
          
          {/* Studio Window Header Bar */}
          <div className={`flex items-center justify-between px-5 py-3.5 border-b ${themeStyles.border} ${themeStyles.surfaceSubtle}`}>
            
            {/* Title & Status */}
            <div className="flex items-center gap-3">
              {!isWeb && (
                <div className="flex items-center gap-2 mr-2">
                  <button onClick={handleClose} className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition"></button>
                  <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition"></button>
                  <button onClick={handleMaximize} className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition"></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Activity size={18} className={themeStyles.accentText} />
                <span className="font-bold text-sm tracking-wide">Kinetix Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">v1.0.0</span>
              </div>
            </div>

            {/* Quick Controls: A/B Mode, Theme, Sound */}
            <div className="flex items-center gap-3">
              
              {/* Sterile vs Craft A/B Toggle */}
              <button
                onClick={() => {
                  const next = abTestMode === 'craft' ? 'sterile' : 'craft';
                  setAbTestMode(next);
                  if (next === 'craft') triggerAudio('mechanical');
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                  abTestMode === 'craft' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
                title="Toggle between sterile 0ms web default and kinetic crafted spring mode"
              >
                <span className={`w-2 h-2 rounded-full ${abTestMode === 'craft' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                Mode: {abTestMode === 'craft' ? 'Kinetic Craft' : 'Flat Sterile'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  setTheme(isSwiss ? 'obsidian' : 'swiss');
                  triggerAudio('pop');
                }}
                className={`p-1.5 rounded-lg border ${themeStyles.border} hover:bg-slate-500/10 transition text-xs flex items-center gap-1.5`}
                title="Toggle between Obsidian Dark Studio and Neo-Swiss Industrial Craft"
              >
                {isSwiss ? <Moon size={14} /> : <Sun size={14} className="text-amber-400" />}
              </button>

              {/* Mute Audio */}
              <button
                onClick={() => {
                  const state = !soundEnabled;
                  setSoundEnabled(state);
                  haptics.toggle(state);
                  if (state) triggerAudio('glass');
                }}
                className={`p-1.5 rounded-lg border ${themeStyles.border} hover:bg-slate-500/10 transition ${soundEnabled ? 'text-cyan-400' : 'text-slate-500'}`}
                title="Toggle Synthesized Audio-Haptics"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Account / Auth Button */}
              {currentUser ? (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${themeStyles.surfaceSubtle} border ${themeStyles.border} text-xs`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono text-[11px] font-semibold text-slate-200">{currentUser.email}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">PRO</span>
                  <button 
                    onClick={handleLogout} 
                    className="hover:text-rose-400 ml-1 transition p-0.5 cursor-pointer text-slate-400" 
                    title="Sign Out"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    triggerAudio('pop');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border ${themeStyles.border} hover:border-cyan-400 ${themeStyles.surfaceSubtle} text-slate-200 cursor-pointer`}
                >
                  <User size={13} className={themeStyles.accentText} />
                  <span>Sign In</span>
                </button>
              )}

            </div>
          </div>

          {/* Workbench Body */}
          <div className="p-5 md:p-7 flex flex-col gap-6">

            {/* Presets Bar */}
            <div className="flex flex-col gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>Kinetic Presets</span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PRESETS).map((key) => {
                  const p = PRESETS[key];
                  const isActive = activePreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                        isActive
                          ? `${themeStyles.accent} text-slate-950 font-bold border-transparent shadow-sm`
                          : `${themeStyles.surfaceSubtle} ${themeStyles.border} hover:border-slate-500 ${themeStyles.textMain}`
                      }`}
                    >
                      <Sparkles size={12} className={isActive ? 'text-slate-950' : themeStyles.accentText} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Physics & Oscilloscope Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Physics Parameter Sculptor Sliders (5 cols) */}
              <div className={`lg:col-span-5 p-4 rounded-2xl ${themeStyles.surfaceSubtle} border ${themeStyles.border} flex flex-col gap-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={14} className={themeStyles.accentText} />
                    Spring Parameters
                  </span>
                  <button 
                    onClick={() => applyPreset('snappy')}
                    className={`text-[11px] ${themeStyles.textMuted} hover:${themeStyles.textMain} flex items-center gap-1 transition`}
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                </div>

                {/* Stiffness */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className={themeStyles.textMuted}>Stiffness (k)</span>
                    <span className="font-bold text-cyan-400">{stiffness} N/m</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="900"
                    step="10"
                    value={stiffness}
                    onChange={(e) => {
                      setStiffness(Number(e.target.value));
                      setActivePreset('');
                      haptics.playSliderTick();
                    }}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700/60 rounded-lg appearance-none"
                  />
                </div>

                {/* Damping */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className={themeStyles.textMuted}>Damping (c)</span>
                    <span className="font-bold text-amber-400">{damping} Ns/m</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={damping}
                    onChange={(e) => {
                      setDamping(Number(e.target.value));
                      setActivePreset('');
                      haptics.playSliderTick();
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-700/60 rounded-lg appearance-none"
                  />
                </div>

                {/* Mass */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className={themeStyles.textMuted}>Mass (m)</span>
                    <span className="font-bold text-emerald-400">{mass} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={mass}
                    onChange={(e) => {
                      setMass(Number(e.target.value));
                      setActivePreset('');
                      haptics.playSliderTick();
                    }}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-700/60 rounded-lg appearance-none"
                  />
                </div>

                {/* Sound Preset Selector */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-700/30">
                  <span className={`text-[11px] font-mono ${themeStyles.textMuted}`}>Acoustic Haptic Profile</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['mechanical', 'pop', 'glass', 'thud', 'rebound'].map((snd) => (
                      <button
                        key={snd}
                        onClick={() => {
                          setSoundType(snd);
                          triggerAudio(snd);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-mono capitalize border transition ${
                          soundType === snd
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                            : 'bg-transparent border-slate-700/50 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {snd}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right: Live Spring Physics Oscilloscope (7 cols) */}
              <div className={`lg:col-span-7 p-4 rounded-2xl ${themeStyles.surfaceSubtle} border ${themeStyles.border} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Spring Physics Oscilloscope
                      </span>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          type="button"
                          onClick={handleAddPoint}
                          className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30 flex items-center gap-1 transition cursor-pointer"
                          title="Click to add another control point on the wave"
                        >
                          <Plus size={10} /> Add Dot
                        </button>
                        <button
                          type="button"
                          onClick={handleResetPoints}
                          className="px-2 py-0.5 rounded-md hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 text-[10px] font-mono border border-slate-700/50 flex items-center gap-1 transition cursor-pointer"
                          title="Reset to default control handles"
                        >
                          <RotateCcw size={10} /> Reset
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>&zeta; = {dampingRatio}</span>
                      <span>&omega;₀ = {angularFreq} rad/s</span>
                      <span>Settling: {settlingTime}s</span>
                    </div>
                  </div>

                  {/* SVG Oscilloscope Canvas with Draggable Control Dots */}
                  <div 
                    onClick={handleSvgCanvasClick}
                    className="w-full h-36 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-2 cursor-crosshair group select-none"
                    title="Click anywhere along the line to add a control dot. Drag dots up & down to sculpt the wave."
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 pointer-events-none opacity-20">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-cyan-500/40"></div>
                      ))}
                    </div>

                    <svg ref={svgRef} viewBox="0 0 440 120" className="w-full h-full relative z-10 overflow-visible">
                      {/* Zero center axis */}
                      <line x1="0" y1="60" x2="440" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                      
                      {/* Dynamic Spring Wave */}
                      <polyline
                        fill="none"
                        stroke={isSwiss ? '#ff5000' : '#06b6d4'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={curvePoints}
                      />

                      {/* Drop guideline from each pin to center equilibrium axis */}
                      {pinPositions.map((pin) => (
                        <line
                          key={`line_${pin.id}`}
                          x1={pin.cx}
                          y1={pin.cy}
                          x2={pin.cx}
                          y2={60}
                          stroke={pin.role === 'stiffness' ? '#06b6d4' : pin.role === 'damping' ? '#f59e0b' : pin.role === 'mass' ? '#10b981' : '#a855f7'}
                          strokeDasharray="2 2"
                          strokeWidth="1"
                          strokeOpacity={hoveredPin === pin.id || activeDraggingPin === pin.id ? 0.9 : 0.35}
                          pointerEvents="none"
                        />
                      ))}

                      {/* Draggable Control Dots / Handles */}
                      {pinPositions.map((pin) => {
                        const isDragging = activeDraggingPin === pin.id;
                        const isHovered = hoveredPin === pin.id;
                        const dotColor = pin.role === 'stiffness' 
                          ? (isSwiss ? '#ff5000' : '#06b6d4') 
                          : pin.role === 'damping' 
                            ? '#f59e0b' 
                            : pin.role === 'mass' 
                              ? '#10b981' 
                              : '#a855f7';

                        return (
                          <g
                            key={pin.id}
                            className="cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setActiveDraggingPin(pin.id);
                              haptics.playMechanicalClick();
                            }}
                            onPointerEnter={() => setHoveredPin(pin.id)}
                            onPointerLeave={() => setHoveredPin(null)}
                          >
                            {/* Outer soft aura ring */}
                            <circle
                              cx={pin.cx}
                              cy={pin.cy}
                              r={isDragging ? 16 : isHovered ? 13 : 9}
                              fill={dotColor}
                              fillOpacity={isDragging ? 0.35 : isHovered ? 0.25 : 0.12}
                              stroke={dotColor}
                              strokeWidth={isDragging ? 2 : 1}
                              strokeOpacity={isDragging ? 0.9 : 0.5}
                              className="transition-all duration-150"
                            />

                            {/* Solid draggable center dot */}
                            <circle
                              cx={pin.cx}
                              cy={pin.cy}
                              r={isDragging ? 6.5 : isHovered ? 5.5 : 4.5}
                              fill={dotColor}
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all duration-150 shadow-lg"
                            />

                            {/* Dynamic tooltip badge on hover/drag */}
                            {(isHovered || isDragging) && (
                              <g pointerEvents="none" transform={`translate(${Math.max(45, Math.min(395, pin.cx))}, ${Math.max(18, pin.cy - 16)})`}>
                                <rect
                                  x="-42"
                                  y="-14"
                                  width="84"
                                  height="18"
                                  rx="5"
                                  fill="#090d16"
                                  stroke={dotColor}
                                  strokeWidth="1"
                                  opacity="0.95"
                                />
                                <text
                                  x="0"
                                  y="-2"
                                  fill="#ffffff"
                                  fontSize="9"
                                  fontWeight="600"
                                  fontFamily="monospace"
                                  textAnchor="middle"
                                >
                                  {pin.role === 'stiffness' 
                                    ? `k: ${stiffness} N/m` 
                                    : pin.role === 'damping' 
                                      ? `c: ${damping} Ns/m` 
                                      : pin.role === 'mass' 
                                        ? `m: ${mass} kg` 
                                        : `Y: ${(60 - pin.cy).toFixed(0)}px`}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                      Drag dots up/down to sculpt • F = -kx - cv
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className={`text-[11px] ${themeStyles.textMuted}`}>
                    {Number(dampingRatio) < 1 
                      ? '⚡ Underdamped: Dynamic oscillation & bounce' 
                      : Number(dampingRatio) === 1 
                        ? '🎯 Critically Damped: Zero overshoot, snappy settle' 
                        : '🐌 Overdamped: Sluggish non-oscillating return'}
                  </span>
                  <button
                    onClick={() => triggerAudio()}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs border border-cyan-500/40 transition flex items-center gap-1.5"
                  >
                    <Play size={11} /> Test Acoustics
                  </button>
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* Interactive Component Test Bench Primitives */}
            {/* ========================================================================= */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>
                  Interactive Component Test Bench (Live Primitives)
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Current Mode: {abTestMode === 'craft' ? 'Physics Enabled' : 'Sterile (Flat 0ms)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Magnetic Kinetic Button */}
                <div 
                  className={`p-5 rounded-2xl ${themeStyles.surfaceSubtle} border ${themeStyles.border} flex flex-col items-center justify-center gap-3 relative overflow-hidden min-h-[170px]`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className={`text-[11px] font-mono ${themeStyles.textMuted} absolute top-3 left-3`}>01 / Magnetic Button</span>
                  
                  <motion.button
                    ref={buttonRef}
                    animate={{ x: magnetPos.x, y: magnetPos.y }}
                    transition={springTransition}
                    whileHover={{ scale: abTestMode === 'sterile' ? 1 : 1.06 }}
                    whileTap={{ scale: abTestMode === 'sterile' ? 1 : 0.92 }}
                    onClick={() => triggerAudio('mechanical')}
                    className={`px-6 py-3 rounded-2xl ${isSwiss ? 'bg-[#ff5000] text-white' : 'bg-cyan-500 text-slate-950'} font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-shadow`}
                  >
                    <Zap size={16} />
                    <span>Snap Me</span>
                  </motion.button>
                  <span className={`text-[10px] ${themeStyles.textMuted}`}>Cursor attraction + spring snap</span>
                </div>

                {/* 2. Fluid Segmented Pill */}
                <div className={`p-5 rounded-2xl ${themeStyles.surfaceSubtle} border ${themeStyles.border} flex flex-col items-center justify-center gap-3 relative min-h-[170px]`}>
                  <span className={`text-[11px] font-mono ${themeStyles.textMuted} absolute top-3 left-3`}>02 / Elastic Pill Tabs</span>
                  
                  <div className={`p-1.5 rounded-2xl ${themeStyles.surface} border ${themeStyles.border} flex gap-1 relative`}>
                    {['Motion', 'Acoustic', 'Tokens'].map((tab, idx) => {
                      const isSelected = activeTab === idx;
                      return (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(idx);
                            triggerAudio('pop');
                          }}
                          className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition z-10 ${
                            isSelected ? (isSwiss ? 'text-white' : 'text-slate-950') : themeStyles.textMuted
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="activeTabPill"
                              className={`absolute inset-0 rounded-xl ${isSwiss ? 'bg-[#ff5000]' : 'bg-cyan-400'} -z-10`}
                              transition={springTransition}
                            />
                          )}
                          {tab}
                        </button>
                      );
                    })}
                  </div>
                  <span className={`text-[10px] ${themeStyles.textMuted}`}>Fluid morphing layout spring</span>
                </div>

                {/* 3. Tactile Dual-State Switch */}
                <div className={`p-5 rounded-2xl ${themeStyles.surfaceSubtle} border ${themeStyles.border} flex flex-col items-center justify-center gap-3 relative min-h-[170px]`}>
                  <span className={`text-[11px] font-mono ${themeStyles.textMuted} absolute top-3 left-3`}>03 / Haptic Switch</span>
                  
                  <div 
                    onClick={() => {
                      setToggleState(!toggleState);
                      triggerAudio('mechanical');
                    }}
                    className={`w-16 h-9 rounded-full p-1 cursor-pointer transition-colors duration-200 border ${
                      toggleState 
                        ? (isSwiss ? 'bg-[#ff5000] border-[#ff5000]' : 'bg-cyan-500 border-cyan-400')
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <motion.div
                      animate={{ x: toggleState ? 28 : 0 }}
                      transition={springTransition}
                      className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center"
                    >
                      <div className={`w-2 h-2 rounded-full ${toggleState ? (isSwiss ? 'bg-[#ff5000]' : 'bg-cyan-500') : 'bg-slate-400'}`}></div>
                    </motion.div>
                  </div>
                  <span className={`text-[10px] ${themeStyles.textMuted}`}>State: {toggleState ? 'ACTIVE' : 'IDLE'}</span>
                </div>

              </div>
            </div>

            {/* ========================================================================= */}
            {/* Code Token Export Drawer */}
            {/* ========================================================================= */}
            <div className={`p-4 rounded-2xl ${themeStyles.surfaceSubtle} border ${themeStyles.border} flex flex-col gap-2.5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className={themeStyles.accentText} />
                  <span className="text-xs font-bold uppercase tracking-wider">Production Token Output</span>
                </div>
                <button
                  onClick={copyTokenSnippet}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    copiedToken 
                      ? 'bg-emerald-500 text-slate-950 font-bold' 
                      : `${themeStyles.accent} text-slate-950 font-bold hover:opacity-90`
                  }`}
                >
                  {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedToken ? 'Token Copied!' : 'Copy Framer Token'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] leading-relaxed text-slate-300 border border-slate-800/80 overflow-x-auto">
                <span className="text-slate-500">// Framer Motion Spring Config</span><br/>
                <span className="text-purple-400">transition</span>=&#123;&#123; <span className="text-cyan-400">type</span>: <span className="text-amber-300">"spring"</span>, <span className="text-cyan-400">stiffness</span>: <span className="text-emerald-400">{stiffness}</span>, <span className="text-cyan-400">damping</span>: <span className="text-emerald-400">{damping}</span>, <span className="text-cyan-400">mass</span>: <span className="text-emerald-400">{mass}</span> &#125;&#125;
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Independent Authentication Modal (No Google SSO dependencies) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(userData) => setCurrentUser(userData)}
        isSwiss={isSwiss}
      />

    </div>
  );
}
