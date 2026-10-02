import React from 'react';
import { INVENTORY_ITEMS, CRAFTING_RECIPES } from '../data/items';
import { audio } from '../audio/soundEngine';
import { localizeItem, translate } from '../data/i18n';

interface InventoryModalProps {
  inventory: string[];
  onUseItem: (itemId: string) => void;
  onCraftItem: (itemA: string, itemB: string, resultId: string) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
  language?: string;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  onUseItem,
  onCraftItem,
  onClose,
  hapticsEnabled,
  language = 'en'
}) => {
  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  // Group inventory items by count
  const itemCounts: Record<string, number> = {};
  inventory.forEach(id => {
    itemCounts[id] = (itemCounts[id] || 0) + 1;
  });

  const uniqueItemIds = Object.keys(itemCounts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0c0f1e] border-2 border-[#374268] max-w-2xl w-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#101424] border-b border-[#232a42]">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">🎒</span>
            <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
              TACTICAL LOADOUT & WORKBENCH ({inventory.length} ITEMS)
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

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Current Stored Equipment */}
          <div>
            <h4 className="text-[11px] text-[#7885aa] uppercase tracking-wider font-bold mb-2">
              EQUIPMENT IN SUIT PODS:
            </h4>

            {uniqueItemIds.length === 0 ? (
              <p className="text-[#646e8c] italic text-[11px]">No equipment in containment pockets.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uniqueItemIds.map(id => {
                  const rawItem = INVENTORY_ITEMS[id] || {
                    id,
                    name: id.toUpperCase(),
                    desc: 'Recovered salvage component.',
                    rarity: 'common'
                  };
                  const item = localizeItem(rawItem, language);
                  const count = itemCounts[id];
                  const isUsable = item.usable;

                  return (
                    <div
                      key={id}
                      className="bg-[#121626] border border-[#2b3554] p-2.5 rounded flex flex-col justify-between gap-1.5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <b className="text-[#d8e0ff] text-xs flex items-center gap-1">
                            <span>{item.name}</span>
                            {count > 1 && (
                              <span className="text-amber-400 font-normal">×{count}</span>
                            )}
                          </b>
                          <p className="text-[#8895bd] text-[10px] mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-black/40 text-[#727f9e] border border-[#232a42] rounded">
                          {item.rarity}
                        </span>
                      </div>

                      {isUsable && (
                        <button
                          onClick={() => {
                            triggerHaptic(15);
                            audio.playSolve();
                            onUseItem(id);
                          }}
                          className="mt-1 w-full py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 hover:border-emerald-500 rounded text-[10px] font-bold uppercase transition cursor-pointer"
                        >
                          USE CONSUMABLE ({item.sanityHeal ? `+${item.sanityHeal} SAN` : 'USE'})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Synthesis Workbench */}
          <div className="pt-3 border-t border-[#1e253c]">
            <h4 className="text-[11px] text-cyan-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
              <span>⚡</span> SYNTHESIS WORKBENCH:
            </h4>

            <div className="space-y-2">
              {CRAFTING_RECIPES.map((r, i) => {
                const hasA = inventory.includes(r.itemA);
                const hasB = inventory.includes(r.itemB);
                const canCraft = hasA && hasB;

                return (
                  <div
                    key={i}
                    className={`p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                      canCraft
                        ? 'bg-[#121a2c] border-cyan-700 text-white'
                        : 'bg-[#0e1220] border-[#222940] opacity-60 text-[#717c9e]'
                    }`}
                  >
                    <div>
                      <b className={canCraft ? 'text-cyan-300' : 'text-[#8e9abf]'}>
                        {r.name}
                      </b>
                      <p className="text-[10px] text-[#93a0c5] mt-0.5">
                        Requires: <span className={hasA ? 'text-emerald-400 font-bold' : 'text-red-400'}>{r.itemA.toUpperCase()}</span> + <span className={hasB ? 'text-emerald-400 font-bold' : 'text-red-400'}>{r.itemB.toUpperCase()}</span>
                      </p>
                      <p className="text-[10px] text-[#717c9e] italic mt-0.5">{r.desc}</p>
                    </div>

                    <button
                      disabled={!canCraft}
                      onClick={() => {
                        triggerHaptic(30);
                        audio.playSolve();
                        onCraftItem(r.itemA, r.itemB, r.resultId);
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-20 text-black font-black text-xs rounded uppercase tracking-wider transition cursor-pointer self-start sm:self-auto"
                    >
                      SYNTHESIZE
                    </button>
                  </div>
                );
              })}
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
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition cursor-pointer text-xs"
          >
            DISMISS LOADOUT
          </button>
        </div>
      </div>
    </div>
  );
};
