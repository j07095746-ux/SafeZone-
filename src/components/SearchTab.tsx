import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  Shield,
  BookOpen,
  Calculator,
  Code,
  Archive,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Lock
} from 'lucide-react';
import { openAboutBlank } from '../utils/cloakPresets';
import { playSound } from '../utils/audio';

interface SearchTabProps {
  soundEnabled: boolean;
}

interface SearchEngine {
  id: string;
  name: string;
  searchUrl: (q: string) => string;
  icon: string;
  badge: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'ddg',
    name: 'DuckDuckGo',
    searchUrl: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    icon: '🦆',
    badge: 'Stealth & No Trackers'
  },
  {
    id: 'google',
    name: 'Google',
    searchUrl: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    icon: '🔍',
    badge: 'Standard Engine'
  },
  {
    id: 'bing',
    name: 'Bing',
    searchUrl: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    icon: '🌐',
    badge: 'Microsoft Engine'
  },
  {
    id: 'wiki',
    name: 'Wikipedia',
    searchUrl: q => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
    icon: '📚',
    badge: 'Free Knowledge'
  }
];

const PRESET_PORTALS = [
  {
    name: 'Wikipedia Encyclopedia',
    desc: 'Unfiltered global encyclopedia database with over 6 million articles.',
    url: 'https://en.wikipedia.org',
    icon: <BookOpen className="w-5 h-5 text-blue-400" />,
    badge: 'Reference'
  },
  {
    name: 'Desmos Graphing Tool',
    desc: 'Advanced math graphing suite, geometry tools, and scientific calculations.',
    url: 'https://www.desmos.com/calculator',
    icon: <Calculator className="w-5 h-5 text-emerald-400" />,
    badge: 'STEM'
  },
  {
    name: 'Scratch Community MIT',
    desc: 'Interactive block coding community, animation creator, and user-made games.',
    url: 'https://scratch.mit.edu',
    icon: <Code className="w-5 h-5 text-amber-400" />,
    badge: 'Creative'
  },
  {
    name: 'Internet Archive',
    desc: 'Wayback Machine access to millions of archived historical websites and software.',
    url: 'https://archive.org',
    icon: <Archive className="w-5 h-5 text-cyan-400" />,
    badge: 'Library'
  },
  {
    name: 'CoolMath Games Portal',
    desc: 'Classic logic, puzzle, and skill-based educational gaming directory.',
    url: 'https://www.coolmathgames.com',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    badge: 'Logic'
  },
  {
    name: 'Khan Academy Courses',
    desc: 'Master courses in biology, chemistry, computer science, and calculus.',
    url: 'https://www.khanacademy.org',
    icon: <BookOpen className="w-5 h-5 text-blue-400" />,
    badge: 'Education'
  }
];

export const SearchTab: React.FC<SearchTabProps> = ({ soundEnabled }) => {
  const [query, setQuery] = useState('');
  const [activeEngine, setActiveEngine] = useState<string>('ddg');
  const [activeFrameUrl, setActiveFrameUrl] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'geometry dash lite',
    'python tutorial w3schools',
    'physics formula sheet'
  ]);

  const selectedEngine = SEARCH_ENGINES.find(e => e.id === activeEngine) || SEARCH_ENGINES[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    playSound('click', soundEnabled);
    const targetUrl = selectedEngine.searchUrl(query.trim());

    // Add to recents
    setRecentSearches(prev => [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 6));

    // If query is an exact URL, open or preview
    if (query.startsWith('http://') || query.startsWith('https://')) {
      setActiveFrameUrl(query);
    } else {
      // Open in new tab or stealth about:blank
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleQuickLaunch = (url: string) => {
    playSound('click', soundEnabled);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="search-tab-section" className="space-y-8 relative z-10">
      {/* Immersive UI Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Search & Portals</h1>
          <p className="text-slate-400 mt-1">Stealth web search with zero tracking, no referrer leaks, and cloaked tab launch</p>
        </div>

        {/* Engine Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {SEARCH_ENGINES.map(engine => (
            <button
              key={engine.id}
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveEngine(engine.id);
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer ${
                activeEngine === engine.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/20 text-slate-300 hover:text-white'
              }`}
            >
              <span>{engine.icon}</span>
              <span>{engine.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Search Bar Box */}
      <div className="bg-[#0a0c16] p-6 rounded-2xl border border-white/5 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
          <Search className="w-5 h-5 absolute left-4 text-indigo-400" />
          <input
            type="text"
            placeholder={`Search via ${selectedEngine.name} or type full URL (https://)...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-32 py-4 bg-[#05060b] rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm sm:text-base transition"
          />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(79,70,229,0.3)] transition active:scale-95"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
            <span className="text-xs text-slate-500 font-mono">Quick searches:</span>
            {recentSearches.map((rec, i) => (
              <button
                key={i}
                onClick={() => setQuery(rec)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs rounded-lg border border-white/5 cursor-pointer transition"
              >
                {rec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Embedded Preview Sandbox if active URL entered */}
      {activeFrameUrl && (
        <div className="bg-[#0a0c16] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#05060b] border-b border-white/5">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="truncate max-w-md font-mono">{activeFrameUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(activeFrameUrl, '_blank')}
                className="p-1.5 text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </button>
              <button
                onClick={() => setActiveFrameUrl(null)}
                className="p-1.5 text-slate-400 hover:text-blue-400 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
          <iframe
            src={activeFrameUrl}
            title="SafeZone Web Sandbox"
            className="w-full h-[65vh] bg-white border-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      )}

      {/* Preset Unblocked Educational & Utility Portals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" /> Curated Unblocked Portals
            </h2>
            <p className="text-xs text-slate-400">Popular whitelisted tools, encyclopedias, and creative sandbox suites.</p>
          </div>
          <button
            onClick={() => openAboutBlank()}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" /> Launch About:Blank
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRESET_PORTALS.map((portal, idx) => (
            <div
              key={idx}
              onClick={() => handleQuickLaunch(portal.url)}
              className="p-6 bg-[#0a0c16] rounded-2xl border border-white/5 group-hover:border-indigo-500/50 hover:border-indigo-500/40 shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-[#05060b] rounded-xl border border-white/10 group-hover:scale-105 transition-transform">
                    {portal.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                    {portal.badge}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition mb-1">
                  {portal.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {portal.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                <span className="text-slate-500 font-mono truncate max-w-[180px]">
                  {portal.url.replace('https://', '')}
                </span>
                <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
