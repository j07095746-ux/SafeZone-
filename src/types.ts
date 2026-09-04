export type TabType = 'games' | 'movies' | 'search' | 'settings';

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

export interface MovieItem {
  id: string;
  title: string;
  year: number;
  duration: string;
  category: string;
  poster: string;
  description: string;
  videoUrl?: string;
  embedUrl?: string;
  genre: string[];
  isCustom?: boolean;
}

export type ThemeType = 'dark-ops' | 'cyberpunk' | 'matrix' | 'midnight' | 'sunset' | 'clean';

export type CloakPreset = 'none' | 'classroom' | 'drive' | 'docs' | 'canvas' | 'desmos' | 'edpuzzle' | 'khan';

export interface AppSettings {
  cloakPreset: CloakPreset;
  customTitle: string;
  customFavicon: string;
  panicKey: string;
  panicUrl: string;
  panicAction: 'decoy' | 'redirect';
  theme: ThemeType;
  soundEnabled: boolean;
  recentGames: string[];
  favoriteGames: string[];
  favoriteMovies: string[];
}
