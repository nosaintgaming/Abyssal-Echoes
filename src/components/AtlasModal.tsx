import React, { useState } from 'react';
import { MapTier, MapData } from '../types';
import { ATLAS_MAPS } from '../data/maps';
import { audio } from '../audio/soundEngine';
import { localizeMap, translate } from '../data/i18n';

interface AtlasModalProps {
  unlockedMaps: number[];
  onSelectSector: (map: MapData) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
  language?: string;
}

export const AtlasModal: React.FC<AtlasModalProps> = ({
  unlockedMaps,
  onSelectSector,
  onClose,
  hapticsEnabled,
  language = 'en'
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const filteredMaps = ATLAS_MAPS.filter(m => {
    if (selectedTier === 'ALL') return true;
    return m.tier === selectedTier;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0b0e1b] border-2 border-[#374268] max-w-3xl w-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101424] border-b border-[#232a42]">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">🗺️</span>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
              DESCENT SECTOR ATLAS ({ATLAS_MAPS.length} SECTORS)
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

        {/* Tier Filter Bar */}
        <div className="flex border-b border-[#232a44] bg-[#0c0f1e] overflow-x-auto p-1.5 gap-1">
          {['ALL', 'STANDARD', 'SECRET', 'OMEGA', 'VOID', 'ABYSS'].map(tier => (
            <button
              key={tier}
              onClick={() => {
                triggerHaptic(6);
                audio.playClick();
                setSelectedTier(tier);
              }}
              className={`px-3 py-1 text-[10px] font-bold rounded uppercase transition cursor-pointer border ${
                selectedTier === tier
                  ? 'bg-[#19223c] text-amber-400 border-amber-500'
                  : 'bg-[#121626] text-[#8b97bc] border-[#222a44] hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Sector Cards */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
          {filteredMaps.map(rawM => {
            const m = localizeMap(rawM, language);
            const isUnlocked = m.tier === 'STANDARD' || unlockedMaps.includes(m.id);

            return (
              <div
                key={m.id}
                onClick={() => {
                  if (isUnlocked) {
                    triggerHaptic(20);
                    onSelectSector(m);
                  }
                }}
                className={`p-3 rounded border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isUnlocked
                    ? 'bg-[#121628] hover:bg-[#1c2340] border-[#2c375c] hover:border-amber-400 cursor-pointer shadow-md'
                    : 'bg-[#0e101c] border-[#1f2438] opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <b className={isUnlocked ? 'text-amber-400 text-sm' : 'text-[#626c8c] text-sm'}>
                      {m.name}
                    </b>
                    <span className={`px-1.5 py-0.2 text-[9px] font-bold border rounded ${
                      m.tier === 'OMEGA' || m.tier === 'ABYSS'
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : m.tier === 'SECRET'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      [{m.tier}]
                    </span>
                    <span className="text-[#8895bd] text-[11px] font-bold">
                      {m.depth}m
                    </span>
                  </div>

                  <p className="text-[#a4aed2] text-[11px] leading-snug">
                    {m.desc}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.hazards.map((h, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-red-950/60 border border-red-900/60 text-red-300 text-[9px] rounded"
                      >
                        ⚠️ {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-auto">
                  {isUnlocked ? (
                    <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded uppercase tracking-wider transition">
                      {translate('startDescent', language)}
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#6c7696] italic">
                      [LOCKED // RECOVER Ω-FRAGMENTS]
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#101424] border-t border-[#232a42] text-right">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#1a1f33] hover:bg-[#252c48] text-white border border-[#313a5c] font-bold rounded transition cursor-pointer text-xs uppercase"
          >
            {translate('close', language)}
          </button>
        </div>
      </div>
    </div>
  );
};
