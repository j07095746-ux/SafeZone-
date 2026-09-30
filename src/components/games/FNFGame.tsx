import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Play, Pause, Volume2, VolumeX, Sparkles, Trophy, Music, Flame, Zap } from 'lucide-react';

interface FNFGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

interface Note {
  id: number;
  lane: number; // 0: Left (purple), 1: Down (cyan), 2: Up (green), 3: Right (red)
  targetTime: number; // in seconds
  hit: boolean;
  missed: boolean;
  isOpponent?: boolean;
}

interface HitRating {
  text: string;
  color: string;
  score: number;
  time: number;
}

interface SongTrack {
  id: string;
  name: string;
  bpm: number;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  notes: { lane: number; beat: number; isOpponent?: boolean }[];
}

// Lane colors & arrows
const LANES = [
  { dir: 'left', key: 'D', altKey: 'ArrowLeft', color: '#c084fc', glow: '#a855f7', symbol: '◀' },
  { dir: 'down', key: 'F', altKey: 'ArrowDown', color: '#38bdf8', glow: '#0ea5e9', symbol: '▼' },
  { dir: 'up', key: 'J', altKey: 'ArrowUp', color: '#4ade80', glow: '#22c55e', symbol: '▲' },
  { dir: 'right', key: 'K', altKey: 'ArrowRight', color: '#f87171', glow: '#ef4444', symbol: '▶' }
];

