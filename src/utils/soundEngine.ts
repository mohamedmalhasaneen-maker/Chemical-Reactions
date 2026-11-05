import { AudioEffectType } from "../types";

export interface SoundFeedbackConfig {
  enabled: boolean;
  masterVolume: number; // 0.0 to 1.0
  uiVolume: number;     // 0.0 to 1.0
  effectsVolume: number;// 0.0 to 1.0
}

const STORAGE_KEYS = {
  soundEnabled: "chem_lab_sound_enabled_v3",
  masterVol: "chem_lab_sound_master_v3",
  uiVol: "chem_lab_sound_ui_v3",
  effectsVol: "chem_lab_sound_effects_v3",
};

/**
 * High-performance, zero-latency Web Audio Synthesizer.
 * Synthesizes short, pristine physical frequencies without external MP3/WAV network dependencies.
 * Prevents audio overlap storms via throttling and voice limits.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;
  private lastSoundTimes: Partial<Record<AudioEffectType, number>> = {};
  private activeNodes: { stop: () => void }[] = [];

  private config: SoundFeedbackConfig = {
    enabled: true,
    masterVolume: 0.75,
    uiVolume: 0.65,
    effectsVolume: 0.8,
  };

  private listeners: Set<(config: SoundFeedbackConfig) => void> = new Set();

  constructor() {
    this.loadPersistedConfig();
    this.setupUnlockListeners();
  }

  private loadPersistedConfig() {
    try {
      const enabledSaved = localStorage.getItem(STORAGE_KEYS.soundEnabled);
      if (enabledSaved !== null) {
        this.config.enabled = enabledSaved === "true";
      }
      const masterSaved = localStorage.getItem(STORAGE_KEYS.masterVol);
      if (masterSaved !== null) {
        const val = parseFloat(masterSaved);
        if (!isNaN(val)) this.config.masterVolume = Math.max(0, Math.min(1, val));
      }
      const uiSaved = localStorage.getItem(STORAGE_KEYS.uiVol);
      if (uiSaved !== null) {
        const val = parseFloat(uiSaved);
        if (!isNaN(val)) this.config.uiVolume = Math.max(0, Math.min(1, val));
      }
      const effectsSaved = localStorage.getItem(STORAGE_KEYS.effectsVol);
      if (effectsSaved !== null) {
        const val = parseFloat(effectsSaved);
        if (!isNaN(val)) this.config.effectsVolume = Math.max(0, Math.min(1, val));
      }
    } catch {
      // Ignore localStorage availability errors
    }
  }

  private saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEYS.soundEnabled, String(this.config.enabled));
      localStorage.setItem(STORAGE_KEYS.masterVol, String(this.config.masterVolume));
      localStorage.setItem(STORAGE_KEYS.uiVol, String(this.config.uiVolume));
      localStorage.setItem(STORAGE_KEYS.effectsVol, String(this.config.effectsVolume));
    } catch {
      // Ignore
    }
    this.listeners.forEach((fn) => fn({ ...this.config }));
  }

  public subscribe(fn: (cfg: SoundFeedbackConfig) => void): () => void {
    this.listeners.add(fn);
    fn({ ...this.config });
    return () => this.listeners.delete(fn);
  }

  public getConfig(): SoundFeedbackConfig {
    return { ...this.config };
  }

  public setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    if (!enabled) {
      this.stopAllActive();
    }
    this.saveConfig();
  }

  public setMasterVolume(vol: number) {
    this.config.masterVolume = Math.max(0, Math.min(1, vol));
    this.saveConfig();
  }

  public setUiVolume(vol: number) {
    this.config.uiVolume = Math.max(0, Math.min(1, vol));
    this.saveConfig();
  }

  public setEffectsVolume(vol: number) {
    this.config.effectsVolume = Math.max(0, Math.min(1, vol));
    this.saveConfig();
  }

  /**
   * Browser autoplay policy unlocker
   */
  private setupUnlockListeners() {
    const unlock = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else if (this.ctx) {
        this.isUnlocked = true;
      }
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("pointerdown", unlock, { passive: true, once: true });
    window.addEventListener("keydown", unlock, { passive: true, once: true });
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.ctx = new AudioContextClass();
        } catch {
          this.ctx = null;
        }
      }
    }
    return this.ctx;
  }

  public stopAllActive() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Ignore already stopped nodes
      }
    });
    this.activeNodes = [];
  }

  /**
   * Synthesize audio event immediately in non-blocking WebAudio thread.
   */
  public play(effect: AudioEffectType) {
    if (!this.config.enabled || effect === "none" || this.config.masterVolume <= 0.005) {
      return;
    }

    // High frequency throttling for repeated clicks (prevent jarring overlapping)
    const nowMs = performance.now();
    const lastTime = this.lastSoundTimes[effect] || 0;
    const minThrottleMs = effect === "click" ? 35 : effect === "select" ? 40 : 80;
    if (nowMs - lastTime < minThrottleMs) {
      return;
    }
    this.lastSoundTimes[effect] = nowMs;

    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    const isUiEffect = [
      "click",
      "modal_open",
      "modal_close",
      "navigate",
      "select",
      "beep",
    ].includes(effect);

    const specificVol = isUiEffect ? this.config.uiVolume : this.config.effectsVolume;
    const effGain = this.config.masterVolume * specificVol;

    // Prune stale active nodes
    if (this.activeNodes.length > 12) {
      this.activeNodes.splice(0, this.activeNodes.length - 6);
    }

    try {
      switch (effect) {
        case "click": {
          // Subtle, tactile micro-click (55ms soft pop)
          masterGain.gain.setValueAtTime(0.08 * effGain, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);
          osc.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.055);
          this.activeNodes.push({ stop: () => osc.stop() });
          break;
        }

        case "select": {
          // Crisp harmonic blip (glass chime selection)
          masterGain.gain.setValueAtTime(0.1 * effGain, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

          const osc = ctx.createOscillator();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(620, t);
          osc.frequency.exponentialRampToValueAtTime(1040, t + 0.07);
          osc.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.085);
          this.activeNodes.push({ stop: () => osc.stop() });
          break;
        }

        case "modal_open": {
          // Elegant frosted glass upward shimmer (2 notes, soft sine)
          masterGain.gain.setValueAtTime(0.09 * effGain, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

          const osc1 = ctx.createOscillator();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(540, t);
          osc1.frequency.exponentialRampToValueAtTime(840, t + 0.08);

          const osc2 = ctx.createOscillator();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(720, t + 0.04);
          osc2.frequency.exponentialRampToValueAtTime(1120, t + 0.15);

          osc1.connect(masterGain);
          osc2.connect(masterGain);
          osc1.start(t);
          osc1.stop(t + 0.16);
          osc2.start(t + 0.04);
          osc2.stop(t + 0.16);
          this.activeNodes.push({
            stop: () => {
              osc1.stop();
              osc2.stop();
            },
          });
          break;
        }

        case "modal_close": {
          // Soft descent tone (glass closing)
          masterGain.gain.setValueAtTime(0.08 * effGain, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(780, t);
          osc.frequency.exponentialRampToValueAtTime(420, t + 0.11);
          osc.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.12);
          this.activeNodes.push({ stop: () => osc.stop() });
          break;
        }

        case "navigate": {
          // Subtle page transition sweep (gentle ambient puff)
          masterGain.gain.setValueAtTime(0.07 * effGain, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, t);
          osc.frequency.exponentialRampToValueAtTime(660, t + 0.12);
          osc.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.14);
          this.activeNodes.push({ stop: () => osc.stop() });
          break;
        }

        case "simulation_start": {
          // Modern Sci-Fi Laboratory Reactor Ignition (0.85s progressive sweep with harmonic bells)
          const duration = 0.85;
          masterGain.gain.setValueAtTime(0.01 * effGain, t);
          masterGain.gain.linearRampToValueAtTime(0.18 * effGain, t + 0.15);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

          // Primary rising sci-fi frequency sweep
          const osc1 = ctx.createOscillator();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(220, t);
          osc1.frequency.exponentialRampToValueAtTime(880, t + 0.5);
          osc1.frequency.exponentialRampToValueAtTime(1320, t + duration);

          // Secondary harmonic shimmer oscillator
          const osc2 = ctx.createOscillator();
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(440, t + 0.05);
          osc2.frequency.exponentialRampToValueAtTime(1760, t + duration);

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(800, t);
          filter.frequency.exponentialRampToValueAtTime(3200, t + 0.6);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(masterGain);

          osc1.start(t);
          osc2.start(t + 0.05);
          osc1.stop(t + duration);
          osc2.stop(t + duration);

          this.activeNodes.push({
            stop: () => {
              try {
                osc1.stop();
              } catch {}
              try {
                osc2.stop();
              } catch {}
            },
          });
          break;
        }

        case "simulation_complete":
        case "success": {
          // Clean, uplifting scientific chord (C5 - E5 - G5)
          const vol = 0.14 * effGain;
          masterGain.gain.setValueAtTime(vol, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);

          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t + idx * 0.05);
            osc.connect(masterGain);
            osc.start(t + idx * 0.05);
            osc.stop(t + idx * 0.05 + 0.32);
            this.activeNodes.push({ stop: () => osc.stop() });
          });
          break;
        }

        case "error": {
          // Low dissonance double buzz (caution warning)
          masterGain.gain.setValueAtTime(0.12 * effGain, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(196, t);
          osc.frequency.setValueAtTime(185, t + 0.09); // slight dissonance

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(500, t);

          osc.connect(filter);
          filter.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.22);
          this.activeNodes.push({ stop: () => osc.stop() });
          break;
        }

        case "achievement":
        case "completion": {
          // Major fanfare arpeggio (C5 - G5 - C6)
          const vol = 0.16 * effGain;
          masterGain.gain.setValueAtTime(vol, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t + idx * 0.075);
            osc.connect(masterGain);
            osc.start(t + idx * 0.075);
            osc.stop(t + idx * 0.075 + 0.28);
            this.activeNodes.push({ stop: () => osc.stop() });
          });
          break;
        }

        case "beep": {
          masterGain.gain.setValueAtTime(0.09 * effGain, t);
          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(680, t);
          osc.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.09);
          this.activeNodes.push({ stop: () => osc.stop() });
          break;
        }

        case "fizz":
        case "sizzle":
        case "pop":
        case "explosion":
        case "cabinet_shake": {
          // Realistic procedural noise synthesis
          const duration =
            effect === "explosion" || effect === "cabinet_shake"
              ? 0.95
              : effect === "pop"
              ? 0.18
              : 0.65;

          const bufferSize = Math.floor(ctx.sampleRate * duration);
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;

          const filter = ctx.createBiquadFilter();
          if (effect === "fizz") {
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(2200, t);
            masterGain.gain.setValueAtTime(0.18 * effGain, t);
          } else if (effect === "sizzle") {
            filter.type = "highpass";
            filter.frequency.setValueAtTime(3000, t);
            masterGain.gain.setValueAtTime(0.15 * effGain, t);
          } else if (effect === "pop") {
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1200, t);
            masterGain.gain.setValueAtTime(0.24 * effGain, t);
          } else {
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(320, t);
            masterGain.gain.setValueAtTime(0.28 * effGain, t);
          }

          masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
          noise.connect(filter);
          filter.connect(masterGain);
          noise.start(t);
          noise.stop(t + duration);
          this.activeNodes.push({ stop: () => noise.stop() });
          break;
        }

        default:
          break;
      }
    } catch {
      // Audio node scheduling error caught gracefully
    }
  }
}

export const soundEngine = new SoundEngine();

/**
 * Global trigger for interactive click sounds, debounced to avoid CPU contention.
 */
export function playSound(effect: AudioEffectType) {
  soundEngine.play(effect);
}

/**
 * Immediately silences all active continuous sound synthesis nodes (fizz, sizzle, etc.)
 */
export function stopAllSounds() {
  soundEngine.stopAllActive();
}
