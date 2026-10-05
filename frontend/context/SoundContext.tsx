'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.25);
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>('pet');

  // Sync soundManager with initial preferences on mount
  useEffect(() => {
    soundManager.init({ muted, volume });
  }, [muted, volume]);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundThemeState(theme);
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
  }, []);

  const mute = useCallback(() => {
    setMutedState(true);
    soundManager.mute();
  }, []);

  const unmute = useCallback(() => {
    setMutedState(false);
    soundManager.unmute();
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      if (next) {
        soundManager.mute();
      } else {
        soundManager.unmute();
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
