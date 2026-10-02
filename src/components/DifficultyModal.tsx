import React from 'react';
import { DifficultyId } from '../types';
import { audio } from '../audio/soundEngine';

interface DifficultyModalProps {
  currentDifficulty: DifficultyId;
  unlockedDifficulties?: DifficultyId[];
  onSelectDifficulty: (diff: DifficultyId) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  currentDifficulty,
  unlockedDifficulties = ['easy'],
  onSelectDifficulty,
  onClose,
  hapticsEnabled
}) => {
  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const diffs: Array<{
    id: DifficultyId;
    title: string;
    stages: string;
    sanity: string;
    revives: string;
    scoreMult: string;
    desc: string;
    color: string;
    unlockReq: string;
  }> = [
    {
      id: 'easy',
      title: 'EASY // RECONNAISSANCE',
      stages: '10 Stages',
      sanity: '100% Starting Sanity',
      revives: '1 Emergency Revive',
      scoreMult: '1.0× Score',
      desc: 'Forgiving acoustic thresholds. Ideal for learning chamber mechanisms and entity patterns.',
      color: 'border-emerald-700 text-emerald-300',
      unlockReq: 'UNLOCKED BY DEFAULT'
    },
    {
      id: 'hard',
      title: 'HARD // PRESSURE TEST',
      stages: '20 Stages',
      sanity: '60% Starting Sanity',
      revives: '0 Revives',
      scoreMult: '1.5× Score',
      desc: 'Elevated hydrostatic corruption. The Listener tracks clatter with lethal precision.',
      color: 'border-amber-600 text-amber-300',
      unlockReq: 'BEAT EASY // RECONNAISSANCE'
    },
    {
      id: 'extreme',
      title: 'EXTREME // NO SAFETY',
      stages: '25 Stages',
      sanity: '30% Starting Sanity',
      revives: '0 Revives',
      scoreMult: '2.25× Score',
      desc: 'Severe neural strain from the outset. Medical supplies severely degraded.',
      color: 'border-red-600 text-red-300',
      unlockReq: 'BEAT HARD // PRESSURE TEST'
    },
    {
      id: 'nightmare',
      title: 'NIGHTMARE // MONKEY PAW',
      stages: '30 Stages',
      sanity: '10% Starting Sanity',
      revives: '0 Revives',
      scoreMult: '3.0× Score',
      desc: 'Reality is actively hostile. 18% of choices trigger sudden Monkey Paw consequence reversals.',
      color: 'border-purple-600 text-purple-300',
      unlockReq: 'BEAT EXTREME // NO SAFETY'
    },
    {
      id: 'endless',
      title: 'ENDLESS // ABYSS WITHOUT END',
      stages: 'Infinite Chambers',
      sanity: '20% Starting Sanity',
      revives: '0 Revives',
      scoreMult: '4.0× Score',
      desc: 'Uncapped depth scaling. Entities adapt and intensify indefinitely as you plunge downward.',
      color: 'border-cyan-600 text-cyan-300',
      unlockReq: 'BEAT NIGHTMARE // MONKEY PAW'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0b0e1b] border-2 border-[#374268] max-w-xl w-full p-5 rounded-lg shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212842] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">⚖️</span>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
              SELECT EXPEDITION DIFFICULTY MATRIX
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="text-[#727d9e] hover:text-white px-2 py-0.5 border border-[#2b3350] rounded"
          >
            ✕
          </button>
        </div>

        {/* Difficulty List */}
        <div className="space-y-2.5">
          {diffs.map(d => {
            const isSelected = currentDifficulty === d.id;
            const isUnlocked = unlockedDifficulties.includes(d.id);

            return (
              <div
                key={d.id}
                onClick={() => {
                  if (!isUnlocked) {
                    triggerHaptic(30);
                    audio.playGlitchDistortion();
                    return;
                  }
                  triggerHaptic(20);
                  audio.playChoice();
                  onSelectDifficulty(d.id);
                }}
                className={`p-3 rounded border transition ${
                  !isUnlocked
                    ? 'bg-[#0b0e18]/80 border-[#22283e] opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#18203c] border-amber-400 shadow-md cursor-pointer'
                    : 'bg-[#121626] border-[#252f4c] hover:border-[#3e4c78] cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    {!isUnlocked && <span className="text-red-400 text-xs">🔒</span>}
                    <b className={`text-sm ${isUnlocked ? d.color.split(' ')[1] : 'text-[#626d8c]'}`}>
                      {d.title}
                    </b>
                  </div>
                  {isSelected && isUnlocked ? (
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded uppercase">
                      ACTIVE
                    </span>
                  ) : !isUnlocked ? (
                    <span className="px-2 py-0.5 bg-red-950/80 text-red-400 border border-red-800/60 text-[9px] font-black rounded uppercase">
                      LOCKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#172036] text-[#7d8cad] text-[9px] font-bold rounded uppercase">
                      UNLOCKED
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-3 text-[10px] text-[#8e9bc4] mb-1">
                  <span>{d.stages}</span>
                  <span>•</span>
                  <span>{d.sanity}</span>
                  <span>•</span>
                  <span>{d.revives}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{d.scoreMult}</span>
                </div>

                <p className="text-[#a4b0d4] text-[11px] leading-snug mb-1">
                  {d.desc}
                </p>

                {!isUnlocked && (
                  <div className="mt-1.5 pt-1.5 border-t border-[#1a2136] flex items-center justify-between text-[10px]">
                    <span className="text-red-400/90 font-bold">
                      REQUIRED: {d.unlockReq}
                    </span>
                    <span className="text-[#647194]">BEAT PREVIOUS TIER TO UNLOCK</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-right pt-2 border-t border-[#1e253e]">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition cursor-pointer text-xs uppercase"
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
    </div>
  );
};
