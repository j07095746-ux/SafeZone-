import React, { useState } from 'react';
import { AppSettings, CloakPreset, ThemeType, EffectType } from '../types';
import { CLOAK_PRESETS, openAboutBlank } from '../utils/cloakPresets';
import { THEME_PRESETS } from '../utils/themePresets';
import { playSound } from '../utils/audio';
import {
  Shield,
  ShieldAlert,
  Volume2,
  VolumeX,
  ExternalLink,
  Check,
  Palette,
  Sparkles,
  CloudSnow,
  CloudRain,
  Ban,
  Trash2,
  GraduationCap,
  Calculator,
  Key,
  Download,
  Copy,
  Code,
  FileCode
} from 'lucide-react';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onTriggerDecoy: () => void;
  onLockEdu?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onTriggerDecoy,
  onLockEdu
}) => {
  const [customTitleInput, setCustomTitleInput] = useState(settings.customTitle);
  const [customFaviconInput, setCustomFaviconInput] = useState(settings.customFavicon);
  const [panicUrlInput, setPanicUrlInput] = useState(settings.panicUrl);
  const [passcodeInput, setPasscodeInput] = useState(settings.calculatorPasscode || '55555');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const presetKeys = Object.keys(CLOAK_PRESETS) as CloakPreset[];
  const panicKeyOptions = [']', '[', '\\', '`', '~', 'Escape', 'p', 'x'];

  const themeList: ThemeType[] = ['cyber', 'galaxy', 'night', 'dark-ops'];
  const effectList: { id: EffectType; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'none',
      name: 'None (Clean)',
      desc: 'Standard minimal canvas without active atmospheric particles',
      icon: <Ban className="w-5 h-5 text-slate-400" />
    },
    {
      id: 'snow',
      name: 'Winter Snow',
      desc: 'Gentle, drifting 60fps snow particles with natural wind turbulence',
      icon: <CloudSnow className="w-5 h-5 text-cyan-300" />
    },
    {
      id: 'rain',
      name: 'Atmospheric Rain',
      desc: 'Cinematic angled raindrops with ground splash ripples and motion blur',
      icon: <CloudRain className="w-5 h-5 text-sky-400" />
    }
  ];

  const handleApplyPreset = (preset: CloakPreset) => {
    playSound('click', settings.soundEnabled);
    onUpdateSettings({
      cloakPreset: preset,
      customTitle: '',
      customFavicon: ''
    });
    setCustomTitleInput('');
    setCustomFaviconInput('');
    flashSuccess();
  };

  const handleSelectTheme = (newTheme: ThemeType) => {
    playSound('click', settings.soundEnabled);
    onUpdateSettings({ theme: newTheme });
    flashSuccess();
  };

  const handleSelectEffect = (newEffect: EffectType) => {
    playSound('click', settings.soundEnabled);
    onUpdateSettings({ effect: newEffect });
    flashSuccess();
  };

  const handleSaveCustomCloak = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('score', settings.soundEnabled);
    onUpdateSettings({
      cloakPreset: 'none',
      customTitle: customTitleInput,
      customFavicon: customFaviconInput
    });
    flashSuccess();
  };

  const handleSavePanicConfig = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('score', settings.soundEnabled);
    onUpdateSettings({
      panicUrl: panicUrlInput
    });
    flashSuccess();
  };

  const handleSaveEduPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcodeInput.trim();
    if (clean.length !== 5) {
      alert('Passcode must be exactly 5 characters (letters or numbers)');
      return;
    }
    playSound('score', settings.soundEnabled);
    onUpdateSettings({
      calculatorPasscode: clean
    });
    flashSuccess();
  };

  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleDownloadSingleHtml = async () => {
    setDownloadingHtml(true);
    try {
      const response = await fetch('/SafeZone-GoogleSites.html');
      if (!response.ok) throw new Error('File not found');
      const htmlText = await response.text();
      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      playSound('score', settings.soundEnabled);
    } catch (err) {
      console.error(err);
      window.open('/SafeZone-GoogleSites.html', '_blank');
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handleCopyGoogleSitesHtml = async () => {
    try {
      const response = await fetch('/SafeZone-GoogleSites.html');
      if (!response.ok) throw new Error('File not found');
      const htmlText = await response.text();
      await navigator.clipboard.writeText(htmlText);
      setCopiedHtml(true);
      playSound('score', settings.soundEnabled);
      setTimeout(() => setCopiedHtml(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Could not copy to clipboard automatically. Click "Download Single-File (index.html)" to save the file.');
    }
  };

  const flashSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div id="settings-tab-section" className="space-y-8 relative z-10 max-w-5xl mx-auto">
      {/* Immersive UI Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Vault Settings</h1>
          <p className="text-slate-400 mt-1">Configure themes, weather effects, tab cloaking masks, and panic hotkeys</p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Check className="w-4 h-4 text-emerald-400" /> Settings updated successfully
          </div>
        )}
      </header>

      {/* 0. Educational Camouflage & Calculator Passcode */}
      <div className="bg-[#0a0c16] p-6 sm:p-8 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-500/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Full Site Camouflage</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" /> Educational Website & Calculator Lock
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              When anyone visits your site link, it displays an authentic academic learning portal (Apex Learning Hub). Scrolling down to the interactive study calculator and typing <strong className="text-emerald-400 font-semibold">any 5 characters</strong> (letters, numbers, or calculator buttons) unlocks SafeZone instantly under the exact same link.
            </p>
          </div>

          {/* Master Enable/Disable Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Cover Website:</span>
            <button
              type="button"
              onClick={() => {
                const next = !settings.eduCoverEnabled;
                playSound('click', settings.soundEnabled);
                onUpdateSettings({ eduCoverEnabled: next });
                flashSuccess();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                settings.eduCoverEnabled
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {settings.eduCoverEnabled ? 'Active (Recommended)' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Passcode Configuration Form */}
        <form onSubmit={handleSaveEduPasscode} className="p-4 sm:p-5 rounded-xl bg-[#060813] border border-white/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" /> Secret Calculator Passcode (5 Letters or Numbers)
              </label>
              <p className="text-[11px] text-slate-400">
                Type this code on the calculator screen or click its buttons to unlock. Case-insensitive.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={5}
                value={passcodeInput}
                onChange={e => setPasscodeInput(e.target.value)}
                placeholder="55555"
                className="w-32 px-3 py-2 bg-[#0a0d1a] border border-indigo-500/40 rounded-xl text-sm font-mono text-center font-bold text-emerald-400 focus:outline-none focus:border-indigo-400 tracking-widest uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Save Code
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-300">Active Code:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                {settings.calculatorPasscode || '55555'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Works with physical keyboard or on-screen calculator buttons</span>
            </div>

            {onLockEdu && (
              <button
                type="button"
                onClick={onLockEdu}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Test / Lock to Educational Portal Now</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Google Sites Standalone Single-File Embed Section */}
      <div className="bg-[#0a0c16] p-6 sm:p-8 rounded-2xl border border-emerald-500/20 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold mb-3">
              <Code className="w-3.5 h-3.5" /> 100% Standalone Google Sites Ready
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-400" /> Single-File index.html for Google Sites
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              This entire application (the disguised learning hub, calculator unlock, all retro arcade games, audio synthesis, weather particles, and tab cloaking) has been bundled into a <strong>single standalone HTML file</strong> with zero external JavaScript or CSS dependencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopyGoogleSitesHtml}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg ${
                copiedHtml
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              {copiedHtml ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedHtml ? 'Copied Full HTML!' : 'Copy Code for Google Sites'}</span>
            </button>

            <button
              onClick={handleDownloadSingleHtml}
              disabled={downloadingHtml}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{downloadingHtml ? 'Preparing...' : 'Download index.html'}</span>
            </button>
          </div>
        </div>

        {/* 3-Step Google Sites Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#060813] border border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-200">Copy or Download</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click the green <strong>"Copy Code for Google Sites"</strong> button above to copy the raw HTML code to your clipboard.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#060813] border border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-200">Embed in Google Sites</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In your Google Sites page editor, click <strong>Insert</strong> &rarr; <strong>Embed (&lt;/&gt;)</strong> &rarr; select the <strong>Embed Code</strong> tab.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#060813] border border-white/5 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-200">Paste &amp; Resize</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Paste the code, click <strong>Next</strong> &rarr; <strong>Insert</strong>, and stretch the box across your page. SafeZone works completely self-contained!
            </p>
          </div>
        </div>
      </div>

      {/* 1. Theme Selection */}
      <div className="bg-[#0a0c16] p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" /> Visual Themes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose your preferred aesthetic style. Each theme dynamically updates the ambient lighting, borders, accents, and visual hierarchy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {themeList.map(themeKey => {
            const meta = THEME_PRESETS[themeKey];
            const isSelected = settings.theme === themeKey;

            return (
              <button
                key={themeKey}
                onClick={() => handleSelectTheme(themeKey)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-white/[0.08] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'bg-[#05060b] hover:bg-white/[0.04] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      {meta.name}
                      {themeKey === 'cyber' && (
                        <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Popular
                        </span>
                      )}
                    </span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mb-4 leading-relaxed line-clamp-2">
                    {meta.tagline}
                  </p>
                </div>

                {/* Color Palette Swatches */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                  {meta.sampleHex.map((hex, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-md border border-white/10 shrink-0 shadow-inner"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Atmospheric Particle Effects */}
      <div className="bg-[#0a0c16] p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" /> Atmospheric Canvas Effects
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immersive 60fps GPU-accelerated background weather effects that float behind the UI without impacting game performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {effectList.map(effectItem => {
            const isSelected = settings.effect === effectItem.id;

            return (
              <button
                key={effectItem.id}
                onClick={() => handleSelectEffect(effectItem.id)}
                className={`p-5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'bg-[#05060b] hover:bg-white/[0.04] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                      {effectItem.icon}
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-black flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(56,189,248,0.6)]">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white mb-1">{effectItem.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{effectItem.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-sky-400 font-bold' : 'text-slate-500'}>
                    {isSelected ? 'Active Effect' : 'Click to Activate'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tab Cloaking Presets */}
      <div className="bg-[#0a0c16] p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Browser Tab Cloak Mask
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamically alters document title and favicon to appear as standard education or utility platforms.
          </p>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {presetKeys.map(key => {
            const info = CLOAK_PRESETS[key];
            const isSelected = settings.cloakPreset === key && !settings.customTitle;

            return (
              <button
                key={key}
                onClick={() => handleApplyPreset(key)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                    : 'bg-[#05060b] hover:bg-white/[0.03] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg bg-black/50 p-1.5 flex items-center justify-center border border-white/10">
                    <img src={info.iconUrl} alt={info.name} className="w-full h-full object-contain" />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white mb-0.5">{info.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{info.title}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Cloak inputs */}
        <div className="pt-5 border-t border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Or Set Custom Tab Title & Icon
          </h3>
          <form onSubmit={handleSaveCustomCloak} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Custom Tab Title</label>
              <input
                type="text"
                placeholder="e.g. Google Docs"
                value={customTitleInput}
                onChange={e => setCustomTitleInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#05060b] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Custom Favicon URL</label>
              <input
                type="url"
                placeholder="https://example.com/favicon.ico"
                value={customFaviconInput}
                onChange={e => setCustomFaviconInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#05060b] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              >
                Apply Custom Cloak
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. Panic Key & Emergency Disguise */}
      <div className="bg-[#0a0c16] p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Panic Hotkey & Decoy Screen
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Instantly replaces the screen with an authentic classroom or redirects away on keypress.
            </p>
          </div>
          <button
            onClick={onTriggerDecoy}
            className="px-4 py-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-950/40 shrink-0"
          >
            Test Panic Now
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Key selector */}
          <div className="bg-[#05060b] p-4 rounded-xl border border-white/5">
            <label className="block text-xs font-bold text-slate-300 mb-3">Select Panic Hotkey</label>
            <div className="flex flex-wrap gap-2">
              {panicKeyOptions.map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    playSound('click', settings.soundEnabled);
                    onUpdateSettings({ panicKey: key });
                  }}
                  className={`w-10 h-10 rounded-lg font-mono font-bold text-sm border flex items-center justify-center transition cursor-pointer ${
                    settings.panicKey === key
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/50'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                  }`}
                >
                  {key === 'Escape' ? 'Esc' : key}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 block mt-3">
              Pressing <span className="font-bold text-rose-400 font-mono">[{settings.panicKey}]</span> anywhere instantly triggers the panic disguise.
            </span>
          </div>

          {/* Action selector */}
          <div className="bg-[#05060b] p-4 rounded-xl border border-white/5">
            <label className="block text-xs font-bold text-slate-300 mb-3">Panic Action Mode</label>
            <div className="space-y-2">
              <label
                onClick={() => onUpdateSettings({ panicAction: 'decoy' })}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  settings.panicAction === 'decoy'
                    ? 'bg-rose-950/30 border-rose-500/60 text-white'
                    : 'bg-white/5 border-white/5 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="panicAction"
                  checked={settings.panicAction === 'decoy'}
                  onChange={() => onUpdateSettings({ panicAction: 'decoy' })}
                  className="accent-rose-500"
                />
                <div>
                  <span className="text-xs font-bold block">Instant Decoy Screen (Recommended)</span>
                  <span className="text-[10px] text-slate-400">Shows Google Classroom interface. Escape returns.</span>
                </div>
              </label>

              <label
                onClick={() => onUpdateSettings({ panicAction: 'redirect' })}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  settings.panicAction === 'redirect'
                    ? 'bg-rose-950/30 border-rose-500/60 text-white'
                    : 'bg-white/5 border-white/5 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="panicAction"
                  checked={settings.panicAction === 'redirect'}
                  onChange={() => onUpdateSettings({ panicAction: 'redirect' })}
                  className="accent-rose-500"
                />
                <div>
                  <span className="text-xs font-bold block">Immediate URL Redirect</span>
                  <span className="text-[10px] text-slate-400">Navigates the tab away completely.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Redirect URL input */}
        <form onSubmit={handleSavePanicConfig} className="flex gap-2">
          <input
            type="url"
            placeholder="Redirect target URL (e.g. https://classroom.google.com)"
            value={panicUrlInput}
            onChange={e => setPanicUrlInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#05060b] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-xl cursor-pointer transition"
          >
            Save Target
          </button>
        </form>
      </div>

      {/* 3. About:Blank Cloaker Utility */}
      <div className="bg-[#0a0c16] p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-indigo-400" /> About:Blank Tab Cloaker
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Launches SafeZone inside an unlogged <code className="bg-[#05060b] px-1.5 py-0.5 rounded text-indigo-400 border border-white/5 font-mono">about:blank</code> tab. This leaves zero entry in your browser history and protects against standard URL-based filters.
            </p>
          </div>

          <button
            onClick={() => openAboutBlank()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <ExternalLink className="w-4 h-4" /> Open About:Blank
          </button>
        </div>
      </div>

      {/* 4. Sound & Data Management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sound FX */}
        <div className="bg-[#0a0c16] p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              Retro Sound Effects
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Synthesized 8-bit audio for arcade actions</p>
          </div>

          <button
            onClick={() => {
              const next = !settings.soundEnabled;
              playSound('click', next);
              onUpdateSettings({ soundEnabled: next });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              settings.soundEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 border border-white/10 text-slate-400'
            }`}
          >
            {settings.soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* Data Reset */}
        <div className="bg-[#0a0c16] p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" /> Reset Local Data
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Clear custom games, high scores, and local cache</p>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all SafeZone stored settings and game scores?')) {
                onResetAllData();
                playSound('pop', true);
              }
            }}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
