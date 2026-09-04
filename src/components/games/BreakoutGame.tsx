import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCcw, Heart } from 'lucide-react';

interface BreakoutGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

const WIDTH = 420;
const HEIGHT = 460;
const BRICK_ROWS = 5;
const BRICK_COLS = 7;
const BRICK_HEIGHT = 18;
const BRICK_GAP = 5;

const ROW_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  alive: boolean;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({ soundEnabled, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover' | 'won'>('ready');

  const paddleRef = useRef<{ x: number; width: number; height: number; speed: number }>({
    x: WIDTH / 2 - 40,
    width: 80,
    height: 12,
    speed: 6
  });

  const ballRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number }>({
    x: WIDTH / 2,
    y: HEIGHT - 40,
    vx: 3,
    vy: -4,
    radius: 6
  });

  const bricksRef = useRef<Brick[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const animRef = useRef<number | null>(null);

  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    const brickWidth = (WIDTH - (BRICK_COLS + 1) * BRICK_GAP) / BRICK_COLS;
    const topOffset = 50;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: BRICK_GAP + c * (brickWidth + BRICK_GAP),
          y: topOffset + r * (BRICK_HEIGHT + BRICK_GAP),
          width: brickWidth,
          height: BRICK_HEIGHT,
          color: ROW_COLORS[r],
          points: (BRICK_ROWS - r) * 10,
          alive: true
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  const resetGame = useCallback(() => {
    initBricks();
    paddleRef.current.x = WIDTH / 2 - 40;
    ballRef.current = {
      x: WIDTH / 2,
      y: HEIGHT - 40,
      vx: (Math.random() > 0.5 ? 1 : -1) * (2.8 + Math.random() * 0.8),
      vy: -4,
      radius: 6
    };
    setScore(0);
    setLives(3);
    setGameState('ready');
    playSound('click', soundEnabled);
  }, [initBricks, soundEnabled]);

  const launchBall = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('playing');
      playSound('jump', soundEnabled);
    }
  }, [gameState, soundEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.code === 'Space') launchBall();
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
  }, [launchBall]);

  // Mouse / Touch paddle control
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = WIDTH / rect.width;
    const canvasX = mouseX * scaleX;
    paddleRef.current.x = Math.max(0, Math.min(WIDTH - paddleRef.current.width, canvasX - paddleRef.current.width / 2));
    if (gameState === 'ready') {
      ballRef.current.x = paddleRef.current.x + paddleRef.current.width / 2;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const scaleX = WIDTH / rect.width;
    const canvasX = touchX * scaleX;
    paddleRef.current.x = Math.max(0, Math.min(WIDTH - paddleRef.current.width, canvasX - paddleRef.current.width / 2));
    if (gameState === 'ready') {
      ballRef.current.x = paddleRef.current.x + paddleRef.current.width / 2;
    }
  };

  // Main Loop
  useEffect(() => {
    initBricks();

    const update = () => {
      const paddle = paddleRef.current;
      const ball = ballRef.current;
      const keys = keysRef.current;

      // Key movement
      if (keys.left) paddle.x = Math.max(0, paddle.x - paddle.speed);
      if (keys.right) paddle.x = Math.min(WIDTH - paddle.width, paddle.x + paddle.speed);

      if (gameState === 'ready') {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = HEIGHT - 30;
      } else if (gameState === 'playing') {
        // Move ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce Walls
        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx;
          playSound('pop', soundEnabled);
        } else if (ball.x + ball.radius >= WIDTH) {
          ball.x = WIDTH - ball.radius;
          ball.vx = -ball.vx;
          playSound('pop', soundEnabled);
        }

        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
          playSound('pop', soundEnabled);
        }

        // Paddle Collision
        const paddleY = HEIGHT - 22;
        if (
          ball.y + ball.radius >= paddleY &&
          ball.y - ball.radius <= paddleY + paddle.height &&
          ball.x >= paddle.x &&
          ball.x <= paddle.x + paddle.width
        ) {
          ball.vy = -Math.abs(ball.vy);
          // Angle ball based on where it hits paddle
          const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          ball.vx = hitOffset * 4.5;
          playSound('click', soundEnabled);
        }

        // Brick Collision
        let hitBrick = false;
        for (const brick of bricksRef.current) {
          if (brick.alive) {
            if (
              ball.x + ball.radius > brick.x &&
              ball.x - ball.radius < brick.x + brick.width &&
              ball.y + ball.radius > brick.y &&
              ball.y - ball.radius < brick.y + brick.height
            ) {
              brick.alive = false;
              ball.vy = -ball.vy;
              playSound('score', soundEnabled);
              hitBrick = true;

              setScore(s => {
                const next = s + brick.points;
                onScoreUpdate?.(next);
                return next;
              });
              break;
            }
          }
        }

        // Check if all bricks cleared
        if (hitBrick && bricksRef.current.every(b => !b.alive)) {
          setGameState('won');
          playSound('powerup', soundEnabled);
        }

        // Ball fell off screen
        if (ball.y - ball.radius > HEIGHT) {
          setLives(l => {
            const nextLives = l - 1;
            if (nextLives <= 0) {
              setGameState('gameover');
              playSound('gameover', soundEnabled);
            } else {
              setGameState('ready');
              playSound('gameover', soundEnabled);
            }
            return nextLives;
          });
        }
      }

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Draw Bricks
          bricksRef.current.forEach(brick => {
            if (brick.alive) {
              ctx.fillStyle = brick.color;
              ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
              ctx.fillStyle = 'rgba(255,255,255,0.2)';
              ctx.fillRect(brick.x, brick.y, brick.width, 3);
            }
          });

          // Draw Paddle
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.roundRect(paddle.x, HEIGHT - 22, paddle.width, paddle.height, 4);
          ctx.fill();
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(paddle.x + 10, HEIGHT - 20, paddle.width - 20, 2);

          // Draw Ball
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, initBricks, onScoreUpdate, soundEnabled]);

  return (
    <div id="breakout-game-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Header Bar */}
        <div className="flex items-center justify-between w-full max-w-[420px] mb-3">
          <div>
            <h3 className="text-xl font-black text-cyan-400">Neon Breakout</h3>
            <span className="text-xs text-slate-400">Move mouse / arrows</span>
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
        <div
          onClick={launchBall}
          className="relative border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner cursor-pointer"
        >
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="block"
          />

          {gameState === 'ready' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <span className="px-4 py-2 bg-cyan-600/90 text-white text-xs font-bold rounded-lg backdrop-blur-sm animate-pulse">
                Click or Space to Launch Ball
              </span>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
              <h3 className="text-2xl font-black text-rose-500 mb-2">GAME OVER</h3>
              <p className="text-sm text-slate-300 mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 bg-emerald-950/85 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
              <h3 className="text-2xl font-black text-emerald-400 mb-2">VICTORY!</h3>
              <p className="text-sm text-slate-200 mb-4">All bricks destroyed! Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
