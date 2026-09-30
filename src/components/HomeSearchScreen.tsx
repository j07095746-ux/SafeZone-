import React, { useState, useMemo } from 'react';
import { GameItem, TabType } from '../types';
import {
  Search,
  Gamepad2,
  Bot,
  Clapperboard,
  Music2,
  MessageSquare,
  Plus,
  LayoutGrid,
  ExternalLink,
  Flame,
  ArrowRight,
  Globe,
  Star,
  Play,
  Sparkles,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface HomeSearchScreenProps {
  games: GameItem[];
  onLaunchGame: (game: GameItem) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenCustomModal: () => void;
  soundEnabled: boolean;
  onLockEdu?: () => void;
}

export const HomeSearchScreen: React.FC<HomeSearchScreenProps> = ({
  games,
  onLaunchGame,
  onNavigateTab,
  onOpenCustomModal,
  soundEnabled,
  onLockEdu
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<'ddg' | 'google' | 'bing'>('ddg');
  const [allAppsOpen, setAllAppsOpen] = useState(false);

  // Filter games based on search query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return games
      .filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
      .slice(0, 6);
  }, [games, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    playSound('click', soundEnabled);

    // If query is an exact URL, open it
    if (q.startsWith('http://') || q.startsWith('https://')) {
      window.open(q, '_blank', 'noopener,noreferrer');
      return;
    }

    // Direct game match launch
    if (searchResults.length === 1) {
      onLaunchGame(searchResults[0]);
      return;
    }

    // Web Search fallback
    let url = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
    if (searchEngine === 'google') {
      url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    } else if (searchEngine === 'bing') {
      url = `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Trending / Featured games on the Safezone home screen
  const featuredGames = useMemo(() => {
    const popularIds = ['friday_night_funkin', 'fnf_arcade', 'stickman_hook', 'subway_surfers', 'drive_mad', 'retro_bowl'];
    const list = games.filter(g => popularIds.includes(g.id));
    return list.length > 0 ? list : games.slice(0, 6);
  }, [games]);

  const appShortcuts = [
    {
      id: 'games',
      label: 'Games',
      icon: <Gamepad2 className="w-5 h-5 text-blue-400" />,
      action: () => {
        playSound('click', soundEnabled);
        onNavigateTab('games');
      }
    },
    {
      id: 'ai',
      label: 'AI Study',
      icon: <Bot className="w-5 h-5 text-blue-400" />,
      action: () => {
        playSound('click', soundEnabled);
        onNavigateTab('chat');
      }
    },
    {
      id: 'movies',
      label: 'Media',
      icon: <Clapperboard className="w-5 h-5 text-blue-400" />,
      action: () => {
        playSound('click', soundEnabled);
        onNavigateTab('movies');
      }
    },
    {
      id: 'music',
      label: 'Spotify',
      icon: <Music2 className="w-5 h-5 text-blue-400" />,
      action: () => {
        playSound('click', soundEnabled);
        onNavigateTab('music');
      }
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      action: () => {
        playSound('click', soundEnabled);
        onNavigateTab('chat');
      }
    },
    {
      id: 'add',
      label: 'Add Game',
      icon: <Plus className="w-5 h-5 text-blue-400" />,
      action: () => {
        playSound('click', soundEnabled);
        onOpenCustomModal();
      }
    },
    {
      id: 'all_apps',
      label: 'All Apps',
      icon: <LayoutGrid className="w-5 h-5 text-blue-400" />,
      action: () => {
        playSound('click', soundEnabled);
        setAllAppsOpen(true);
      }
    }
  ];

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center relative select-none px-4 py-8">
      {/* Soft Ambient Radial Blue Glow Behind Logo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Center Hero Block */}
      <div className="w-full max-w-2xl flex flex-col items-center text-center relative z-10 mb-6">
        {/* Glow halo & Safezone Logo with Blue Letters */}
        <div className="relative mb-3 flex flex-col items-center">
          <div className="absolute inset-0 bg-blue-500/25 blur-3xl rounded-full scale-125 pointer-events-none animate-pulse" />
          
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight flex items-center justify-center gap-1 sm:gap-1.5 cursor-default select-none safezone-glow">
            {'Safezone'.split('').map((letter, index) => (
              <span
                key={index}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-blue-300 via-blue-400 to-blue-600 blue-letter-glow hover:scale-110 hover:-translate-y-1 transition-all duration-200"
                style={{
                  textShadow: '0 0 20px rgba(59,130,246,0.85), 0 0 40px rgba(37,99,235,0.5)',
                  animationDelay: `${index * 50}ms`
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Subtitle / Tagline in crisp blue tone */}
        <p className="text-sm sm:text-base font-medium text-blue-200/80 tracking-wide mb-8 flex items-center gap-2">
          <span>Stealth Unblocked Vault &amp; Browser</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
          <span className="text-cyan-400 font-mono text-xs">READY</span>
        </p>

        {/* Pill Search Box with Blue Accents */}
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <div className="relative flex items-center">
            <div className="absolute left-4.5 text-blue-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search unblocked games or web..."
              className="w-full py-3.5 pl-12 pr-28 rounded-full bg-[#0a1120]/90 border border-blue-500/30 text-white placeholder-blue-200/40 text-sm sm:text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all"
            />

            {/* Quick Engine Selector Pill */}
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950/40 transition cursor-pointer flex items-center gap-1"
                >
                  <span>Go</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Instant Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-[#08101e]/95 border border-blue-500/30 rounded-2xl shadow-2xl backdrop-blur-xl z-30 text-left animate-in fade-in slide-in-from-top-2">
              <div className="text-[11px] font-bold text-blue-300/70 uppercase tracking-widest px-2 mb-2 flex items-center justify-between">
                <span>Matching Games &amp; Apps</span>
                <span>{searchResults.length} found</span>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-1.5">
                  {searchResults.map(game => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => onLaunchGame(game)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-500/15 transition cursor-pointer group text-left border border-transparent hover:border-blue-500/25"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={game.thumbnail}
                          alt={game.title}
                          className="w-9 h-9 rounded-lg object-cover bg-black/40 border border-blue-500/20 shrink-0"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                            <span>{game.title}</span>
                            {game.id.includes('fnf') && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold border border-blue-500/30">
                                FNF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{game.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">No built-in games named "{searchQuery}".</p>
                  <button
                    type="submit"
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                  >
                    Search the web with {searchEngine.toUpperCase()} &rarr;
                  </button>
                </div>
              )}

              {/* Web search footer shortcut */}
              <div className="pt-2.5 mt-2 border-t border-blue-500/15 flex items-center justify-between text-xs text-slate-400 px-2">
                <span>Press <strong className="text-white">Enter</strong> to search web</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchEngine('ddg')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      searchEngine === 'ddg' ? 'bg-blue-600 text-white' : 'hover:text-white'
                    }`}
                  >
                    DDG
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchEngine('google')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      searchEngine === 'google' ? 'bg-blue-600 text-white' : 'hover:text-white'
                    }`}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchEngine('bing')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      searchEngine === 'bing' ? 'bg-blue-600 text-white' : 'hover:text-white'
                    }`}
                  >
                    Bing
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Circular App Launcher Row (with Default Blue Styling) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10">
          {appShortcuts.map(app => (
            <button
              key={app.id}
              onClick={app.action}
              className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0d1627]/85 border border-blue-500/25 group-hover:border-blue-400 group-hover:bg-blue-600/20 flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-lg shadow-black/40 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                {app.icon}
              </div>
              <span className="text-xs font-semibold text-blue-200/80 group-hover:text-white transition-colors tracking-wide">
                {app.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Jump / Trending Games Row */}
      <div className="w-full max-w-4xl mt-10 pt-8 border-t border-blue-500/15">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Featured Games</h3>
          </div>
          <button
            onClick={() => onNavigateTab('games')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({games.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {featuredGames.map(game => (
            <button
              key={game.id}
              onClick={() => {
                playSound('click', soundEnabled);
                onLaunchGame(game);
              }}
              className="bg-[#0b1222]/80 hover:bg-blue-500/10 border border-blue-500/15 hover:border-blue-400/40 rounded-xl p-2.5 flex flex-col justify-between text-left transition-all duration-200 group cursor-pointer hover:shadow-lg hover:shadow-blue-950/40"
            >
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/50 mb-2 border border-blue-500/10 relative">
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {game.id.includes('fnf') && (
                  <span className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-600/90 font-black text-white">
                    FNF
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                  {game.title}
                </h4>
                <span className="text-[10px] text-slate-400 capitalize">{game.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* All Apps Modal Drawer */}
      {allAppsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#091120] border border-blue-500/30 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black text-white">Safezone App Suite</h3>
              </div>
              <button
                onClick={() => setAllAppsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setAllAppsOpen(false);
                  onNavigateTab('games');
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-400 text-left transition cursor-pointer"
              >
                <Gamepad2 className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Games Hub</h4>
                <p className="text-[11px] text-slate-400 mt-1">Friday Night Funkin, Retro Bowl, Subway Surfers, and 30+ titles</p>
              </button>

              <button
                onClick={() => {
                  setAllAppsOpen(false);
                  onNavigateTab('chat');
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-400 text-left transition cursor-pointer"
              >
                <Bot className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm text-white">AI Study Assistant</h4>
                <p className="text-[11px] text-slate-400 mt-1">Homework help, math solvers, and curriculum tutor</p>
              </button>

              <button
                onClick={() => {
                  setAllAppsOpen(false);
                  onNavigateTab('movies');
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-400 text-left transition cursor-pointer"
              >
                <Clapperboard className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Media Hub</h4>
                <p className="text-[11px] text-slate-400 mt-1">Curated streaming links and media player tools</p>
              </button>

              <button
                onClick={() => {
                  setAllAppsOpen(false);
                  onNavigateTab('music');
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-400 text-left transition cursor-pointer"
              >
                <Music2 className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Spotify Web Player</h4>
                <p className="text-[11px] text-slate-400 mt-1">Unblocked music streaming, top playlists, and lo-fi beats</p>
              </button>

              <button
                onClick={() => {
                  setAllAppsOpen(false);
                  onOpenCustomModal();
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-400 text-left transition cursor-pointer"
              >
                <Plus className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Add Custom Game</h4>
                <p className="text-[11px] text-slate-400 mt-1">Embed custom HTML5 games or web links</p>
              </button>

              <button
                onClick={() => {
                  setAllAppsOpen(false);
                  onNavigateTab('settings');
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-400 text-left transition cursor-pointer"
              >
                <Sparkles className="w-6 h-6 text-blue-400 mb-2" />
                <h4 className="font-bold text-sm text-white">Settings &amp; Cloaks</h4>
                <p className="text-[11px] text-slate-400 mt-1">Google Sites HTML export, Tab Cloaking, Themes</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
