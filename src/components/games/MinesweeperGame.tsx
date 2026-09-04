import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playSound } from '../../utils/audio';
import { Flag, Bomb, Smile, Frown, Award, RotateCcw } from 'lucide-react';

interface MinesweeperProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborMines: number;
}

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 22 }
};

const NUMBER_COLORS = [
  '',
  'text-blue-400 font-bold',
  'text-emerald-400 font-bold',
  'text-rose-400 font-bold',
  'text-indigo-400 font-bold',
  'text-amber-500 font-bold',
  'text-cyan-400 font-bold',
  'text-purple-400 font-bold',
  'text-white font-bold'
];

export const MinesweeperGame: React.FC<MinesweeperProps> = ({ soundEnabled, onScoreUpdate }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [flagMode, setFlagMode] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  const { rows, cols, mines } = DIFFICULTIES[difficulty];

  const createEmptyBoard = useCallback((rCount: number, cCount: number): Cell[][] => {
    return Array.from({ length: rCount }, (_, r) =>
      Array.from({ length: cCount }, (_, c) => ({
        r,
        c,
        isMine: false,
        revealed: false,
        flagged: false,
        neighborMines: 0
      }))
    );
  }, []);

  const populateMines = useCallback((board: Cell[][], firstR: number, firstC: number, mineCount: number): Cell[][] => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let placed = 0;

    while (placed < mineCount) {
      const randR = Math.floor(Math.random() * rows);
      const randC = Math.floor(Math.random() * cols);

      // Don't place on or around first click
      if (Math.abs(randR - firstR) <= 1 && Math.abs(randC - firstC) <= 1) continue;
      if (newBoard[randR][randC].isMine) continue;

      newBoard[randR][randC].isMine = true;
      placed++;
    }

    // Calculate neighbors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                count++;
              }
            }
          }
          newBoard[r][c].neighborMines = count;
        }
      }
    }

    return newBoard;
  }, [cols, rows]);

  const initGame = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setGrid(createEmptyBoard(rows, cols));
    setGameState('idle');
    setTimer(0);
  }, [cols, createEmptyBoard, rows]);

  useEffect(() => {
    initGame();
  }, [initGame, difficulty]);

  // Timer ticker
  useEffect(() => {
    if (gameState === 'playing') {
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState]);

  const revealCell = (r: number, c: number) => {
    if (gameState === 'lost' || gameState === 'won') return;

    let currentGrid = grid;

    if (gameState === 'idle') {
      // First click: generate safe board
      currentGrid = populateMines(grid, r, c, mines);
      setGameState('playing');
    }

    const cell = currentGrid[r][c];
    if (cell.flagged || cell.revealed) return;

    if (cell.isMine) {
      // Game Over - reveal all mines
      const revealedGrid = currentGrid.map(row =>
        row.map(cellItem => ({
          ...cellItem,
          revealed: cellItem.isMine ? true : cellItem.revealed
        }))
      );
      setGrid(revealedGrid);
      setGameState('lost');
      playSound('gameover', soundEnabled);
      return;
    }

    // Flood fill algorithm for zero tiles
    const newGrid = currentGrid.map(row => row.map(ci => ({ ...ci })));
    const queue: [number, number][] = [[r, c]];
    newGrid[r][c].revealed = true;
    let revealedCount = 0;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      revealedCount++;
      const currentCell = newGrid[currR][currC];

      if (currentCell.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = newGrid[nr][nc];
              if (!neighbor.revealed && !neighbor.flagged && !neighbor.isMine) {
                neighbor.revealed = true;
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    playSound('pop', soundEnabled);
    setGrid(newGrid);

    // Check Win condition
    let unrevealedNonMines = 0;
    for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
      for (let colIdx = 0; colIdx < cols; colIdx++) {
        if (!newGrid[rowIdx][colIdx].isMine && !newGrid[rowIdx][colIdx].revealed) {
          unrevealedNonMines++;
        }
      }
    }

    if (unrevealedNonMines === 0) {
      setGameState('won');
      playSound('score', soundEnabled);
      onScoreUpdate?.(1000 - timer * 2);
    }
  };

  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (gameState === 'lost' || gameState === 'won') return;

    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      const cell = next[r][c];
      if (!cell.revealed) {
        cell.flagged = !cell.flagged;
        playSound('click', soundEnabled);
      }
      return next;
    });
  };

  const remainingFlags = mines - grid.flat().filter(c => c.flagged).length;

  return (
    <div id="minesweeper-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="bg-slate-900/95 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col items-center">
        {/* Difficulty Selection */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDifficulty('easy')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                difficulty === 'easy' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Easy (9x9)
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                difficulty === 'medium' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Medium (12x12)
            </button>
          </div>

          <button
            onClick={() => setFlagMode(!flagMode)}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              flagMode ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> Flag Mode: {flagMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Counter & Status Bar */}
        <div className="flex items-center justify-between w-full bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
          <div className="text-xl font-mono font-black text-rose-500 bg-black/60 px-3 py-1 rounded border border-rose-900/40">
            {String(remainingFlags).padStart(3, '0')}
          </div>

          <button
            onClick={initGame}
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-full text-amber-400 transition cursor-pointer"
          >
            {gameState === 'won' ? (
              <Award className="w-6 h-6 text-emerald-400" />
            ) : gameState === 'lost' ? (
              <Frown className="w-6 h-6 text-rose-400" />
            ) : (
              <Smile className="w-6 h-6" />
            )}
          </button>

          <div className="text-xl font-mono font-black text-cyan-400 bg-black/60 px-3 py-1 rounded border border-cyan-900/40">
            {String(Math.min(999, timer)).padStart(3, '0')}
          </div>
        </div>

        {/* Game Grid */}
        <div
          className="grid gap-1 bg-slate-950 p-2.5 rounded-xl border-2 border-slate-800 shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => (flagMode ? toggleFlag(r, c) : revealCell(r, c))}
                onContextMenu={e => toggleFlag(r, c, e)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-sm font-black transition cursor-pointer select-none ${
                  cell.revealed
                    ? cell.isMine
                      ? 'bg-rose-700 text-white'
                      : 'bg-slate-900 text-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 shadow-sm'
                }`}
              >
                {cell.revealed ? (
                  cell.isMine ? (
                    <Bomb className="w-4 h-4 animate-pulse" />
                  ) : cell.neighborMines > 0 ? (
                    <span className={NUMBER_COLORS[cell.neighborMines]}>{cell.neighborMines}</span>
                  ) : null
                ) : cell.flagged ? (
                  <Flag className="w-4 h-4 text-rose-500 fill-rose-500" />
                ) : null}
              </button>
            ))
          )}
        </div>

        {/* Win/Loss banner */}
        {gameState === 'won' && (
          <div className="mt-4 p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-center w-full">
            <h4 className="text-emerald-400 font-bold">Field Cleared! 🎉</h4>
            <p className="text-xs text-slate-300">Time: {timer} seconds</p>
          </div>
        )}
        {gameState === 'lost' && (
          <div className="mt-4 p-3 bg-rose-950 border border-rose-600 rounded-xl text-center w-full">
            <h4 className="text-rose-400 font-bold">Detonation! 💥</h4>
            <p className="text-xs text-slate-300">Press smiley to retry</p>
          </div>
        )}
      </div>
    </div>
  );
};
