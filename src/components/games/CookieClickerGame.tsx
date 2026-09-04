import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/audio';
import { Sparkles, Zap, Award, RotateCcw } from 'lucide-react';

interface CookieClickerProps {
  soundEnabled: boolean;
  onScoreUpdate?: (score: number) => void;
}

interface Building {
  id: string;
  name: string;
  cost: number;
  cps: number;
  count: number;
  icon: string;
}

const INITIAL_BUILDINGS: Building[] = [
  { id: 'cursor', name: 'Auto-Pointer', cost: 15, cps: 0.5, count: 0, icon: '👆' },
  { id: 'grandma', name: 'Baking Grandma', cost: 100, cps: 4, count: 0, icon: '👵' },
  { id: 'farm', name: 'Cookie Farm', cost: 1100, cps: 32, count: 0, icon: '🌾' },
  { id: 'mine', name: 'Chocolate Mine', cost: 12000, cps: 260, count: 0, icon: '⛏️' },
  { id: 'factory', name: 'Cookie Factory', cost: 130000, cps: 1400, count: 0, icon: '🏭' },
  { id: 'bank', name: 'Sugar Bank', cost: 1400000, cps: 7800, count: 0, icon: '🏦' }
];

export const CookieClickerGame: React.FC<CookieClickerProps> = ({ soundEnabled, onScoreUpdate }) => {
  const [cookies, setCookies] = useState<number>(0);
  const [totalBaked, setTotalBaked] = useState<number>(0);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [isCookiePressed, setIsCookiePressed] = useState(false);
  const [clickParticles, setClickParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  const particleIdRef = useRef(0);

  // Compute total CPS
  const cps = buildings.reduce((acc, b) => acc + b.cps * b.count, 0);

  // Idle generation loop (runs every 100ms for smooth increments)
  useEffect(() => {
    const interval = setInterval(() => {
      if (cps > 0) {
        const added = cps / 10;
        setCookies(c => c + added);
        setTotalBaked(t => {
          const next = t + added;
          onScoreUpdate?.(Math.floor(next));
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cps, onScoreUpdate]);

  const handleCookieClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSound('pop', soundEnabled);
    setIsCookiePressed(true);
    setTimeout(() => setIsCookiePressed(false), 120);

    // Compute click power (1 + small bonus per 10 buildings)
    const clickPower = 1 + Math.floor(buildings.reduce((sum, b) => sum + b.count, 0) / 8);

    setCookies(c => c + clickPower);
    setTotalBaked(t => {
      const next = t + clickPower;
      onScoreUpdate?.(Math.floor(next));
      return next;
    });

    // Particle
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticle = {
      id: particleIdRef.current++,
      x,
      y,
      text: `+${clickPower}`
    };

    setClickParticles(p => [...p.slice(-8), newParticle]);
    setTimeout(() => {
      setClickParticles(p => p.filter(item => item.id !== newParticle.id));
    }, 800);
  };

  const buyBuilding = (id: string) => {
    setBuildings(prev =>
      prev.map(b => {
        if (b.id === id && cookies >= b.cost) {
          playSound('score', soundEnabled);
          setCookies(c => c - b.cost);
          return {
            ...b,
            count: b.count + 1,
            cost: Math.floor(b.cost * 1.15)
          };
        }
        return b;
      })
    );
  };

  const resetProgress = () => {
    setCookies(0);
    setTotalBaked(0);
    setBuildings(INITIAL_BUILDINGS);
    playSound('click', soundEnabled);
  };

  return (
    <div id="cookie-clicker-wrapper" className="flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 bg-slate-900/95 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md max-w-2xl w-full">
        {/* Left Column: Big Cookie */}
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="mb-3">
            <h3 className="text-3xl font-black text-amber-400 tracking-tight">
              {Math.floor(cookies).toLocaleString()}
            </h3>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Cookies in Vault
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              +{cps.toFixed(1)} cookies / sec
            </span>
          </div>

          {/* Interactive Giant Cookie */}
          <div className="relative my-4 flex items-center justify-center">
            <button
              onClick={handleCookieClick}
              className={`w-44 h-44 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-800 border-4 border-amber-300/40 shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-75 relative overflow-hidden active:scale-95 ${
                isCookiePressed ? 'scale-90 ring-4 ring-amber-400/50' : 'hover:scale-105'
              }`}
            >
              {/* Chocolate chips representation */}
              <div className="absolute w-5 h-5 bg-amber-950 rounded-full top-8 left-10 shadow-inner" />
              <div className="absolute w-6 h-6 bg-amber-950 rounded-full bottom-10 left-12 shadow-inner" />
              <div className="absolute w-5 h-5 bg-amber-950 rounded-full top-12 right-10 shadow-inner" />
              <div className="absolute w-6 h-6 bg-amber-950 rounded-full bottom-12 right-12 shadow-inner" />
              <div className="absolute w-7 h-7 bg-amber-950 rounded-full top-20 left-20 shadow-inner" />
              <span className="text-6xl select-none drop-shadow-md">🍪</span>
            </button>

            {/* Click float particles */}
            {clickParticles.map(p => (
              <span
                key={p.id}
                className="absolute text-amber-300 font-black text-lg pointer-events-none animate-fade-up duration-700"
                style={{ left: p.x, top: p.y }}
              >
                {p.text}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={resetProgress}
              className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Bakery
            </button>
          </div>
        </div>

        {/* Right Column: Upgrades Store */}
        <div className="flex-1 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Bakery Equipment
              </span>
              <span className="text-[11px] text-slate-400">Total: {Math.floor(totalBaked).toLocaleString()}</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {buildings.map(b => {
                const canAfford = cookies >= b.cost;
                return (
                  <button
                    key={b.id}
                    disabled={!canAfford}
                    onClick={() => buyBuilding(b.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
                      canAfford
                        ? 'bg-slate-900 hover:bg-slate-850 border-slate-700 hover:border-amber-500/50'
                        : 'bg-slate-950/60 border-slate-800/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{b.name}</div>
                        <div className="text-[10px] text-emerald-400">+{b.cps} CPS</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-amber-400">
                        {b.cost.toLocaleString()} 🍪
                      </div>
                      <div className="text-[10px] text-slate-400">Owned: {b.count}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
