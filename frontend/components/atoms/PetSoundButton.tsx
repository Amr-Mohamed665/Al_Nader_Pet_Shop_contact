'use client';

import { useSound } from '@/hooks/useSound';
import { getSoundForCategory, type SoundName } from '@/lib/sounds';

interface PetSoundButtonProps {
  petType?: SoundName | string;
  label?: string;
  className?: string;
  icon?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  dog: 'fa-dog',
  cat: 'fa-cat',
  bird: 'fa-dove',
  fish: 'fa-fish',
  hamster: 'fa-otter',
  reptile: 'fa-dragon',
  pet: 'fa-paw',
};

export default function PetSoundButton({
  petType = 'pet',
  label,
  className = '',
  icon,
}: PetSoundButtonProps) {
  const { playSound } = useSound();
  const soundName = getSoundForCategory(petType);
  const resolvedIcon = icon || CATEGORY_ICONS[soundName] || 'fa-paw';

  const handleInteract = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    playSound(soundName);
  };

  return (
    <button
      type="button"
      onClick={handleInteract}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs border border-purple-200/60 ${className}`}
      title={`Play ${soundName} sound`}
      aria-label={`Play ${soundName} sound`}
    >
      <i className={`fa-solid ${resolvedIcon} text-purple-500`} />
      {label && <span>{label}</span>}
    </button>
  );
}