// Predefined fun beat charts
const SONGS: SongTrack[] = [
  {
    id: 'bopeebo',
    name: 'Bopeebo (Week 1)',
    bpm: 100,
    difficulty: 'Normal',
    notes: [
      // Opponent calls, BF responds
      { lane: 0, beat: 4, isOpponent: true },
      { lane: 1, beat: 5, isOpponent: true },
      { lane: 2, beat: 6, isOpponent: true },
      { lane: 3, beat: 7, isOpponent: true },
      // Player turn!
      { lane: 0, beat: 8 },
      { lane: 1, beat: 9 },
      { lane: 2, beat: 10 },
      { lane: 3, beat: 11 },

      // Phrase 2
      { lane: 1, beat: 12, isOpponent: true },
      { lane: 1, beat: 13, isOpponent: true },
      { lane: 2, beat: 14, isOpponent: true },
      { lane: 0, beat: 15, isOpponent: true },
      { lane: 1, beat: 16 },
      { lane: 1, beat: 17 },
      { lane: 2, beat: 18 },
      { lane: 0, beat: 19 },

      // Chorus / Fast exchange
      { lane: 3, beat: 20, isOpponent: true },
      { lane: 2, beat: 21, isOpponent: true },
      { lane: 1, beat: 22, isOpponent: true },
      { lane: 3, beat: 23, isOpponent: true },
      { lane: 3, beat: 24 },
      { lane: 2, beat: 25 },
      { lane: 1, beat: 26 },
      { lane: 3, beat: 27 },

      // Climax
      { lane: 0, beat: 28, isOpponent: true },
      { lane: 2, beat: 28.5, isOpponent: true },
      { lane: 1, beat: 29, isOpponent: true },
      { lane: 3, beat: 29.5, isOpponent: true },
      { lane: 0, beat: 30 },
      { lane: 2, beat: 30.5 },
      { lane: 1, beat: 31 },
      { lane: 3, beat: 31.5 },

      // Final bars
      { lane: 1, beat: 32 },
      { lane: 2, beat: 33 },
      { lane: 0, beat: 34 },
      { lane: 3, beat: 35 },
      { lane: 2, beat: 36 },
      { lane: 1, beat: 37 },
      { lane: 3, beat: 38 },
      { lane: 0, beat: 39 }
    ]
  },
  {
    id: 'fresh',
    name: 'Fresh (Funk Groove)',
    bpm: 120,
    difficulty: 'Normal',
    notes: [
      { lane: 0, beat: 4, isOpponent: true },
      { lane: 1, beat: 4.5, isOpponent: true },
      { lane: 2, beat: 5, isOpponent: true },
      { lane: 3, beat: 6, isOpponent: true },
      { lane: 0, beat: 8 },
      { lane: 1, beat: 8.5 },
      { lane: 2, beat: 9 },
      { lane: 3, beat: 10 },

      { lane: 2, beat: 12, isOpponent: true },
      { lane: 2, beat: 12.5, isOpponent: true },
      { lane: 1, beat: 13, isOpponent: true },
      { lane: 3, beat: 14, isOpponent: true },
      { lane: 2, beat: 16 },
      { lane: 2, beat: 16.5 },
      { lane: 1, beat: 17 },
      { lane: 3, beat: 18 },

      { lane: 0, beat: 20 },
      { lane: 3, beat: 21 },
      { lane: 1, beat: 22 },
      { lane: 2, beat: 23 },
      { lane: 0, beat: 24 },
      { lane: 1, beat: 24.5 },
      { lane: 2, beat: 25 },
      { lane: 3, beat: 25.5 },
      { lane: 2, beat: 26 },
      { lane: 1, beat: 27 },
      { lane: 0, beat: 28 },
      { lane: 3, beat: 29 }
    ]
  },
  {
    id: 'dadbattle',
    name: 'Dad Battle (Hard)',
    bpm: 135,
    difficulty: 'Hard',
    notes: [
      { lane: 0, beat: 4, isOpponent: true },
      { lane: 1, beat: 4.5, isOpponent: true },
      { lane: 2, beat: 5, isOpponent: true },
      { lane: 3, beat: 5.5, isOpponent: true },
      { lane: 1, beat: 6, isOpponent: true },
      { lane: 2, beat: 7, isOpponent: true },

      { lane: 0, beat: 8 },
      { lane: 1, beat: 8.5 },
      { lane: 2, beat: 9 },
      { lane: 3, beat: 9.5 },
      { lane: 1, beat: 10 },
      { lane: 2, beat: 11 },

      { lane: 3, beat: 12, isOpponent: true },
      { lane: 0, beat: 12.5, isOpponent: true },
      { lane: 2, beat: 13, isOpponent: true },
      { lane: 1, beat: 13.5, isOpponent: true },
      { lane: 3, beat: 14, isOpponent: true },
      { lane: 0, beat: 15, isOpponent: true },

      { lane: 3, beat: 16 },
      { lane: 0, beat: 16.5 },
      { lane: 2, beat: 17 },
      { lane: 1, beat: 17.5 },
      { lane: 3, beat: 18 },
      { lane: 0, beat: 19 },

      { lane: 1, beat: 20 },
      { lane: 2, beat: 20.5 },
      { lane: 1, beat: 21 },
      { lane: 3, beat: 21.5 },
      { lane: 0, beat: 22 },
      { lane: 2, beat: 22.5 },
      { lane: 3, beat: 23 },
      { lane: 1, beat: 24 }
    ]
  }
];

