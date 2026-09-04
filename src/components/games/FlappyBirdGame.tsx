import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCcw } from 'lucide-react';

interface FlappyBirdGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

const WIDTH = 340;
const HEIGHT = 480;
const GRAVITY = 0.28;
const JUMP = -5.8;
const PIPE_SPEED = 2.2;
const PIPE_GAP = 125;
const PIPE_WIDTH = 52;

export const FlappyBirdGame: React.FC<FlappyBirdGameProps> = ({ soundEnabled, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const birdRef = useRef<{ y: number; velocity: number; rotation: number }>({
    y: HEIGHT / 2,
    velocity: 0,
    rotation: 0
  });

  const pipesRef = useRef<Pipe[]>([]);
  const frameCountRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const flap = useCallback(() => {
    if (gameState === 'idle') {
      setGameState('playing');
      birdRef.current.velocity = JUMP;
      playSound('jump', soundEnabled);
      return;
    }
    if (gameState === 'gameover') {
      return;
    }
    birdRef.current.velocity = JUMP;
    playSound('jump', soundEnabled);
  }, [gameState, soundEnabled]);

  const resetGame = useCallback(() => {
    birdRef.current = {
      y: HEIGHT / 2,
      velocity: 0,
      rotation: 0
    };
    pipesRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    setGameState('idle');
    playSound('click', soundEnabled);
  }, [soundEnabled]);

  // Space / click to flap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flap]);

  // Game Engine Loop
  useEffect(() => {
    const update = () => {
      const bird = birdRef.current;
      const pipes = pipesRef.current;

      if (gameState === 'playing') {
        frameCountRef.current++;

        // Bird Physics
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;
        bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (bird.velocity * 4 * Math.PI) / 180));

        // Pipe Spawning
        if (frameCountRef.current % 100 === 0) {
          const minH = 60;
          const maxH = HEIGHT - PIPE_GAP - minH - 60;
          const topH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
          pipes.push({
            x: WIDTH,
            topHeight: topH,
            bottomY: topH + PIPE_GAP,
            passed: false
          });
        }

        // Pipe Movement & Collision
        for (let i = pipes.length - 1; i >= 0; i--) {
          const pipe = pipes[i];
          pipe.x -= PIPE_SPEED;

          // Check Score
          if (!pipe.passed && pipe.x + PIPE_WIDTH < WIDTH / 2 - 14) {
            pipe.passed = true;
            playSound('score', soundEnabled);
            setScore(s => {
              const next = s + 1;
              onScoreUpdate?.(next);
              setHighScore(h => Math.max(h, next));
              return next;
            });
          }

          // Remove off-screen pipes
          if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
            continue;
          }

          // Hitbox collision (bird radius ~14)
          const birdX = WIDTH / 2;
          const birdY = bird.y;
          const radius = 12;

          // Inside pipe X range
          if (birdX + radius > pipe.x && birdX - radius < pipe.x + PIPE_WIDTH) {
            // Hit top pipe or bottom pipe
            if (birdY - radius < pipe.topHeight || birdY + radius > pipe.bottomY) {
              setGameState('gameover');
              playSound('gameover', soundEnabled);
            }
          }
        }

        // Floor / Ceiling Collision
        if (bird.y + 14 >= HEIGHT - 40) {
          bird.y = HEIGHT - 40 - 14;
          setGameState('gameover');
          playSound('gameover', soundEnabled);
        }
        if (bird.y - 14 <= 0) {
          bird.y = 14;
          bird.velocity = 0;
        }
      }

      // Drawing
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Sky gradient
          const skyGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
          skyGradient.addColorStop(0, '#0284c7');
          skyGradient.addColorStop(0.7, '#38bdf8');
          skyGradient.addColorStop(1, '#bae6fd');
          ctx.fillStyle = skyGradient;
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          // Draw clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(80, 100, 30, 0, Math.PI * 2);
          ctx.arc(110, 90, 35, 0, Math.PI * 2);
          ctx.arc(140, 100, 30, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(240, 160, 25, 0, Math.PI * 2);
          ctx.arc(265, 150, 30, 0, Math.PI * 2);
          ctx.arc(290, 160, 25, 0, Math.PI * 2);
          ctx.fill();

          // Draw Pipes
          pipes.forEach(pipe => {
            // Top pipe
            ctx.fillStyle = '#15803d';
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
            ctx.fillStyle = '#166534';
            ctx.fillRect(pipe.x - 3, pipe.topHeight - 18, PIPE_WIDTH + 6, 18);

            // Bottom pipe
            ctx.fillStyle = '#15803d';
            ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, HEIGHT - pipe.bottomY);
            ctx.fillStyle = '#166534';
            ctx.fillRect(pipe.x - 3, pipe.bottomY, PIPE_WIDTH + 6, 18);
          });

          // Ground
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(0, HEIGHT - 40, WIDTH, 40);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(0, HEIGHT - 40, WIDTH, 8);

          // Draw Bird
          ctx.save();
          ctx.translate(WIDTH / 2, bird.y);
          ctx.rotate(bird.rotation);

          // Bird body (yellow circle)
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(6, -4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(8, -4, 2, 0, Math.PI * 2);
          ctx.fill();

          // Beak
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(10, 1);
          ctx.lineTo(18, 5);
          ctx.lineTo(10, 8);
          ctx.closePath();
          ctx.fill();

          // Wing
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.ellipse(-4, 3, 7, 4, -0.3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // In-game score display
          if (gameState === 'playing') {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.strokeText(score.toString(), WIDTH / 2, 70);
            ctx.fillText(score.toString(), WIDTH / 2, 70);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, onScoreUpdate, score, soundEnabled]);

  return (
    <div id="flappy-game-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col items-center bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Top Info */}
        <div className="flex items-center justify-between w-full max-w-[340px] mb-3">
          <div className="text-left">
            <h3 className="text-xl font-black text-sky-400">Flappy Flight</h3>
            <span className="text-xs text-slate-400">Tap / Space to Fly</span>
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-bold">BEST</span>
              <span className="text-sm font-black text-amber-400">{highScore}</span>
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
          onClick={flap}
          className="relative border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
        >
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block" />

          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
              <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-xl shadow-xl">
                <p className="text-lg font-black text-amber-300 mb-1">READY FOR TAKEOFF</p>
                <p className="text-xs text-slate-300 mb-4">Click or press Space to flap wings</p>
                <button className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold rounded-lg text-sm shadow-md">
                  CLICK TO START
                </button>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="p-5 bg-slate-900 border border-rose-600/40 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-black text-rose-500 mb-2">GAME OVER</h3>
                <p className="text-sm text-slate-300 mb-1">Score: <span className="font-bold text-white">{score}</span></p>
                <p className="text-xs text-slate-400 mb-4">High Score: <span className="font-bold text-amber-400">{highScore}</span></p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetGame();
                  }}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-bold rounded-lg text-sm flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
