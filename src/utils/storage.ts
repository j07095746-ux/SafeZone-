import { AppSettings, GameItem } from '../types';
import { INITIAL_GAMES } from '../data/gamesData';

const SETTINGS_KEY = 'safezone_settings_v1';
const CUSTOM_GAMES_KEY = 'safezone_custom_games_v1';
const HIGH_SCORES_KEY = 'safezone_highscores_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  cloakPreset: 'none',
  customTitle: '',
  customFavicon: '',
  panicKey: ']',
  panicUrl: 'https://classroom.google.com',
  panicAction: 'decoy',
  theme: 'cyber',
  effect: 'none',
  soundEnabled: true,
  recentGames: ['subway_surfers', 'monkey_mart', 'stickman_hook', 'drive_mad'],
  favoriteGames: ['subway_surfers', 'monkey_mart', 'stickman_hook'],
  eduCoverEnabled: true,
  calculatorPasscode: '55555'
};

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const favoriteGames = Array.isArray(parsed.favoriteGames)
      ? parsed.favoriteGames.filter((id: string) => id !== 'geometry_dash_lite')
      : DEFAULT_SETTINGS.favoriteGames;
    const recentGames = Array.isArray(parsed.recentGames)
      ? parsed.recentGames.filter((id: string) => id !== 'geometry_dash_lite')
      : DEFAULT_SETTINGS.recentGames;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      favoriteGames,
      recentGames,
      eduCoverEnabled: parsed.eduCoverEnabled !== undefined ? parsed.eduCoverEnabled : DEFAULT_SETTINGS.eduCoverEnabled,
      calculatorPasscode: parsed.calculatorPasscode || DEFAULT_SETTINGS.calculatorPasscode
    };
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
    localStorage.removeItem(HIGH_SCORES_KEY);
  } catch {
    // ignore
  }
}
