/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, AppSettings, GameItem, MovieItem } from './types';
import { INITIAL_GAMES } from './data/gamesData';
import { INITIAL_MOVIES } from './data/moviesData';
import {
  getStoredSettings,
  saveStoredSettings,
  getCustomGames,
  saveCustomGame,
  getCustomMovies,
  saveCustomMovie,
  saveHighScore,
  resetAllData,
  DEFAULT_SETTINGS
} from './utils/storage';
import { applyCloak } from './utils/cloakPresets';
import { playSound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { GamesTab } from './components/GamesTab';
import { MoviesTab } from './components/MoviesTab';
import { SearchTab } from './components/SearchTab';
import { SettingsTab } from './components/SettingsTab';
import { DecoyOverlay } from './components/DecoyOverlay';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('games');
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [games, setGames] = useState<GameItem[]>(() => {
    const custom = getCustomGames();
    return [...custom, ...INITIAL_GAMES];
  });
  const [movies, setMovies] = useState<MovieItem[]>(() => {
    const custom = getCustomMovies();
    return [...custom, ...INITIAL_MOVIES];
  });
  const [decoyActive, setDecoyActive] = useState(false);

  // Apply tab cloak on change
  useEffect(() => {
    applyCloak(settings.cloakPreset, settings.customTitle, settings.customFavicon);
  }, [settings.cloakPreset, settings.customTitle, settings.customFavicon]);

  // Global Panic Key Listener
  const triggerPanic = useCallback(() => {
    playSound('click', settings.soundEnabled);
    if (settings.panicAction === 'redirect') {
      window.location.href = settings.panicUrl || 'https://classroom.google.com';
    } else {
      setDecoyActive(true);
    }
  }, [settings.panicAction, settings.panicUrl, settings.soundEnabled]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === settings.panicKey || (settings.panicKey === 'Escape' && e.key === 'Escape')) {
        e.preventDefault();
        triggerPanic();
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [settings.panicKey, triggerPanic]);

  // Settings update handler
  const handleUpdateSettings = (updated: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updated };
      saveStoredSettings(next);
      return next;
    });
  };

  // Toggle favorite game
  const handleToggleFavoriteGame = (id: string) => {
    playSound('click', settings.soundEnabled);
    setSettings(prev => {
      const exists = prev.favoriteGames.includes(id);
      const updated = exists
        ? prev.favoriteGames.filter(gId => gId !== id)
        : [...prev.favoriteGames, id];
      const next = { ...prev, favoriteGames: updated };
      saveStoredSettings(next);
      return next;
    });
  };

  // Toggle favorite movie
  const handleToggleFavoriteMovie = (id: string) => {
    playSound('click', settings.soundEnabled);
    setSettings(prev => {
      const exists = prev.favoriteMovies.includes(id);
      const updated = exists
        ? prev.favoriteMovies.filter(mId => mId !== id)
        : [...prev.favoriteMovies, id];
      const next = { ...prev, favoriteMovies: updated };
      saveStoredSettings(next);
      return next;
    });
  };

  // Add custom game
  const handleAddCustomGame = (game: GameItem) => {
    saveCustomGame(game);
    setGames(prev => [game, ...prev.filter(g => g.id !== game.id)]);
  };

  // Add custom movie
  const handleAddCustomMovie = (movie: MovieItem) => {
    saveCustomMovie(movie);
    setMovies(prev => [movie, ...prev.filter(m => m.id !== movie.id)]);
  };

  // Reset all data
  const handleResetData = () => {
    resetAllData();
    setSettings(DEFAULT_SETTINGS);
    setGames(INITIAL_GAMES);
    setMovies(INITIAL_MOVIES);
    applyCloak('none');
  };

  return (
    <div className="bg-[#05060b] text-slate-200 flex flex-col md:flex-row min-h-screen overflow-x-hidden font-sans selection:bg-indigo-600 selection:text-white">
      {/* Decoy Overlay Screen */}
      {decoyActive && (
        <DecoyOverlay
          onDismiss={() => setDecoyActive(false)}
          preset={settings.cloakPreset}
        />
      )}

      {/* Primary Sidebar & Mobile Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={tab => {
          playSound('click', settings.soundEnabled);
          setCurrentTab(tab);
        }}
        onPanicTrigger={triggerPanic}
        panicKey={settings.panicKey}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        cloakPreset={settings.cloakPreset}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col p-6 sm:p-10 md:pl-16 gap-8 relative overflow-y-auto max-h-screen w-full">
        {/* Immersive UI Ambient Glow Orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

        {/* Tab Modules */}
        <div className="relative z-10 flex-1">
          {currentTab === 'games' && (
            <GamesTab
              games={games}
              favoriteGames={settings.favoriteGames}
              onToggleFavorite={handleToggleFavoriteGame}
              onAddCustomGame={handleAddCustomGame}
              soundEnabled={settings.soundEnabled}
              onGamePlayScore={(id, score) => saveHighScore(id, score)}
            />
          )}

          {currentTab === 'movies' && (
            <MoviesTab
              movies={movies}
              favoriteMovies={settings.favoriteMovies}
              onToggleFavorite={handleToggleFavoriteMovie}
              onAddCustomMovie={handleAddCustomMovie}
              soundEnabled={settings.soundEnabled}
            />
          )}

          {currentTab === 'search' && (
            <SearchTab soundEnabled={settings.soundEnabled} />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetData}
              onTriggerDecoy={() => setDecoyActive(true)}
            />
          )}
        </div>

        {/* Immersive UI Status Footer */}
        <footer className="mt-auto flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 text-slate-500 text-xs sm:text-sm relative z-10 gap-3">
          <div className="flex items-center gap-3">
            <span>v4.2.1 Stable Build</span>
            <span className="text-white/10">•</span>
            <span className="text-slate-400">SafeZone Vault</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-slate-400">
            <div>RAM USAGE: 42MB</div>
            <div>FPS: 60</div>
            <div>USERS: 1.2k</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
