import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Atom,
  Search,
  FileText,
  CheckCircle2,
  ArrowDown,
  Sparkles,
  Clock,
  Compass,
  Binary,
  Sigma,
  ChevronRight,
  SlidersHorizontal,
  Lightbulb,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface EducationalPortalProps {
  passcode: string;
  onUnlock: () => void;
  soundEnabled: boolean;
}

export const EducationalPortal: React.FC<EducationalPortalProps> = ({
  passcode,
  onUnlock,
  soundEnabled
}) => {
  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState('');
  const [recentKeySequence, setRecentKeySequence] = useState('');
  const [isUnlockedSequence, setIsUnlockedSequence] = useState(false);
  const [calcMode, setCalcMode] = useState<'standard' | 'scientific' | 'alpha'>('standard');
  const [showHint, setShowHint] = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState<'math' | 'physics' | 'chem' | 'cs'>('math');
  const [searchQuery, setSearchQuery] = useState('');

  const calcInputRef = useRef<HTMLInputElement>(null);
  const targetCode = (passcode || '55555').trim().toLowerCase();

  // Scroll to calculator utility
  const scrollToCalculator = () => {
    playSound('click', soundEnabled);
    const el = document.getElementById('study-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        calcInputRef.current?.focus();
      }, 500);
    }
  };

  // Trigger unlock transition
  const triggerUnlock = () => {
    if (isUnlockedSequence) return;
    setIsUnlockedSequence(true);
    playSound('score', soundEnabled);
    setTimeout(() => {
      onUnlock();
    }, 600);
  };

  // Check whether any 5 characters have been typed or entered
  const checkPasscode = (text: string) => {
    const clean = text.trim();
    // Unlock on ANY 5 characters (letters, numbers, or inputs)
    if (clean.length >= 5) {
      triggerUnlock();
      return true;
    }
    // Also check if matches target code specifically
    if (targetCode && (clean.toLowerCase() === targetCode || clean.toLowerCase().endsWith(targetCode))) {
      triggerUnlock();
      return true;
    }
    return false;
  };

  // Calculator button press handler
  const handleButtonPress = (btn: string) => {
    playSound('click', soundEnabled);

    if (btn === 'C') {
      setCalcDisplay('0');
      setRecentKeySequence('');
      return;
    }

    if (btn === 'AC') {
      setCalcDisplay('0');
      setCalcHistory('');
      setRecentKeySequence('');
      return;
    }

    if (btn === 'DEL') {
      setCalcDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      setRecentKeySequence(prev => (prev.length > 1 ? prev.slice(0, -1) : ''));
      return;
    }

    if (btn === '=') {
      // Check passcode first
      if (checkPasscode(calcDisplay) || checkPasscode(recentKeySequence)) {
        return;
      }
      try {
        // Safe evaluation of standard arithmetic expressions
        const sanitized = calcDisplay
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');

        // Only evaluate if it contains valid math symbols
        if (/^[0-9+\-*/().MathPIsincotanqrt\s**]+$/.test(sanitized)) {
          // eslint-disable-next-line no-eval
          const result = Function(`'use strict'; return (${sanitized})`)();
          setCalcHistory(`${calcDisplay} =`);
          setCalcDisplay(String(Number(result.toFixed(6))));
        }
      } catch {
        setCalcDisplay('Error');
      }
      return;
    }

    // Append character
    const newDisplay = calcDisplay === '0' || calcDisplay === 'Error' ? btn : calcDisplay + btn;
    const newSeq = recentKeySequence + btn;
    setCalcDisplay(newDisplay);
    setRecentKeySequence(newSeq);

    // Instant unlock check on ANY 5 characters
    checkPasscode(newDisplay);
    checkPasscode(newSeq);
  };

  // Direct physical keyboard listener while on the educational page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on the search input, do not intercept
      if (document.activeElement?.id === 'edu-search-input') {
        return;
      }

      const key = e.key;

      if (key === 'Backspace') {
        handleButtonPress('DEL');
        return;
      }

      if (key === 'Escape') {
        handleButtonPress('AC');
        return;
      }

      if (key === 'Enter' || key === '=') {
        handleButtonPress('=');
        return;
      }

      // Any single printable character (letters, numbers, symbols)
      if (key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setCalcDisplay(prev => {
          const next = prev === '0' || prev === 'Error' ? key : prev + key;
          checkPasscode(next);
          return next;
        });

        setRecentKeySequence(prev => {
          const next = prev + key;
          checkPasscode(next);
          return next.slice(-10);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [soundEnabled, isUnlockedSequence]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Top Academic Notification Bar */}
      <div className="bg-slate-950 border-b border-slate-800 py-2 px-4 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 max-w-2xl">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 text-[10px] uppercase tracking-wider">
            Academic Term 2026
          </span>
          <span className="truncate">
            📢 Midterm examination syllabus and STEM lab schedules are now available.
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> Mon - Fri 8:00 AM - 4:30 PM
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Portal Verified
          </span>
        </div>
      </div>

      {/* Main Educational Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                Apex Learning Hub
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20 font-normal">
                  EDU-v4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Curriculum & STEM Resource Directory
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#curriculum" className="hover:text-white transition">Curriculum</a>
            <a href="#resources" className="hover:text-white transition">Course Modules</a>
            <a href="#study-calculator" onClick={e => { e.preventDefault(); scrollToCalculator(); }} className="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Study Calculator
            </a>
            <a href="#academic-calendar" className="hover:text-white transition">Calendar</a>
          </nav>

          {/* Direct Actions to Enter or Open Calculator */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={scrollToCalculator}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
            <button
              onClick={triggerUnlock}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95"
              title="Enter Safezone Site"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter Safezone</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Academic Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-slate-900 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-indigo-300 font-medium mb-5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accredited Secondary & Higher Education Curriculum</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Digital Learning & Academic Resource Center
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8">
              Access syllabus guidelines, course textbooks, formula archives, and scientific problem-solving tools designed for high school and university STEM coursework.
            </p>

            {/* Quick Search */}
            <div className="relative max-w-xl mb-6">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="edu-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search calculus formulas, physics constants, textbooks..."
                className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>

            {/* Quick Jump Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={triggerUnlock}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enter Safezone</span>
              </button>
              <button
                onClick={scrollToCalculator}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 text-blue-400 animate-bounce" />
                <span>Scroll Down to Student Calculator</span>
              </button>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Tip: Type any 5 keys or use the study calculator below to enter.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Curriculum Overview */}
      <section id="curriculum" className="py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Course Directory</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Active Departmental Pathways
              </h2>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCourseTab('math')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCourseTab === 'math'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Mathematics
              </button>
              <button
                onClick={() => setActiveCourseTab('physics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCourseTab === 'physics'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Physics
              </button>
              <button
                onClick={() => setActiveCourseTab('chem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCourseTab === 'chem'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Chemistry
              </button>
              <button
                onClick={() => setActiveCourseTab('cs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCourseTab === 'cs'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Computer Science
              </button>
            </div>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeCourseTab === 'math' && (
              <>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <Sigma className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">AP Calculus BC</h3>
                  <p className="text-xs text-slate-400 mb-3">Taylor polynomials, polar integration, parametric curves, and convergence series.</p>
                  <span className="text-[11px] text-indigo-400 font-mono font-medium">MATH-401 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Linear Algebra</h3>
                  <p className="text-xs text-slate-400 mb-3">Eigenvectors, matrix transformations, orthogonal projections, and vector spaces.</p>
                  <span className="text-[11px] text-indigo-400 font-mono font-medium">MATH-310 • 3 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <Binary className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Discrete Mathematics</h3>
                  <p className="text-xs text-slate-400 mb-3">Combinatorics, graph theory, boolean logic, and mathematical induction proofs.</p>
                  <span className="text-[11px] text-indigo-400 font-mono font-medium">MATH-220 • 3 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Applied Statistics</h3>
                  <p className="text-xs text-slate-400 mb-3">Hypothesis testing, regression modeling, probability density, and variance analysis.</p>
                  <span className="text-[11px] text-indigo-400 font-mono font-medium">MATH-180 • 3 Credits</span>
                </div>
              </>
            )}

            {activeCourseTab === 'physics' && (
              <>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Atom className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Classical Mechanics</h3>
                  <p className="text-xs text-slate-400 mb-3">Newtonian dynamics, conservation laws, rotational kinematics, and oscillations.</p>
                  <span className="text-[11px] text-blue-400 font-mono font-medium">PHYS-101 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Electromagnetism</h3>
                  <p className="text-xs text-slate-400 mb-3">Maxwell equations, electric flux, magnetic induction, and circuit dynamics.</p>
                  <span className="text-[11px] text-blue-400 font-mono font-medium">PHYS-201 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Thermodynamics</h3>
                  <p className="text-xs text-slate-400 mb-3">Entropy, heat cycles, ideal gas laws, and statistical mechanics fundamentals.</p>
                  <span className="text-[11px] text-blue-400 font-mono font-medium">PHYS-250 • 3 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Sigma className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Wave Optics</h3>
                  <p className="text-xs text-slate-400 mb-3">Diffraction gratings, interference patterns, lasers, and polarization.</p>
                  <span className="text-[11px] text-blue-400 font-mono font-medium">PHYS-320 • 3 Credits</span>
                </div>
              </>
            )}

            {activeCourseTab === 'chem' && (
              <>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                    <Atom className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">General Chemistry I</h3>
                  <p className="text-xs text-slate-400 mb-3">Atomic structure, stoichiometry, chemical bonding, and gas behaviors.</p>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">CHEM-110 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Organic Chemistry</h3>
                  <p className="text-xs text-slate-400 mb-3">Reaction mechanisms, stereochemistry, synthesis pathways, and spectroscopy.</p>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">CHEM-240 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Chemical Kinetics</h3>
                  <p className="text-xs text-slate-400 mb-3">Reaction rates, activation energy, catalysis, and equilibrium constants.</p>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">CHEM-310 • 3 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Biochemistry</h3>
                  <p className="text-xs text-slate-400 mb-3">Macromolecules, enzyme kinetics, metabolic pathways, and cellular respiration.</p>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">CHEM-360 • 4 Credits</span>
                </div>
              </>
            )}

            {activeCourseTab === 'cs' && (
              <>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <Binary className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Data Structures</h3>
                  <p className="text-xs text-slate-400 mb-3">Trees, hash maps, balanced graphs, heaps, and algorithmic time complexity.</p>
                  <span className="text-[11px] text-amber-400 font-mono font-medium">CS-201 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Algorithm Analysis</h3>
                  <p className="text-xs text-slate-400 mb-3">Dynamic programming, greedy paradigms, divide-and-conquer, and NP-completeness.</p>
                  <span className="text-[11px] text-amber-400 font-mono font-medium">CS-330 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Computer Systems</h3>
                  <p className="text-xs text-slate-400 mb-3">Assembly architecture, memory hierarchies, virtual addressing, and cache design.</p>
                  <span className="text-[11px] text-amber-400 font-mono font-medium">CS-250 • 4 Credits</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-indigo-500/40 transition">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">Cybersecurity & Crypto</h3>
                  <p className="text-xs text-slate-400 mb-3">Public-key cryptography, symmetric ciphers, network protocols, and authentication.</p>
                  <span className="text-[11px] text-amber-400 font-mono font-medium">CS-370 • 3 Credits</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* THE CALCULATOR SECTION (Requested centerpiece) */}
      <section
        id="study-calculator"
        className="py-16 lg:py-24 bg-slate-950/70 border-b border-slate-800 relative scroll-mt-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Study Tool</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Student Scientific & Study Calculator
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Evaluate algebra, trigonometry, and scientific expressions, or type <span className="text-emerald-400 font-semibold">any 5 characters</span> (letters or numbers) to unlock.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {/* The Physical / Visual Calculator Housing */}
            <div className="bg-[#0e1322] border-2 border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 relative">
              {/* Unlock Transition Banner */}
              {isUnlockedSequence && (
                <div className="absolute inset-0 z-30 bg-emerald-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center border-2 border-emerald-500 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white">ACCESS VERIFIED</h3>
                  <p className="text-xs text-emerald-300 mt-1 font-mono">
                    Authorized environment unlocked • Loading vault...
                  </p>
                </div>
              )}

              {/* Calculator Brand & Solar Panel */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="font-mono text-xs font-bold text-slate-300 tracking-wider">
                    APEX-TI-84 EDU
                  </span>
                </div>
                {/* Decorative Solar Cell */}
                <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md">
                  <div className="w-3 h-4 bg-amber-950/60 rounded-xs" />
                  <div className="w-3 h-4 bg-amber-950/60 rounded-xs" />
                  <div className="w-3 h-4 bg-amber-950/60 rounded-xs" />
                  <div className="w-3 h-4 bg-amber-950/60 rounded-xs" />
                </div>
              </div>

              {/* Calculator Screen / Display */}
              <div className="bg-[#050811] border border-slate-800 rounded-2xl p-4 mb-4 shadow-inner">
                {/* Status indicator row */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                  <span>DEG | STAT: READY</span>
                  <span className="truncate max-w-[200px] text-right">{calcHistory}</span>
                </div>

                {/* Main Readout / Input Area */}
                <div className="relative">
                  <input
                    ref={calcInputRef}
                    type="text"
                    value={calcDisplay}
                    onChange={e => {
                      const val = e.target.value;
                      setCalcDisplay(val);
                      setRecentKeySequence(val);
                      checkPasscode(val);
                    }}
                    placeholder="0"
                    className="w-full bg-transparent font-mono text-right text-2xl sm:text-3xl font-bold text-emerald-400 focus:outline-none tracking-tight"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>AUTH: ANY 5 CHARS</span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map(idx => {
                        const count = calcDisplay !== '0' && calcDisplay !== 'Error' ? calcDisplay.length : 0;
                        const active = count > idx;
                        return (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                              active
                                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] scale-110'
                                : 'bg-slate-700'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span>MODE: {calcMode.toUpperCase()}</span>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-xl mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setCalcMode('standard');
                  }}
                  className={`py-1.5 rounded-lg transition cursor-pointer ${
                    calcMode === 'standard' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setCalcMode('scientific');
                  }}
                  className={`py-1.5 rounded-lg transition cursor-pointer ${
                    calcMode === 'scientific' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Scientific
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click', soundEnabled);
                    setCalcMode('alpha');
                  }}
                  className={`py-1.5 rounded-lg transition cursor-pointer ${
                    calcMode === 'alpha' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Letters (A-Z)
                </button>
              </div>

              {/* Standard / Scientific Keypad */}
              {calcMode !== 'alpha' && (
                <div className="space-y-2">
                  {calcMode === 'scientific' && (
                    <div className="grid grid-cols-5 gap-2 font-mono text-xs mb-2">
                      {['sin', 'cos', 'tan', '√', '^'].map(fn => (
                        <button
                          key={fn}
                          type="button"
                          onClick={() => handleButtonPress(fn === '^' ? '^' : fn === '√' ? '√(' : `${fn}(`)}
                          className="py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-300 font-semibold border border-slate-700/60 active:scale-95 transition cursor-pointer"
                        >
                          {fn}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 font-mono text-sm">
                    {/* Row 1 */}
                    <button
                      type="button"
                      onClick={() => handleButtonPress('C')}
                      className="py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold active:scale-95 transition cursor-pointer"
                    >
                      C
                    </button>
                    <button
                      type="button"
                      onClick={() => handleButtonPress('(')}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition cursor-pointer"
                    >
                      (
                    </button>
                    <button
                      type="button"
                      onClick={() => handleButtonPress(')')}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition cursor-pointer"
                    >
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() => handleButtonPress('÷')}
                      className="py-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold active:scale-95 transition cursor-pointer"
                    >
                      ÷
                    </button>

                    {/* Row 2 */}
                    {['7', '8', '9'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleButtonPress(num)}
                        className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold border border-slate-700 text-base active:scale-95 transition cursor-pointer shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleButtonPress('×')}
                      className="py-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold active:scale-95 transition cursor-pointer"
                    >
                      ×
                    </button>

                    {/* Row 3 */}
                    {['4', '5', '6'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleButtonPress(num)}
                        className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold border border-slate-700 text-base active:scale-95 transition cursor-pointer shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleButtonPress('-')}
                      className="py-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold active:scale-95 transition cursor-pointer"
                    >
                      -
                    </button>

                    {/* Row 4 */}
                    {['1', '2', '3'].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleButtonPress(num)}
                        className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold border border-slate-700 text-base active:scale-95 transition cursor-pointer shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleButtonPress('+')}
                      className="py-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold active:scale-95 transition cursor-pointer"
                    >
                      +
                    </button>

                    {/* Row 5 */}
                    <button
                      type="button"
                      onClick={() => handleButtonPress('0')}
                      className="py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold border border-slate-700 text-base active:scale-95 transition cursor-pointer shadow-sm"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleButtonPress('.')}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold active:scale-95 transition cursor-pointer"
                    >
                      .
                    </button>
                    <button
                      type="button"
                      onClick={() => handleButtonPress('DEL')}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold active:scale-95 transition cursor-pointer"
                    >
                      DEL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleButtonPress('=')}
                      className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold border border-indigo-400 active:scale-95 transition cursor-pointer shadow-md shadow-indigo-600/30 text-lg"
                    >
                      =
                    </button>
                  </div>
                </div>
              )}

              {/* Letter Keypad (A-Z) mode for touch devices or letter passcodes */}
              {calcMode === 'alpha' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Alpha Mode: Type letters or numbers</span>
                    <button
                      type="button"
                      onClick={() => handleButtonPress('C')}
                      className="text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 font-mono text-xs">
                    {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => handleButtonPress(letter)}
                        className="py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 active:scale-95 transition cursor-pointer"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleButtonPress('DEL')}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs cursor-pointer"
                    >
                      Backspace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        checkPasscode(calcDisplay);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Enter Code
                    </button>
                  </div>
                </div>
              )}

              {/* Discrete Passcode Hint & Launch Tooltip */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 hover:text-slate-300 transition cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showHint ? 'Hide Code Hint' : 'Need Code Hint?'}</span>
                </button>
                {showHint && (
                  <div className="font-mono text-slate-300 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    Type: <span className="text-blue-400 font-bold">Any 5 letters or numbers</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={triggerUnlock}
                  className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-[11px] border border-blue-500/30 transition cursor-pointer"
                >
                  Direct Enter &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Resources Reference Table */}
      <section id="resources" className="py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Reference Archive</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Fundamental Scientific Constants</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400">Speed of Light (c)</span>
              <div className="font-mono text-sm font-bold text-white mt-1">2.99792 × 10⁸ m/s</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400">Planck's Constant (h)</span>
              <div className="font-mono text-sm font-bold text-white mt-1">6.62607 × 10⁻³⁴ J·s</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400">Gravitational Constant (G)</span>
              <div className="font-mono text-sm font-bold text-white mt-1">6.67430 × 10⁻¹¹ N·m²/kg²</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400">Avogadro's Constant (Nₐ)</span>
              <div className="font-mono text-sm font-bold text-white mt-1">6.02214 × 10²³ mol⁻¹</div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Footer */}
      <footer id="academic-calendar" className="py-10 bg-slate-950 text-slate-500 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Apex Learning Academic System</span>
            <span>•</span>
            <span>Accreditation Board Code #8841-B</span>
          </div>
          <div>
            <span>© 2026 Apex Educational Foundation. All academic rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
