import React from 'react';
import { INVENTORY_ITEMS } from '../data/items';
import { audio } from '../audio/soundEngine';
import { localizeItem, translate } from '../data/i18n';

interface QuickItemBeltProps {
  inventory: string[];
  onUseItem: (itemId: string) => void;
  hapticsEnabled: boolean;
  language?: string;
}

export const QuickItemBelt: React.FC<QuickItemBeltProps> = ({
  inventory,
  onUseItem,
  hapticsEnabled,
  language = 'en'
}) => {
  const consumableIds = ['stim', 'medkit', 'trauma_kit', 'flare'];
  const counts: Record<string, number> = {};
  consumableIds.forEach(id => {
    counts[id] = inventory.filter(i => i === id).length;
  });

  const availableConsumables = consumableIds.filter(id => counts[id] > 0);

  if (availableConsumables.length === 0) {
    return (
      <div className="w-full bg-[#080a12] border border-[#1e2338] px-3 py-1.5 rounded flex items-center justify-between text-[11px] font-mono text-[#586282] my-2">
        <span>{translate('quickBelt', language)}: [EMPTY]</span>
        <span className="text-[10px]">CRAFT OR SCAVENGE SUPPLIES</span>
      </div>
    );
  }

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  return (
    <div className="w-full bg-[#0a0d18] border border-[#2b3352] p-2 rounded my-2 font-mono">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span>⚡</span> {translate('quickBelt', language)} (1-TAP USE)
        </span>
        <span className="text-[9px] text-[#717c9e]">RESTORATIVE &amp; UTILITY</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {availableConsumables.map(id => {
          const rawItem = INVENTORY_ITEMS[id];
          const item = localizeItem(rawItem, language);
          const count = counts[id];
          const isHeal = id === 'stim' || id === 'medkit' || id === 'trauma_kit';

          return (
            <button
              key={id}
              onClick={() => {
                triggerHaptic(15);
                audio.playSolve();
                onUseItem(id);
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-[11px] font-bold transition cursor-pointer ${
                isHeal
                  ? 'bg-[#102418] hover:bg-[#163622] text-emerald-300 border-emerald-700 hover:border-emerald-400'
                  : 'bg-[#291b10] hover:bg-[#3d2716] text-amber-300 border-amber-700 hover:border-amber-400'
              }`}
              title={item.desc}
            >
              <div className="text-left truncate">
                <div className="truncate text-[10px] sm:text-[11px]">{item.name}</div>
                <div className="text-[9px] opacity-75">
                  {item.sanityHeal ? `+${item.sanityHeal} SAN` : 'ILLUMINATE'}
                </div>
              </div>
              <span className="ml-1.5 px-1.5 py-0.5 bg-black/50 text-white rounded text-[10px] font-mono">
                ×{count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
