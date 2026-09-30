import React, { useState } from 'react';
import { TabType, CloakPreset } from '../types';
import {
  Home,
  Gamepad2,
  Clapperboard,
  Music2,
  MessageSquare,
  Settings,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Plus,
  X,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Star,
  ExternalLink,
  GraduationCap,
  Shield
} from 'lucide-react';
import { openAboutBlank } from '../utils/cloakPresets';
import { playSound } from '../utils/audio';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onPanicTrigger: () => void;
  onLockEdu?: () => void;
  panicKey: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cloakPreset: CloakPreset;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onPanicTrigger,
  onLockEdu,
  panicKey,
  soundEnabled,
  onToggleSound
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [omniboxInput, setOmniboxInput] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Tab mapping for title display
  const tabTitles: Record<string, string> = {
    home: 'Home',
    search: 'Home',
    games: 'Games Hub',
    movies: 'Media & Stream',
    music: 'Spotify Player',
    chat: 'AI Study Chat',
    settings: 'Vault Settings'
  };

  const currentTabTitle = tabTitles[currentTab] || 'Home';
  const displayUrl = `safezone://${currentTab === 'music' ? 'spotify' : currentTab === 'search' ? 'home' : currentTab}`;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleOmniboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = omniboxInput.trim().toLowerCase();
    setIsEditingUrl(false);

    if (!clean) return;

    if (clean.includes('game')) {
      onTabChange('games');
    } else if (clean.includes('movie') || clean.includes('media')) {
      onTabChange('movies');
    } else if (clean.includes('music') || clean.includes('spotify') || clean.includes('song')) {
      onTabChange('music');
    } else if (clean.includes('chat') || clean.includes('ai')) {
      onTabChange('chat');
    } else if (clean.includes('setting')) {
      onTabChange('settings');
    } else if (clean.includes('home')) {
      onTabChange('home');
    } else {
      // Direct Web search
      window.open(`https://duckduckgo.com/?q=${encodeURIComponent(clean)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TOP BROWSER CHROME (Safezone Blue Chrome Bar) */}
      {/* ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#060b17] border-b border-blue-500/20 flex flex-col select-none">
        {/* Top Tab Strip */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 gap-2">
          {/* Active Tab & Add button */}
          <div className="flex items-center gap-1.5 pl-14 md:pl-16">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-[#0d1628] border-t border-x border-blue-500/30 text-blue-200 text-xs font-bold shadow-md">
              <span className="w-4 h-4 rounded bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px] font-black">
                {currentTab === 'games' ? 'G' : currentTab === 'movies' ? 'M' : currentTab === 'music' ? '♫' : currentTab === 'chat' ? 'AI' : 'S'}
              </span>
              <span className="text-white font-medium">{currentTabTitle}</span>
              <button
                onClick={() => onTabChange('home')}
                className="hover:text-white hover:bg-blue-500/20 rounded p-0.5 ml-1 text-blue-300/60"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => onTabChange('home')}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
              title="New Tab (safezone://home)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Lock to Edu Camouflage */}
          <div className="flex items-center gap-2">
            {onLockEdu && (
              <button
                onClick={onLockEdu}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white text-xs font-semibold cursor-pointer border border-blue-500/30 shadow-sm transition"
                title="Lock immediately to Educational Portal (Apex Learning Hub)"
              >
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Exit to Edu Portal</span>
                <span className="sm:hidden">Edu Lock</span>
              </button>
            )}
          </div>
        </div>

        {/* Omnibox & Controls Row */}
        <div className="flex items-center justify-between px-3 pb-2 gap-2">
          {/* Left Navigation Buttons */}
          <div className="flex items-center gap-1 pl-14 md:pl-16 text-slate-400">
            <button
              onClick={() => onTabChange('home')}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onTabChange('games')}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition cursor-pointer"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                window.location.reload();
              }}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition cursor-pointer"
              title="Reload"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Omnibox Address Bar */}
          <form onSubmit={handleOmniboxSubmit} className="flex-1 max-w-3xl">
            <div className="flex items-center bg-[#091120] border border-blue-500/25 hover:border-blue-500/40 focus-within:border-blue-400 rounded-full px-3.5 py-1.5 gap-2 transition-all">
              <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />

              {isEditingUrl ? (
                <input
                  type="text"
                  value={omniboxInput}
                  onChange={e => setOmniboxInput(e.target.value)}
                  onBlur={() => setIsEditingUrl(false)}
                  autoFocus
                  placeholder="Enter URL or search..."
                  className="w-full bg-transparent text-xs text-white focus:outline-none font-mono"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingUrl(true);
                    setOmniboxInput(displayUrl);
                  }}
                  className="w-full text-left font-mono text-xs text-blue-200/90 truncate cursor-text"
                >
                  {displayUrl}
                </button>
              )}
            </div>
          </form>

          {/* Right Utility Widgets (Media, Bookmark, Cloak, Fullscreen) */}
          <div className="flex items-center gap-1.5 text-slate-400">
            {/* Audio Synth Status */}
            <div
              onClick={onToggleSound}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#091120] border border-blue-500/20 text-[11px] text-blue-200/80 hover:text-white cursor-pointer"
              title={soundEnabled ? 'Mute 8-bit sound' : 'Unmute sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{soundEnabled ? '8-Bit Synth ON' : 'Audio Muted'}</span>
            </div>

            {/* Bookmark Star */}
            <button
              onClick={() => {
                setIsBookmarked(b => !b);
                playSound('score', soundEnabled);
              }}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer ${
                isBookmarked ? 'text-blue-400' : 'hover:text-white'
              }`}
              title="Bookmark this page"
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            {/* Cloak About:Blank */}
            <button
              onClick={() => openAboutBlank()}
              className="hidden sm:block p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition cursor-pointer"
              title="Open inside unblocked about:blank tab"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. LEFT VERTICAL ICON RAIL / DOCK (Safezone Blue Left Rail) */}
      {/* ============================================================ */}
      <aside className="fixed left-0 top-0 bottom-0 w-14 md:w-16 z-50 bg-[#050a15] border-r border-blue-500/20 flex flex-col items-center justify-between py-4 select-none">
        {/* Top App Icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Safezone Brand Badge */}
          <div
            onClick={() => onTabChange('home')}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/40 cursor-pointer mb-2 transition hover:scale-105"
            title="Safezone"
          >
            <Shield className="w-5 h-5 text-white" />
          </div>

          {/* Home Icon */}
          <button
            onClick={() => onTabChange('home')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              currentTab === 'home' || currentTab === 'search'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Safezone Home & Search"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Games Icon */}
          <button
            onClick={() => onTabChange('games')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              currentTab === 'games'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Games (Friday Night Funkin, Retro Bowl, etc.)"
          >
            <Gamepad2 className="w-5 h-5" />
          </button>

          {/* Movies / Streaming Icon */}
          <button
            onClick={() => onTabChange('movies')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              currentTab === 'movies'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Media & Streaming"
          >
            <Clapperboard className="w-5 h-5" />
          </button>

          {/* Music Icon */}
          <button
            onClick={() => onTabChange('music')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              currentTab === 'music'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Spotify Web Player (Unblocked)"
          >
            <Music2 className="w-5 h-5" />
          </button>

          {/* Chat / AI Icon */}
          <button
            onClick={() => onTabChange('chat')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              currentTab === 'chat'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="AI Study Assistant"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Utility Icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Edu Portal Lock */}
          {onLockEdu && (
            <button
              onClick={onLockEdu}
              className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-blue-600/30 text-blue-300 hover:text-white flex items-center justify-center transition cursor-pointer border border-blue-500/20"
              title="Return to Educational Portal (Apex Learning Hub)"
            >
              <GraduationCap className="w-5 h-5" />
            </button>
          )}

          {/* Settings Icon */}
          <button
            onClick={() => onTabChange('settings')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Safezone Settings & Google Sites Code"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Emergency Panic Button */}
          <button
            onClick={onPanicTrigger}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-950/60 transition cursor-pointer active:scale-95 animate-pulse"
            title={`Emergency Panic Disguise [${panicKey}]`}
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  );
};
