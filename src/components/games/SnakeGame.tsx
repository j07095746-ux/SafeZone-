import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCcw, Play, Pause, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface SnakeGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

const GRID_SIZE = 20;
const TILE_SIZE = 18;

interface Point {
  x: number;
  y: number;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ soundEnabled, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const snakeRef = useRef<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const goldenFoodRef = useRef<Point | null>(null);
  const goldenTimerRef = useRef<number>(0);
  const loopRef = useRef<number | null>(null);

  const spawnFood = useCallback((): Point => {
    let valid = false;
    let newFood: Point = { x: 0, y: 0 };
    while (!valid) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      valid = !snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = spawnFood();
    goldenFoodRef.current = null;
    goldenTimerRef.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    playSound('click', soundEnabled);
  }, [soundEnabled, spawnFood]);

  const changeDirection = useCallback((newDir: Point) => {
    // Prevent 180-degree reversing
    if (
      (newDir.x !== 0 && dirRef.current.x === -newDir.x) ||
      (newDir.y !== 0 && dirRef.current.y === -newDir.y)
    ) {
      return;
    }
    nextDirRef.current = newDir;
    playSound('click', soundEnabled);
  }, [soundEnabled]);

  // Key controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection({ x: 0, y: -1 });
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection({ x: 0, y: 1 });
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection({ x: -1, y: 0 });
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection({ x: 1, y: 0 });
      if (e.code === 'Space' || e.key === 'p' || e.key === 'P') setIsPaused(p => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  // Main Loop
  useEffect(() => {
    let lastTick = 0;
    const speed = Math.max(70, 140 - Math.floor(score / 30) * 10);

    const step = (now: number) => {
      if (!isPaused && !gameOver && now - lastTick > speed) {
        lastTick = now;

        dirRef.current = nextDirRef.current;
        const head = snakeRef.current[0];
        const newHead: Point = {
          x: head.x + dirRef.current.x,
          y: head.y + dirRef.current.y
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          playSound('gameover', soundEnabled);
          return;
        }

        // Self collision
        if (snakeRef.current.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          playSound('gameover', soundEnabled);
          return;
        }

        // Move snake
        snakeRef.current.unshift(newHead);

        // Check food collision
        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          playSound('score', soundEnabled);
          foodRef.current = spawnFood();

          // Chance to spawn golden bonus
          if (Math.random() < 0.25 && !goldenFoodRef.current) {
            goldenFoodRef.current = spawnFood();
            goldenTimerRef.current = 40; // remaining ticks
          }

          setScore(s => {
            const next = s + 10;
            onScoreUpdate?.(next);
            setHighScore(h => Math.max(h, next));
            return next;
          });
        } else if (
          goldenFoodRef.current &&
          newHead.x === goldenFoodRef.current.x &&
          newHead.y === goldenFoodRef.current.y
        ) {
          playSound('powerup', soundEnabled);
          goldenFoodRef.current = null;
          setScore(s => {
            const next = s + 50;
            onScoreUpdate?.(next);
            setHighScore(h => Math.max(h, next));
            return next;
          });
        } else {
          snakeRef.current.pop();
        }

        // Golden food timer
        if (goldenFoodRef.current) {
          goldenTimerRef.current -= 1;
          if (goldenTimerRef.current <= 0) {
            goldenFoodRef.current = null;
          }
        }
      }

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Background
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid lines
          ctx.strokeStyle = '#161f30';
          ctx.lineWidth = 1;
          for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * TILE_SIZE, 0);
            ctx.lineTo(i * TILE_SIZE, GRID_SIZE * TILE_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * TILE_SIZE);
            ctx.lineTo(GRID_SIZE * TILE_SIZE, i * TILE_SIZE);
            ctx.stroke();
          }

          // Regular Food (Apple)
          const f = foodRef.current;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(
            f.x * TILE_SIZE + TILE_SIZE / 2,
            f.y * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE / 2 - 2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Golden Bonus Food
          if (goldenFoodRef.current) {
            const gf = goldenFoodRef.current;
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(
              gf.x * TILE_SIZE + TILE_SIZE / 2,
              gf.y * TILE_SIZE + TILE_SIZE / 2,
              TILE_SIZE / 2 - 1,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.strokeStyle = '#fef08a';
            ctx.stroke();
          }

          // Snake Body
          snakeRef.current.forEach((segment, idx) => {
            if (idx === 0) {
              // Head
              ctx.fillStyle = '#10b981';
              ctx.fillRect(segment.x * TILE_SIZE + 1, segment.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);

              // Eyes
              ctx.fillStyle = '#042f2e';
              const eyeOffset = 4;
              ctx.fillRect(segment.x * TILE_SIZE + eyeOffset, segment.y * TILE_SIZE + eyeOffset, 3, 3);
              ctx.fillRect(segment.x * TILE_SIZE + TILE_SIZE - eyeOffset - 3, segment.y * TILE_SIZE + eyeOffset, 3, 3);
            } else {
              // Tail gradient
              const colorRatio = Math.max(0.3, 1 - idx / (snakeRef.current.length + 5));
              ctx.fillStyle = `rgba(16, 185, 129, ${colorRatio})`;
              ctx.fillRect(segment.x * TILE_SIZE + 1.5, segment.y * TILE_SIZE + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
            }
          });
        }
      }

      loopRef.current = requestAnimationFrame(step);
    };

    loopRef.current = requestAnimationFrame(step);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [gameOver, isPaused, onScoreUpdate, score, soundEnabled, spawnFood]);

  return (
    <div id="snake-game-container" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="flex items-center justify-between w-full mb-4">
          <div>
            <h3 className="text-xl font-black text-emerald-400">Retro Snake</h3>
            <span className="text-xs text-slate-400">Eat apples & survive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">SCORE</span>
              <span className="text-sm font-black text-white">{score}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">BEST</span>
              <span className="text-sm font-black text-amber-400">{highScore}</span>
            </div>
            <button
              onClick={() => setIsPaused(p => !p)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={resetGame}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner bg-slate-950">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * TILE_SIZE}
            height={GRID_SIZE * TILE_SIZE}
            className="block"
          />

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4">
              <h3 className="text-2xl font-black text-rose-500 mb-1">CRASHED!</h3>
              <p className="text-slate-300 text-sm mb-4">Score: <span className="text-emerald-400 font-bold">{score}</span></p>
              <button
                onClick={resetGame}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
              <h3 className="text-lg font-bold text-white mb-2">Game Paused</h3>
              <button
                onClick={() => setIsPaused(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Resume
              </button>
            </div>
          )}
        </div>

        {/* D-Pad controls for mobile / quick click */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <button
            onClick={() => changeDirection({ x: 0, y: -1 })}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white rounded-lg cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => changeDirection({ x: -1, y: 0 })}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeDirection({ x: 0, y: 1 })}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white rounded-lg cursor-pointer"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeDirection({ x: 1, y: 0 })}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white rounded-lg cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
