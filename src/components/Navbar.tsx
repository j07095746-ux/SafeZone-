import React, { useState, useEffect, useRef } from 'react';
import { TabType, CloakPreset } from '../types';
import {
  Gamepad2,
  Film,
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
  ChevronRight,
  Pin,
  PinOff
} from 'lucide-react';
import { openAboutBlank } from '../utils/cloakPresets';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onPanicTrigger: () => void;
  panicKey: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cloakPreset: CloakPreset;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onPanicTrigger,
  panicKey,
  soundEnabled,
  onToggleSound
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop hover-to-expand state
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem('safezone_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarMode, setSidebarMode] = useState<'drawer' | 'rail'>(() => {
    try {
      return (localStorage.getItem('safezone_sidebar_mode') as 'drawer' | 'rail') || 'drawer';
    } catch {
      return 'drawer';
    }
  });

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
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const isExpanded = isPinned || isHovered;

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
    { id: 'movies', label: 'Movies', icon: <Film className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Mobile Top Bar (< md) */}
      <div className="md:hidden sticky top-0 z-50 bg-[#0a0c16] border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">SAFEZONE</span>
        </div>

        <div className="flex items-center gap-2">
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
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {item.icon}
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
              className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-lg font-medium flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> About:Blank
            </button>
          </div>
        </div>
      )}

      {/* Desktop Layout Spacer when Pinned or in Rail Mode */}
      {isPinned && <div className="hidden md:block w-64 shrink-0 transition-all duration-300" />}
      {!isPinned && sidebarMode === 'rail' && (
        <div className="hidden md:block w-[72px] shrink-0 transition-all duration-300" />
      )}

      {/* Immersive UI Sidebar Desktop (>= md) with Hover Slide */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex flex-col select-none z-40 h-screen top-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isPinned
            ? 'fixed left-0 w-64 bg-[#0a0c16] border-r border-white/5 shadow-2xl'
            : sidebarMode === 'drawer'
            ? `fixed left-0 w-68 bg-[#0a0c16]/95 backdrop-blur-2xl border-r border-white/10 ${
                isExpanded
                  ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.85)]'
                  : '-translate-x-full'
              }`
            : `fixed left-0 bg-[#0a0c16]/95 backdrop-blur-2xl border-r border-white/10 ${
                isExpanded
                  ? 'w-68 translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.85)]'
                  : 'w-[72px] translate-x-0'
              }`
        }`}
      >
        {/* Floating "Tabs" Edge Trigger Tab (visible when unhovered in drawer mode, or on rail) */}
        {!isPinned && (
          <div
            className={`absolute -right-12 top-24 z-50 transition-all duration-300 pointer-events-auto ${
              isExpanded && sidebarMode === 'drawer' ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <div
              onClick={() => setIsHovered(true)}
              className="flex items-center gap-1.5 py-3 px-2 bg-[#0a0c16]/95 hover:bg-indigo-950/90 text-indigo-400 hover:text-white border border-l-0 border-indigo-500/40 rounded-r-2xl shadow-[0_4px_25px_rgba(79,70,229,0.35)] cursor-pointer group backdrop-blur-xl transition-all"
              title="Hover over to open tabs"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div className="flex flex-col items-center justify-center pr-0.5">
                <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase [writing-mode:vertical-lr] rotate-180 py-1">
                  TABS
                </span>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Full-height invisible edge trigger zone (16px along screen left edge) */}
        {!isPinned && sidebarMode === 'drawer' && (
          <div
            className="absolute -right-4 top-0 bottom-0 w-4 pointer-events-auto cursor-pointer"
            onMouseEnter={handleMouseEnter}
          />
        )}

        <div className="p-6 pb-3">
          {/* Brand Logo & Title & Pin Button */}
          <div className="flex items-center justify-between mb-4">
            <div
              onClick={() => onTabChange('games')}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              {(isExpanded || sidebarMode === 'drawer') && (
                <div className="whitespace-nowrap transition-opacity duration-200">
                  <span className="text-2xl font-black tracking-tighter text-white block leading-none">
                    SAFEZONE
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mt-1">
                    Unblocked Vault
                  </span>
                </div>
              )}
            </div>

            {/* Quick Collapse / Pin Controls */}
            {isExpanded && (
              <button
                onClick={() => {
                  const next = !isPinned;
                  setIsPinned(next);
                  try {
                    localStorage.setItem('safezone_sidebar_pinned', String(next));
                  } catch {
                    // ignore
                  }
                }}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isPinned
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                    : 'bg-white/5 text-slate-500 hover:text-slate-300 border-white/5'
                }`}
                title={
                  isPinned
                    ? 'Sidebar is pinned open. Click to enable hover-to-slide mode.'
                    : 'Hover auto-slide is active. Click to pin sidebar open.'
                }
              >
                {isPinned ? <Pin className="w-3.5 h-3.5 text-indigo-400" /> : <PinOff className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Mode Switcher Pill (Drawer vs Rail) */}
          {isExpanded && (
            <div className="flex items-center justify-between p-1.5 mb-4 rounded-xl bg-white/[0.03] border border-white/5 text-[11px]">
              <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider pl-1 flex items-center gap-1">
                <span>{isPinned ? '📌 PINNED' : '✨ HOVER SLIDE'}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSidebarMode('drawer');
                    try {
                      localStorage.setItem('safezone_sidebar_mode', 'drawer');
                    } catch {
                      // ignore
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                    sidebarMode === 'drawer'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Drawer mode: Tucks into the edge, slides out on hover"
                >
                  Drawer
                </button>
                <button
                  onClick={() => {
                    setSidebarMode('rail');
                    try {
                      localStorage.setItem('safezone_sidebar_mode', 'rail');
                    } catch {
                      // ignore
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                    sidebarMode === 'rail'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Rail mode: Sleek icon dock, expands on hover"
                >
                  Rail
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-3.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 font-bold shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium border border-transparent'
                  } ${!isExpanded && sidebarMode === 'rail' ? 'justify-center p-3' : ''}`}
                  title={item.label}
                >
                  <span className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  {(isExpanded || sidebarMode === 'drawer') && (
                    <span className="text-sm tracking-wide whitespace-nowrap">{item.label}</span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Quick Tools Tray */}
        <div
          className={`px-5 py-2 flex items-center border-t border-white/5 mx-2 pt-3 ${
            !isExpanded && sidebarMode === 'rail' ? 'flex-col gap-2' : 'justify-between gap-1.5'
          }`}
        >
          <button
            onClick={() => openAboutBlank()}
            className={`py-1.5 px-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
              !isExpanded && sidebarMode === 'rail' ? 'w-full p-2' : 'flex-1'
            }`}
            title="Open in about:blank cloaked tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {(isExpanded || sidebarMode === 'drawer') && (
              <span className="text-[11px] whitespace-nowrap">Cloaked</span>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleSound}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-lg transition cursor-pointer"
              title={soundEnabled ? 'Mute 8-bit sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-lg transition cursor-pointer"
              title="Toggle fullscreen mode"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Status & Panic Box */}
        <div className="mt-auto p-5 space-y-3">
          {/* Emergency Panic Button */}
          <button
            onClick={onPanicTrigger}
            className={`w-full flex items-center justify-center gap-2 p-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/40 transition cursor-pointer active:scale-95 animate-pulse ${
              !isExpanded && sidebarMode === 'rail' ? 'p-3' : ''
            }`}
            title={`Trigger instant panic disguise (Key: '${panicKey}')`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {(isExpanded || sidebarMode === 'drawer') && (
              <span className="whitespace-nowrap">Panic Hotkey [{panicKey}]</span>
            )}
          </button>

          {/* Proxy Status widget */}
          {(isExpanded || sidebarMode === 'drawer') && (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-black border border-white/5">
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
          )}
        </div>
      </aside>
    </>
  );
};
