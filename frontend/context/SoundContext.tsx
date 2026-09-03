'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { soundManager, type SoundName } from '@/lib/sounds';

export type SoundTheme = 'standard' | 'pet' | 'dog' | 'cat';

interface SoundContextValue {
  muted: boolean;
  volume: number; // 0 to 1
  soundTheme: SoundTheme;
  playSound: (name: SoundName) => void;
  setVolume: (vol: number) => void;
  setSoundTheme: (theme: SoundTheme) => void;
  toggleMute: () => void;
  mute: () => void;
  unmute: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const COOKIE_MUTED_KEY = 'pet-shop-sound-muted';
const COOKIE_VOLUME_KEY = 'pet-shop-sound-volume';
const COOKIE_THEME_KEY = 'pet-shop-sound-theme';

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const savedMuted = Cookies.get(COOKIE_MUTED_KEY);
      return savedMuted ? savedMuted === 'true' : false;
    } catch {
      return false;
    }
  });

  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.25;
    try {
      const savedVolume = Cookies.get(COOKIE_VOLUME_KEY);
      const vol = savedVolume ? parseFloat(savedVolume) : 0.25;
      return isNaN(vol) ? 0.25 : Math.max(0, Math.min(1, vol));
    } catch {
      return 0.25;
    }
  });

  const [soundTheme, setSoundThemeState] = useState<SoundTheme>(() => {
    if (typeof window === 'undefined') return 'pet';
    try {
      const savedTheme = Cookies.get(COOKIE_THEME_KEY) as SoundTheme | undefined;
      return savedTheme && ['standard', 'pet', 'dog', 'cat'].includes(savedTheme)
        ? savedTheme
        : 'pet';
    } catch {
      return 'pet';
    }
  });

  // Sync soundManager with initial preferences on mount
  useEffect(() => {
    soundManager.init({ muted, volume });
  }, [muted, volume]);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundThemeState(theme);
    Cookies.set(COOKIE_THEME_KEY, theme, { expires: 365 });
  }, []);

  const playSound = useCallback(
    (name: SoundName) => {
      if (!muted) {
        soundManager.playSound(name);
      }
    },
    [muted]
  );

  const setVolume = useCallback((vol: number) => {
    const validVol = Math.max(0, Math.min(1, vol));
    setVolumeState(validVol);
    soundManager.setVolume(validVol);
    Cookies.set(COOKIE_VOLUME_KEY, validVol.toString(), { expires: 365 });
  }, []);

  const mute = useCallback(() => {
    setMutedState(true);
    soundManager.mute();
    Cookies.set(COOKIE_MUTED_KEY, 'true', { expires: 365 });
  }, []);

  const unmute = useCallback(() => {
    setMutedState(false);
    soundManager.unmute();
    Cookies.set(COOKIE_MUTED_KEY, 'false', { expires: 365 });
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      if (next) {
        soundManager.mute();
        Cookies.set(COOKIE_MUTED_KEY, 'true', { expires: 365 });
      } else {
        soundManager.unmute();
        Cookies.set(COOKIE_MUTED_KEY, 'false', { expires: 365 });
      }
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider
      value={{
        muted,
        volume,
        soundTheme,
        playSound,
        setVolume,
        setSoundTheme,
        toggleMute,
        mute,
        unmute,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
}
