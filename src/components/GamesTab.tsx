import React, { useState, useMemo } from 'react';
import { GameItem, GameCategory } from '../types';
import {
  Search,
  Star,
  Play,
  Maximize,
  RotateCcw,
  X,
  Plus,
  Gamepad2,
  SlidersHorizontal,
  ExternalLink,
  Flame,
  Info,
  Shield
} from 'lucide-react';
import { TetrisGame } from './games/TetrisGame';
import { Game2048 } from './games/Game2048';
import { SnakeGame } from './games/SnakeGame';
import { FlappyBirdGame } from './games/FlappyBirdGame';
import { BreakoutGame } from './games/BreakoutGame';
import { SpaceDefendersGame } from './games/SpaceDefendersGame';
import { DinoRunnerGame } from './games/DinoRunnerGame';
import { MinesweeperGame } from './games/MinesweeperGame';
import { CookieClickerGame } from './games/CookieClickerGame';
import { ConnectFourGame } from './games/ConnectFourGame';
import { FNFGame } from './games/FNFGame';
import { openAboutBlank, openStealthBlobWindow } from '../utils/cloakPresets';
import { playSound } from '../utils/audio';

interface GamesTabProps {
  games: GameItem[];
  favoriteGames: string[];
  onToggleFavorite: (id: string) => void;
  onAddCustomGame: (game: GameItem) => void;
  soundEnabled: boolean;
  onGamePlayScore?: (gameId: string, score: number) => void;
  launchGameId?: string | null;
  onClearLaunchGameId?: () => void;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  games,
  favoriteGames,
  onToggleFavorite,
  onAddCustomGame,
  soundEnabled,
  onGamePlayScore,
  launchGameId,
  onClearLaunchGameId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Auto-launch if launchGameId passed
  React.useEffect(() => {
    if (launchGameId) {
      const g = games.find(item => item.id === launchGameId);
      if (g) {
        setActiveGame(g);
        onClearLaunchGameId?.();
      }
    }
  }, [launchGameId, games, onClearLaunchGameId]);

