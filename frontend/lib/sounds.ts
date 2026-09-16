"use client";

import { Howl, Howler } from "howler";
import {
  DOG_BARK_WAV,
  CAT_MEOW_WAV,
  BIRD_CHIRP_WAV,
  FISH_BUBBLE_WAV,
  HAMSTER_SQUEAK_WAV,
  REPTILE_HISS_WAV,
  PET_CHIRP_WAV,
} from "./soundFiles";

export type SoundName =
  | "cart-add"
  | "cart-remove"
  | "wishlist-add"
  | "wishlist-remove"
  | "success"
  | "error"
  | "pet"
  | "dog"
  | "cat"
  | "bird"
  | "fish"
  | "hamster"
  | "reptile";

const SOUND_FILES: Record<SoundName, string[]> = {
  "cart-add": ["/sounds/cart-add.mp3"],
  "cart-remove": ["/sounds/cart-remove.mp3"],
  "wishlist-add": ["/sounds/wishlist-add.mp3"],
  "wishlist-remove": ["/sounds/wishlist-remove.mp3"],
  success: ["/sounds/success.mp3"],
  error: ["/sounds/error.mp3"],
  pet: [PET_CHIRP_WAV, "/sounds/pet.mp3"],
  dog: [DOG_BARK_WAV, "/sounds/dog.mp3"],
  cat: [CAT_MEOW_WAV, "/sounds/cat.mp3"],
  bird: [BIRD_CHIRP_WAV, "/sounds/bird.mp3"],
  fish: [FISH_BUBBLE_WAV, "/sounds/fish.mp3"],
  hamster: [HAMSTER_SQUEAK_WAV, "/sounds/hamster.mp3"],
  reptile: [REPTILE_HISS_WAV, "/sounds/reptile.mp3"],
};

