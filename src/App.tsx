/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TabType, AppSettings, GameItem } from './types';
import { INITIAL_GAMES } from './data/gamesData';
import {
  getStoredSettings,
  saveStoredSettings,
  getCustomGames,
  saveCustomGame,
  saveHighScore,
  resetAllData,
  DEFAULT_SETTINGS
} from './utils/storage';
import { applyCloak } from './utils/cloakPresets';
import { playSound } from './utils/audio';
import { Navbar } from './components/Navbar';
import { GamesTab } from './components/GamesTab';
import { SearchTab } from './components/SearchTab';
import { SettingsTab } from './components/SettingsTab';
import { DecoyOverlay } from './components/DecoyOverlay';
import { BackgroundEffects } from './components/BackgroundEffects';
import { EducationalPortal } from './components/EducationalPortal';
import { THEME_PRESETS } from './utils/themePresets';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('games');
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [games, setGames] = useState<GameItem[]>(() => {
    const custom = getCustomGames();
    return [...custom, ...INITIAL_GAMES];
  });
  const [decoyActive, setDecoyActive] = useState(false);

  // Educational cover lock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const s = getStoredSettings();
    if (!s.eduCoverEnabled) return true;
    try {
      return sessionStorage.getItem('safezone_unlocked_session') === 'true';
    } catch {
      return false;
    }
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    try {
      sessionStorage.setItem('safezone_unlocked_session', 'true');
    } catch {}
  };

  const handleLockEdu = useCallback(() => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem('safezone_unlocked_session');
    } catch {}
  }, []);

  // Apply tab cloak or educational disguise on change
  useEffect(() => {
    if (!isUnlocked) {
      document.title = 'Apex Learning Hub | Student Portal & Curriculum';
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L1 7l11 5 9-4.09V17h2V7L12 2zM3.5 10.5v5.8c0 3.3 3.8 6 8.5 6s8.5-2.7 8.5-6v-5.8l-8.5 3.9-8.5-3.9z'/></svg>";
      }
    } else {
      applyCloak(settings.cloakPreset, settings.customTitle, settings.customFavicon);
    }
  }, [isUnlocked, settings.cloakPreset, settings.customTitle, settings.customFavicon]);

  // Global Panic Key Listener
  const triggerPanic = useCallback(() => {
    playSound('click', settings.soundEnabled);
    if (settings.panicAction === 'redirect') {
      window.location.href = settings.panicUrl || 'https://classroom.google.com';
    } else {
      if (settings.eduCoverEnabled) {
        handleLockEdu();
      } else {
        setDecoyActive(true);
      }
    }
  }, [settings.panicAction, settings.panicUrl, settings.soundEnabled, settings.eduCoverEnabled, handleLockEdu]);

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

  // Add custom game
  const handleAddCustomGame = (game: GameItem) => {
    saveCustomGame(game);
    setGames(prev => [game, ...prev.filter(g => g.id !== game.id)]);
  };

  // Reset all data
  const handleResetData = () => {
    resetAllData();
    setSettings(DEFAULT_SETTINGS);
    setGames(INITIAL_GAMES);
    applyCloak('none');
  };

  // Theme styling helpers
  const activeThemeMeta = THEME_PRESETS[settings.theme] || THEME_PRESETS['cyber'];

  const getThemeBackground = () => {
    switch (settings.theme) {
      case 'galaxy':
        return 'bg-[#05020f]';
      case 'night':
        return 'bg-[#02050b]';
      case 'dark-ops':
        return 'bg-[#05060b]';
      case 'cyber':
      default:
        return 'bg-[#050814]';
    }
  };

  const getAmbientOrbs = () => {
    switch (settings.theme) {
      case 'galaxy':
        return (
          <>
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-purple-600/12 blur-[140px] rounded-full -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-[25rem] h-[25rem] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
          </>
        );
      case 'night':
        return (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[130px] rounded-full -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/8 blur-[120px] rounded-full pointer-events-none" />
          </>
        );
      case 'dark-ops':
        return (
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
        );
      case 'cyber':
      default:
        return (
          <>
            <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-cyan-500/12 blur-[140px] rounded-full -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute top-1/2 left-10 w-80 h-80 bg-pink-500/10 blur-[140px] rounded-full pointer-events-none" />
          </>
        );
    }
  };

  if (!isUnlocked) {
    return (
      <EducationalPortal
        passcode={settings.calculatorPasscode}
        onUnlock={handleUnlock}
        soundEnabled={settings.soundEnabled}
      />
    );
  }

  return (
    <div className={`${getThemeBackground()} text-slate-200 flex flex-col md:flex-row min-h-screen overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-500 relative`}>
      {/* Dynamic Atmospheric Canvas Effect (Snow, Rain, None) */}
      <BackgroundEffects effect={settings.effect} />

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
        onLockEdu={handleLockEdu}
        panicKey={settings.panicKey}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        cloakPreset={settings.cloakPreset}
        theme={settings.theme}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col p-6 sm:p-10 gap-8 relative overflow-y-auto max-h-screen w-full">
        {/* Immersive UI Ambient Glow Orbs */}
        {getAmbientOrbs()}

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

          {currentTab === 'search' && (
            <SearchTab soundEnabled={settings.soundEnabled} />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetData}
              onTriggerDecoy={() => setDecoyActive(true)}
              onLockEdu={handleLockEdu}
            />
          )}
        </div>

        {/* Immersive UI Status Footer */}
        <footer className="mt-auto flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 text-slate-500 text-xs sm:text-sm relative z-10 gap-3">
          <div className="flex items-center gap-3">
            <span>SafeZone Vault</span>
            <span className="text-white/10">•</span>
            <span className="capitalize text-slate-400 font-medium">{activeThemeMeta.name} Theme</span>
            {settings.effect !== 'none' && (
              <>
                <span className="text-white/10">•</span>
                <span className="capitalize text-cyan-400 font-medium">{settings.effect} Active</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs text-slate-400">
            <div>FPS: 60</div>
            <div>STATUS: STEALTH</div>
            <div>VAULT: ACTIVE</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
