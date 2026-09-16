/**
 * AL NADER PET SHOP — DESIGN SYSTEM TOKENS
 *
 * Single source of truth for all design tokens.
 * These mirror the CSS custom properties defined in globals.css @theme block.
 * Use these in any TypeScript/React code that needs design tokens programmatically.
 */

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────

export const colors = {
  cream: {
    50: '#FFF9F0',
    100: '#FFF3E0',
    200: '#FFE4B8',
  },
  amber: {
    400: '#F5A623',
    500: '#E8961C',
    600: '#D4850F',
  },
  teal: {
    400: '#2EC4B6',
    500: '#20B2A4',
    600: '#179E91',
    700: '#0F8B7E',
  },
  purple: {
    50: '#F5F0FF',
    100: '#EDE5FF',
    200: '#D4C4FB',
    300: '#B89EF7',
    400: '#9B72F2',
    500: '#7C4DDB',
    600: '#6535C4',
    700: '#4F2A9E',
    800: '#3B1F78',
    900: '#2A1558',
  },
  coral: {
    400: '#FF6F61',
    500: '#E85D50',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
} as const;

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────

export const fonts = {
  heading: "'Outfit', sans-serif",
  body: "'Inter', sans-serif",
} as const;

// ─── SHADOWS ──────────────────────────────────────────────────────────────────

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
  modal: '0 25px 50px rgba(0,0,0,0.15)',
  nav: '0 1px 3px rgba(0,0,0,0.05)',
  soft: '0 4px 14px rgba(0,0,0,0.06)',
} as const;

// ─── TRANSITIONS ──────────────────────────────────────────────────────────────

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ─── BORDER RADIUS ────────────────────────────────────────────────────────────

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  full: '9999px',
} as const;

// ─── Z-INDEX SCALE ────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

// ─── BREAKPOINTS ─────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─── ANIMATION CLASS NAMES ───────────────────────────────────────────────────

export const animations = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  slideInRight: 'animate-slide-in-right',
  slideOutRight: 'animate-slide-out-right',
  scaleIn: 'animate-scale-in',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  shimmer: 'animate-shimmer',
  bounceSubtle: 'animate-bounce-subtle',
  revealUp: 'animate-reveal-up',
  heroFade: 'animate-hero-fade',
  marquee: 'animate-marquee',
} as const;

// ─── TAILWIND CSS VARIABLE REFERENCES ────────────────────────────────────────
// Use these when you need the CSS custom property name as a string.

export const cssVars = {
  colors: {
    cream50: 'var(--color-cream-50)',
    cream100: 'var(--color-cream-100)',
    purple500: 'var(--color-purple-500)',
    purple600: 'var(--color-purple-600)',
    teal500: 'var(--color-teal-500)',
    amber500: 'var(--color-amber-500)',
    slate800: 'var(--color-slate-800)',
    slate900: 'var(--color-slate-900)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
  },
  fonts: {
    heading: 'var(--font-heading)',
    body: 'var(--font-body)',
  },
} as const;

// ─── TYPE EXPORTS ─────────────────────────────────────────────────────────────

export type ColorScale = typeof colors;
export type FontScale = typeof fonts;
export type ShadowScale = typeof shadows;
export type TransitionScale = typeof transitions;
export type RadiusScale = typeof radii;
export type BreakpointScale = typeof breakpoints;
