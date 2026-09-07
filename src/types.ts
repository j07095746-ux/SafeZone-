export type TabType = 'games' | 'search' | 'settings';

export type GameCategory = 'all' | 'arcade' | 'puzzle' | 'retro' | 'action' | 'casual' | 'favorites';

export interface GameItem {
  id: string;
  title: string;
  category: GameCategory;
  description: string;
  thumbnail: string;
  author?: string;
  plays?: number;
  rating?: number;
  type: 'canvas' | 'embed';
  componentId?: string;
  embedUrl?: string;
  sandbox?: string;
  instructions: string;
  controls: string[];
  isCustom?: boolean;
}

export type ThemeType = 'cyber' | 'galaxy' | 'night' | 'dark-ops';

export type EffectType = 'none' | 'snow' | 'rain';

export type CloakPreset = 'none' | 'classroom' | 'drive' | 'docs' | 'canvas' | 'desmos' | 'edpuzzle' | 'khan';

export interface AppSettings {
  cloakPreset: CloakPreset;
  customTitle: string;
  customFavicon: string;
  panicKey: string;
  panicUrl: string;
  panicAction: 'decoy' | 'redirect';
  theme: ThemeType;
  effect: EffectType;
  soundEnabled: boolean;
  recentGames: string[];
  favoriteGames: string[];
  favoriteMovies?: string[];
  eduCoverEnabled: boolean;
  calculatorPasscode: string;
}
