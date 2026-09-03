'use client';

import { useSoundContext, type SoundTheme } from '@/context/SoundContext';
import { getSoundForCategory, type SoundName } from '@/lib/sounds';

export function useSound() {
  const { muted, volume, soundTheme, playSound, setVolume, setSoundTheme, toggleMute, mute, unmute } =
    useSoundContext();

  return {
    muted,
    volume,
    soundTheme,
    playSound,
    setVolume,
    setSoundTheme,
    toggleMute,
    mute,
    unmute,
    playCartAdd: () => playSound('cart-add'),
    playCartRemove: () => playSound('cart-remove'),
    playWishlistAdd: () => playSound('wishlist-add'),
    playWishlistRemove: () => playSound('wishlist-remove'),
    playSuccess: () => playSound('success'),
    playError: () => playSound('error'),
    playPet: (petTypeOrCategory: SoundName | string = 'pet') => {
      const sound = getSoundForCategory(petTypeOrCategory);
      playSound(sound);
    },
    playCategorySound: (category?: string | { name?: string; slug?: string } | null) => {
      const sound = getSoundForCategory(category);
      playSound(sound);
    },
  };
}

export type { SoundName, SoundTheme };
