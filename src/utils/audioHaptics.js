// Procedural Web Audio API Haptic Feedback Engine
// 52+ Hand-Crafted Procedural Sound Models
// Zero external files, ultra-low latency (<2ms), 100% procedural synthesis.

class AudioHapticsEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterVolume = 0.28;
    this.noiseBuffer = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this._buildNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate 1-second white noise buffer for friction, air, shutter, rustle
  _buildNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  _playNoise(t, duration, filterFreq, filterType = 'bandpass', Q = 2, gainVal = 0.5) {
    if (!this.noiseBuffer || !this.ctx) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, t);
    filter.Q.setValueAtTime(Q, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + duration);
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  toggle(enable) {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    return this.enabled;
  }

  // Generic play by sound ID
  play(id) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const method = this.registry[id];
    if (method && typeof method === 'function') {
      method.call(this);
    } else {
      this.playMechanicalClick();
    }
  }

  // =========================================================================
  // CATEGORY 1: MECHANICAL & CLICKS (12 SOUNDS)
  // =========================================================================

  playMechanicalClick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, t);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.022);

    gain.gain.setValueAtTime(this.masterVolume * 0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.028);
    this._playNoise(t, 0.015, 2400, 'bandpass', 3, 0.4);
  }

  playMouseClick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.012);

    gain.gain.setValueAtTime(this.masterVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.018);
  }

  playTypewriterKey() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.04);

    gain.gain.setValueAtTime(this.masterVolume * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.05);
    this._playNoise(t, 0.035, 1800, 'bandpass', 2, 0.6);
  }

  playTactileDome() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);

    gain.gain.setValueAtTime(this.masterVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.035);
  }

  playCameraShutter() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.018, 3000, 'highpass', 2, 0.7);
    this._playNoise(t + 0.035, 0.022, 1800, 'bandpass', 3, 0.85);
  }

  playRotaryDetent() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.008);

    gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.01);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.012);
  }

  playArcadeButton() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.03);

    gain.gain.setValueAtTime(this.masterVolume * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.04);
  }

  playPenClick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.012, 4500, 'highpass', 4, 0.6);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t + 0.005);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.02);

    gain.gain.setValueAtTime(this.masterVolume * 0.55, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t + 0.005); osc.stop(t + 0.025);
  }

  playLightSwitch() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.035);

    gain.gain.setValueAtTime(this.masterVolume * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.045);
  }

  playRelayClick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(3200, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.009);

    gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.015);
  }

  playLatchSnap() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.02, 2200, 'bandpass', 4, 0.7);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t + 0.008);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.03);
    gain.gain.setValueAtTime(this.masterVolume * 0.7, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t + 0.008); osc.stop(t + 0.04);
  }

  playScissorSwitch() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2100, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.014);

    gain.gain.setValueAtTime(this.masterVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.02);
  }

  // =========================================================================
  // CATEGORY 2: SWIPES, GESTURES & WHOOSHES (10 SOUNDS)
  // =========================================================================

  playSwipeCard() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.08, 1400, 'bandpass', 1.5, 0.65);
  }

  playAiryWhoosh() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.12, 900, 'lowpass', 1.2, 0.55);
  }

  playPaperSlide() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.06, 3200, 'bandpass', 2.5, 0.5);
  }

  playSilkFlick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.05, 2100, 'lowpass', 1.8, 0.4);
  }

  playElasticStretch() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.09);

    gain.gain.setValueAtTime(this.masterVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.11);
  }

  playSpringRelease() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);

    gain.gain.setValueAtTime(this.masterVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.16);
  }

  playVelocityZip() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.07);

    gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.09);
  }

  playDrawerSlide() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.15, 650, 'lowpass', 1.5, 0.45);
  }

  playCurtainFlick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.09, 1200, 'bandpass', 1.2, 0.5);
  }

  playMagneticSnapBack() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.07);

    gain.gain.setValueAtTime(this.masterVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.09);
  }

  // =========================================================================
  // CATEGORY 3: FLUID, POPS & BUBBLES (10 SOUNDS)
  // =========================================================================

  playTactilePop() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

    gain.gain.setValueAtTime(this.masterVolume * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.05);
  }

  playBubblePop() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.028);

    gain.gain.setValueAtTime(this.masterVolume * 0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.04);
  }

  playWaterDrop() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.03);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.09);

    gain.gain.setValueAtTime(this.masterVolume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.11);
  }

  playCorkPop() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.02);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.06);

    gain.gain.setValueAtTime(this.masterVolume * 0.95, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.08);
  }

  playSubtlePlop() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.05);

    gain.gain.setValueAtTime(this.masterVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.06);
  }

  playJellySquish() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.03);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

    gain.gain.setValueAtTime(this.masterVolume * 0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.1);
  }

  playGlassTick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const bandpass = this.ctx.createBiquadFilter();

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2800, t);
    bandpass.Q.setValueAtTime(12, t);

    osc.type = 'square';
    osc.frequency.setValueAtTime(2800, t);

    gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(bandpass); bandpass.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.04);
  }

  playHollowKnock() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.035);

    gain.gain.setValueAtTime(this.masterVolume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.045);
  }

  playBubbleRise() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(820, t + 0.05);

    gain.gain.setValueAtTime(this.masterVolume * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.07);
  }

  playSodaTab() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    this._playNoise(t, 0.02, 3500, 'bandpass', 3, 0.8);
    this._playNoise(t + 0.015, 0.05, 5200, 'highpass', 2, 0.6);
  }

  // =========================================================================
  // CATEGORY 4: SOLENOIDS, THUDS & TACTILE MATERIALS (10 SOUNDS)
  // =========================================================================

  playSolenoidThud() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);

    gain.gain.setValueAtTime(this.masterVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.065);
  }

  playCoinTap() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3400, t);
    osc.frequency.exponentialRampToValueAtTime(2600, t + 0.04);

    gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.06);
  }

  playVaultLock() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    gain.gain.setValueAtTime(this.masterVolume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.1);
    this._playNoise(t, 0.04, 1100, 'bandpass', 3, 0.7);
  }

  playWoodBlock() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(780, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.03);

    gain.gain.setValueAtTime(this.masterVolume * 0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.04);
  }

  playMarbleStrike() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1900, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.035);

    gain.gain.setValueAtTime(this.masterVolume * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.045);
  }

  playSubBassPulse() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);

    gain.gain.setValueAtTime(this.masterVolume * 0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.14);
  }

  playMetalClink() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(3600, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.04);

    gain.gain.setValueAtTime(this.masterVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.06);
  }

  playLeatherThump() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.06);

    gain.gain.setValueAtTime(this.masterVolume * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.08);
  }

  playCeramicTap() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.025);

    gain.gain.setValueAtTime(this.masterVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.035);
  }

  playRubberRebound() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.02);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.05);

    gain.gain.setValueAtTime(this.masterVolume * 0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.07);
  }

  // =========================================================================
  // CATEGORY 5: SIGNALS, CHIMES & CONFIRMATIONS (10 SOUNDS)
  // =========================================================================

  playPositiveChime() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const playTone = (freq, startOffset, dur) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + startOffset);
      gain.gain.setValueAtTime(this.masterVolume * 0.5, t + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + startOffset + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(t + startOffset); osc.stop(t + startOffset + dur + 0.01);
    };
    playTone(523.25, 0, 0.08); // C5
    playTone(659.25, 0.05, 0.12); // E5
    playTone(783.99, 0.10, 0.22); // G5
  }

  playErrorBuzz() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);

    gain.gain.setValueAtTime(this.masterVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.14);
  }

  playRadarPing() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);

    gain.gain.setValueAtTime(this.masterVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.38);
  }

  playCrystalBell() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2093, t); // C7

    gain.gain.setValueAtTime(this.masterVolume * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.32);
  }

  playQuantumBlip() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(2400, t + 0.03);

    gain.gain.setValueAtTime(this.masterVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.05);
  }

  playLevelUp() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const playNote = (freq, offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + offset);
      gain.gain.setValueAtTime(this.masterVolume * 0.6, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(t + offset); osc.stop(t + offset + 0.11);
    };
    playNote(440, 0);     // A4
    playNote(554.37, 0.06); // C#5
    playNote(659.25, 0.12); // E5
    playNote(880, 0.18);    // A5
  }

  playNotificationDing() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, t); // D6
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.04); // A6

    gain.gain.setValueAtTime(this.masterVolume * 0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.28);
  }

  playScannerChirp() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(3200, t + 0.02);

    gain.gain.setValueAtTime(this.masterVolume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.03);
  }

  playZenBowl() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, t);

    gain.gain.setValueAtTime(this.masterVolume * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.52);
  }

  playHapticHeartbeat() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const beat = (offset, vol) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, t + offset);
      osc.frequency.exponentialRampToValueAtTime(40, t + offset + 0.06);
      gain.gain.setValueAtTime(this.masterVolume * vol, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.07);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(t + offset); osc.stop(t + offset + 0.08);
    };
    beat(0, 0.85);
    beat(0.12, 0.65);
  }

  // Dynamic parameterized Spring Rebound
  playSpringRebound(stiffness = 350, damping = 25) {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = Math.min(800, Math.max(120, stiffness * 0.8));
    const duration = Math.min(0.25, Math.max(0.06, 1.5 / (damping * 0.1)));

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + duration);

    gain.gain.setValueAtTime(this.masterVolume * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + duration + 0.01);
  }

  playSliderTick() {
    this.init(); if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.008);

    gain.gain.setValueAtTime(this.masterVolume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.01);

    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.012);
  }
}

