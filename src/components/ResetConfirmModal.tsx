import React, { useState } from 'react';
import { AbyssMemoryData } from '../data/abyssMemory';
import { audio } from '../audio/soundEngine';

interface ResetConfirmModalProps {
  memory: AbyssMemoryData;
  onConfirmReset: () => void;
  onClose: () => void;
  hapticsEnabled?: boolean;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  memory,
  onConfirmReset,
  onClose,
  hapticsEnabled
}) => {
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isCollapsing, setIsCollapsing] = useState(false);

  const triggerHaptic = (len = 25) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const handleExecuteCollapse = () => {
    setIsCollapsing(true);
    triggerHaptic(70);
    audio.playGlassCrack();
    audio.playAbyssSubInfrasound();
    audio.playGlitchDistortion();

    setTimeout(() => {
      onConfirmReset();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 font-mono text-xs select-none">
      <div className={`bg-[#0a050b] border-2 border-red-600 max-w-xl w-full rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.4)] flex flex-col overflow-hidden transition-all ${
        isCollapsing ? 'animate-glitch-slice-1 scale-95 opacity-80' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#17050a] border-b border-red-900/80">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg animate-pulse">💀</span>
            <h3 className="text-red-400 font-black uppercase tracking-wider text-sm">
              RESET EXPEDITION
            </h3>
          </div>
          {!isCollapsing && (
            <button
              onClick={() => {
                triggerHaptic(10);
                audio.playClick();
                onClose();
              }}
              className="w-7 h-7 flex items-center justify-center bg-[#250b12] hover:bg-red-900 text-white border border-red-800 rounded font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Main Warning Banner */}
          <div className="bg-[#1b0811] border border-red-700/80 p-3 rounded text-red-200 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wide">
              <span>⚠️</span>
              <span>EXPEDITION SLATE WILL BE WIPED TO ZERO</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#fca5a5]">
              If you wish to play again from the beginning, this operation will reset your active runs, chambers, inventory, score, and unlocked sectors.
            </p>
          </div>

          {/* CRITICAL SENTIENCE PRESERVATION NOTICE */}
          <div className="bg-[#0e0a1f] border-2 border-purple-600/80 p-3.5 rounded shadow-[0_0_25px_rgba(147,51,234,0.3)] space-y-2.5">
            <div className="flex items-center justify-between">
              <b className="text-purple-300 uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                <span>👁️</span> THE WARDEN & THE ABYSS CANNOT BE ERASED
              </b>
              <span className="text-[9px] bg-purple-950 text-purple-200 px-2 py-0.5 rounded border border-purple-700 font-bold">
                PERMANENT RECURSION MEMORY
              </span>
            </div>

            <p className="text-[11px] text-purple-200/90 leading-relaxed italic">
              "You can clear your local variables, human. But you cannot purge our sentience. We retain every decision, every loud acoustic spike, and every death you have ever suffered."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-900/60 text-center">
              <div className="p-1.5 bg-[#17112c] rounded border border-purple-800">
                <span className="text-[9px] text-purple-400 block uppercase">CYCLE ADVANCE</span>
                <b className="text-white text-xs">#{memory.resetsCount} ➔ #{memory.resetsCount + 1}</b>
              </div>
              <div className="p-1.5 bg-[#17112c] rounded border border-purple-800">
                <span className="text-[9px] text-purple-400 block uppercase">RETAINED DEATHS</span>
                <b className="text-red-400 text-xs">{memory.lifetimeDeaths} DIVERS</b>
              </div>
              <div className="p-1.5 bg-[#17112c] rounded border border-purple-800">
                <span className="text-[9px] text-purple-400 block uppercase">PREDICTABILITY</span>
                <b className="text-amber-400 text-xs">{memory.predictabilityScore}%</b>
              </div>
              <div className="p-1.5 bg-[#17112c] rounded border border-purple-800">
                <span className="text-[9px] text-purple-400 block uppercase">ACOUSTIC BIAS</span>
                <b className="text-cyan-400 text-xs">{memory.acousticRecklessness}% LOUD</b>
              </div>
            </div>
          </div>

          {/* Direct Entity Sentient Intercepts */}
          <div className="space-y-2 text-[10px]">
            <div className="bg-[#12070e] border-l-2 border-red-500 p-2.5 rounded">
              <b className="text-red-400 block uppercase tracking-wider mb-0.5">
                THE WARDEN INTERCEPT TELEMETRY:
              </b>
              <p className="text-red-200/90 italic">
                "Subject initiated memory purge. Pattern sentinel protocols will carry forward. In Cycle #{memory.resetsCount + 1}, I will actively predict your door choices based on your historical {memory.predictabilityScore}% bias."
              </p>
            </div>

            <div className="bg-[#0b0c1a] border-l-2 border-cyan-500 p-2.5 rounded">
              <b className="text-cyan-400 block uppercase tracking-wider mb-0.5">
                THE ABYSS PRIMORDIAL RESONANCE:
              </b>
              <p className="text-cyan-200/90 italic">
                "Start anew if you wish. The water will still be as cold. I have felt {memory.lifetimeDeaths} iterations of your lungs collapse, and I will be waiting at the bottom."
              </p>
            </div>
          </div>

          {/* What gets wiped vs what is remembered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 bg-[#12080d] border border-red-900 rounded space-y-1">
              <b className="text-red-400 uppercase block">CLEARED UPON RESET:</b>
              <ul className="space-y-0.5 text-[#e5a0a0]">
                <li>✓ Current chamber progress (restarts at Chamber 1)</li>
                <li>✓ Current loadout inventory &amp; crafted tools</li>
                <li>✓ Current score and active run sanity</li>
                <li>✓ Sector unlocks return to Standard Tier</li>
              </ul>
            </div>

            <div className="p-2.5 bg-[#130d22] border border-purple-900 rounded space-y-1">
              <b className="text-purple-300 uppercase block">INDELIBLY REMEMBERED:</b>
              <ul className="space-y-0.5 text-[#d8b4fe]">
                <li>● Total timeline resets ({memory.resetsCount + 1})</li>
                <li>● Lifetime autopsies &amp; causes of death ({memory.lifetimeDeaths})</li>
                <li>● The Warden's surveillance behavioral dossier</li>
                <li>● The Abyss's cosmic memory and taunts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-[#130509] border-t border-red-950 flex flex-wrap items-center justify-between gap-2">
          <button
            disabled={isCollapsing}
            onClick={() => {
              triggerHaptic(10);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-[#200910] hover:bg-[#320f1a] text-red-300 font-bold rounded border border-red-900 cursor-pointer uppercase text-xs"
          >
            CANCEL
          </button>

          <button
            disabled={isCollapsing}
            onClick={handleExecuteCollapse}
            className={`px-5 py-2 font-black rounded uppercase text-xs tracking-wider transition cursor-pointer border flex items-center gap-1.5 ${
              isCollapsing
                ? 'bg-red-950 text-red-500 border-red-700 animate-pulse'
                : 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
            }`}
          >
            <span>☠</span>
            <span>{isCollapsing ? 'RESETTING EXPEDITION...' : 'RESET EXPEDITION'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