export const FNFGame: React.FC<FNFGameProps> = ({ soundEnabled, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [selectedSongIndex, setSelectedSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [health, setHealth] = useState(50); // 0 to 100, 50 is center
  const [rating, setRating] = useState<HitRating | null>(null);
  const [accuracy, setAccuracy] = useState({ hits: 0, total: 0 });

  // Poses for animations: 'idle', 'left', 'down', 'up', 'right'
  const [bfPose, setBfPose] = useState<string>('idle');
  const [dadPose, setDadPose] = useState<string>('idle');
  const poseTimeoutRef = useRef<{ bf?: NodeJS.Timeout; dad?: NodeJS.Timeout }>({});

  const notesRef = useRef<Note[]>([]);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const activeKeysRef = useRef<{ [key: number]: boolean }>({ 0: false, 1: false, 2: false, 3: false });

  // Web Audio Synth engine
  const playSynthBeep = useCallback((lane: number, isOpponent: boolean = false) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Pitch frequencies for lanes [Left, Down, Up, Right]
      const freqs = isOpponent
        ? [164.81, 146.83, 220.0, 196.0] // Dad deep gravel voice (E3, D3, A3, G3)
        : [329.63, 293.66, 440.0, 392.0]; // BF higher autotune beep (E4, D4, A4, G4)

      osc.type = isOpponent ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freqs[lane] || 300, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isOpponent ? 900 : 2500, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // AudioContext fallback
    }
  }, [soundEnabled]);

  // Metronome kick / snare drum beat
  const playDrumBeat = useCallback((isSnare: boolean) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      if (isSnare) {
        // Noise buffer snare
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else {
        // 808 Kick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      }
    } catch {}
  }, [soundEnabled]);

  // Initialize track notes
  const startSong = useCallback((trackIndex: number) => {
    const track = SONGS[trackIndex];
    const secPerBeat = 60 / track.bpm;

    const initialNotes: Note[] = track.notes.map((n, idx) => ({
      id: idx,
      lane: n.lane,
      targetTime: n.beat * secPerBeat,
      hit: false,
      missed: false,
      isOpponent: n.isOpponent
    }));

    notesRef.current = initialNotes;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHealth(50);
    setRating(null);
    setAccuracy({ hits: 0, total: 0 });
    setGameOver(false);
    setVictory(false);
    setIsPaused(false);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    lastTimeRef.current = 0;
  }, []);

  // Trigger character poses
  const triggerPose = useCallback((character: 'bf' | 'dad', lane: number) => {
    const poseNames = ['left', 'down', 'up', 'right'];
    const p = poseNames[lane] || 'idle';
    if (character === 'bf') {
      if (poseTimeoutRef.current.bf) clearTimeout(poseTimeoutRef.current.bf);
      setBfPose(p);
      poseTimeoutRef.current.bf = setTimeout(() => setBfPose('idle'), 300);
    } else {
      if (poseTimeoutRef.current.dad) clearTimeout(poseTimeoutRef.current.dad);
      setDadPose(p);
      poseTimeoutRef.current.dad = setTimeout(() => setDadPose('idle'), 300);
    }
  }, []);

  // Handle note press
  const handleHitNote = useCallback((laneIndex: number) => {
    if (!isPlaying || isPaused || gameOver || victory) return;

    const currentTime = (performance.now() - startTimeRef.current) / 1000;
    const hitWindow = 0.18; // 180ms window

    // Find closest player note in this lane
    const candidates = notesRef.current.filter(
      n => !n.isOpponent && !n.hit && !n.missed && n.lane === laneIndex && Math.abs(n.targetTime - currentTime) <= hitWindow
    );

    triggerPose('bf', laneIndex);
    playSynthBeep(laneIndex, false);

    if (candidates.length > 0) {
      // Pick closest
      candidates.sort((a, b) => Math.abs(a.targetTime - currentTime) - Math.abs(b.targetTime - currentTime));
      const hitNote = candidates[0];
      hitNote.hit = true;

      const diff = Math.abs(hitNote.targetTime - currentTime);
      let rText = 'SICK!';
      let rColor = '#38bdf8';
      let addScore = 350;

      if (diff < 0.05) {
        rText = 'SICK!!';
        rColor = '#38bdf8';
        addScore = 350;
      } else if (diff < 0.11) {
        rText = 'GOOD!';
        rColor = '#4ade80';
        addScore = 200;
      } else {
        rText = 'BAD';
        rColor = '#fbbf24';
        addScore = 100;
      }

      setScore(prev => {
        const next = prev + addScore;
        onScoreUpdate?.(next);
        return next;
      });

      setCombo(prev => {
        const next = prev + 1;
        setMaxCombo(m => Math.max(m, next));
        return next;
      });

      setHealth(h => Math.min(100, h + 3.5));
      setRating({ text: rText, color: rColor, score: addScore, time: performance.now() });
      setAccuracy(prev => ({ hits: prev.hits + 1, total: prev.total + 1 }));
    } else {
      // Ghost tapping penalty (mild)
      setHealth(h => Math.max(0, h - 2));
    }
  }, [isPlaying, isPaused, gameOver, victory, triggerPose, playSynthBeep, onScoreUpdate]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && (gameOver || victory || !isPlaying)) {
        startSong(selectedSongIndex);
        return;
      }

      if (e.key.toLowerCase() === 'p') {
        setIsPaused(p => !p);
        return;
      }

      LANES.forEach((l, idx) => {
        if (e.key.toUpperCase() === l.key || e.key === l.altKey) {
          if (!activeKeysRef.current[idx]) {
            activeKeysRef.current[idx] = true;
            handleHitNote(idx);
          }
        }
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      LANES.forEach((l, idx) => {
        if (e.key.toUpperCase() === l.key || e.key === l.altKey) {
          activeKeysRef.current[idx] = false;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleHitNote, isPlaying, gameOver, victory, selectedSongIndex, startSong]);

  // Main Game Loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver || victory) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastBeat = -1;

    const render = (now: number) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      const currentTrack = SONGS[selectedSongIndex];
      const secPerBeat = 60 / currentTrack.bpm;
      const currentBeat = Math.floor(elapsedSec / secPerBeat);

      // Metronome beat pulses
      if (currentBeat > lastBeat) {
        lastBeat = currentBeat;
        playDrumBeat(currentBeat % 2 === 1);
      }

      // Check opponent notes & missed player notes
      notesRef.current.forEach(note => {
        if (note.isOpponent && !note.hit && elapsedSec >= note.targetTime) {
          note.hit = true;
          triggerPose('dad', note.lane);
          playSynthBeep(note.lane, true);
        }

        // Missed player note check
        if (!note.isOpponent && !note.hit && !note.missed && elapsedSec > note.targetTime + 0.18) {
          note.missed = true;
          setCombo(0);
          setHealth(h => {
            const next = Math.max(0, h - 8);
            if (next <= 0) setGameOver(true);
            return next;
          });
          setRating({ text: 'MISS!', color: '#ef4444', score: 0, time: performance.now() });
          setAccuracy(prev => ({ hits: prev.hits, total: prev.total + 1 }));
        }
      });

      // Check victory
      const allDone = notesRef.current.every(n => n.hit || n.missed);
      const lastNoteTime = Math.max(...notesRef.current.map(n => n.targetTime), 0);
      if (allDone && elapsedSec > lastNoteTime + 1.5 && !gameOver) {
        setVictory(true);
      }

      // CLEAR CANVAS
      ctx.fillStyle = '#060814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Stage Background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stage Lights / Curtains
      ctx.save();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
      ctx.beginPath();
      ctx.moveTo(100, 0);
      ctx.lineTo(250, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.beginPath();
      ctx.moveTo(canvas.width - 100, 0);
      ctx.lineTo(canvas.width - 250, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Speaker Box / Girlfriend area in center
      const centerX = canvas.width / 2;
      const stageFloorY = canvas.height - 110;

      // Draw Speaker Box
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 3;
      ctx.fillRect(centerX - 45, stageFloorY - 70, 90, 70);
      ctx.strokeRect(centerX - 45, stageFloorY - 70, 90, 70);

      // Speaker cones (bouncing to beat)
      const bounce = Math.sin((elapsedSec / secPerBeat) * Math.PI * 2) * 3;
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.arc(centerX, stageFloorY - 35, 22 + bounce, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(centerX, stageFloorY - 35, 10 + bounce * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Girlfriend / Mini character on speaker
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(centerX, stageFloorY - 95 - bounce, 14, 0, Math.PI * 2); // head
      ctx.fill();
      ctx.fillStyle = '#be185d';
      ctx.fillRect(centerX - 10, stageFloorY - 80 - bounce, 20, 18); // dress

      // Draw Opponent (Daddy Dearest) on Left
      const dadX = 110;
      const dadY = stageFloorY - 20;
      ctx.save();
      // Body
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(dadX - 22, dadY - 85, 44, 75);
      // Head
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(dadX, dadY - 105, 24, 0, Math.PI * 2);
      ctx.fill();
      // Hair horn
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.moveTo(dadX - 20, dadY - 120);
      ctx.lineTo(dadX, dadY - 145);
      ctx.lineTo(dadX + 20, dadY - 120);
      ctx.fill();
      // Eyes / Mic
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(dadX - 10, dadY - 110, 6, 6);
      ctx.fillRect(dadX + 4, dadY - 110, 6, 6);
      // Mic in hand
      ctx.fillStyle = '#475569';
      ctx.fillRect(dadX + 18, dadY - 70, 8, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(dadX + 22, dadY - 72, 8, 0, Math.PI * 2);
      ctx.fill();

      // Pose reaction indicator
      if (dadPose !== 'idle') {
        ctx.fillStyle = '#e879f9';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`♫ ${dadPose.toUpperCase()}`, dadX - 25, dadY - 150);
      }
      ctx.restore();

      // Draw Boyfriend (BF) on Right
      const bfX = canvas.width - 110;
      const bfY = stageFloorY - 10;
      ctx.save();
      // BF Body / Shirt
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bfX - 18, bfY - 65, 36, 50);
      // Red No-entry sign on shirt
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bfX, bfY - 42, 9, 0, Math.PI * 2);
      ctx.stroke();
      // Blue baggy pants
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(bfX - 20, bfY - 20, 40, 20);
      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(bfX, bfY - 80, 20, 0, Math.PI * 2);
      ctx.fill();
      // Cyan spiky hair
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(bfX - 6, bfY - 90, 16, 0, Math.PI * 2);
      ctx.fill();
      // Red Cap (Backwards)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bfX + 4, bfY - 88, 18, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(bfX - 22, bfY - 90, 14, 6); // visor backwards
      // Mic in right hand
      ctx.fillStyle = '#334155';
      ctx.fillRect(bfX + 16, bfY - 50, 7, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(bfX + 19, bfY - 52, 7, 0, Math.PI * 2);
      ctx.fill();

      if (bfPose !== 'idle') {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`★ ${bfPose.toUpperCase()}`, bfX - 20, bfY - 115);
      }
      ctx.restore();

      // ==========================================
      // RHYTHM NOTE HIGHWAY & RECEPTORS (TOP)
      // ==========================================
      const highwayX = canvas.width / 2 - 130;
      const receptorY = 65;
      const laneWidth = 65;
      const scrollSpeed = 380; // pixels per second

      // Highway Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(highwayX, 0, laneWidth * 4, canvas.height - 110);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(highwayX + i * laneWidth, 0);
        ctx.lineTo(highwayX + i * laneWidth, canvas.height - 110);
        ctx.stroke();
      }

      // Draw Target Receptors (at top)
      LANES.forEach((lane, idx) => {
        const lx = highwayX + idx * laneWidth + laneWidth / 2;
        const isPressed = activeKeysRef.current[idx];

        ctx.save();
        ctx.strokeStyle = isPressed ? lane.glow : 'rgba(255, 255, 255, 0.4)';
        ctx.fillStyle = isPressed ? lane.glow : 'rgba(20, 20, 35, 0.8)';
        ctx.lineWidth = isPressed ? 4 : 2;

        ctx.beginPath();
        ctx.roundRect(lx - 24, receptorY - 24, 48, 48, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isPressed ? '#ffffff' : lane.color;
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lane.symbol, lx, receptorY);

        // Key prompt label underneath
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px monospace';
        ctx.fillText(lane.key, lx, receptorY + 36);

        ctx.restore();
      });

      // Draw Incoming Notes (Scrolling upwards to receptorY)
      notesRef.current.forEach(note => {
        if (note.hit || note.missed) return;

        // Position based on time delta
        const timeDiff = note.targetTime - elapsedSec;
        const noteY = receptorY + timeDiff * scrollSpeed;

        // Only draw if within screen
        if (noteY > -50 && noteY < canvas.height - 110) {
          const lane = LANES[note.lane];
          const lx = highwayX + note.lane * laneWidth + laneWidth / 2;

          ctx.save();
          // Glow shadow
          ctx.shadowColor = note.isOpponent ? '#a855f7' : lane.glow;
          ctx.shadowBlur = 10;

          // Note body
          ctx.fillStyle = note.isOpponent ? '#7c3aed' : lane.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.roundRect(lx - 22, noteY - 22, 44, 44, 8);
          ctx.fill();
          ctx.stroke();

          // Symbol
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(lane.symbol, lx, noteY);

          ctx.restore();
        }
      });

      // ==========================================
      // HEALTH BAR & ICONS (BOTTOM)
      // ==========================================
      const barY = canvas.height - 55;
      const barW = 380;
      const barH = 18;
      const barX = canvas.width / 2 - barW / 2;

      // Outer border
      ctx.fillStyle = '#090a15';
      ctx.fillRect(barX - 4, barY - 4, barW + 8, barH + 8);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX - 4, barY - 4, barW + 8, barH + 8);

      // Health splits: Left = Opponent (Purple), Right = BF (Cyan)
      const bfWidth = (health / 100) * barW;
      const dadWidth = barW - bfWidth;

      // Dad segment (Left)
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(barX, barY, dadWidth, barH);

      // BF segment (Right)
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(barX + dadWidth, barY, bfWidth, barH);

      // Health Bar Divider / Heads
      const iconX = barX + dadWidth;
      ctx.save();
      // Center icon token
      ctx.fillStyle = health > 50 ? '#06b6d4' : '#9333ea';
      ctx.beginPath();
      ctx.arc(iconX, barY + barH / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(health > 50 ? 'BF' : 'DAD', iconX, barY + barH / 2);
      ctx.restore();

      // Rating Flash
      if (rating && performance.now() - rating.time < 500) {
        ctx.save();
        ctx.fillStyle = rating.color;
        ctx.shadowColor = rating.color;
        ctx.shadowBlur = 12;
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(rating.text, centerX, receptorY + 80);
        ctx.restore();
      }

      // Loop
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isPaused, gameOver, victory, selectedSongIndex, health, rating, triggerPose, playSynthBeep, playDrumBeat, dadPose, bfPose]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 bg-[#080b18] text-white rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Top Header & Song Select */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 shadow-md">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-white">
              Friday Night Funkin' <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">Beat Battle</span>
            </h2>
            <p className="text-[11px] text-slate-400">Rhythm Rap Battle with BF vs Daddy Dearest</p>
          </div>
        </div>

        {/* Track selector */}
        <div className="flex items-center gap-2">
          {SONGS.map((song, i) => (
            <button
              key={song.id}
              onClick={() => {
                setSelectedSongIndex(i);
                startSong(i);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedSongIndex === i
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-900/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {song.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
        <div className="p-2.5 rounded-xl bg-[#0d1226] border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Score:</span>
          <span className="font-mono font-black text-cyan-300 text-sm">{score}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0d1226] border border-white/5 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-400" /> Combo:</span>
          <span className="font-mono font-black text-amber-300 text-sm">{combo} <span className="text-[10px] text-slate-500">(Max {maxCombo})</span></span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0d1226] border border-white/5 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Accuracy:</span>
          <span className="font-mono font-black text-emerald-300 text-sm">
            {accuracy.total > 0 ? Math.round((accuracy.hits / accuracy.total) * 100) : 100}%
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0d1226] border border-white/5 flex items-center justify-between">
          <span className="text-slate-400">Health:</span>
          <span className={`font-mono font-black text-sm ${health > 30 ? 'text-cyan-300' : 'text-rose-400 animate-pulse'}`}>
            {Math.round(health)}%
          </span>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full max-w-[700px] aspect-[16/10] bg-black rounded-xl overflow-hidden border border-white/10 shadow-inner">
        <canvas
          ref={canvasRef}
          width={700}
          height={440}
          className="w-full h-full block object-contain"
        />

        {/* Start Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Friday Night Funkin'</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                Press the arrow keys or <strong className="text-cyan-300">D - F - J - K</strong> right as the notes hit the targets!
              </p>
            </div>
            <button
              onClick={() => startSong(selectedSongIndex)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:from-fuchsia-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-cyan-900/40 flex items-center gap-2 cursor-pointer transition transform hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START RAP BATTLE</span>
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <h3 className="text-3xl font-black text-rose-500 tracking-wider">BLUE BALLED!</h3>
            <p className="text-xs text-slate-300">Daddy Dearest out-funked you. Don't give up!</p>
            <div className="text-sm font-mono text-cyan-300">Final Score: {score}</div>
            <button
              onClick={() => startSong(selectedSongIndex)}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow-lg shadow-rose-950/50"
            >
              <RotateCcw className="w-4 h-4" /> RETRY TRACK
            </button>
          </div>
        )}

        {/* Victory Modal */}
        {victory && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <Trophy className="w-12 h-12 text-amber-400" />
            <h3 className="text-3xl font-black text-emerald-400 tracking-wider">TRACK CLEARED!</h3>
            <p className="text-xs text-slate-300">You dropped the hottest beats on stage!</p>
            <div className="text-sm font-mono text-amber-300 font-bold">
              Score: {score} • Max Combo: {maxCombo} • Accuracy: {Math.round((accuracy.hits / Math.max(1, accuracy.total)) * 100)}%
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startSong((selectedSongIndex + 1) % SONGS.length)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition"
              >
                NEXT SONG
              </button>
              <button
                onClick={() => startSong(selectedSongIndex)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch / Mobile / Chromebook Virtual Hit Pads */}
      <div className="w-full max-w-[700px] mt-3 grid grid-cols-4 gap-2">
        {LANES.map((lane, idx) => (
          <button
            key={lane.dir}
            onPointerDown={e => {
              e.preventDefault();
              activeKeysRef.current[idx] = true;
              handleHitNote(idx);
            }}
            onPointerUp={() => {
              activeKeysRef.current[idx] = false;
            }}
            onPointerLeave={() => {
              activeKeysRef.current[idx] = false;
            }}
            className="py-3 sm:py-4 rounded-xl border font-mono font-black text-lg sm:text-xl transition active:scale-95 flex flex-col items-center justify-center cursor-pointer select-none"
            style={{
              borderColor: `${lane.color}50`,
              backgroundColor: `${lane.color}15`,
              color: lane.color
            }}
          >
            <span>{lane.symbol}</span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5">{lane.key} / {lane.altKey.replace('Arrow', '')}</span>
          </button>
        ))}
      </div>

      {/* Bottom Controls Info */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-white/5 px-2">
        <div className="flex items-center gap-3">
          <span>Controls: <strong className="text-white">D F J K</strong> or <strong className="text-white">← ↓ ↑ →</strong></span>
          <span>•</span>
          <span>Space: <strong className="text-white">Restart</strong></span>
          <span>•</span>
          <span>P: <strong className="text-white">Pause</strong></span>
        </div>

        <button
          onClick={() => startSong(selectedSongIndex)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart Song
        </button>
      </div>
    </div>
  );
};