class SoundManager {
  private sounds: Partial<Record<SoundName, Howl>> = {};
  private muted: boolean = false;
  private volume: number = 0.25;
  private unlocked: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initUnlockListener();
    }
  }

  /**
   * Listens for first touch/click interaction to unlock audio context on mobile/safari
   */
  private initUnlockListener(): void {
    if (typeof window === "undefined") return;

    const unlock = () => {
      if (this.unlocked) return;
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        void Howler.ctx.resume();
      }
      this.unlocked = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
  }

  /**
   * Initializes sound configuration with muted and volume options
   */
  public init(options?: { muted?: boolean; volume?: number }): void {
    if (typeof window === "undefined") return;

    if (options?.muted !== undefined) {
      this.muted = options.muted;
      Howler.mute(this.muted);
    }
    if (options?.volume !== undefined) {
      this.volume = Math.max(0, Math.min(1, options.volume));
      Howler.volume(this.volume);
    }
  }

  /**
   * Helper to retrieve or create a Howl instance for a sound
   */
  private getHowl(name: SoundName): Howl | null {
    if (typeof window === "undefined") return null;

    if (this.sounds[name]) {
      return this.sounds[name]!;
    }

    const srcPaths = SOUND_FILES[name];
    if (!srcPaths || srcPaths.length === 0 || !srcPaths[0]) return null;

    try {
      const sound = new Howl({
        src: srcPaths,
        volume: this.volume,
        preload: true,
        html5: false, // Use Web Audio API for fast, responsive playback
        onloaderror: (_id: number, error: unknown) => {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[SoundManager] Audio file load notice for "${name}":`,
              error,
            );
          }
        },
        onplayerror: (_id: number, error: unknown) => {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[SoundManager] Playback error for "${name}":`, error);
          }
          if (Howler.ctx && Howler.ctx.state === "suspended") {
            void Howler.ctx.resume();
          }
        },
      });

      this.sounds[name] = sound;
      return sound;
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[SoundManager] Could not instantiate Howl for "${name}":`,
          e,
        );
      }
      return null;
    }
  }

  /**
   * Play a sound effect by name for up to 1 second (1000ms)
   */
  public playSound(name: SoundName, maxDurationMs: number = 1000): void {
    if (typeof window === "undefined" || this.muted) return;

    try {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        void Howler.ctx.resume();
      }

      const howl = this.getHowl(name);
      if (howl) {
        howl.stop();
        howl.volume(this.volume);
        const soundId = howl.play();

        if (soundId !== undefined) {
          const fadeStartMs = Math.max(100, maxDurationMs - 150);
          setTimeout(() => {
            try {
              if (howl.playing(soundId)) {
                howl.fade(this.volume, 0, 150, soundId);
                setTimeout(() => {
                  howl.stop(soundId);
                }, 150);
              }
            } catch {
              howl.stop(soundId);
            }
          }, fadeStartMs);
          return;
        }
      }
      this.playWebAudioSound(name, maxDurationMs);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[SoundManager] Error playing sound "${name}":`, err);
      }
      this.playWebAudioSound(name, maxDurationMs);
    }
  }

  /**
   * Web Audio API synthesis for high-quality, instant animal sound effects
   */
  private playWebAudioSound(
    name: SoundName,
    maxDurationMs: number = 1000,
  ): void {
    if (typeof window === "undefined" || this.muted) return;

    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = Howler.ctx || new AudioCtx();
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      const mainVol = Math.max(0, Math.min(1, this.volume));
      const vol = mainVol * 0.2;

      const createGain = (initialVol: number) => {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(initialVol, now);
        gain.connect(ctx.destination);
        return gain;
      };

      switch (name) {
        case "cat": {
          // Meow: pitch bend up then smooth drop with dual harmonics
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = createGain(vol * 0.8);

          osc1.type = "sine";
          osc2.type = "triangle";

          osc1.connect(gain);
          osc2.connect(gain);

          // Meow pitch curve: 580Hz -> 920Hz -> 640Hz
          osc1.frequency.setValueAtTime(580, now);
          osc1.frequency.exponentialRampToValueAtTime(920, now + 0.25);
          osc1.frequency.exponentialRampToValueAtTime(640, now + 0.55);

          osc2.frequency.setValueAtTime(1160, now);
          osc2.frequency.exponentialRampToValueAtTime(1840, now + 0.25);
          osc2.frequency.exponentialRampToValueAtTime(1280, now + 0.55);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.6);
          osc2.stop(now + 0.6);
          break;
        }

        case "dog": {
          // Double Bark (Woof-Woof!)
          const osc1 = ctx.createOscillator();
          const gain1 = createGain(vol * 0.9);
          osc1.type = "triangle";
          osc1.connect(gain1);

          // First Woof: 320Hz -> 140Hz
          osc1.frequency.setValueAtTime(320, now);
          osc1.frequency.exponentialRampToValueAtTime(140, now + 0.09);
          gain1.gain.setValueAtTime(vol * 0.9, now);
          gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc1.start(now);
          osc1.stop(now + 0.1);

          // Second Woof (at t + 0.13s): 360Hz -> 160Hz
          const osc2 = ctx.createOscillator();
          const gain2 = createGain(0.001);
          osc2.type = "triangle";
          osc2.connect(gain2);

          osc2.frequency.setValueAtTime(360, now + 0.13);
          osc2.frequency.exponentialRampToValueAtTime(160, now + 0.23);
          gain2.gain.setValueAtTime(vol * 0.95, now + 0.13);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          osc2.start(now + 0.13);
          osc2.stop(now + 0.24);
          break;
        }

        case "bird": {
          // Bird Chirp Trill: 2 fast pitch sweeps
          const osc1 = ctx.createOscillator();
          const gain1 = createGain(vol * 0.7);
          osc1.type = "sine";
          osc1.connect(gain1);

          osc1.frequency.setValueAtTime(1900, now);
          osc1.frequency.exponentialRampToValueAtTime(2800, now + 0.06);
          osc1.frequency.exponentialRampToValueAtTime(2100, now + 0.11);
          gain1.gain.setValueAtTime(vol * 0.7, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc1.start(now);
          osc1.stop(now + 0.12);

          // Second chirp sweep
          const osc2 = ctx.createOscillator();
          const gain2 = createGain(0.001);
          osc2.type = "sine";
          osc2.connect(gain2);

          osc2.frequency.setValueAtTime(2100, now + 0.14);
          osc2.frequency.exponentialRampToValueAtTime(3100, now + 0.2);
          osc2.frequency.exponentialRampToValueAtTime(2300, now + 0.26);
          gain2.gain.setValueAtTime(vol * 0.75, now + 0.14);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
          osc2.start(now + 0.14);
          osc2.stop(now + 0.27);
          break;
        }

        case "fish": {
          // Bubble Pops (3 consecutive bubble sweeps)
          const pops = [
            { start: 0, freq: 850, endFreq: 300, duration: 0.07 },
            { start: 0.09, freq: 950, endFreq: 350, duration: 0.07 },
            { start: 0.18, freq: 750, endFreq: 280, duration: 0.07 },
          ];

          pops.forEach((p) => {
            const osc = ctx.createOscillator();
            const g = createGain(0.001);
            osc.type = "sine";
            osc.connect(g);

            osc.frequency.setValueAtTime(p.freq, now + p.start);
            osc.frequency.exponentialRampToValueAtTime(
              p.endFreq,
              now + p.start + p.duration,
            );
            g.gain.setValueAtTime(vol * 0.8, now + p.start);
            g.gain.exponentialRampToValueAtTime(
              0.001,
              now + p.start + p.duration,
            );

            osc.start(now + p.start);
            osc.stop(now + p.start + p.duration);
          });
          break;
        }

        case "hamster": {
          // Cute Squeak
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.6);
          osc.type = "triangle";
          osc.connect(gain);

          osc.frequency.setValueAtTime(2300, now);
          osc.frequency.exponentialRampToValueAtTime(3300, now + 0.07);
          osc.frequency.exponentialRampToValueAtTime(2700, now + 0.13);
          gain.gain.setValueAtTime(vol * 0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }

        case "reptile": {
          // Reptile glide sound
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.5);
          osc.type = "sawtooth";
          osc.connect(gain);

          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.2);
          gain.gain.setValueAtTime(vol * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          osc.start(now);
          osc.stop(now + 0.22);
          break;
        }

        case "pet": {
          // Gentle Pet Chirp
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.7);
          osc.type = "sine";
          osc.connect(gain);

          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(760, now + 0.07);
          osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
          gain.gain.setValueAtTime(vol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

          osc.start(now);
          osc.stop(now + 0.16);
          break;
        }

        case "cart-add": {
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.7);
          osc.type = "sine";
          osc.connect(gain);

          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
          gain.gain.setValueAtTime(vol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }

        case "cart-remove": {
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.7);
          osc.type = "sine";
          osc.connect(gain);

          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
          gain.gain.setValueAtTime(vol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

          osc.start(now);
          osc.stop(now + 0.13);
          break;
        }

        case "wishlist-add": {
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.7);
          osc.type = "triangle";
          osc.connect(gain);

          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
          gain.gain.setValueAtTime(vol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case "wishlist-remove": {
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.7);
          osc.type = "sine";
          osc.connect(gain);

          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(350, now + 0.1);
          gain.gain.setValueAtTime(vol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

          osc.start(now);
          osc.stop(now + 0.13);
          break;
        }

        case "success": {
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.7);
          osc.type = "sine";
          osc.connect(gain);

          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.07);
          osc.frequency.setValueAtTime(783.99, now + 0.14);
          gain.gain.setValueAtTime(vol * 0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.start(now);
          osc.stop(now + 0.3);
          break;
        }

        case "error": {
          const osc = ctx.createOscillator();
          const gain = createGain(vol * 0.5);
          osc.type = "sawtooth";
          osc.connect(gain);

          osc.frequency.setValueAtTime(220, now);
          osc.frequency.setValueAtTime(180, now + 0.08);
          gain.gain.setValueAtTime(vol * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        default:
          break;
      }
    } catch {
      // Ignore synth errors silently
    }
  }

  /**
   * Set global sound volume (0.0 to 1.0)
   */
  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== "undefined") {
      Howler.volume(this.volume);
      Object.values(this.sounds).forEach((howl) => {
        howl?.volume(this.volume);
      });
    }
  }

  /**
   * Get current volume (0.0 to 1.0)
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Mute all sounds
   */
  public mute(): void {
    this.muted = true;
    if (typeof window !== "undefined") {
      Howler.mute(true);
    }
  }

  /**
   * Unmute all sounds
   */
  public unmute(): void {
    this.muted = false;
    if (typeof window !== "undefined") {
      Howler.mute(false);
    }
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): boolean {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.muted;
  }

  /**
   * Check if sound system is currently muted
   */
  public isMuted(): boolean {
    return this.muted;
  }
}

