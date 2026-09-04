import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCcw } from 'lucide-react';

interface Game2048Props {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

type Grid = number[][];

const SIZE = 4;

const TILE_COLORS: { [key: number]: { bg: string } } = {
  2: { bg: 'bg-amber-100 text-stone-800' },
  4: { bg: 'bg-amber-200 text-stone-800' },
  8: { bg: 'bg-orange-400 text-white shadow-md' },
  16: { bg: 'bg-orange-500 text-white shadow-md' },
  19: { bg: 'bg-rose-500 text-white shadow-md' },
  32: { bg: 'bg-rose-500 text-white shadow-md' },
  64: { bg: 'bg-rose-600 text-white shadow-lg' },
  128: { bg: 'bg-yellow-400 text-stone-900 shadow-lg font-bold' },
  256: { bg: 'bg-yellow-500 text-white shadow-lg font-bold' },
  512: { bg: 'bg-yellow-600 text-white shadow-xl font-black' },
  1024: { bg: 'bg-cyan-500 text-white shadow-xl font-black' },
  2048: { bg: 'bg-emerald-500 text-white shadow-2xl ring-2 ring-emerald-300 font-black' },
  4096: { bg: 'bg-purple-600 text-white shadow-2xl font-black' }
};

export const Game2048: React.FC<Game2048Props> = ({ soundEnabled, onScoreUpdate }) => {
  const [grid, setGrid] = useState<Grid>(() => createInitialGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function createInitialGrid(): Grid {
    let newGrid = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    return newGrid;
  }

  function addRandomTile(currentGrid: Grid): Grid {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentGrid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length === 0) return currentGrid;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.9 ? 2 : 4;

    const newGrid = currentGrid.map(row => [...row]);
    newGrid[randomCell.r][randomCell.c] = val;
    return newGrid;
  }

  const checkGameOver = (currentGrid: Grid): boolean => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (currentGrid[r][c] === 0) return false;
        if (r < SIZE - 1 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
        if (c < SIZE - 1 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    setGrid(prev => {
      let moved = false;
      let pointsEarned = 0;
      let newGrid = prev.map(row => [...row]);

      const slideAndMergeRow = (row: number[]) => {
        let nonZero = row.filter(v => v !== 0);
        let merged: number[] = [];

        for (let i = 0; i < nonZero.length; i++) {
          if (nonZero[i] === nonZero[i + 1]) {
            const combined = nonZero[i] * 2;
            merged.push(combined);
            pointsEarned += combined;
            if (combined === 2048 && !gameWon) {
              setGameWon(true);
              playSound('powerup', soundEnabled);
            }
            i++; // skip merged
          } else {
            merged.push(nonZero[i]);
          }
        }

        while (merged.length < SIZE) {
          merged.push(0);
        }
        return merged;
      };

      if (direction === 'left') {
        for (let r = 0; r < SIZE; r++) {
          const oldRow = newGrid[r];
          const newRow = slideAndMergeRow(oldRow);
          if (oldRow.some((v, i) => v !== newRow[i])) moved = true;
          newGrid[r] = newRow;
        }
      } else if (direction === 'right') {
        for (let r = 0; r < SIZE; r++) {
          const oldRow = [...newGrid[r]].reverse();
          const newRow = slideAndMergeRow(oldRow).reverse();
          if (newGrid[r].some((v, i) => v !== newRow[i])) moved = true;
          newGrid[r] = newRow;
        }
      } else if (direction === 'up') {
        for (let c = 0; c < SIZE; c++) {
          const oldCol = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          const newCol = slideAndMergeRow(oldCol);
          if (oldCol.some((v, i) => v !== newCol[i])) moved = true;
          for (let r = 0; r < SIZE; r++) newGrid[r][c] = newCol[r];
        }
      } else if (direction === 'down') {
        for (let c = 0; c < SIZE; c++) {
          const oldCol = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
          const newCol = slideAndMergeRow(oldCol);
          if ([newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]].some((v, i) => v !== newCol[3 - i])) moved = true;
          for (let r = 0; r < SIZE; r++) newGrid[r][c] = newCol[3 - r];
        }
      }

      if (moved) {
        playSound(pointsEarned > 0 ? 'score' : 'pop', soundEnabled);
        const gridWithTile = addRandomTile(newGrid);

        if (pointsEarned > 0) {
          setScore(s => {
            const nextScore = s + pointsEarned;
            onScoreUpdate?.(nextScore);
            setBestScore(b => Math.max(b, nextScore));
            return nextScore;
          });
        }

        if (checkGameOver(gridWithTile)) {
          setGameOver(true);
          playSound('gameover', soundEnabled);
        }

        return gridWithTile;
      }

      return prev;
    });
  }, [gameOver, gameWon, onScoreUpdate, soundEnabled]);

  const restart = () => {
    setGrid(createInitialGrid());
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    playSound('click', soundEnabled);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') move('left');
      if (e.key === 'ArrowRight' || e.key === 'd') move('right');
      if (e.key === 'ArrowUp' || e.key === 'w') move('up');
      if (e.key === 'ArrowDown' || e.key === 's') move('down');
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 30) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > 30) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }
  };

  return (
    <div
      id="game-2048-container"
      className="flex flex-col items-center justify-center p-4 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-[360px] bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black text-amber-400 tracking-tight">2048</h2>
            <p className="text-xs text-slate-400">Merge tiles to 2048!</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Score</span>
              <span className="text-sm font-black text-white">{score}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Best</span>
              <span className="text-sm font-black text-amber-400">{bestScore}</span>
            </div>
            <button
              onClick={restart}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition cursor-pointer"
              title="Reset Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4x4 Grid */}
        <div className="relative bg-slate-950 p-3 rounded-xl border-2 border-slate-800 aspect-square grid grid-cols-4 grid-rows-4 gap-2.5 shadow-inner">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const tileStyle = val > 0 ? (TILE_COLORS[val] || { bg: 'bg-purple-700 text-white' }) : null;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center rounded-lg font-bold text-lg md:text-xl transition-all duration-100 ${
                    val === 0
                      ? 'bg-slate-900/70'
                      : `${tileStyle?.bg} animate-in zoom-in-50`
                  }`}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4">
              <h3 className="text-2xl font-black text-rose-500 mb-2">Game Over!</h3>
              <p className="text-sm text-slate-300 mb-4">Total Score: {score}</p>
              <button
                onClick={restart}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          )}

          {gameWon && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4">
              <h3 className="text-2xl font-black text-emerald-400 mb-2">You Hit 2048!</h3>
              <p className="text-sm text-slate-200 mb-4">Master tactician reached the summit.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setGameWon(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Keep Going
                </button>
                <button
                  onClick={restart}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg cursor-pointer"
                >
                  New Game
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Directional Pad */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <button
            onClick={() => move('up')}
            className="w-14 py-2 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => move('left')}
              className="w-14 py-2 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              ◀
            </button>
            <button
              onClick={() => move('down')}
              className="w-14 py-2 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              ▼
            </button>
            <button
              onClick={() => move('right')}
              className="w-14 py-2 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
