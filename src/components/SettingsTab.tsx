import React, { useState } from 'react';
import { AppSettings, CloakPreset } from '../types';
import { CLOAK_PRESETS, openAboutBlank } from '../utils/cloakPresets';
import { playSound } from '../utils/audio';
import {
  Shield,
  ShieldAlert,
  Volume2,
  VolumeX,
  ExternalLink,
  Check,
  Sliders,
  Trash2
} from 'lucide-react';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onTriggerDecoy: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onTriggerDecoy
}) => {
  const [customTitleInput, setCustomTitleInput] = useState(settings.customTitle);
  const [customFaviconInput, setCustomFaviconInput] = useState(settings.customFavicon);
  const [panicUrlInput, setPanicUrlInput] = useState(settings.panicUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const presetKeys = Object.keys(CLOAK_PRESETS) as CloakPreset[];
  const panicKeyOptions = [']', '[', '\\', '`', '~', 'Escape', 'p', 'x'];

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
          <p className="text-slate-400 mt-1">Configure tab cloaking masks, panic hotkeys, audio synthesizer, and stealth privacy</p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Check className="w-4 h-4 text-emerald-400" /> Settings updated successfully
          </div>
        )}
      </header>

      {/* 1. Tab Cloaking Presets */}
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
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                Apply Custom Cloak
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Panic Key & Emergency Disguise */}
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
