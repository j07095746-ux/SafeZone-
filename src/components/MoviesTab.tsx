import React, { useState, useMemo } from 'react';
import { MovieItem } from '../types';
import {
  Film,
  Search,
  Play,
  Heart,
  Maximize,
  X,
  Plus,
  Tv,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { openAboutBlank } from '../utils/cloakPresets';

interface MoviesTabProps {
  movies: MovieItem[];
  favoriteMovies: string[];
  onToggleFavorite: (id: string) => void;
  onAddCustomMovie: (movie: MovieItem) => void;
  soundEnabled: boolean;
}

export const MoviesTab: React.FC<MoviesTabProps> = ({
  movies,
  favoriteMovies,
  onToggleFavorite,
  onAddCustomMovie,
  soundEnabled
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [activeMovie, setActiveMovie] = useState<MovieItem | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Custom movie form
  const [customTitle, setCustomTitle] = useState('');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [customDuration, setCustomDuration] = useState('15m 00s');
  const [customDesc, setCustomDesc] = useState('');

  const genres = ['all', 'favorites', 'Animation', 'Sci-Fi', 'Fantasy', 'Nature', 'Action'];

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedGenre === 'all') return true;
      if (selectedGenre === 'favorites') return favoriteMovies.includes(movie.id);
      return movie.genre.includes(selectedGenre);
    });
  }, [movies, searchQuery, selectedGenre, favoriteMovies]);

  const handlePlayMovie = (movie: MovieItem) => {
    playSound('click', soundEnabled);
    setActiveMovie(movie);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customVideoUrl) return;

    const newMovie: MovieItem = {
      id: `custom_movie_${Date.now()}`,
      title: customTitle,
      year: new Date().getFullYear(),
      duration: customDuration || 'Streaming',
      category: 'custom',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
      description: customDesc || 'Custom loaded streaming video.',
      videoUrl: customVideoUrl,
      genre: ['Stream', 'Cinema'],
      isCustom: true
    };

    onAddCustomMovie(newMovie);
    setIsCustomModalOpen(false);
    setCustomTitle('');
    setCustomVideoUrl('');
    setCustomDesc('');
    setActiveMovie(newMovie);
  };

  return (
    <div id="movies-tab-section" className="space-y-8 relative z-10">
      {/* Immersive UI Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Movies & Cinema</h1>
          <p className="text-slate-400 mt-1">Curated public domain classics, animated shorts, and custom web streams</p>
        </div>

        {/* Category / Genre Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {genres.map(genre => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/20 text-slate-300 hover:text-white'
                }`}
              >
                {genre === 'all' ? 'All Cinema' : genre === 'favorites' ? '❤️ Watchlist' : genre}
              </button>
            );
          })}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0c16] p-3 rounded-2xl border border-white/5 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search movies & streams..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#05060b] rounded-xl border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Custom Stream
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map(movie => {
          const isFav = favoriteMovies.includes(movie.id);

          return (
            <div
              key={movie.id}
              onClick={() => handlePlayMovie(movie)}
              className="group cursor-pointer flex flex-col justify-between"
            >
              {/* Poster Container */}
              <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden mb-3 border border-white/5 group-hover:border-indigo-500/50 transition-all duration-300 shadow-xl relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />

                {/* Duration & Year Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 flex items-center gap-1.5 border border-white/10">
                    <Clock className="w-3 h-3 text-indigo-400" /> {movie.duration}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-400 border border-white/10">
                    {movie.year}
                  </span>
                </div>

                {/* Watchlist toggle */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleFavorite(movie.id);
                  }}
                  className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md border transition cursor-pointer ${
                    isFav
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-black/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Add to Watchlist"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>

                {/* Play hover trigger */}
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)] transform scale-90 group-hover:scale-100 transition">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Movie info */}
              <div>
                <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition mb-0.5">
                  {movie.title}
                </h3>
                <p className="text-sm text-slate-500 italic">
                  {movie.genre.join(', ')} • {movie.year}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Movie Player Modal */}
      {activeMovie && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0a0c16] border border-white/10 rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col">
            {/* Player Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#05060b]">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-base text-white">{activeMovie.title}</h3>
                <span className="text-xs text-slate-400">({activeMovie.year})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAboutBlank()}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  title="Watch in cloaked tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">About:Blank</span>
                </button>
                <button
                  onClick={() => setActiveMovie(null)}
                  className="p-1.5 bg-white/5 hover:bg-rose-600 border border-white/10 text-slate-300 hover:text-white rounded-lg cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activeMovie.videoUrl ? (
                <video
                  src={activeMovie.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : activeMovie.embedUrl ? (
                <iframe
                  src={activeMovie.embedUrl}
                  title={activeMovie.title}
                  className="w-full h-full border-none"
                  allow="autoplay; fullscreen; encrypted-media"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <div className="text-slate-400 text-sm">Video source unavailable</div>
              )}
            </div>

            {/* Metadata footer */}
            <div className="p-4 bg-[#05060b] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-300 max-w-2xl">{activeMovie.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {activeMovie.genre.map((g, i) => (
                    <span key={i} className="text-[10px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded">
                      {g}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-400">Duration: {activeMovie.duration}</span>
                </div>
              </div>

              <button
                onClick={() => onToggleFavorite(activeMovie.id)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Heart
                  className={`w-4 h-4 ${favoriteMovies.includes(activeMovie.id) ? 'fill-rose-500 text-rose-500' : ''}`}
                />
                {favoriteMovies.includes(activeMovie.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Video Stream Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" /> Add Custom Video Stream
              </h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Movie / Stream Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Anime Episode / Sci-Fi Short"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Video Stream URL (MP4 / WebM)</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/video.mp4"
                  value={customVideoUrl}
                  onChange={e => setCustomVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Direct MP4 or streaming video link.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 24m 10s"
                  value={customDuration}
                  onChange={e => setCustomDuration(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Brief synopsis"
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save & Play
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
