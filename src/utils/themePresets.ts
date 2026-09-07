import { ThemeType } from '../types';

export interface ThemeMeta {
  id: ThemeType;
  name: string;
  tagline: string;
  colors: {
    bg: string;
    card: string;
    accent: string;
    border: string;
    glow: string;
  };
  sampleHex: string[];
}

export const THEME_PRESETS: Record<ThemeType, ThemeMeta> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    tagline: 'High-voltage electric cyan & neon magenta cybernetic aesthetic',
    colors: {
      bg: 'bg-[#050814]',
      card: 'bg-[#080d22]',
      accent: 'text-cyan-400',
      border: 'border-cyan-500/20',
      glow: 'bg-cyan-500/15'
    },
    sampleHex: ['#050814', '#06b6d4', '#ec4899', '#22d3ee']
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy',
    tagline: 'Deep space cosmic void with starlight violet and nebula purple',
    colors: {
      bg: 'bg-[#05020f]',
      card: 'bg-[#0a051c]',
      accent: 'text-purple-400',
      border: 'border-purple-500/20',
      glow: 'bg-purple-600/15'
    },
    sampleHex: ['#05020f', '#8b5cf6', '#a855f7', '#3b82f6']
  },
  night: {
    id: 'night',
    name: 'Night',
    tagline: 'Quiet midnight obsidian canvas with calm moonlit sky blue accents',
    colors: {
      bg: 'bg-[#02050b]',
      card: 'bg-[#070b14]',
      accent: 'text-sky-400',
      border: 'border-sky-500/20',
      glow: 'bg-sky-500/12'
    },
    sampleHex: ['#02050b', '#38bdf8', '#0ea5e9', '#64748b']
  },
  'dark-ops': {
    id: 'dark-ops',
    name: 'Dark Ops',
    tagline: 'Classic tactical stealth dark mode with indigo focus rings',
    colors: {
      bg: 'bg-[#05060b]',
      card: 'bg-[#0a0c16]',
      accent: 'text-indigo-400',
      border: 'border-indigo-500/20',
      glow: 'bg-indigo-600/12'
    },
    sampleHex: ['#05060b', '#6366f1', '#4f46e5', '#94a3b8']
  }
};