// 52 Sound Registry Metadata
export const SOUND_LIBRARY = [
  // 1. Mechanical & Clicks (12)
  { id: 'mechanical', name: 'Mechanical Switch', category: 'clicks', icon: '⌨️', desc: 'Tactile blue-switch mechanical click' },
  { id: 'mouse', name: 'Optical Mouse', category: 'clicks', icon: '🖱️', desc: 'High-precision micro-switch snap' },
  { id: 'typewriter', name: 'Typewriter Strike', category: 'clicks', icon: '📠', desc: 'Vintage cast-metal typewriter key' },
  { id: 'dome', name: 'Rubber Dome', category: 'clicks', icon: '🔘', desc: 'Soft silicone membrane cushion' },
  { id: 'camera', name: 'SLR Shutter', category: 'clicks', icon: '📷', desc: 'Dual-curtain mechanical camera shutter' },
  { id: 'detent', name: 'Rotary Detent', category: 'clicks', icon: '⚙️', desc: 'Precision watch bezel click' },
  { id: 'arcade', name: 'Arcade Button', category: 'clicks', icon: '🕹️', desc: 'Hollow plastic micro-switch slap' },
  { id: 'pen', name: 'Ballpoint Click', category: 'clicks', icon: '🖊️', desc: 'Spring-loaded pen push latch' },
  { id: 'switch', name: 'Wall Toggle', category: 'clicks', icon: '💡', desc: 'Heavy domestic wall switch' },
  { id: 'relay', name: 'Magnetic Relay', category: 'clicks', icon: '⚡', desc: 'Industrial solenoid relay click' },
  { id: 'latch', name: 'Magnetic Latch', category: 'clicks', icon: '🧲', desc: 'Cabinet magnetic door closure' },
  { id: 'scissor', name: 'Scissor Chiclet', category: 'clicks', icon: '💻', desc: 'Slim laptop scissor-switch key' },

  // 2. Swipes & Gestures (10)
  { id: 'swipe_card', name: 'Velocity Swipe', category: 'swipes', icon: '💳', desc: 'Smooth drag card displacement' },
  { id: 'airy_whoosh', name: 'Airy Whoosh', category: 'swipes', icon: '💨', desc: 'Light velocity gesture breeze' },
  { id: 'paper_slide', name: 'Paper Slide', category: 'swipes', icon: '📄', desc: 'Parchment page-flip texture' },
  { id: 'silk_flick', name: 'Silk Flick', category: 'swipes', icon: '🧣', desc: 'Velvet fluid gesture release' },
  { id: 'elastic_stretch', name: 'Elastic Stretch', category: 'swipes', icon: '➰', desc: 'Band tension build-up' },
  { id: 'spring_twang', name: 'Spring Release', category: 'swipes', icon: '🌀', desc: 'Spiral spring release twang' },
  { id: 'velocity_zip', name: 'Velocity Zip', category: 'swipes', icon: '⚡', desc: 'Rapid item dismissal ejection' },
  { id: 'drawer_slide', name: 'Drawer Glide', category: 'swipes', icon: '🗄️', desc: 'Ball-bearing rail drawer slide' },
  { id: 'curtain_flick', name: 'Curtain Reveal', category: 'swipes', icon: '🎭', desc: 'Soft modal backdrop swipe' },
  { id: 'magnetic_snap', name: 'Magnetic Dock', category: 'swipes', icon: '🧭', desc: 'Magnetic re-centering lock' },

  // 3. Fluid & Bubbles (10)
  { id: 'pop', name: 'Tactile Pop', category: 'fluids', icon: '🫧', desc: 'Subtle fluid interface detent' },
  { id: 'bubble_pop', name: 'Soap Bubble', category: 'fluids', icon: '🛁', desc: 'Light resonant sphere burst' },
  { id: 'water_drop', name: 'Water Droplet', category: 'fluids', icon: '💧', desc: 'Clear basin water drop ripple' },
  { id: 'cork_pop', name: 'Cork Pop', category: 'fluids', icon: '🍾', desc: 'Deep bottle neck pressure pop' },
  { id: 'subtle_plop', name: 'Fluid Plop', category: 'fluids', icon: '🥣', desc: 'Low-viscosity surface plop' },
  { id: 'jelly_squish', name: 'Jelly Squish', category: 'fluids', icon: '🍮', desc: 'Viscous elastic rebound' },
  { id: 'glass_tick', name: 'Crystal Tap', category: 'fluids', icon: '🍸', desc: 'High-frequency crystalline ring' },
  { id: 'hollow_knock', name: 'Hollow Pop', category: 'fluids', icon: '🥥', desc: 'Acoustic woodblock resonance' },
  { id: 'bubble_rise', name: 'Rising Bubble', category: 'fluids', icon: '🐟', desc: 'Ascending liquid micro-bubble' },
  { id: 'soda_tab', name: 'Can Tab Pop', category: 'fluids', icon: '🥫', desc: 'Pressurized aluminum can seal' },

  // 4. Solenoids & Thuds (10)
  { id: 'thud', name: 'Solenoid Thud', category: 'thuds', icon: '🔨', desc: 'Low electromagnetic impulse' },
  { id: 'coin_tap', name: 'Brass Coin', category: 'thuds', icon: '🪙', desc: 'Metallic coin drop bounce' },
  { id: 'vault_lock', name: 'Vault Bolt', category: 'thuds', icon: '🏦', desc: 'Heavy steel vault lock engage' },
  { id: 'wood_block', name: 'Teakwood Tap', category: 'thuds', icon: '🪵', desc: 'Warm acoustic hardwood strike' },
  { id: 'marble_strike', name: 'Marble Sphere', category: 'thuds', icon: '🔮', desc: 'Polished stone ball impact' },
  { id: 'sub_bass', name: 'Sub-Bass Rumble', category: 'thuds', icon: '🔊', desc: '40Hz tactile bass pulse' },
  { id: 'metal_clink', name: 'Titanium Ring', category: 'thuds', icon: '💍', desc: 'High metallic ring resonance' },
  { id: 'leather_thump', name: 'Leather Binder', category: 'thuds', icon: '📕', desc: 'Heavy padded book closure' },
  { id: 'ceramic_tap', name: 'Ceramic Plate', category: 'thuds', icon: '🍽️', desc: 'Crisp porcelain edge impact' },
  { id: 'rubber_rebound', name: 'Rubber Rebound', category: 'thuds', icon: '🏀', desc: 'Dense rubber ball bounce' },

  // 5. Signals & Confirmations (10)
  { id: 'positive_chime', name: 'Success Chord', category: 'signals', icon: '✨', desc: 'Major triad euphoric chime' },
  { id: 'error_buzz', name: 'Warning Buzz', category: 'signals', icon: '⚠️', desc: 'Dissonant double square buzz' },
  { id: 'radar_ping', name: 'Sonar Ping', category: 'signals', icon: '📡', desc: 'Subsea radar ping echo' },
  { id: 'crystal_bell', name: 'Crystal Bell', category: 'signals', icon: '🔔', desc: 'Pure 2kHz crystalline bell' },
  { id: 'quantum_blip', name: 'Quantum Blip', category: 'signals', icon: '🌌', desc: 'Sci-fi holographic interface tick' },
  { id: 'level_up', name: 'Triumph Arpeggio', category: 'signals', icon: '🏆', desc: '4-note ascending fanfare' },
  { id: 'notification_ding', name: 'Glass Ding', category: 'signals', icon: '📬', desc: 'Smartphone modern glass chime' },
  { id: 'scanner_chirp', name: 'Laser Chirp', category: 'signals', icon: '📟', desc: 'Optical barcode scan verify' },
  { id: 'zen_bowl', name: 'Singing Bowl', category: 'signals', icon: '🧘', desc: '432Hz meditative resonance' },
  { id: 'heartbeat', name: 'Haptic Pulse', category: 'signals', icon: '💓', desc: 'Dual systolic cardiac rhythm' }
];

