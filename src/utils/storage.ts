import { AppSettings, GameItem, MovieItem } from '../types';
import { INITIAL_GAMES } from '../data/gamesData';
import { INITIAL_MOVIES } from '../data/moviesData';

const SETTINGS_KEY = 'safezone_settings_v1';
const CUSTOM_GAMES_KEY = 'safezone_custom_games_v1';
const CUSTOM_MOVIES_KEY = 'safezone_custom_movies_v1';
const HIGH_SCORES_KEY = 'safezone_highscores_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  cloakPreset: 'none',
  customTitle: '',
  customFavicon: '',
  panicKey: ']',
  panicUrl: 'https://classroom.google.com',
  panicAction: 'decoy',
  theme: 'dark-ops',
  soundEnabled: true,
  recentGames: ['subway_surfers', 'escape_road', 'retro_bowl', 'geometry_dash_lite'],
  favoriteGames: ['subway_surfers', 'escape_road', 'geometry_dash_lite'],
  favoriteMovies: ['big_buck_bunny']
};

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // quota exceeded or disabled
  }
}

export function getCustomGames(): GameItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_GAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomGame(game: GameItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomGames();
    const updated = [game, ...current.filter(g => g.id !== game.id)];
    localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function deleteCustomGame(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomGames();
    const updated = current.filter(g => g.id !== id);
    localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getCustomMovies(): MovieItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_MOVIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomMovie(movie: MovieItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getCustomMovies();
    const updated = [movie, ...current.filter(m => m.id !== movie.id)];
    localStorage.setItem(CUSTOM_MOVIES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getHighScore(gameId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY);
    if (!raw) return 0;
    const scores = JSON.parse(raw);
    return scores[gameId] || 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(gameId: string, score: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getHighScore(gameId);
    if (score > current) {
      const raw = localStorage.getItem(HIGH_SCORES_KEY);
      const scores = raw ? JSON.parse(raw) : {};
      scores[gameId] = score;
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(CUSTOM_GAMES_KEY);
    localStorage.removeItem(CUSTOM_MOVIES_KEY);
    localStorage.removeItem(HIGH_SCORES_KEY);
  } catch {
    // ignore
  }
}