/**
 * Maps category name, slug, or object to appropriate pet SoundName
 */
export function getSoundForCategory(
  category?: string | { name?: string; slug?: string } | null,
): SoundName {
  if (!category) return "pet";

  const str =
    typeof category === "string"
      ? category.toLowerCase()
      : (category.slug || category.name || "").toLowerCase();

  if (str.includes("dog") || str.includes("puppy") || str.includes("canine"))
    return "dog";
  if (str.includes("cat") || str.includes("kitten") || str.includes("feline"))
    return "cat";
  if (
    str.includes("bird") ||
    str.includes("parrot") ||
    str.includes("feather") ||
    str.includes("avian")
  )
    return "bird";
  if (
    str.includes("fish") ||
    str.includes("aquatic") ||
    str.includes("aquarium")
  )
    return "fish";
  if (
    str.includes("hamster") ||
    str.includes("rodent") ||
    str.includes("rabbit") ||
    str.includes("small")
  )
    return "hamster";
  if (
    str.includes("reptile") ||
    str.includes("snake") ||
    str.includes("lizard") ||
    str.includes("turtle")
  )
    return "reptile";

  return "pet";
}

// Export singleton instance
export const soundManager = new SoundManager();
export const playSound = (name: SoundName) => soundManager.playSound(name);
export const setVolume = (vol: number) => soundManager.setVolume(vol);
export const getVolume = () => soundManager.getVolume();
export const mute = () => soundManager.mute();
export const unmute = () => soundManager.unmute();
export const toggleMute = () => soundManager.toggleMute();
