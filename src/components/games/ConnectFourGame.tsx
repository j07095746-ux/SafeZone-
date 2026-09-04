import React, { useState, useCallback } from 'react';
import { playSound } from '../../utils/audio';
import { RotateCcw, User, Bot, Award } from 'lucide-react';

interface ConnectFourProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

const ROWS = 6;
const COLS = 7;
type Player = 1 | 2; // 1 = Red, 2 = Yellow

export const ConnectFourGame: React.FC<ConnectFourProps> = ({ soundEnabled, onScoreUpdate }) => {
  const [board, setBoard] = useState<(Player | null)[][]>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [vsBot, setVsBot] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<{ r: number; c: number }[]>([]);

  const checkWin = useCallback((currentBoard: (Player | null)[][], row: number, col: number, player: Player): { r: number; c: number }[] | null => {
    const directions = [
      { dr: 0, dc: 1 },  // horizontal
      { dr: 1, dc: 0 },  // vertical
      { dr: 1, dc: 1 },  // diagonal /
      { dr: 1, dc: -1 }  // diagonal \
    ];

    for (const { dr, dc } of directions) {
      let cells = [{ r: row, c: col }];

      // Look forward
      for (let step = 1; step < 4; step++) {
        const nr = row + dr * step;
        const nc = col + dc * step;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && currentBoard[nr][nc] === player) {
          cells.push({ r: nr, c: nc });
        } else break;
      }

      // Look backward
      for (let step = 1; step < 4; step++) {
        const nr = row - dr * step;
        const nc = col - dc * step;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && currentBoard[nr][nc] === player) {
          cells.push({ r: nr, c: nc });
        } else break;
      }

      if (cells.length >= 4) {
        return cells;
      }
    }
    return null;
  }, []);

  const dropPiece = useCallback((col: number) => {
    if (winner) return;

    setBoard(prevBoard => {
      // Find lowest empty row in column
      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!prevBoard[r][col]) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) return prevBoard; // Column full

      const nextBoard = prevBoard.map(row => [...row]);
      nextBoard[targetRow][col] = currentPlayer;
      playSound('pop', soundEnabled);

      const winLine = checkWin(nextBoard, targetRow, col, currentPlayer);
      if (winLine) {
        setWinner(currentPlayer);
        setWinningCells(winLine);
        playSound('powerup', soundEnabled);
        if (currentPlayer === 1) {
          onScoreUpdate?.(100);
        }
        return nextBoard;
      }

      // Check draw
      if (nextBoard.every(row => row.every(cell => cell !== null))) {
        setWinner('draw');
        return nextBoard;
      }

      const nextPlayer: Player = currentPlayer === 1 ? 2 : 1;
      setCurrentPlayer(nextPlayer);

      // Bot turn if playing vs Bot
      if (vsBot && nextPlayer === 2) {
        setTimeout(() => {
          makeBotMove(nextBoard);
        }, 400);
      }

      return nextBoard;
    });
  }, [checkWin, currentPlayer, onScoreUpdate, soundEnabled, vsBot, winner]);

  const makeBotMove = (currentBoard: (Player | null)[][]) => {
    if (winner) return;

    // Available columns
    const availableCols: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (!currentBoard[0][c]) availableCols.push(c);
    }

    if (availableCols.length === 0) return;

    // 1. Check if bot can win in one move
    for (const c of availableCols) {
      let targetR = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!currentBoard[r][c]) {
          targetR = r;
          break;
        }
      }
      if (targetR !== -1) {
        currentBoard[targetR][c] = 2;
        if (checkWin(currentBoard, targetR, c, 2)) {
          currentBoard[targetR][c] = null;
          dropPiece(c);
          return;
        }
        currentBoard[targetR][c] = null;
      }
    }

    // 2. Check if player could win next and block
    for (const c of availableCols) {
      let targetR = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (!currentBoard[r][c]) {
          targetR = r;
          break;
        }
      }
      if (targetR !== -1) {
        currentBoard[targetR][c] = 1;
        if (checkWin(currentBoard, targetR, c, 1)) {
          currentBoard[targetR][c] = null;
          dropPiece(c);
          return;
        }
        currentBoard[targetR][c] = null;
      }
    }

    // 3. Prefer center column, then random
    const preferredCols = [3, 2, 4, 1, 5, 0, 6].filter(c => availableCols.includes(c));
    const chosen = preferredCols.length > 0 ? preferredCols[0] : availableCols[0];
    dropPiece(chosen);
  };

  const restart = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
    playSound('click', soundEnabled);
  };

  return (
    <div id="connect-four-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col items-center bg-slate-900/95 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-[380px] mb-4">
          <div>
            <h3 className="text-xl font-black text-rose-400">Four in a Line</h3>
            <span className="text-xs text-slate-400">Align 4 checkers to win</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVsBot(!vsBot);
                restart();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 text-slate-200 cursor-pointer"
            >
              {vsBot ? <Bot className="w-3.5 h-3.5 text-cyan-400" /> : <User className="w-3.5 h-3.5 text-amber-400" />}
              {vsBot ? 'vs Bot' : '2-Player'}
            </button>
            <button
              onClick={restart}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Turn indicator */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-400">Current Turn:</span>
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                currentPlayer === 1 ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-amber-400 shadow-lg shadow-amber-400/50'
              }`}
            />
            <span className={currentPlayer === 1 ? 'text-rose-400' : 'text-amber-400'}>
              {currentPlayer === 1 ? 'Red (You)' : vsBot ? 'Yellow (Bot)' : 'Yellow (Player 2)'}
            </span>
          </div>
        </div>

        {/* Board */}
        <div className="bg-blue-700 p-3 rounded-2xl border-4 border-blue-800 shadow-2xl">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: COLS }).map((_, c) => (
              <button
                key={c}
                disabled={!!winner || !board[0] || !!board[0][c]}
                onClick={() => dropPiece(c)}
                className="flex flex-col gap-2 p-1 rounded-lg hover:bg-blue-600/40 transition cursor-pointer group"
              >
                {Array.from({ length: ROWS }).map((_, r) => {
                  const cell = board[r][c];
                  const isWinning = winningCells.some(wc => wc.r === r && wc.c === c);

                  return (
                    <div
                      key={r}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-blue-900 shadow-inner flex items-center justify-center transition-all ${
                        cell === 1
                          ? 'bg-gradient-to-br from-rose-500 to-rose-700'
                          : cell === 2
                          ? 'bg-gradient-to-br from-amber-300 to-amber-500'
                          : 'bg-slate-950 group-hover:bg-slate-900'
                      } ${isWinning ? 'ring-4 ring-white animate-bounce' : ''}`}
                    />
                  );
                })}
              </button>
            ))}
          </div>
        </div>

        {/* Win Banner */}
        {winner && (
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl text-center w-full max-w-[380px]">
            {winner === 'draw' ? (
              <p className="text-sm font-bold text-slate-300">Stalemate! Board is full.</p>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-white">
                  {winner === 1 ? 'Red Team Wins!' : 'Yellow Team Wins!'}
                </span>
              </div>
            )}
            <button
              onClick={restart}
              className="mt-2 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
