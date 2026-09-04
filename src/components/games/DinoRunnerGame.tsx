import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCcw } from 'lucide-react';

interface DinoRunnerProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

const WIDTH = 500;
const HEIGHT = 240;
const GROUND_Y = 190;

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
  y: number;
}

export const DinoRunnerGame: React.FC<DinoRunnerProps> = ({ soundEnabled, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isDucking, setIsDucking] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');

  const dinoRef = useRef<{ y: number; vy: number; width: number; height: number; isGrounded: boolean }>({
    y: GROUND_Y - 44,
    vy: 0,
    width: 36,
    height: 44,
    isGrounded: true
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const speedRef = useRef<number>(5.5);
  const distanceRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);

  const jump = useCallback(() => {
    if (gameState === 'idle') {
      setGameState('running');
      dinoRef.current.vy = -10.5;
      dinoRef.current.isGrounded = false;
      playSound('jump', soundEnabled);
      return;
    }
    if (gameState === 'running' && dinoRef.current.isGrounded) {
      dinoRef.current.vy = -10.5;
      dinoRef.current.isGrounded = false;
      playSound('jump', soundEnabled);
    }
  }, [gameState, soundEnabled]);

  const resetGame = useCallback(() => {
    dinoRef.current = {
      y: GROUND_Y - 44,
      vy: 0,
      width: 36,
      height: 44,
      isGrounded: true
    };
    obstaclesRef.current = [];
    speedRef.current = 5.5;
    distanceRef.current = 0;
    setScore(0);
    setGameState('idle');
    playSound('click', soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      if (e.code === 'Space' || e.code === 'ArrowUp') jump();
      if (e.code === 'ArrowDown') {
        setIsDucking(true);
        if (dinoRef.current.isGrounded) {
          dinoRef.current.height = 26;
          dinoRef.current.y = GROUND_Y - 26;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        setIsDucking(false);
        dinoRef.current.height = 44;
        if (dinoRef.current.isGrounded) {
          dinoRef.current.y = GROUND_Y - 44;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump]);

  // Game Loop
  useEffect(() => {
    let spawnTimer = 0;

    const update = () => {
      const dino = dinoRef.current;
      const obstacles = obstaclesRef.current;

      if (gameState === 'running') {
        distanceRef.current += 1;
        speedRef.current = 5.5 + Math.floor(distanceRef.current / 400) * 0.5;

        // Update score
        if (distanceRef.current % 5 === 0) {
          setScore(s => {
            const next = s + 1;
            onScoreUpdate?.(next);
            setHighScore(h => Math.max(h, next));
            return next;
          });
        }

        // Dino Physics
        if (!dino.isGrounded) {
          dino.vy += 0.55; // gravity
          dino.y += dino.vy;

          const currentHeight = isDucking ? 26 : 44;
          if (dino.y >= GROUND_Y - currentHeight) {
            dino.y = GROUND_Y - currentHeight;
            dino.vy = 0;
            dino.isGrounded = true;
          }
        }

        // Obstacle Spawner
        spawnTimer++;
        const spawnInterval = Math.max(65, 120 - Math.floor(speedRef.current * 4));
        if (spawnTimer > spawnInterval) {
          spawnTimer = 0;
          const isBird = Math.random() < 0.28 && distanceRef.current > 300;
          if (isBird) {
            obstacles.push({
              x: WIDTH + 20,
              width: 32,
              height: 22,
              type: 'bird',
              y: Math.random() > 0.5 ? GROUND_Y - 35 : GROUND_Y - 60
            });
          } else {
            const cactusH = Math.random() > 0.5 ? 42 : 32;
            obstacles.push({
              x: WIDTH + 20,
              width: 20 + Math.floor(Math.random() * 14),
              height: cactusH,
              type: 'cactus',
              y: GROUND_Y - cactusH
            });
          }
        }

        // Move Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= speedRef.current;

          if (obs.x + obs.width < -10) {
            obstacles.splice(i, 1);
            continue;
          }

          // AABB Hitbox check
          const padding = 5;
          const dinoRight = 50 + dino.width - padding;
          const dinoLeft = 50 + padding;
          const dinoTop = dino.y + padding;
          const dinoBottom = dino.y + dino.height;

          const obsLeft = obs.x + padding;
          const obsRight = obs.x + obs.width - padding;
          const obsTop = obs.y + padding;
          const obsBottom = obs.y + obs.height;

          if (
            dinoRight > obsLeft &&
            dinoLeft < obsRight &&
            dinoBottom > obsTop &&
            dinoTop < obsBottom
          ) {
            setGameState('gameover');
            playSound('gameover', soundEnabled);
          }
        }
      }

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Dark desert background
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Ground line
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, GROUND_Y);
          ctx.lineTo(WIDTH, GROUND_Y);
          ctx.stroke();

          // Ground pebbles
          ctx.fillStyle = '#475569';
          for (let p = 0; p < WIDTH; p += 40) {
            const offset = (p - (distanceRef.current * 2) % 40);
            ctx.fillRect(offset, GROUND_Y + 8, 4, 2);
            ctx.fillRect(offset + 18, GROUND_Y + 16, 2, 2);
          }

          // Draw Dino
          ctx.fillStyle = '#38bdf8';
          const dinoX = 50;
          if (isDucking) {
            // Ducking Dino shape
            ctx.fillRect(dinoX, dino.y, dino.width + 12, dino.height);
            // Eye
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(dinoX + dino.width + 4, dino.y + 4, 3, 3);
          } else {
            // Standing Dino shape
            ctx.fillRect(dinoX, dino.y, dino.width, dino.height);
            // Head
            ctx.fillRect(dinoX + 16, dino.y - 10, 24, 18);
            // Eye
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(dinoX + 32, dino.y - 6, 3, 3);
            // Legs
            ctx.fillStyle = '#38bdf8';
            if (dino.isGrounded && gameState === 'running') {
              const legAlt = Math.floor(distanceRef.current / 6) % 2 === 0;
              ctx.fillRect(dinoX + 6, dino.y + dino.height, 4, legAlt ? 6 : 2);
              ctx.fillRect(dinoX + 22, dino.y + dino.height, 4, legAlt ? 2 : 6);
            }
          }

          // Draw Obstacles
          obstaclesRef.current.forEach(obs => {
            if (obs.type === 'cactus') {
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
              // Spikes
              ctx.fillStyle = '#15803d';
              ctx.fillRect(obs.x - 3, obs.y + 10, 3, 4);
              ctx.fillRect(obs.x + obs.width, obs.y + 16, 3, 4);
            } else {
              // Bird
              ctx.fillStyle = '#f43f5e';
              ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
              ctx.fillStyle = '#fda4af';
              const wingY = Math.floor(distanceRef.current / 8) % 2 === 0 ? obs.y - 6 : obs.y + obs.height;
              ctx.fillRect(obs.x + 8, wingY, 14, 5);
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
  }, [gameState, isDucking, onScoreUpdate, soundEnabled]);

  return (
    <div id="dino-runner-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-[500px] mb-3">
          <div>
            <h3 className="text-xl font-black text-amber-400">T-Rex Chrome Run</h3>
            <span className="text-xs text-slate-400">Space to Jump, Down to Duck</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">HI</span>
              <span className="text-sm font-black text-amber-400">{highScore}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">SCORE</span>
              <span className="text-sm font-black text-white">{score}</span>
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
        <div
          onClick={jump}
          className="relative border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner cursor-pointer"
        >
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block" />

          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
              <span className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-sm shadow-xl">
                PRESS SPACE OR TAP TO RUN
              </span>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
              <h3 className="text-2xl font-black text-rose-500 mb-2">GAME OVER</h3>
              <p className="text-sm text-slate-300 mb-4">Score: {score}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={jump}
            className="px-8 py-3 bg-sky-600 active:bg-sky-500 text-white font-bold rounded-xl text-sm cursor-pointer shadow-lg"
          >
            ▲ JUMP
          </button>
          <button
            onMouseDown={() => {
              setIsDucking(true);
              dinoRef.current.height = 26;
            }}
            onMouseUp={() => {
              setIsDucking(false);
              dinoRef.current.height = 44;
            }}
            onTouchStart={() => {
              setIsDucking(true);
              dinoRef.current.height = 26;
            }}
            onTouchEnd={() => {
              setIsDucking(false);
              dinoRef.current.height = 44;
            }}
            className="px-8 py-3 bg-slate-800 active:bg-slate-700 text-white font-bold rounded-xl text-sm cursor-pointer"
          >
            ▼ DUCK
          </button>
        </div>
      </div>
    </div>
  );
};
