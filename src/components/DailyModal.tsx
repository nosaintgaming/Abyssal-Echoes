import React from 'react';
import { DailyData } from '../types';
import { audio } from '../audio/soundEngine';
import { useDailyCountdown } from '../utils/countdown';
import { getRewardItemInfo } from '../utils/dailyRewards';

interface DailyModalProps {
  daily: DailyData;
  onStartDaily: () => void;
  onClose: () => void;
  hapticsEnabled: boolean;
  onClaimReward?: (missionId: string) => void;
  onClaimAllRewards?: () => void;
}

export const DailyModal: React.FC<DailyModalProps> = ({
  daily,
  onStartDaily,
  onClose,
  hapticsEnabled,
  onClaimReward,
  onClaimAllRewards
}) => {
  const countdown = useDailyCountdown();

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const unclaimedCount = daily.missions.filter(m => m.done && !m.rewardClaimed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0b0e1b] border-2 border-red-800/80 max-w-2xl w-full max-h-[92vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#160f14] border-b border-red-900/50">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-base animate-pulse">☠</span>
            <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm">
              DAILY DESCENT CHALLENGE // SEED: {daily.date}
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center bg-[#1e141a] hover:bg-red-950 text-white border border-red-900 rounded font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Prominent Live Daily Countdown HUD */}
          <div className="bg-[#1c0d16] border-2 border-red-600/80 p-3.5 rounded-lg shadow-lg space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-base animate-bounce">⏳</span>
                <div>
                  <span className="text-[10px] text-red-300 font-bold uppercase tracking-widest block">
                    TIME REMAINING UNTIL NEXT DAILY DESCENT RESET:
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider flex items-center gap-1">
                    <span>{countdown.formattedClock}</span>
                    <span className="text-xs text-red-400 font-normal uppercase tracking-widest ml-2">
                      (UTC MIDNIGHT)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px]">
                <span className="text-[#8895bd] block">NEXT SEED ROTATION:</span>
                <b className="text-emerald-400 text-xs">{countdown.targetDateUtc} 00:00:00 UTC</b>
              </div>
            </div>

            {/* 24-Hour Cycle Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-[#93a0c5]">
                <span>24-HOUR EXPEDITION ROTATION WINDOW</span>
                <span className="text-amber-400 font-bold">{Math.round(100 - countdown.progressPercent)}% WINDOW REMAINING</span>
              </div>
              <div className="w-full h-2 bg-[#0d0912] rounded-full overflow-hidden border border-red-900/60">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${100 - countdown.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Modifier & Stats */}
          <div className="bg-[#14111d] border border-[#2d2642] p-3 rounded space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#8895bd]">DAILY MUTATOR MODIFIER:</span>
              <span className="text-amber-400 font-bold tracking-wider uppercase">
                {daily.modifier}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#8895bd]">CURRENT STREAK:</span>
              <span className="text-emerald-400 font-bold">
                {daily.streak} DAYS (PERSONAL BEST: {daily.bestStreak})
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#8895bd]">TOTAL EXPEDITIONS COMPLETED:</span>
              <span className="text-cyan-400 font-bold">
                {daily.totalCompleted} CHALLENGES
              </span>
            </div>
          </div>

          {/* Missions List */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  DAILY SECTOR OBJECTIVES:
                </h4>
                {unclaimedCount > 0 && onClaimAllRewards && (
                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      onClaimAllRewards();
                    }}
                    className="px-2 py-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-[10px] rounded shadow animate-pulse cursor-pointer flex items-center gap-1"
                  >
                    <span>🎁</span>
                    <span>CLAIM ALL REWARDS ({unclaimedCount})</span>
                  </button>
                )}
              </div>
              <span className="text-[10px] text-red-400 font-bold">
                EXPIRES IN: {countdown.formattedVerbose}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {daily.missions.map((m, i) => {
                const itemInfo = getRewardItemInfo(m.reward, m.rewardItemId);
                const isDelivered = m.done && m.rewardClaimed;
                const canClaim = m.done && !m.rewardClaimed;

                return (
                  <div
                    key={i}
                    className={`p-3 rounded border space-y-2 transition ${
                      m.done
                        ? 'bg-[#102416] border-emerald-700 text-white shadow-md shadow-emerald-950/30'
                        : 'bg-[#121626] border-[#293352] text-[#c2cced]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <b className={m.done ? 'text-emerald-300 text-xs flex items-center gap-1.5' : 'text-amber-400 text-xs'}>
                        {m.done && <span className="text-emerald-400">✓</span>}
                        {i + 1}. {m.name}
                      </b>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        m.done ? 'bg-emerald-950 text-emerald-400 border border-emerald-600' : 'bg-black/50 text-[#717c9e]'
                      }`}>
                        {m.done ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#93a0c5]">{m.desc}</p>

                    {/* Reward Panel with Item Info & Inventory Status */}
                    <div className="pt-2 border-t border-[#1e253e] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-purple-400 font-bold">PROMISED REWARD:</span>
                          <span className="text-amber-300 font-black tracking-wide uppercase">
                            {itemInfo.name}
                          </span>
                        </div>
                        {isDelivered ? (
                          <span className="text-[9px] bg-emerald-900/90 text-emerald-200 border border-emerald-500 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <span>✓</span> DELIVERED TO INVENTORY
                          </span>
                        ) : canClaim && onClaimReward ? (
                          <button
                            onClick={() => {
                              triggerHaptic(15);
                              onClaimReward(m.id);
                            }}
                            className="text-[9px] bg-amber-500 hover:bg-amber-400 text-black font-black px-2 py-0.5 rounded shadow cursor-pointer uppercase animate-pulse"
                          >
                            ⚡ CLAIM TO INVENTORY
                          </button>
                        ) : (
                          <span className="text-[9px] bg-[#1a1f33] text-[#8ea0d2] border border-[#2b3558] font-bold px-1.5 py-0.5 rounded">
                            AWARDED ON COMPLETION
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-[#8ca0cd] bg-black/40 px-2 py-1 rounded">
                        <span className="truncate max-w-[280px] italic">
                          "{itemInfo.desc}"
                        </span>
                        {m.secret && (
                          <span className="text-[#a4b5e0] text-[9px]">
                            {m.secretDone ? '★ SECRET ACHIEVED' : `Secret: ${m.secret}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#160f14] border-t border-red-900/50 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
            <span>⏱️</span>
            <span>NEXT EXPEDITION SEED IN {countdown.formattedClock}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerHaptic(8);
                audio.playClick();
                onClose();
              }}
              className="px-3 py-1.5 bg-[#181c2e] hover:bg-[#22273e] text-white border border-[#2b3350] rounded font-bold text-xs cursor-pointer"
            >
              CLOSE
            </button>
            <button
              onClick={() => {
                triggerHaptic(30);
                audio.playSolve();
                onStartDaily();
              }}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded uppercase tracking-wider text-xs transition cursor-pointer shadow-lg shadow-red-950"
            >
              LAUNCH DAILY EXPEDITION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
