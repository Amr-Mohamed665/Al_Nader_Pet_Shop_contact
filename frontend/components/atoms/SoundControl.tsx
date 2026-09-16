'use client';

import { useState, useRef, useEffect } from 'react';
import { useSound, type SoundTheme } from '@/hooks/useSound';

interface SoundControlProps {
  className?: string;
  compact?: boolean;
}

const THEME_OPTIONS: { id: SoundTheme; label: string }[] = [
  { id: 'pet', label: 'Pet Chirp' },
  { id: 'dog', label: 'Dog Woof' },
  { id: 'cat', label: 'Cat Meow' },
  { id: 'standard', label: 'Standard' },
];

export default function SoundControl({ className = '', compact = false }: SoundControlProps) {
  const { muted, volume, soundTheme, setVolume, setSoundTheme, toggleMute, playSound } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
  };

  const currentVolPercent = Math.round(volume * 100);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border border-slate-200/80 shadow-xs active:scale-95 ${
          compact ? 'p-1.5' : 'p-2'
        }`}
        aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
        title="Sound Settings"
      >
        {muted || volume === 0 ? (
          <i className="fa-solid fa-volume-xmark text-slate-400 text-lg" />
        ) : volume < 0.5 ? (
          <i className="fa-solid fa-volume-low text-purple-600 text-lg" />
        ) : (
          <i className="fa-solid fa-volume-high text-purple-600 text-lg" />
        )}
      </button>

      {/* Popover Settings Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl z-50 animate-scale-in text-slate-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <i className="fa-solid fa-sliders text-purple-500" /> Sound Settings
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                muted
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              {muted ? 'Muted' : 'Enabled'}
            </button>
          </div>

          {/* Sound Theme Selection */}
          <div className="mb-3 space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <i className="fa-solid fa-wand-magic-sparkles text-amber-500" /> Sound Theme Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {THEME_OPTIONS.map((opt) => {
                const isActive = soundTheme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSoundTheme(opt.id);
                      playSound(opt.id === 'standard' ? 'cart-add' : opt.id);
                    }}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 justify-center ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5 mb-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Volume</span>
              <span className="text-purple-600 font-mono">{muted ? '0%' : `${currentVolPercent}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={muted}
              className="w-full accent-purple-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Quick Sound Test Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">Test Category Sounds:</p>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => playSound('dog')}
                className="py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg transition-colors text-center cursor-pointer"
              >
                Woof
              </button>
              <button
                type="button"
                onClick={() => playSound('cat')}
                className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors text-center cursor-pointer"
              >
                Meow
              </button>
              <button
                type="button"
                onClick={() => playSound('bird')}
                className="py-1 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg transition-colors text-center cursor-pointer"
              >
                Chirp
              </button>
              <button
                type="button"
                onClick={() => playSound('fish')}
                className="py-1 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold rounded-lg transition-colors text-center cursor-pointer"
              >
                Bubble
              </button>
              <button
                type="button"
                onClick={() => playSound('hamster')}
                className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors text-center cursor-pointer"
              >
                Squeak
              </button>
              <button
                type="button"
                onClick={() => playSound('pet')}
                className="py-1 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition-colors text-center cursor-pointer"
              >
                Generic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
