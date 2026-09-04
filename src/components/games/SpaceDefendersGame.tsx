import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCcw, Heart, Crosshair } from 'lucide-react';

interface SpaceDefendersProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

const WIDTH = 400;
const HEIGHT = 450;

interface Invader {
  x: number;
  y: number;
  width: number;
  height: number;
  type: number;
  alive: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vy: number;
  fromPlayer: boolean;
}

export const SpaceDefendersGame: React.FC<SpaceDefendersProps> = ({ soundEnabled, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'won'>('playing');

  const playerRef = useRef<{ x: number; y: number; width: number; height: number; speed: number }>({
    x: WIDTH / 2 - 16,
    y: HEIGHT - 35,
    width: 32,
    height: 18,
    speed: 5
  });

  const invadersRef = useRef<Invader[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const invaderDirRef = useRef<number>(1);
  const invaderSpeedRef = useRef<number>(0.8);
  const keysRef = useRef<{ left: boolean; right: boolean; shoot: boolean }>({ left: false, right: false, shoot: false });
  const lastShotTimeRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);

  const initInvaders = useCallback((waveNum = 1) => {
    const invaders: Invader[] = [];
    const rows = 4;
    const cols = 8;
    const startX = 40;
    const startY = 40;
    const spacingX = 40;
    const spacingY = 30;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        invaders.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          width: 24,
          height: 18,
          type: r,
          alive: true
        });
      }
    }
    invadersRef.current = invaders;
    invaderSpeedRef.current = 0.6 + waveNum * 0.25;
    invaderDirRef.current = 1;
    projectilesRef.current = [];
  }, []);

  const resetGame = useCallback(() => {
    initInvaders(1);
    setScore(0);
    setLives(3);
    setWave(1);
    setGameState('playing');
    playerRef.current.x = WIDTH / 2 - 16;
    playSound('click', soundEnabled);
  }, [initInvaders, soundEnabled]);

  const shootLaser = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTimeRef.current < 280) return; // cooldown
    lastShotTimeRef.current = now;

    projectilesRef.current.push({
      x: playerRef.current.x + playerRef.current.width / 2,
      y: playerRef.current.y - 2,
      vy: -7,
      fromPlayer: true
    });
    playSound('laser', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.code === 'Space') shootLaser();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shootLaser]);

  // Main Loop
  useEffect(() => {
    initInvaders(wave);

    const update = () => {
      if (gameState === 'playing') {
        const player = playerRef.current;
        const keys = keysRef.current;

        if (keys.left) player.x = Math.max(8, player.x - player.speed);
        if (keys.right) player.x = Math.min(WIDTH - player.width - 8, player.x + player.speed);

        // Move Invaders
        let switchDir = false;
        const invaders = invadersRef.current;
        const aliveInvaders = invaders.filter(i => i.alive);

        if (aliveInvaders.length === 0) {
          // Next wave!
          setWave(w => {
            const nextW = w + 1;
            initInvaders(nextW);
            playSound('powerup', soundEnabled);
            return nextW;
          });
        }

        for (const invader of aliveInvaders) {
          invader.x += invaderDirRef.current * invaderSpeedRef.current;
          if (invader.x + invader.width >= WIDTH - 12 || invader.x <= 12) {
            switchDir = true;
          }
          // Invader reached player level
          if (invader.y + invader.height >= player.y) {
            setGameState('gameover');
            playSound('gameover', soundEnabled);
          }
        }

        if (switchDir) {
          invaderDirRef.current = -invaderDirRef.current;
          for (const invader of aliveInvaders) {
            invader.y += 12;
          }
        }

        // Alien shooting randomly
        if (Math.random() < 0.025 && aliveInvaders.length > 0) {
          const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
          projectilesRef.current.push({
            x: shooter.x + shooter.width / 2,
            y: shooter.y + shooter.height,
            vy: 3.5,
            fromPlayer: false
          });
        }

        // Update Projectiles
        const projs = projectilesRef.current;
        for (let i = projs.length - 1; i >= 0; i--) {
          const p = projs[i];
          p.y += p.vy;

          if (p.y < 0 || p.y > HEIGHT) {
            projs.splice(i, 1);
            continue;
          }

          if (p.fromPlayer) {
            // Check collision with invaders
            for (const inv of aliveInvaders) {
              if (
                p.x >= inv.x &&
                p.x <= inv.x + inv.width &&
                p.y >= inv.y &&
                p.y <= inv.y + inv.height
              ) {
                inv.alive = false;
                projs.splice(i, 1);
                playSound('score', soundEnabled);

                const points = (4 - inv.type) * 20;
                setScore(s => {
                  const next = s + points;
                  onScoreUpdate?.(next);
                  return next;
                });
                break;
              }
            }
          } else {
            // Alien projectile hitting player
            if (
              p.x >= player.x &&
              p.x <= player.x + player.width &&
              p.y >= player.y &&
              p.y <= player.y + player.height
            ) {
              projs.splice(i, 1);
              playSound('gameover', soundEnabled);
              setLives(l => {
                const nextLives = l - 1;
                if (nextLives <= 0) {
                  setGameState('gameover');
                }
                return nextLives;
              });
            }
          }
        }
      }

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Space background
          ctx.fillStyle = '#060913';
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Stars
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(50, 40, 2, 2);
          ctx.fillRect(180, 110, 1.5, 1.5);
          ctx.fillRect(320, 70, 2, 2);
          ctx.fillRect(120, 260, 1.5, 1.5);
          ctx.fillRect(280, 320, 2, 2);
          ctx.fillRect(90, 380, 1.5, 1.5);

          // Draw Invaders
          const colors = ['#f43f5e', '#a855f7', '#38bdf8', '#34d399'];
          invadersRef.current.forEach(inv => {
            if (inv.alive) {
              ctx.fillStyle = colors[inv.type % colors.length];
              ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
              // Eyes
              ctx.fillStyle = '#000000';
              ctx.fillRect(inv.x + 4, inv.y + 4, 4, 4);
              ctx.fillRect(inv.x + inv.width - 8, inv.y + 4, 4, 4);
              // Antenna
              ctx.fillStyle = colors[inv.type % colors.length];
              ctx.fillRect(inv.x + 4, inv.y - 3, 3, 3);
              ctx.fillRect(inv.x + inv.width - 7, inv.y - 3, 3, 3);
            }
          });

          // Draw Player Ship
          const p = playerRef.current;
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.moveTo(p.x + p.width / 2, p.y);
          ctx.lineTo(p.x + p.width, p.y + p.height);
          ctx.lineTo(p.x, p.y + p.height);
          ctx.closePath();
          ctx.fill();
          // Blaster tip
          ctx.fillStyle = '#fde047';
          ctx.fillRect(p.x + p.width / 2 - 2, p.y - 4, 4, 4);

          // Draw Projectiles
          projectilesRef.current.forEach(proj => {
            if (proj.fromPlayer) {
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(proj.x - 1.5, proj.y - 4, 3, 8);
            } else {
              ctx.fillStyle = '#f43f5e';
              ctx.fillRect(proj.x - 1.5, proj.y - 3, 3, 6);
            }
          });
        }
      }

      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, initInvaders, onScoreUpdate, shootLaser, soundEnabled, wave]);

  return (
    <div id="space-defenders-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Top Header */}
        <div className="flex items-center justify-between w-full max-w-[400px] mb-3">
          <div>
            <h3 className="text-xl font-black text-cyan-400">Space Defenders</h3>
            <span className="text-xs text-slate-400">Wave {wave}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
                />
              ))}
            </div>
            <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">SCORE</span>
              <span className="text-sm font-black text-amber-400">{score}</span>
            </div>
            <button
              onClick={resetGame}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block" />

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
              <h3 className="text-2xl font-black text-rose-500 mb-2">EARTH OVERRUN</h3>
              <p className="text-sm text-slate-300 mb-1">Total Score: {score}</p>
              <p className="text-xs text-slate-400 mb-4">Reached Wave: {wave}</p>
              <button
                onClick={resetGame}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => {
              playerRef.current.x = Math.max(8, playerRef.current.x - 24);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white rounded-lg text-sm font-bold cursor-pointer"
          >
            ◀ Move Left
          </button>
          <button
            onClick={shootLaser}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 text-black rounded-lg text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Crosshair className="w-4 h-4" /> FIRE
          </button>
          <button
            onClick={() => {
              playerRef.current.x = Math.min(WIDTH - playerRef.current.width - 8, playerRef.current.x + 24);
            }}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-white rounded-lg text-sm font-bold cursor-pointer"
          >
            Move Right ▶
          </button>
        </div>
      </div>
    </div>
  );
};
