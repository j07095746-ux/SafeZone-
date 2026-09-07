import React, { useState, useEffect, useRef } from 'react';
import { TabType, CloakPreset, ThemeType } from '../types';
import {
  Gamepad2,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  ExternalLink,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { openAboutBlank } from '../utils/cloakPresets';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onPanicTrigger: () => void;
  onLockEdu?: () => void;
  panicKey: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cloakPreset: CloakPreset;
  theme?: ThemeType;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onPanicTrigger,
  onLockEdu,
  panicKey,
  soundEnabled,
  onToggleSound,
  theme = 'cyber'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop hover-to-slide rail state
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'games', label: 'Games', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const getThemeAccentClasses = () => {
    switch (theme) {
      case 'galaxy':
        return {
          logoBg: 'bg-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]',
          activeBg: 'bg-purple-600/15 text-purple-400 border-purple-500/30',
          activeIcon: 'text-purple-400',
          badgeBg: 'bg-purple-600/20 text-purple-300 border-purple-500/30'
        };
      case 'night':
        return {
          logoBg: 'bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.4)]',
          activeBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          activeIcon: 'text-sky-400',
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
        };
      case 'dark-ops':
        return {
          logoBg: 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]',
          activeBg: 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30',
          activeIcon: 'text-indigo-400',
          badgeBg: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
        };
      case 'cyber':
      default:
        return {
          logoBg: 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]',
          activeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          activeIcon: 'text-cyan-400',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        };
    }
  };

  const themeClasses = getThemeAccentClasses();

  return (
    <>
      {/* Mobile Top Bar (< md) */}
      <div className="md:hidden sticky top-0 z-50 bg-[#0a0c16] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${themeClasses.logoBg}`}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">SAFEZONE</span>
        </div>

        <div className="flex items-center gap-2">
          {onLockEdu && (
            <button
              onClick={onLockEdu}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold cursor-pointer active:scale-95"
              title="Lock to Educational Portal"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edu Lock</span>
            </button>
          )}

          {/* Quick Panic Button Mobile */}
          <button
            onClick={onPanicTrigger}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/90 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-950/50 cursor-pointer active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Panic [{panicKey}]</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0c16] border-b border-white/5 p-4 space-y-2 z-40 relative">
          <nav className="space-y-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? `${themeClasses.activeBg} font-bold`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? themeClasses.activeIcon : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSound}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => openAboutBlank()}
              className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-lg font-medium flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> About:Blank
            </button>
          </div>
        </div>
      )}

      {/* Desktop Layout Spacer for Rail */}
      <div className="hidden md:block w-[72px] shrink-0 transition-all duration-300" />

      {/* Immersive Hover-Slide Rail Navigation Desktop (>= md) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex flex-col select-none z-40 h-screen top-0 fixed left-0 bg-[#0a0c16]/95 backdrop-blur-2xl border-r transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isHovered
            ? 'w-64 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)]'
            : 'w-[72px] border-white/5'
        }`}
      >
        <div className="p-4 pb-3">
          {/* Brand Logo & Title */}
          <div
            onClick={() => onTabChange('games')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden mb-6"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${themeClasses.logoBg}`}>
              <Shield className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            {isHovered && (
              <div className="whitespace-nowrap transition-opacity duration-200">
                <span className="text-xl font-black tracking-tighter text-white block leading-none">
                  SAFEZONE
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mt-1">
                  Unblocked Vault
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center rounded-xl cursor-pointer transition-all ${
                    isHovered ? 'gap-3.5 px-3.5 py-2.5' : 'justify-center p-3'
                  } ${
                    isActive
                      ? `${themeClasses.activeBg} font-bold shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium border border-transparent'
                  }`}
                  title={item.label}
                >
                  <span className={`shrink-0 ${isActive ? themeClasses.activeIcon : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  {isHovered && (
                    <span className="text-sm tracking-wide whitespace-nowrap overflow-hidden text-left">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Tools Tray */}
        <div
          className={`px-3 py-2 flex items-center border-t border-white/5 mx-1 pt-3 ${
            !isHovered ? 'flex-col gap-2' : 'justify-between gap-1.5'
          }`}
        >
          <button
            onClick={() => openAboutBlank()}
            className={`bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
              !isHovered ? 'w-10 h-10 p-2' : 'flex-1 py-1.5 px-2'
            }`}
            title="Open in about:blank cloaked tab"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
            {isHovered && (
              <span className="text-[11px] whitespace-nowrap">Cloaked</span>
            )}
          </button>

          <div className={`flex items-center ${!isHovered ? 'flex-col gap-2' : 'gap-1.5'}`}>
            <button
              onClick={onToggleSound}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-lg transition cursor-pointer"
              title={soundEnabled ? 'Mute 8-bit sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-lg transition cursor-pointer"
              title="Toggle fullscreen mode"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Status & Panic Box */}
        <div className="mt-auto p-3 space-y-2.5">
          {/* Quick Lock to Educational Camouflage Cover */}
          {onLockEdu && (
            <button
              onClick={onLockEdu}
              className={`w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl font-semibold transition cursor-pointer active:scale-95 ${
                isHovered ? 'p-2.5 text-xs' : 'p-3'
              }`}
              title="Lock & disguise as Educational Portal"
            >
              <GraduationCap className="w-5 h-5 shrink-0 text-indigo-400" />
              {isHovered && (
                <span className="whitespace-nowrap text-xs font-bold">Lock to Edu Portal</span>
              )}
            </button>
          )}

          {/* Emergency Panic Button */}
          <button
            onClick={onPanicTrigger}
            className={`w-full flex items-center justify-center gap-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-950/40 transition cursor-pointer active:scale-95 animate-pulse ${
              isHovered ? 'p-2.5 text-xs' : 'p-3'
            }`}
            title={`Trigger instant panic disguise (Key: '${panicKey}')`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            {isHovered && (
              <span className="whitespace-nowrap text-xs">Panic Hotkey [{panicKey}]</span>
            )}
          </button>

          {/* Proxy Status */}
          {isHovered ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 font-mono">
                Proxy Status
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 font-mono">CONNECTED</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">STEALTH</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="Proxy: Connected (Stealth)">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
