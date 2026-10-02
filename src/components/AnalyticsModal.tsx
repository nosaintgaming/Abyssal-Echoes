import React, { useState } from 'react';
import { PlayerStats, DeathLog } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { audio } from '../audio/soundEngine';

interface AnalyticsModalProps {
  stats: PlayerStats;
  achievements: string[];
  deathArchive: DeathLog[];
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  stats,
  achievements,
  deathArchive,
  onClose,
  hapticsEnabled
}) => {
  const [subTab, setSubTab] = useState<'metrics' | 'achievements' | 'autopsies'>('metrics');

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const winRate = stats.runs > 0 ? Math.round((stats.wins / stats.runs) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0c0f1e] border-2 border-[#374268] max-w-2xl w-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101424] border-b border-[#232a42]">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">📊</span>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
              FORENSIC ANALYTICS & TELEMETRY
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

        {/* Subtabs */}
        <div className="flex border-b border-[#232a44] bg-[#0c0f1e] overflow-x-auto p-1.5 gap-1">
          {[
            { id: 'metrics', label: 'EXPEDITION METRICS' },
            { id: 'achievements', label: `ACHIEVEMENTS (${achievements.length}/${ACHIEVEMENTS.length})` },
            { id: 'autopsies', label: `DEATH ARCHIVE (${deathArchive.length})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                triggerHaptic(6);
                audio.playClick();
                setSubTab(t.id as typeof subTab);
              }}
              className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition cursor-pointer border ${
                subTab === t.id
                  ? 'bg-[#19223c] text-amber-400 border-amber-500'
                  : 'bg-[#121626] text-[#8b97bc] border-[#222a44] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {subTab === 'metrics' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#121626] border border-[#2b3554] p-3 rounded text-center">
                  <div className="text-[10px] text-[#717c9e]">TOTAL RUNS</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{stats.runs}</div>
                </div>
                <div className="bg-[#121626] border border-[#2b3554] p-3 rounded text-center">
                  <div className="text-[10px] text-[#717c9e]">SUCCESS RATE</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{winRate}%</div>
                </div>
                <div className="bg-[#121626] border border-[#2b3554] p-3 rounded text-center">
                  <div className="text-[10px] text-[#717c9e]">AUTOPSIES</div>
                  <div className="text-xl font-black text-red-400 mt-1">{stats.deaths}</div>
                </div>
                <div className="bg-[#121626] border border-[#2b3554] p-3 rounded text-center">
                  <div className="text-[10px] text-[#717c9e]">MAX DEPTH</div>
                  <div className="text-xl font-black text-cyan-400 mt-1">{stats.highestDepth}m</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-[#121626] border border-[#232b45] p-2.5 rounded">
                  <span className="text-[#8e9abf]">CHAMBERS EXPLORED:</span>
                  <b className="text-white ml-2">{stats.chambers}</b>
                </div>
                <div className="bg-[#121626] border border-[#232b45] p-2.5 rounded">
                  <span className="text-[#8e9abf]">ITEMS SYNTHESIZED:</span>
                  <b className="text-white ml-2">{stats.crafts}</b>
                </div>
                <div className="bg-[#121626] border border-[#232b45] p-2.5 rounded">
                  <span className="text-[#8e9abf]">SURVIVOR TRADES:</span>
                  <b className="text-white ml-2">{stats.trades}</b>
                </div>
              </div>
            </div>
          )}

          {subTab === 'achievements' && (
            <div className="space-y-2">
              {ACHIEVEMENTS.map(a => {
                const isUnlocked = achievements.includes(a.id);

                return (
                  <div
                    key={a.id}
                    className={`p-3 rounded border flex items-center justify-between gap-2 ${
                      isUnlocked
                        ? 'bg-[#102416] border-emerald-700 text-white'
                        : 'bg-[#121626] border-[#252f4a] opacity-60 text-[#717c9e]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-[#586282]'}>
                          {isUnlocked ? '✓' : '○'}
                        </span>
                        <b className={isUnlocked ? 'text-emerald-300' : 'text-[#8e9abf]'}>
                          {a.name}
                        </b>
                        {a.isSecret && (
                          <span className="text-[9px] px-1 py-0.2 bg-purple-950 text-purple-300 border border-purple-800 rounded">
                            SECRET
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#93a0c5] mt-0.5">{a.desc}</p>
                    </div>

                    <span className="text-[10px] font-bold uppercase">
                      {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {subTab === 'autopsies' && (
            <div className="space-y-2">
              {deathArchive.length === 0 ? (
                <p className="text-[#717c9e] italic text-center py-6">
                  No neural collapses recorded in this cycle.
                </p>
              ) : (
                deathArchive.slice(0, 30).map(d => (
                  <div
                    key={d.id}
                    className="bg-[#181116] border border-red-950 p-2.5 rounded text-[11px] space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <b className="text-red-400">{d.mapName} // CHAMBER {d.chamber}</b>
                      <span className="text-[#8e9abf] text-[10px]">{d.date.slice(0, 10)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[#9faac7]">
                      <span>DIFFICULTY: <b className="text-amber-400 uppercase">{d.difficulty}</b></span>
                      <span>COLLAPSE ENTITY: <b className="text-red-400">{d.entity}</b></span>
                      <span>SCORE: <b className="text-white">{d.score}</b></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#101424] border-t border-[#232a42] text-right">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition cursor-pointer text-xs"
          >
            DISMISS ANALYTICS
          </button>
        </div>
      </div>
    </div>
  );
};