  // Custom game form
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customCategory, setCustomCategory] = useState<GameCategory>('arcade');
  const [customDesc, setCustomDesc] = useState('');

  const categories: { id: GameCategory; label: string }[] = [
    { id: 'all', label: 'All Games' },
    { id: 'fnf', label: '🎤 FNF' },
    { id: 'favorites', label: '⭐ Favorites' },
    { id: 'retro', label: 'Retro' },
    { id: 'arcade', label: 'Arcade' },
    { id: 'puzzle', label: 'Puzzle' },
    { id: 'action', label: 'Action' },
    { id: 'casual', label: 'Casual' }
  ];

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'favorites') return favoriteGames.includes(game.id);
      if (selectedCategory === 'fnf') return game.id.includes('fnf') || game.id.includes('friday_night_funkin');
      return game.category === selectedCategory;
    });
  }, [games, searchQuery, selectedCategory, favoriteGames]);

  const handleLaunchGame = (game: GameItem) => {
    playSound('click', soundEnabled);
    setActiveGame(game);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customUrl) return;

    let cleanUrl = customUrl.trim();
    const iframeSrcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
    if (iframeSrcMatch) {
      cleanUrl = iframeSrcMatch[1];
    }

    const newGame: GameItem = {
      id: `custom_${Date.now()}`,
      title: customTitle,
      category: customCategory,
      description: customDesc || 'Custom loaded unblocked web game.',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      type: 'embed',
      embedUrl: cleanUrl,
      instructions: 'Controls determined by the embedded game application.',
      controls: ['Standard mouse & keyboard bindings'],
      isCustom: true
    };

    onAddCustomGame(newGame);
    setIsCustomModalOpen(false);
    setCustomTitle('');
    setCustomUrl('');
    setCustomDesc('');
    setActiveGame(newGame);
  };

  const renderActiveGameComponent = () => {
    if (!activeGame) return null;

    if (activeGame.type === 'canvas') {
      switch (activeGame.componentId) {
        case 'tetris':
          return <TetrisGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('tetris', s)} />;
        case '2048':
          return <Game2048 soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('2048', s)} />;
        case 'snake':
          return <SnakeGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('snake', s)} />;
        case 'flappy':
          return <FlappyBirdGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('flappy', s)} />;
        case 'breakout':
          return <BreakoutGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('breakout', s)} />;
        case 'space_defenders':
          return <SpaceDefendersGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('space_defenders', s)} />;
        case 'dino_runner':
          return <DinoRunnerGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('dino_runner', s)} />;
        case 'minesweeper':
          return <MinesweeperGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('minesweeper', s)} />;
        case 'cookie_clicker':
          return <CookieClickerGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('cookie_clicker', s)} />;
        case 'connect_four':
          return <ConnectFourGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('connect_four', s)} />;
        case 'fnf_arcade':
          return <FNFGame soundEnabled={soundEnabled} onScoreUpdate={s => onGamePlayScore?.('fnf_arcade', s)} />;
        default:
          return <TetrisGame soundEnabled={soundEnabled} />;
      }
    } else {
      // Embed iframe with unblocked sandbox permissions & no-referrer
      return (
        <div className="w-full h-[75vh] min-h-[520px] bg-black rounded-xl overflow-hidden border border-white/10 relative">
          <iframe
            id="iframehtml5"
            width="100%"
            height="100%"
            src={activeGame.embedUrl}
            title={activeGame.title}
            frameBorder="0"
            scrolling="no"
            className="iframe-default w-full h-full border-0"
            allowFullScreen
            referrerPolicy="no-referrer"
            allow="fullscreen; gamepad; autoplay; screen-wake-lock; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-downloads allow-modals"
          />
        </div>
      );
    }
  };

  return (
    <div id="games-tab-section" className="space-y-8 relative z-10">
      {/* Immersive UI Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Games Hub</h1>
          <p className="text-slate-400 mt-1">High-speed getaway thrillers and unblocked titles with zero trackers</p>
        </div>

        {/* Category Pills & Action */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/20 text-slate-300 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0f1d] p-3 rounded-2xl border border-blue-500/15 shadow-lg">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#060b17] rounded-xl border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(37,99,235,0.35)] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Custom Game
          </button>
        </div>
      </div>

      {/* Games Catalog Grid in Immersive UI style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map(game => {
          const isFav = favoriteGames.includes(game.id);

          return (
            <div
              key={game.id}
              onClick={() => handleLaunchGame(game)}
              className="group cursor-pointer flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden mb-3 border border-white/5 group-hover:border-indigo-500/50 transition-all duration-300 shadow-xl relative">
                <img
                  src={game.thumbnail}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={e => {
                    // Fallback to a high-aesthetic placeholder if an external CDN encounters an issue
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-indigo-400 border border-white/10 uppercase tracking-wider">
                    {game.category}
                  </span>
                  {game.isCustom && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-[10px] font-bold text-black uppercase">
                      Custom
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleFavorite(game.id);
                  }}
                  className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md border transition cursor-pointer ${
                    isFav
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-black/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Bookmark game"
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>

                {/* Play Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] transform scale-90 group-hover:scale-100 transition">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition mb-0.5">
                  {game.title}
                </h3>
                <p className="text-sm text-slate-500 italic">
                  {game.category.charAt(0).toUpperCase() + game.category.slice(1)} • {game.plays?.toLocaleString() || '2.4k'} Plays
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300 mb-1">No Games Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or explore another category.
          </p>
        </div>
      )}

      {/* Active Game Modal / Stage */}
      {activeGame && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0a0c16] border border-white/10 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#05060b]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-black text-lg text-white">{activeGame.title}</h3>
                <span className="text-xs text-indigo-400 uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-600/10 border border-indigo-500/20 font-bold">
                  {activeGame.category}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openAboutBlank(activeGame.embedUrl || window.location.href, activeGame.title)}
                  className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
                  title="Open game in an unblocked about:blank cloaked tab (bypasses school firewalls & hides URL)"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Unblock About:Blank</span>
                </button>

                <button
                  onClick={() => openStealthBlobWindow(activeGame.embedUrl || window.location.href, activeGame.title)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition hidden sm:flex"
                  title="Open game in an unblocked stealth blob URL"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Stealth Blob</span>
                </button>

                {activeGame.embedUrl && (
                  <button
                    onClick={() => window.open(activeGame.embedUrl, '_blank', 'noopener,noreferrer')}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-lg text-xs cursor-pointer"
                    title="Open direct game mirror link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    const el = document.getElementById('active-game-canvas-area');
                    if (el) el.requestFullscreen().catch(() => {});
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveGame(null)}
                  className="p-1.5 bg-white/5 hover:bg-blue-600 border border-white/10 text-slate-300 hover:text-white rounded-lg cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Game Canvas / Component Container */}
            <div
              id="active-game-canvas-area"
              className="p-4 bg-[#05060b] flex items-center justify-center min-h-[460px] overflow-auto"
            >
              {renderActiveGameComponent()}
            </div>

            {/* Game Controls & Instructions footer with Unblock Status */}
            <div className="px-5 py-3 bg-[#05060b] border-t border-white/5 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{activeGame.instructions}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  UNBLOCKED
                </span>
                {activeGame.controls.map((ctrl, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[11px] font-mono">
                    {ctrl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Game Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0c16] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Add Custom Web Game
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Game Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Retro Space Blaster"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#05060b] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Game Embed URL or IFrame Code</label>
                <input
                  type="text"
                  required
                  placeholder="https://... or paste <iframe ...> snippet"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#05060b] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Supports direct HTTPS web game links or pasted iframe embed code.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value as GameCategory)}
                  className="w-full px-3.5 py-2 bg-[#05060b] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="arcade">Arcade</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="retro">Retro</option>
                  <option value="action">Action</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My favorite web arcade game"
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#05060b] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                >
                  Add to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
