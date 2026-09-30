import React, { useState } from 'react';
import { Clapperboard, ExternalLink, Play, Film, Search, Star, Sparkles } from 'lucide-react';
import { playSound } from '../utils/audio';

interface MoviesTabProps {
  soundEnabled: boolean;
}

const STREAMING_PORTALS = [
  {
    id: 'fmovies',
    title: 'FMovies Portal',
    desc: 'Extensive library of high-definition movies, trending releases, and TV series with multiple mirror streams.',
    url: 'https://fmovies.ps/',
    badge: 'Popular HD',
    genre: 'General & Trending'
  },
  {
    id: 'cineby',
    title: 'Cineby Unblocked',
    desc: 'Clean, ad-light streaming interface featuring current box office releases, animation, and indie cinema.',
    url: 'https://cineby.app/',
    badge: 'Clean UI',
    genre: 'Cinema & Series'
  },
  {
    id: 'moviesjoy',
    title: 'MoviesJoy Media',
    desc: 'Fast streaming servers, subtitles support, and zero registration requirements for mobile and desktop.',
    url: 'https://moviesjoy.is/',
    badge: 'Fast Servers',
    genre: 'All Genres'
  },
  {
    id: 'solarmovie',
    title: 'SolarMovie Mirrors',
    desc: 'Classic streaming catalog with filterable search by release year, IMDb ratings, and country of origin.',
    url: 'https://solarmovie.pe/',
    badge: 'Full Catalog',
    genre: 'Filterable'
  },
  {
    id: 'archive_cinema',
    title: 'Internet Archive Feature Films',
    desc: 'Over 200,000 public domain, vintage, classic horror, and film noir masterpieces free of copyright restrictions.',
    url: 'https://archive.org/details/moviesandfilms',
    badge: '100% Free & Legal',
    genre: 'Classics & Vault'
  },
  {
    id: 'youtube_unblocked',
    title: 'Invidious Video Proxy',
    desc: 'Lightweight privacy-friendly YouTube frontend with no tracking, no age-gates, and zero ads.',
    url: 'https://yewtu.be/',
    badge: 'Video Proxy',
    genre: 'Videos & Streams'
  }
];

export const MoviesTab: React.FC<MoviesTabProps> = ({ soundEnabled }) => {
  const [query, setQuery] = useState('');

  const filtered = STREAMING_PORTALS.filter(
    p => p.title.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleOpen = (url: string) => {
    playSound('click', soundEnabled);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
            <Clapperboard className="w-3.5 h-3.5 text-blue-400" /> Media &amp; Streaming Hub
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Movies &amp; Shows</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Direct access to unblocked cinema portals, video mirrors, and public domain archives</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search streaming mirrors..."
            className="w-full pl-9 pr-4 py-2 bg-[#0a1222] border border-blue-500/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(portal => (
          <div
            key={portal.id}
            className="bg-[#0b1324]/80 border border-blue-500/15 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-blue-950/40"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  {portal.badge}
                </span>
                <span className="text-xs text-slate-500">{portal.genre}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5 flex items-center gap-2">
                <Film className="w-4 h-4 text-blue-400" />
                <span>{portal.title}</span>
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {portal.desc}
              </p>
            </div>

            <button
              onClick={() => handleOpen(portal.url)}
              className="w-full py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Launch Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
