import React, { useState, useRef, useEffect } from 'react';
import {
  Music2,
  Play,
  Pause,
  ExternalLink,
  Shield,
  Radio,
  Search,
  Check,
  Disc3,
  Headphones,
  Sliders,
  Volume2,
  Sparkles,
  Zap,
  Globe,
  Flame,
  Layers
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { openAboutBlank, openStealthBlobWindow } from '../utils/cloakPresets';

interface MusicTabProps {
  soundEnabled: boolean;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  category: string;
  embedUri: string;
  desc: string;
  directUrl: string;
}

const SPOTIFY_FEATURED: SpotifyPlaylist[] = [
  {
    id: 'top_hits',
    name: "Today's Top Hits",
    category: 'Trending',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
    desc: 'The hottest tracks right now across all genres updated live.',
    directUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M'
  },
  {
    id: 'lofi_study',
    name: 'Lo-Fi Beats (Study & Focus)',
    category: 'Study & Chill',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    desc: 'Chill beats, soft kicks, and relaxing lo-fi loops for homework & gaming.',
    directUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM'
  },
  {
    id: 'gaming_energy',
    name: 'Gaming Beats & EDM Energy',
    category: 'Gaming',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdfOcg1SlKTU?utm_source=generator&theme=0',
    desc: 'High-octane electronic, synthwave, and trap for gaming sessions.',
    directUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdfOcg1SlKTU'
  },
  {
    id: 'rap_caviar',
    name: 'RapCaviar',
    category: 'Hip-Hop',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0',
    desc: 'The pinnacle of modern hip-hop, drill, and lyrical bangers.',
    directUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd'
  },
  {
    id: 'chill_vibes',
    name: 'Chill Hits',
    category: 'Relax',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator&theme=0',
    desc: 'Kick back to smooth indie, acoustica, and mellow chart-toppers.',
    directUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcn6'
  },
  {
    id: 'synthwave',
    name: 'Synthwave & Retrowave',
    category: 'Retro',
    embedUri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXd9rSDyQguIk?utm_source=generator&theme=0',
    desc: 'Neon 80s arpeggios, cyberpunk night drives, and analog basslines.',
    directUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXd9rSDyQguIk'
  }
];

// Offline fallback synthesizer stations
const CHIPTUNE_STATIONS = [
  {
    id: 'cyber_groove',
    title: 'Neon Midnight Synth',
    genre: 'Chiptune / Cyberwave',
    bpm: 124,
    notes: [261.63, 329.63, 392.0, 523.25, 493.88, 392.0, 329.63, 293.66]
  },
  {
    id: 'lofi_study',
    title: 'Study Room Lo-Fi Chords',
    genre: 'Lo-Fi Chill & Beats',
    bpm: 88,
    notes: [220.0, 261.63, 329.63, 440.0, 349.23, 261.63, 220.0, 196.0]
  },
  {
    id: 'arcade_rush',
    title: 'Arcade Rush 8-Bit',
    genre: 'Retro 8-Bit Video Game',
    bpm: 140,
    notes: [440.0, 554.37, 659.25, 880.0, 783.99, 659.25, 554.37, 493.88]
  }
];

export const MusicTab: React.FC<MusicTabProps> = ({ soundEnabled }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist>(SPOTIFY_FEATURED[0]);
  const [customSpotifyUrl, setCustomSpotifyUrl] = useState('');
  const [activeEmbedUrl, setActiveEmbedUrl] = useState<string>(SPOTIFY_FEATURED[0].embedUri);
  const [showSynthFallback, setShowSynthFallback] = useState(false);

  // Offline synth state
  const [activeStation, setActiveStation] = useState(0);
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentStation = CHIPTUNE_STATIONS[activeStation];

  const handleLaunchSpotifyDirect = () => {
    playSound('click', soundEnabled);
    window.open('https://open.spotify.com', '_blank', 'noopener,noreferrer');
  };

  const handleLaunchSpotifyAboutBlank = () => {
    playSound('score', soundEnabled);
    openAboutBlank(
      'https://open.spotify.com',
      'Spotify - Web Player: Music for everyone',
      'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico'
    );
  };

  const handleLaunchSpotifyBlob = () => {
    playSound('score', soundEnabled);
    openStealthBlobWindow(
      'https://open.spotify.com',
      'Spotify - Web Player: Music for everyone',
      'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico'
    );
  };

  const handleSelectPlaylist = (p: SpotifyPlaylist) => {
    playSound('click', soundEnabled);
    setSelectedPlaylist(p);
    setActiveEmbedUrl(p.embedUri);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSpotifyUrl.trim();
    if (!clean) return;

    playSound('score', soundEnabled);

    // Convert standard Spotify web URL to embed URL
    // e.g. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M -> https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M
    let embed = clean;
    if (clean.includes('open.spotify.com') && !clean.includes('/embed/')) {
      embed = clean.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
    setActiveEmbedUrl(embed);
  };

  // Synthesizer logic (for 100% offline fallback)
  const playSynthNote = (freq: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {}
  };

  useEffect(() => {
    if (!isSynthPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = (60 / currentStation.bpm) * 1000 * 0.5;
    let step = 0;

    timerRef.current = setInterval(() => {
      const noteFreq = currentStation.notes[step % currentStation.notes.length];
      playSynthNote(noteFreq);
      setActiveStep(step % currentStation.notes.length);
      step++;
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSynthPlaying, activeStation, soundEnabled]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Spotify Top Banner & Stealth Launchers */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#091122]/90 border border-blue-500/25 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1db954] flex items-center justify-center text-black shadow-lg shadow-[#1db954]/30 shrink-0">
            {/* Spotify SVG Logo */}
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1db954]/20 border border-[#1db954]/30 text-[#1db954] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Official Spotify Integration</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Spotify Web Player</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30 font-normal">
                UNBLOCKED
              </span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Stream millions of songs and podcasts directly inside Safezone or launch cloaked in about:blank
            </p>
          </div>
        </div>

        {/* Unblocked Stealth Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleLaunchSpotifyAboutBlank}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95"
            title="Launch Spotify in an unblocked about:blank tab cloaked as Google Classroom (bypasses school firewalls)"
          >
            <Shield className="w-4 h-4 text-cyan-300" />
            <span>Unblocked About:Blank</span>
          </button>

          <button
            onClick={handleLaunchSpotifyBlob}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Launch Spotify in a stealth blob: window"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Blob Stealth</span>
          </button>

          <button
            onClick={handleLaunchSpotifyDirect}
            className="px-3.5 py-2.5 rounded-xl bg-[#1db954] hover:bg-[#1aa34a] text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#1db954]/20 transition cursor-pointer active:scale-95"
            title="Open Spotify Web Player directly"
          >
            <span>Open Spotify</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Playlist Selector Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">Featured Spotify Playlists</h3>
          </div>
          <span className="text-xs text-slate-400">Click any station to switch embed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {SPOTIFY_FEATURED.map(p => {
            const isSelected = selectedPlaylist.id === p.id && activeEmbedUrl === p.embedUri;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPlaylist(p)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-[#0a1120]/80 border-blue-500/15 hover:border-blue-400/40 text-slate-300 hover:text-white'
                }`}
              >
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-400 block mb-1">
                    {p.category}
                  </span>
                  <h4 className="text-xs font-bold line-clamp-1 group-hover:text-blue-300 transition-colors">
                    {p.name}
                  </h4>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Stream</span>
                  {isSelected ? (
                    <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
                  ) : (
                    <Play className="w-2.5 h-2.5 fill-current opacity-60 group-hover:opacity-100" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Spotify Player Window */}
      <div className="bg-[#0a1120] border border-blue-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-blue-500/15">
          <div className="flex items-center gap-3">
            <Disc3 className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{selectedPlaylist.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  LIVE STREAM
                </span>
              </h2>
              <p className="text-xs text-slate-400">{selectedPlaylist.desc}</p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAboutBlank(selectedPlaylist.directUrl, selectedPlaylist.name)}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Cloak This Playlist</span>
            </button>

            <button
              onClick={() => window.open(selectedPlaylist.directUrl, '_blank', 'noopener,noreferrer')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Open on Spotify</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The Real Spotify Iframe Embed with full unblocked sandbox permissions */}
        <div className="w-full rounded-xl overflow-hidden bg-black/60 border border-white/5 shadow-inner">
          <iframe
            key={activeEmbedUrl}
            src={activeEmbedUrl}
            title="Spotify Embedded Player"
            width="100%"
            height="380"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full rounded-xl"
          />
        </div>

        {/* Custom Spotify URL Input */}
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-4 border-t border-blue-500/15 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customSpotifyUrl}
              onChange={e => setCustomSpotifyUrl(e.target.value)}
              placeholder="Paste any Spotify song, album, or playlist link here..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#060b17] border border-blue-500/25 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Load Spotify Link</span>
          </button>
        </form>
      </div>

      {/* Offline Synthesizer & Zero-Network Music Player Accordion */}
      <div className="bg-[#091120] border border-blue-500/15 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>100% Offline 8-Bit Synthesizer Backup</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono border border-blue-500/20 font-normal">
                  NO INTERNET NEEDED
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Zero bandwidth audio synthesis that works on any school network without internet</p>
            </div>
          </div>

          <button
            onClick={() => setShowSynthFallback(!showSynthFallback)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
          >
            {showSynthFallback ? 'Hide Synth' : 'Show Synth'}
          </button>
        </div>

        {showSynthFallback && (
          <div className="mt-4 pt-4 border-t border-blue-500/15 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  {currentStation.genre} • {currentStation.bpm} BPM
                </span>
                <h4 className="text-base font-bold text-white">{currentStation.title}</h4>
              </div>

              <div className="flex items-center gap-2">
                {CHIPTUNE_STATIONS.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setActiveStation(idx);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeStation === idx
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    Track {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setIsSynthPlaying(p => !p);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isSynthPlaying
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-slate-200 hover:text-white'
                  }`}
                >
                  {isSynthPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isSynthPlaying ? 'Pause' : 'Play Synth'}</span>
                </button>
              </div>
            </div>

            {/* Step Sequencer */}
            <div className="grid grid-cols-8 gap-2">
              {currentStation.notes.map((note, idx) => {
                const isCurrent = isSynthPlaying && activeStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => playSynthNote(note)}
                    className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-400 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                        : 'bg-white/5 border-white/5 hover:border-blue-500/40 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{Math.round(note)}</span>
                    <span className="text-[9px] text-slate-400">Hz</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
