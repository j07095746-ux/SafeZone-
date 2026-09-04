import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';

interface TetrisGameProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

const SHAPES: { [key: string]: number[][] } = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
};

const COLORS: { [key: string]: string } = {
  I: '#06b6d4',
  O: '#eab308',
  T: '#a855f7',
  S: '#22c55e',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316'
};

const SHAPE_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const TetrisGame: React.FC<TetrisGameProps> = ({ soundEnabled, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const gridRef = useRef<string[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
  const currentPieceRef = useRef<{ shape: number[][]; color: string; type: string; x: number; y: number } | null>(null);
  const nextPieceKeyRef = useRef<string>(SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]);
  const holdPieceRef = useRef<string | null>(null);
  const canHoldRef = useRef(true);
  const dropCounterRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  const spawnPiece = useCallback(() => {
    const key = nextPieceKeyRef.current;
    nextPieceKeyRef.current = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    const shape = SHAPES[key];
    const piece = {
      shape,
      color: COLORS[key],
      type: key,
      x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
      y: 0
    };

    // Check collision on spawn
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] && gridRef.current[piece.y + r]?.[piece.x + c]) {
          setGameOver(true);
          playSound('gameover', soundEnabled);
          return null;
        }
      }
    }

    currentPieceRef.current = piece;
    canHoldRef.current = true;
    return piece;
  }, [soundEnabled]);

  const collide = (x: number, y: number, shape: number[][]): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && gridRef.current[newY][newX]) return true;
        }
      }
    }
    return false;
  };

  const rotate = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  };

  const lockPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece) return;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const y = piece.y + r;
          const x = piece.x + c;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            gridRef.current[y][x] = piece.color;
          }
        }
      }
    }

    // Check completed lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (gridRef.current[r].every(cell => cell !== '')) {
        gridRef.current.splice(r, 1);
        gridRef.current.unshift(Array(COLS).fill(''));
        cleared++;
        r++; // check same row index again
      }
    }

    if (cleared > 0) {
      playSound('clear', soundEnabled);
      const points = [0, 100, 300, 500, 800][cleared] * level;
      setScore(s => {
        const next = s + points;
        onScoreUpdate?.(next);
        return next;
      });
      setLines(l => {
        const nextLines = l + cleared;
        setLevel(Math.floor(nextLines / 10) + 1);
        return nextLines;
      });
    } else {
      playSound('pop', soundEnabled);
    }

    spawnPiece();
  }, [level, onScoreUpdate, soundEnabled, spawnPiece]);

  const moveLeft = useCallback(() => {
    const p = currentPieceRef.current;
    if (!p || gameOver || isPaused) return;
    if (!collide(p.x - 1, p.y, p.shape)) {
      p.x -= 1;
      playSound('click', soundEnabled);
    }
  }, [gameOver, isPaused, soundEnabled]);

  const moveRight = useCallback(() => {
    const p = currentPieceRef.current;
    if (!p || gameOver || isPaused) return;
    if (!collide(p.x + 1, p.y, p.shape)) {
      p.x += 1;
      playSound('click', soundEnabled);
    }
  }, [gameOver, isPaused, soundEnabled]);

  const rotatePiece = useCallback(() => {
    const p = currentPieceRef.current;
    if (!p || gameOver || isPaused) return;
    const rotated = rotate(p.shape);
    // Wall kick attempts
    const offsets = [0, -1, 1, -2, 2];
    for (const offset of offsets) {
      if (!collide(p.x + offset, p.y, rotated)) {
        p.shape = rotated;
        p.x += offset;
        playSound('click', soundEnabled);
        return;
      }
    }
  }, [gameOver, isPaused, soundEnabled]);

  const drop = useCallback(() => {
    const p = currentPieceRef.current;
    if (!p || gameOver || isPaused) return;
    if (!collide(p.x, p.y + 1, p.shape)) {
      p.y += 1;
    } else {
      lockPiece();
    }
    dropCounterRef.current = 0;
  }, [gameOver, isPaused, lockPiece]);

  const hardDrop = useCallback(() => {
    const p = currentPieceRef.current;
    if (!p || gameOver || isPaused) return;
    while (!collide(p.x, p.y + 1, p.shape)) {
      p.y += 1;
    }
    playSound('jump', soundEnabled);
    lockPiece();
  }, [gameOver, isPaused, lockPiece, soundEnabled]);

  const holdPiece = useCallback(() => {
    if (!canHoldRef.current || gameOver || isPaused) return;
    const current = currentPieceRef.current;
    if (!current) return;

    playSound('click', soundEnabled);
    const holdKey = holdPieceRef.current;
    holdPieceRef.current = current.type;

    if (holdKey) {
      const shape = SHAPES[holdKey];
      currentPieceRef.current = {
        shape,
        color: COLORS[holdKey],
        type: holdKey,
        x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
        y: 0
      };
    } else {
      spawnPiece();
    }
    canHoldRef.current = false;
  }, [gameOver, isPaused, soundEnabled, spawnPiece]);

  // Restart game
  const resetGame = useCallback(() => {
    gridRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    holdPieceRef.current = null;
    canHoldRef.current = true;
    nextPieceKeyRef.current = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    spawnPiece();
  }, [spawnPiece]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (gameOver) return;

      if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft();
      else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();
      else if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'x' || e.key === 'X') rotatePiece();
      else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') drop();
      else if (e.code === 'Space') hardDrop();
      else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') holdPiece();
      else if (e.key === 'p' || e.key === 'P') setIsPaused(p => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drop, gameOver, hardDrop, holdPiece, moveLeft, moveRight, rotatePiece]);

  // Main Loop
  useEffect(() => {
    if (!currentPieceRef.current && !gameOver) {
      spawnPiece();
    }

    const dropInterval = Math.max(100, 800 - (level - 1) * 70);

    const update = (time = 0) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (!isPaused && !gameOver) {
        dropCounterRef.current += deltaTime;
        if (dropCounterRef.current > dropInterval) {
          drop();
        }
      }

      // Render main canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid lines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * BLOCK_SIZE);
            ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
            ctx.stroke();
          }
          for (let c = 0; c <= COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * BLOCK_SIZE, 0);
            ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            ctx.stroke();
          }

          // Draw fixed blocks
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              if (gridRef.current[r][c]) {
                ctx.fillStyle = gridRef.current[r][c];
                ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 4);
              }
            }
          }

          // Draw current falling piece and ghost piece
          const p = currentPieceRef.current;
          if (p) {
            // Find ghost Y
            let ghostY = p.y;
            while (!collide(p.x, ghostY + 1, p.shape)) {
              ghostY++;
            }

            // Draw ghost
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            for (let r = 0; r < p.shape.length; r++) {
              for (let c = 0; c < p.shape[r].length; c++) {
                if (p.shape[r][c]) {
                  ctx.fillRect((p.x + c) * BLOCK_SIZE + 1, (ghostY + r) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                  ctx.strokeStyle = p.color;
                  ctx.strokeRect((p.x + c) * BLOCK_SIZE + 1, (ghostY + r) * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                }
              }
            }

            // Draw actual piece
            ctx.fillStyle = p.color;
            for (let r = 0; r < p.shape.length; r++) {
              for (let c = 0; c < p.shape[r].length; c++) {
                if (p.shape[r][c]) {
                  const drawX = (p.x + c) * BLOCK_SIZE + 1;
                  const drawY = (p.y + r) * BLOCK_SIZE + 1;
                  ctx.fillRect(drawX, drawY, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                  ctx.fillStyle = 'rgba(255,255,255,0.3)';
                  ctx.fillRect(drawX, drawY, BLOCK_SIZE - 2, 4);
                  ctx.fillStyle = p.color;
                }
              }
            }
          }
        }
      }

      // Render next piece canvas
      const nextCanvas = nextCanvasRef.current;
      if (nextCanvas) {
        const nextCtx = nextCanvas.getContext('2d');
        if (nextCtx) {
          nextCtx.fillStyle = '#0f172a';
          nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
          const nextKey = nextPieceKeyRef.current;
          if (nextKey && SHAPES[nextKey]) {
            const nextShape = SHAPES[nextKey];
            const color = COLORS[nextKey];
            const size = 18;
            const offsetX = (nextCanvas.width - nextShape[0].length * size) / 2;
            const offsetY = (nextCanvas.height - nextShape.length * size) / 2;

            nextCtx.fillStyle = color;
            for (let r = 0; r < nextShape.length; r++) {
              for (let c = 0; c < nextShape[r].length; c++) {
                if (nextShape[r][c]) {
                  nextCtx.fillRect(offsetX + c * size, offsetY + r * size, size - 2, size - 2);
                }
              }
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(update);
    };

    animFrameIdRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [drop, gameOver, isPaused, level, spawnPiece]);

  return (
    <div id="tetris-game-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Game Canvas */}
        <div className="relative border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner bg-slate-950">
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK_SIZE}
            height={ROWS * BLOCK_SIZE}
            className="block"
          />

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
              <h2 className="text-2xl font-black text-rose-500 tracking-wider mb-2">GAME OVER</h2>
              <p className="text-slate-300 text-sm mb-1">Final Score: <span className="font-bold text-amber-400">{score}</span></p>
              <p className="text-slate-400 text-xs mb-4">Lines Cleared: {lines}</p>
              <button
                onClick={resetGame}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/40 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4">
              <h3 className="text-xl font-bold text-white tracking-widest mb-3">PAUSED</h3>
              <button
                onClick={() => setIsPaused(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" /> Resume
              </button>
            </div>
          )}
        </div>

        {/* Info & Side Panel */}
        <div className="flex flex-col justify-between w-full max-w-[220px] gap-4">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Next Piece</span>
            <div className="flex items-center justify-center bg-slate-900/60 rounded-lg p-2 border border-slate-800">
              <canvas ref={nextCanvasRef} width={80} height={60} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block">Score</span>
              <span className="text-xl font-black text-amber-400">{score}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block">Lines</span>
              <span className="text-xl font-black text-cyan-400">{lines}</span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-center col-span-2">
              <span className="text-xs text-slate-400 block">Level</span>
              <span className="text-lg font-bold text-emerald-400">{level}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPaused(p => !p)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={resetGame}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile / On-Screen Controls */}
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest text-center block mb-2 font-bold">Touch / Quick Keys</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={moveLeft}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-700 text-white rounded-lg flex items-center justify-center cursor-pointer"
                title="Left"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={rotatePiece}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-700 text-white rounded-lg flex items-center justify-center cursor-pointer"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={moveRight}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-700 text-white rounded-lg flex items-center justify-center cursor-pointer"
                title="Right"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={drop}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-700 text-white rounded-lg flex items-center justify-center col-span-2 cursor-pointer"
                title="Soft Drop"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={hardDrop}
                className="p-2 bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                title="Hard Drop"
              >
                DROP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
