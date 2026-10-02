import React from 'react';
import { GameState } from '../types';
import { translate } from '../data/i18n';
import { audio } from '../audio/soundEngine';
import { AbyssMemoryData } from '../data/abyssMemory';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderBarProps {
  state: GameState;
  abyssMemory?: AbyssMemoryData;
  onToggleFullscreen: () => void;
  onToggleHaptics: () => void;
  onToggleAudio: () => void;
  onOpenHelp: () => void;
  onOpenPause: () => void;
  onOpenSettings: () => void;
  onNavigateHome: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  state,
  abyssMemory,
  onToggleFullscreen,
  onToggleHaptics,
  onToggleAudio,
  onOpenHelp,
  onOpenPause,
  onOpenSettings,
  onNavigateHome
}) => {
  const t = (k: string) => translate(k, state.language);

  const triggerHaptic = (len = 12) => {
    if (state.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(len);
      } catch {
        // Haptic unsupported
      }
    }
  };

  const getThreatBadge = () => {
    if (state.threatMeter >= 70) {
      return { text: t('threatCritical'), color: 'bg-red-950 text-red-400 border-red-600 animate-pulse' };
    }
    if (state.threatMeter >= 35) {
      return { text: t('threatElevated'), color: 'bg-amber-950 text-amber-400 border-amber-600' };
    }
    return { text: t('threatSafe'), color: 'bg-emerald-950 text-emerald-400 border-emerald-700' };
  };

  const threatBadge = getThreatBadge();

  return (
    <header className="w-full bg-[#090b14] border-b border-[#2a3150] px-3 py-2 text-xs font-mono select-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Terminal Brand & Active Context */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onNavigateHome();
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-[#121628] hover:bg-[#1f2646] text-[#c0c8e0] hover:text-white border border-[#3a4168] rounded transition cursor-pointer"
            title="Return to Main Terminal"
          >
            <span className="text-red-500 font-black">Ω</span>
            <span className="font-bold tracking-wider hidden sm:inline">{t('appTitle')}</span>
          </button>

          {state.screen === 'game' && (
            <div className="flex items-center gap-2 text-[11px] truncate">
              <span className="text-amber-400 font-bold truncate">
                {state.mapName}
              </span>
              <span className="text-[#687396]">/</span>
              <span className="text-cyan-400">
                CH.{state.chamber}/{state.maxChambers}
              </span>
              <span className={`hidden md:inline-flex px-1.5 py-0.5 text-[9px] font-bold border rounded ${threatBadge.color}`}>
                THREAT: {threatBadge.text} ({state.threatMeter}%)
              </span>
            </div>
          )}
        </div>

        {/* Right: Accessible, Non-Blocking Quick Tools Strip */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
          {/* PWA Offline Install Button */}
          <PWAInstallButton compact />

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onToggleAudio();
            }}
            className={`px-2 py-1 text-[11px] font-bold rounded border transition flex items-center gap-1 cursor-pointer ${
              state.musicMuted
                ? 'bg-[#151722] text-[#717b9b] border-[#292e44]'
                : 'bg-[#101a2e] text-cyan-400 border-cyan-700 hover:border-cyan-400'
            }`}
            title={state.musicMuted ? 'Sound Muted — Click to Unmute' : 'Sound Active — Click to Mute'}
            aria-label="Toggle Audio"
          >
            <span>{state.musicMuted ? '🔇' : '🔊'}</span>
            <span className="hidden lg:inline">{state.musicMuted ? 'MUTED' : 'AUDIO'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              triggerHaptic(15);
              audio.playClick();
              onToggleFullscreen();
            }}
            className={`px-2 py-1 text-[11px] font-bold rounded border transition flex items-center gap-1 cursor-pointer ${
              state.fullscreen
                ? 'bg-[#1e1b10] text-amber-400 border-amber-600'
                : 'bg-[#121628] text-[#c0c8e0] border-[#3a4168] hover:border-amber-400'
            }`}
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <span>⛶</span>
            <span className="hidden md:inline">{state.fullscreen ? 'FULL' : 'WIN'}</span>
          </button>

          {/* Haptic Toggle */}
          <button
            onClick={() => {
              triggerHaptic(25);
              audio.playClick();
              onToggleHaptics();
            }}
            className={`px-2 py-1 text-[11px] font-bold rounded border transition flex items-center gap-1 cursor-pointer ${
              state.hapticsEnabled
                ? 'bg-[#102416] text-emerald-400 border-emerald-600'
                : 'bg-[#151722] text-[#717b9b] border-[#292e44]'
            }`}
            title={state.hapticsEnabled ? 'Haptics: Enabled' : 'Haptics: Disabled'}
            aria-label="Toggle Haptic Feedback"
          >
            <span>📳</span>
            <span className="hidden md:inline">{state.hapticsEnabled ? 'HAPTIC' : 'OFF'}</span>
          </button>

          {/* Pause Button (in game) */}
          {state.screen === 'game' && (
            <button
              onClick={() => {
                triggerHaptic(10);
                audio.playClick();
                onOpenPause();
              }}
              className="px-2 py-1 text-[11px] font-bold bg-[#1d1414] hover:bg-[#2b1b1b] text-red-400 border border-red-700 hover:border-red-500 rounded transition flex items-center gap-1 cursor-pointer"
              title="Pause Descent"
              aria-label="Pause Game"
            >
              <span>⏸</span>
              <span className="hidden sm:inline">PAUSE</span>
            </button>
          )}

          {/* Field Guide / Mobile Quick-Help */}
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onOpenHelp();
            }}
            className="px-2 py-1 text-[11px] font-bold bg-[#14182b] hover:bg-[#202747] text-cyan-300 border border-cyan-800 hover:border-cyan-400 rounded transition flex items-center gap-1 cursor-pointer"
            title="Open Survival Field Guide & Help"
            aria-label="Field Guide Help"
          >
            <span className="text-amber-400">❓</span>
            <span className="hidden sm:inline">HELP</span>
          </button>

          {/* Settings & Languages */}
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onOpenSettings();
            }}
            className="px-2 py-1 text-[11px] font-bold bg-[#121628] hover:bg-[#1e2444] text-[#c0c8e0] hover:text-white border border-[#3a4168] hover:border-amber-400 rounded transition flex items-center gap-1 cursor-pointer"
            title="System Settings & Language"
            aria-label="Settings"
          >
            <span>⚙️</span>
            <span className="hidden lg:inline">{state.language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
