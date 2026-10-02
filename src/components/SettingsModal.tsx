import React, { useState, useMemo } from 'react';
import { GameState, TerminalTheme } from '../types';
import { SUPPORTED_LANGUAGES, translate } from '../data/i18n';
import { audio } from '../audio/soundEngine';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  state: GameState;
  onChangeLanguage: (lang: string) => void;
  onToggleFullscreen: () => void;
  onToggleHaptics: () => void;
  onToggleCRT: () => void;
  onChangeTheme: (theme: TerminalTheme) => void;
  onToggleReducedMotion: () => void;
  onChangeVolume: (vol: number) => void;
  onChangeMusicVolume: (vol: number) => void;
  onExportSave: () => void;
  onTriggerVoidEvent?: () => void;
  onChangeHorrorIntensity?: (val: 'eerie' | 'terrifying' | 'nightmare') => void;
  onToggleJumpscares?: () => void;
  onToggleWhispers?: () => void;
  onToggleHallucinations?: () => void;
  onOpenResetConfirm?: () => void;
  onReplayBoot?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  onChangeLanguage,
  onToggleFullscreen,
  onToggleHaptics,
  onToggleCRT,
  onChangeTheme,
  onToggleReducedMotion,
  onChangeVolume,
  onChangeMusicVolume,
  onExportSave,
  onTriggerVoidEvent,
  onChangeHorrorIntensity,
  onToggleJumpscares,
  onToggleWhispers,
  onToggleHallucinations,
  onOpenResetConfirm,
  onReplayBoot,
  onClose
}) => {
  const t = (k: string) => translate(k, state.language);
  const [langQuery, setLangQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'global' | 'europe' | 'asia' | 'americas' | 'mideast'>('all');

  const filteredLanguages = useMemo(() => {
    return Object.entries(SUPPORTED_LANGUAGES).filter(([code, meta]) => {
      const q = langQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        code.toLowerCase().includes(q) ||
        meta.name.toLowerCase().includes(q) ||
        meta.native.toLowerCase().includes(q);
      if (!matchesQuery) return false;
      if (regionFilter === 'all') return true;
      return meta.region === regionFilter;
    });
  }, [langQuery, regionFilter]);

  const triggerHaptic = (len = 15) => {
    if (state.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0b0e1b] border-2 border-[#374268] max-w-2xl w-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101424] border-b border-[#232a42]">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">⚙️</span>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
              {t('settings')}
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center bg-[#181d32] hover:bg-red-950 text-white border border-[#374268] rounded font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Audio Synthesizer Controls */}
          <div className="bg-[#121628] border border-[#2b3558] p-3 rounded space-y-3">
            <div className="flex justify-between items-center">
              <b className="text-cyan-300 uppercase tracking-wider text-xs">
                🔊 AUDIO SYNTHESIZER & HORROR BGM
              </b>
              <button
                onClick={() => {
                  audio.toggleMusic();
                  triggerHaptic(8);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded border ${
                  audio.musicMuted
                    ? 'bg-red-950 text-red-400 border-red-700'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-700'
                }`}
              >
                {audio.musicMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#93a0c5]">MASTER SOUND EFFECTS:</span>
                <span className="text-amber-400 font-bold">{Math.round(state.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.volume}
                onChange={e => onChangeVolume(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#93a0c5]">HORROR ATMOSPHERE BGM:</span>
                <span className="text-cyan-400 font-bold">{Math.round(state.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.musicVolume}
                onChange={e => onChangeMusicVolume(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] text-[#93a0c5] mb-2">
                <span>SELECT HYDROPHONE SYNTHESIZER TRACK ({Object.keys(audio.tracks).length} COMPOSITIONS):</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  LIVE DECK
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {Object.entries(audio.tracks).map(([k, trk]) => {
                  const isCur = audio.currentTrack === k;
                  return (
                    <div
                      key={k}
                      onClick={() => {
                        audio.playTrack(k);
                        triggerHaptic(8);
                      }}
                      className={`p-2.5 rounded border text-[10px] cursor-pointer transition flex flex-col justify-between ${
                        isCur
                          ? 'bg-[#182544] text-amber-300 border-amber-400 shadow-lg'
                          : 'bg-[#131728] text-[#8e9abf] border-[#252f4c] hover:border-[#3d4c78] hover:text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <b className={`font-bold ${isCur ? 'text-amber-300' : 'text-[#c6d0ea]'}`}>
                          {trk.name}
                        </b>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${
                          isCur ? 'bg-amber-400 text-black' : 'bg-[#1e2742] text-cyan-300'
                        }`}>
                          {trk.mood}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#828fae] mb-1.5 leading-tight line-clamp-2">
                        {trk.desc}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-[#1f2842] text-[9px]">
                        <span className="text-[#64749f]">TEMPO: {trk.bpm} BPM</span>
                        <span className={isCur ? 'text-amber-400 font-black' : 'text-[#7080a8]'}>
                          {isCur ? '▶ ACTIVE PLAYING' : 'CLICK TO PLAY'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Audio FX Soundboard Tester */}
            <div className="pt-2 border-t border-[#232c4a]">
              <span className="text-[10px] text-[#7887b0] uppercase font-bold block mb-1.5">
                HADAL SOUNDBOARD FX DIAGNOSTICS:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    audio.playHeartbeat();
                    triggerHaptic(15);
                  }}
                  className="px-2 py-1 bg-[#171c32] hover:bg-[#202744] text-[#a1b0d8] hover:text-white text-[9px] font-bold rounded border border-[#2e395c] cursor-pointer"
                >
                  💓 HEARTBEAT
                </button>
                <button
                  onClick={() => {
                    audio.playEntityStinger(65);
                    triggerHaptic(25);
                  }}
                  className="px-2 py-1 bg-[#261520] hover:bg-[#3d182e] text-red-300 hover:text-white text-[9px] font-bold rounded border border-red-900/60 cursor-pointer"
                >
                  ⚠️ STALKER STINGER
                </button>
                <button
                  onClick={() => {
                    audio.playAcousticScreech();
                    triggerHaptic(30);
                  }}
                  className="px-2 py-1 bg-[#261520] hover:bg-[#3d182e] text-purple-300 hover:text-white text-[9px] font-bold rounded border border-purple-900/60 cursor-pointer"
                >
                  📡 ACOUSTIC SCREECH
                </button>
                <button
                  onClick={() => {
                    audio.playSolve();
                    triggerHaptic(10);
                  }}
                  className="px-2 py-1 bg-[#11241f] hover:bg-[#18362e] text-emerald-300 hover:text-white text-[9px] font-bold rounded border border-emerald-900/60 cursor-pointer"
                >
                  ✨ CIPHER RESOLVE
                </button>
                <button
                  onClick={() => {
                    audio.playSubsonicDrone();
                    triggerHaptic(20);
                  }}
                  className="px-2 py-1 bg-[#151c2e] hover:bg-[#1e2842] text-cyan-300 hover:text-white text-[9px] font-bold rounded border border-cyan-900/60 cursor-pointer"
                >
                  🌊 SUB-BAR INFRASOUND
                </button>
                <button
                  onClick={() => {
                    audio.playWhisper();
                    triggerHaptic(15);
                  }}
                  className="px-2 py-1 bg-[#24111d] hover:bg-[#38152c] text-red-300 hover:text-white text-[9px] font-bold rounded border border-red-900/60 cursor-pointer"
                >
                  👁️ DEMONIC WHISPER
                </button>
                <button
                  onClick={() => {
                    audio.playHullCreak();
                    triggerHaptic(25);
                  }}
                  className="px-2 py-1 bg-[#1c1811] hover:bg-[#332512] text-amber-300 hover:text-white text-[9px] font-bold rounded border border-amber-900/60 cursor-pointer"
                >
                  ⚓ HULL PRESSURE GROAN
                </button>
                <button
                  onClick={() => {
                    audio.playHullScratch();
                    triggerHaptic(30);
                  }}
                  className="px-2 py-1 bg-[#281315] hover:bg-[#3d161a] text-red-400 hover:text-white text-[9px] font-bold rounded border border-red-800 cursor-pointer"
                >
                  🩸 TALON SCRATCH
                </button>
              </div>
            </div>
          </div>

          {/* Psychological Horror & Dread Calibration Panel */}
          <div className="bg-[#190a14] border-2 border-red-700/80 p-3 rounded space-y-3 shadow-[0_0_20px_rgba(255,0,0,0.15)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-sm animate-pulse">💀</span>
                <b className="text-red-300 uppercase tracking-wider text-xs">
                  PSYCHOLOGICAL HORROR & DREAD CALIBRATION
                </b>
              </div>
              <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded text-[9px] font-black uppercase">
                SCARY INTENSIFIED
              </span>
            </div>

            {/* Horror Intensity Presets */}
            <div>
              <span className="text-[#a895a5] text-[10px] uppercase font-bold block mb-1.5">
                ATMOSPHERIC TERROR INTENSITY:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'eerie', name: 'EERIE', desc: 'Subtle dread & ambient hull creaks' },
                  { id: 'terrifying', name: 'TERRIFYING', desc: 'Accelerating heartbeats, whispers & stalker radar' },
                  { id: 'nightmare', name: 'NIGHTMARE', desc: 'Maximum paranoia, text dementia & jumpscares' }
                ].map(lvl => {
                  const isCur = (state.horrorIntensity || 'terrifying') === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        triggerHaptic(15);
                        audio.playChoice();
                        if (onChangeHorrorIntensity) onChangeHorrorIntensity(lvl.id as any);
                      }}
                      className={`p-2 rounded border text-left transition cursor-pointer flex flex-col justify-between ${
                        isCur
                          ? 'bg-red-950 text-red-200 border-red-500 shadow-[0_0_12px_rgba(255,0,0,0.4)]'
                          : 'bg-black/50 text-[#857683] border-[#361a29] hover:border-red-800'
                      }`}
                    >
                      <b className={`text-[10px] ${isCur ? 'text-red-400' : 'text-[#a3909f]'}`}>
                        {lvl.name}
                      </b>
                      <span className="text-[8px] leading-tight mt-1 opacity-80">{lvl.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles for Horror Elements */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-red-900/40">
              {/* Jumpscares */}
              <div className="flex items-center justify-between p-2 bg-black/60 rounded border border-red-900/50">
                <div>
                  <b className="text-[10px] text-red-200 block">JUMPSCARE SHOCKS</b>
                  <span className="text-[8px] text-[#93818e]">Subliminal visual flashes</span>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(12);
                    if (onToggleJumpscares) onToggleJumpscares();
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${
                    (state.jumpscaresEnabled ?? true)
                      ? 'bg-red-950 text-red-300 border-red-600'
                      : 'bg-[#1b1017] text-[#715d6a] border-[#36212e]'
                  }`}
                >
                  {(state.jumpscaresEnabled ?? true) ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Whispers */}
              <div className="flex items-center justify-between p-2 bg-black/60 rounded border border-red-900/50">
                <div>
                  <b className="text-[10px] text-red-200 block">SPECTRAL WHISPERS</b>
                  <span className="text-[8px] text-[#93818e]">Formant auditory voices</span>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(12);
                    if (onToggleWhispers) onToggleWhispers();
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${
                    (state.whispersEnabled ?? true)
                      ? 'bg-red-950 text-red-300 border-red-600'
                      : 'bg-[#1b1017] text-[#715d6a] border-[#36212e]'
                  }`}
                >
                  {(state.whispersEnabled ?? true) ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Paranoia Eyes & Dementia */}
              <div className="flex items-center justify-between p-2 bg-black/60 rounded border border-red-900/50">
                <div>
                  <b className="text-[10px] text-red-200 block">WATCHING EYES</b>
                  <span className="text-[8px] text-[#93818e]">Peripheral phantoms</span>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(12);
                    if (onToggleHallucinations) onToggleHallucinations();
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border cursor-pointer ${
                    (state.hallucinationsEnabled ?? true)
                      ? 'bg-red-950 text-red-300 border-red-600'
                      : 'bg-[#1b1017] text-[#715d6a] border-[#36212e]'
                  }`}
                >
                  {(state.hallucinationsEnabled ?? true) ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Ergonomics, Fullscreen, Haptics */}
          <div className="bg-[#121628] border border-[#2b3558] p-3 rounded space-y-2.5">
            <b className="text-amber-300 uppercase tracking-wider text-xs block mb-1">
              📱 MOBILE & ACCESSIBILITY CONTROLS
            </b>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Fullscreen */}
              <div className="flex items-center justify-between p-2.5 bg-[#171c32] rounded border border-[#2b3558]">
                <div>
                  <b className="text-white text-[11px]">⛶ FULLSCREEN MODE</b>
                  <p className="text-[10px] text-[#8b97bc]">Immersive borderless display</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    onToggleFullscreen();
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                    state.fullscreen
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-[#1f243c] text-[#8b97bc] border-[#364064]'
                  }`}
                >
                  {state.fullscreen ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              {/* Haptic Feedback */}
              <div className="flex items-center justify-between p-2.5 bg-[#171c32] rounded border border-[#2b3558]">
                <div>
                  <b className="text-white text-[11px]">📳 HAPTIC FEEDBACK</b>
                  <p className="text-[10px] text-[#8b97bc]">Tactile controller vibration</p>
                </div>
                <button
                  onClick={() => {
                    onToggleHaptics();
                    triggerHaptic(30);
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                    state.hapticsEnabled
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-[#1f243c] text-[#8b97bc] border-[#364064]'
                  }`}
                >
                  {state.hapticsEnabled ? 'ACTIVE' : 'MUTED'}
                </button>
              </div>

              {/* CRT Scanlines */}
              <div className="flex items-center justify-between p-2.5 bg-[#171c32] rounded border border-[#2b3558]">
                <div>
                  <b className="text-white text-[11px]">📺 CRT SCANLINES</b>
                  <p className="text-[10px] text-[#8b97bc]">Retro monitor raster texture</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    onToggleCRT();
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                    state.crtEnabled
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-[#1f243c] text-[#8b97bc] border-[#364064]'
                  }`}
                >
                  {state.crtEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-2.5 bg-[#171c32] rounded border border-[#2b3558]">
                <div>
                  <b className="text-white text-[11px]">♿ REDUCED MOTION</b>
                  <p className="text-[10px] text-[#8b97bc]">Disables screen flashes & shakes</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    onToggleReducedMotion();
                  }}
                  className={`px-3 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                    state.reducedMotion
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                      : 'bg-[#1f243c] text-[#8b97bc] border-[#364064]'
                  }`}
                >
                  {state.reducedMotion ? 'REDUCED' : 'NORMAL'}
                </button>
              </div>
            </div>
          </div>

          {/* Terminal Color Theme */}
          <div className="bg-[#121628] border border-[#2b3558] p-3 rounded space-y-2">
            <b className="text-purple-300 uppercase tracking-wider text-xs block">
              🎨 TERMINAL PHOSPHOR PALETTE
            </b>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'amber', label: 'AMBER RESIN', color: '#f39c12' },
                { id: 'emerald', label: 'PHOSPHOR GREEN', color: '#2ecc71' },
                { id: 'cyan', label: 'CYBER CYAN', color: '#38d9ff' },
                { id: 'crimson', label: 'CRIMSON EMERGENCY', color: '#ff3838' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    triggerHaptic(8);
                    onChangeTheme(theme.id as TerminalTheme);
                  }}
                  className={`p-2 rounded border text-left text-[11px] font-bold ${
                    state.crtTheme === theme.id
                      ? 'border-amber-400 bg-[#1b223d]'
                      : 'border-[#293250] bg-[#14182c]'
                  }`}
                >
                  <span style={{ color: theme.color }}>● {theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Language Suite */}
          <div className="bg-[#121628] border-2 border-cyan-800/80 p-3.5 rounded-lg space-y-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232b47] pb-2.5">
              <div>
                <b className="text-cyan-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <span>🌐</span> {t('langSelect')}
                </b>
                <span className="text-[10px] text-[#8e9abf]">
                  ADVANCED GLOBAL LOCALIZATION MATRIX // 41 LANGUAGES
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#0a0d18] border border-cyan-700/80 text-cyan-300 rounded text-[10px] font-bold">
                  {SUPPORTED_LANGUAGES[state.language]?.flag} {SUPPORTED_LANGUAGES[state.language]?.native} [{state.language.toUpperCase()}]
                </span>
                {SUPPORTED_LANGUAGES[state.language]?.dir === 'rtl' && (
                  <span className="px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-700 rounded text-[9px] font-bold">
                    RTL ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Search Input & Live Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={langQuery}
                  onChange={e => setLangQuery(e.target.value)}
                  placeholder="Search by language, native name, or code (e.g. es, 日本語, Deutsch, ar)..."
                  className="w-full bg-[#0a0d1a] border border-[#2b3558] focus:border-cyan-400 rounded px-2.5 py-1.5 text-xs text-white placeholder-[#5a668c] outline-none"
                />
                {langQuery && (
                  <button
                    onClick={() => setLangQuery('')}
                    className="absolute right-2 top-1.5 text-xs text-[#7d8aa8] hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Region Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-bold">
                {[
                  { id: 'all', label: `ALL (${Object.keys(SUPPORTED_LANGUAGES).length})` },
                  { id: 'global', label: 'TOP' },
                  { id: 'europe', label: 'EUROPE' },
                  { id: 'asia', label: 'ASIA' },
                  { id: 'americas', label: 'AMERICAS' },
                  { id: 'mideast', label: 'MID-EAST' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      triggerHaptic(6);
                      setRegionFilter(tab.id as any);
                    }}
                    className={`px-2 py-1 rounded whitespace-nowrap transition cursor-pointer border ${
                      regionFilter === tab.id
                        ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                        : 'bg-[#0d101e] text-[#8e9abf] border-[#222a45] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-52 overflow-y-auto p-1.5 bg-[#090c17] rounded border border-[#1e253e]">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map(([code, meta]) => {
                  const isSelected = state.language === code;

                  return (
                    <button
                      key={code}
                      onClick={() => {
                        triggerHaptic(12);
                        audio.playClick();
                        onChangeLanguage(code);
                      }}
                      className={`p-2 rounded border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-black border-cyan-300 shadow-md font-bold'
                          : 'bg-[#12162a] text-[#c0cae8] border-[#222b49] hover:bg-[#1a213e] hover:border-cyan-500/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-bold flex items-center gap-1">
                          <span>{meta.flag}</span>
                          <span>{meta.native}</span>
                        </span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? 'bg-black/30 text-white' : 'bg-black/50 text-[#7c8aa9]'}`}>
                          {code.toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-[9px] truncate mt-0.5 ${isSelected ? 'text-black/80' : 'text-[#6f7c9e]'}`}>
                        {meta.name} {meta.dir === 'rtl' ? '• RTL' : ''}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-[#6e7b9e]">
                  No languages match "{langQuery}". Clear search to view all.
                </div>
              )}
            </div>

            {/* Live Language Telemetry Diagnostic Panel */}
            <div className="bg-[#0b0e1b] border border-[#222a45] p-2.5 rounded text-[11px] space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] border-b border-[#1c233c] pb-1">
                <span className="text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <span>⚡</span> ACTIVE TRANSLATION TELEMETRY:
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  ● REAL-TIME SYNCHRONIZED
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-[#6d7999] block">NATIVE SCRIPT</span>
                  <b className="text-white">{SUPPORTED_LANGUAGES[state.language]?.native}</b>
                </div>
                <div>
                  <span className="text-[#6d7999] block">TEXT DIRECTION</span>
                  <b className="text-amber-400">
                    {SUPPORTED_LANGUAGES[state.language]?.dir === 'rtl' ? 'RTL (RIGHT-TO-LEFT)' : 'LTR (LEFT-TO-RIGHT)'}
                  </b>
                </div>
                <div>
                  <span className="text-[#6d7999] block">LOCALIZATION INDEX</span>
                  <b className="text-emerald-400">100% COMPREHENSIVE</b>
                </div>
                <div>
                  <span className="text-[#6d7999] block">ENCODING MATRIX</span>
                  <b className="text-cyan-300">UTF-8 HADAL SUBSEA</b>
                </div>
              </div>
            </div>
          </div>

          {/* Void Event Anomaly Simulator / Debug Trigger */}
          {onTriggerVoidEvent && (
            <div className="bg-[#190d18] border border-red-900/80 p-3 rounded flex flex-wrap items-center justify-between gap-2">
              <div>
                <b className="text-red-300 text-[11px] uppercase flex items-center gap-1.5">
                  <span>🌀</span> TEST 'VOID EVENT' BREACH
                </b>
                <p className="text-[10px] text-red-400/80">
                  Triggers automatically every 25 chambers. Click to simulate immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(25);
                  onTriggerVoidEvent();
                  onClose();
                }}
                className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-100 font-bold rounded text-xs border border-red-500 transition cursor-pointer"
              >
                SIMULATE VOID EVENT ➔
              </button>
            </div>
          )}

          {/* Terminal System Boot Calibration */}
          {onReplayBoot && (
            <div className="bg-[#0b1322] border border-cyan-800/80 p-3 rounded flex flex-wrap items-center justify-between gap-2">
              <div>
                <b className="text-cyan-300 text-[11px] flex items-center gap-1.5">
                  <span>⚡</span> SYSTEM BOOT SEQUENCE
                </b>
                <p className="text-[10px] text-[#8097c7]">Replay the terminal diagnostic telemetry &amp; sensor calibration</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  audio.playClick();
                  onReplayBoot();
                  onClose();
                }}
                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded text-xs transition cursor-pointer"
              >
                REPLAY BOOT SEQUENCE ➔
              </button>
            </div>
          )}

          {/* Offline Standalone & Multi-Device Compatibility */}
          <div className="bg-[#0b1612] border-2 border-emerald-700/80 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div>
              <b className="text-emerald-300 text-xs uppercase flex items-center gap-1.5 font-bold tracking-wider">
                <span>📲</span> OFFLINE STANDALONE &amp; MULTI-DEVICE SUITE
              </b>
              <p className="text-[10px] text-[#9fcbb5] mt-0.5 max-w-md leading-relaxed">
                Install as a standalone PWA for zero-latency, full-screen offline gameplay on iOS, Android, macOS, Windows, and Linux. No internet required.
              </p>
            </div>
            <PWAInstallButton />
          </div>

          {/* Backup & System Reset */}
          <div className="bg-[#121628] border border-[#2b3558] p-3 rounded flex flex-wrap items-center justify-between gap-2">
            <div>
              <b className="text-white text-[11px]">DATA PERSISTENCE:</b>
              <p className="text-[10px] text-[#8e9abf]">Export save or download standalone backup</p>
            </div>
            <button
              onClick={() => {
                triggerHaptic(15);
                audio.playSolve();
                onExportSave();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded text-xs transition cursor-pointer"
            >
              EXPORT SAVE / HTML BACKUP
            </button>
          </div>

          {/* RESET EXPEDITION */}
          <div className="bg-[#190912] border-2 border-red-700/80 p-3.5 rounded space-y-2.5 shadow-[0_0_20px_rgba(220,38,38,0.25)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <b className="text-red-400 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <span>💀</span> RESET EXPEDITION
                </b>
                <p className="text-[10px] text-[#fca5a5] mt-0.5">
                  Clear progress to play again from Chamber 1.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenResetConfirm && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(25);
                    audio.playError();
                    onOpenResetConfirm();
                  }}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded border border-red-400 transition cursor-pointer shadow-lg shadow-red-950/60 uppercase flex items-center gap-1.5"
                >
                  <span>💀</span>
                  <span>RESET EXPEDITION</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#101424] border-t border-[#232a42] text-right">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition cursor-pointer text-xs uppercase"
          >
            APPLY & CLOSE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