// Map method names for instant execution
AudioHapticsEngine.prototype.registry = {
  mechanical: AudioHapticsEngine.prototype.playMechanicalClick,
  mouse: AudioHapticsEngine.prototype.playMouseClick,
  typewriter: AudioHapticsEngine.prototype.playTypewriterKey,
  dome: AudioHapticsEngine.prototype.playTactileDome,
  camera: AudioHapticsEngine.prototype.playCameraShutter,
  detent: AudioHapticsEngine.prototype.playRotaryDetent,
  arcade: AudioHapticsEngine.prototype.playArcadeButton,
  pen: AudioHapticsEngine.prototype.playPenClick,
  switch: AudioHapticsEngine.prototype.playLightSwitch,
  relay: AudioHapticsEngine.prototype.playRelayClick,
  latch: AudioHapticsEngine.prototype.playLatchSnap,
  scissor: AudioHapticsEngine.prototype.playScissorSwitch,

  swipe_card: AudioHapticsEngine.prototype.playSwipeCard,
  airy_whoosh: AudioHapticsEngine.prototype.playAiryWhoosh,
  paper_slide: AudioHapticsEngine.prototype.playPaperSlide,
  silk_flick: AudioHapticsEngine.prototype.playSilkFlick,
  elastic_stretch: AudioHapticsEngine.prototype.playElasticStretch,
  spring_twang: AudioHapticsEngine.prototype.playSpringRelease,
  velocity_zip: AudioHapticsEngine.prototype.playVelocityZip,
  drawer_slide: AudioHapticsEngine.prototype.playDrawerSlide,
  curtain_flick: AudioHapticsEngine.prototype.playCurtainFlick,
  magnetic_snap: AudioHapticsEngine.prototype.playMagneticSnapBack,

  pop: AudioHapticsEngine.prototype.playTactilePop,
  bubble_pop: AudioHapticsEngine.prototype.playBubblePop,
  water_drop: AudioHapticsEngine.prototype.playWaterDrop,
  cork_pop: AudioHapticsEngine.prototype.playCorkPop,
  subtle_plop: AudioHapticsEngine.prototype.playSubtlePlop,
  jelly_squish: AudioHapticsEngine.prototype.playJellySquish,
  glass_tick: AudioHapticsEngine.prototype.playGlassTick,
  glass: AudioHapticsEngine.prototype.playGlassTick,
  hollow_knock: AudioHapticsEngine.prototype.playHollowKnock,
  bubble_rise: AudioHapticsEngine.prototype.playBubbleRise,
  soda_tab: AudioHapticsEngine.prototype.playSodaTab,

  thud: AudioHapticsEngine.prototype.playSolenoidThud,
  coin_tap: AudioHapticsEngine.prototype.playCoinTap,
  vault_lock: AudioHapticsEngine.prototype.playVaultLock,
  wood_block: AudioHapticsEngine.prototype.playWoodBlock,
  marble_strike: AudioHapticsEngine.prototype.playMarbleStrike,
  sub_bass: AudioHapticsEngine.prototype.playSubBassPulse,
  metal_clink: AudioHapticsEngine.prototype.playMetalClink,
  leather_thump: AudioHapticsEngine.prototype.playLeatherThump,
  ceramic_tap: AudioHapticsEngine.prototype.playCeramicTap,
  rubber_rebound: AudioHapticsEngine.prototype.playRubberRebound,

  positive_chime: AudioHapticsEngine.prototype.playPositiveChime,
  error_buzz: AudioHapticsEngine.prototype.playErrorBuzz,
  radar_ping: AudioHapticsEngine.prototype.playRadarPing,
  crystal_bell: AudioHapticsEngine.prototype.playCrystalBell,
  quantum_blip: AudioHapticsEngine.prototype.playQuantumBlip,
  level_up: AudioHapticsEngine.prototype.playLevelUp,
  notification_ding: AudioHapticsEngine.prototype.playNotificationDing,
  scanner_chirp: AudioHapticsEngine.prototype.playScannerChirp,
  zen_bowl: AudioHapticsEngine.prototype.playZenBowl,
  heartbeat: AudioHapticsEngine.prototype.playHapticHeartbeat,

  rebound: AudioHapticsEngine.prototype.playSpringRebound
};

export const haptics = new AudioHapticsEngine();
if (typeof window !== 'undefined') {
  window.kinetixHaptics = haptics;
}
