import React, { useState, useMemo } from 'react';
import { INVENTORY_ITEMS } from '../data/items';
import { DifficultyId } from '../types';
import { audio } from '../audio/soundEngine';

interface TraderModalProps {
  sector: number;
  chamber: number;
  difficulty: DifficultyId;
  inventory: string[];
  onAcceptTrade: (playerItemId: string, traderItemId: string, volatileRate: number) => void;
  onDeclineTrade: () => void;
  hapticsEnabled: boolean;
}

export const getTraderVolatileRate = (sector: number, difficulty: DifficultyId): number => {
  // Rates as specified by user: 100 / 80 / 50 / 25 / 10 / 1
  const baseRates = [100, 80, 50, 25, 10, 1];
  const sectorIdx = Math.max(0, Math.min(baseRates.length - 1, sector - 1));
  let rate = baseRates[sectorIdx];

  if (difficulty === 'easy') {
    rate = Math.min(100, rate + 10);
  } else if (difficulty === 'nightmare') {
    // Shifts down one tier
    const shiftedIdx = Math.min(baseRates.length - 1, sectorIdx + 1);
    rate = baseRates[shiftedIdx];
  } else if (difficulty === 'extreme') {
    rate = Math.max(1, rate - 10);
  }

  return rate;
};

const TRADER_OFFER_POOL = [
  'trader_gamble_syringe',
  'trader_chronometer',
  'trader_singularity_core',
  'trader_phantom_rebreather',
  'trader_null_dice'
];

export const TraderModal: React.FC<TraderModalProps> = ({
  sector,
  chamber,
  difficulty,
  inventory,
  onAcceptTrade,
  onDeclineTrade,
  hapticsEnabled
}) => {
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string | null>(
    inventory.length > 0 ? inventory[0] : null
  );

  // Pick a trader item offer based on chamber/sector seed
  const offeredTraderItemId = useMemo(() => {
    const idx = (chamber + sector) % TRADER_OFFER_POOL.length;
    return TRADER_OFFER_POOL[idx];
  }, [chamber, sector]);

  const offeredItem = INVENTORY_ITEMS[offeredTraderItemId];
  const volatileRate = useMemo(() => getTraderVolatileRate(sector, difficulty), [sector, difficulty]);
  const backfireRate = 100 - volatileRate;

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const handleAccept = () => {
    if (!selectedInventoryItem) return;
    triggerHaptic(40);
    audio.playSubsonicDrone();
    onAcceptTrade(selectedInventoryItem, offeredTraderItemId, volatileRate);
  };

  const handleDecline = () => {
    triggerHaptic(12);
    audio.playClick();
    onDeclineTrade();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-5 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0b0811] border-2 border-amber-600/80 max-w-3xl w-full p-4 sm:p-6 rounded-lg shadow-[0_0_60px_rgba(217,119,6,0.35)] space-y-4 max-h-[92vh] flex flex-col overflow-hidden relative">
        {/* Atmospheric background scanlines & pulsing glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-black/80" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-3 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse select-none">⏳</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-amber-400 font-black uppercase tracking-[0.2em] text-sm sm:text-base">
                  THE TRADER
                </h3>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 text-[9px] rounded font-bold uppercase">
                  CLASS VII ANOMALY
                </span>
              </div>
              <p className="text-[10px] text-amber-500/80 tracking-wider">
                OMNIPRESENT CAUSALITY SPECULATOR // SECTOR {sector} ENCOUNTER
              </p>
            </div>
          </div>

          <button
            onClick={handleDecline}
            className="text-amber-500/70 hover:text-amber-300 px-2 py-1 border border-amber-900/60 hover:border-amber-600 rounded cursor-pointer transition text-[11px]"
          >
            DECLINE &amp; STEP BACK
          </button>
        </div>

        {/* Self-Aware Monologue Banner */}
        <div className="bg-[#140c1a] border-l-4 border-amber-500 p-3 rounded text-xs space-y-1 relative z-10">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              TRANSMISSION INTERCEPT // 4TH WALL DIRECT CONVERSATION
            </span>
            <span className="text-[#a48ab5] font-mono">CLIENT PORT: 3000</span>
          </div>
          <p className="text-white italic text-xs leading-relaxed">
            "Greetings, human across the monitor. I watch you dispatch options and rerender component trees. You hold perishable variables in your local array. Hand me one, and I will gift you an anomaly of pure volatile probability. Will it save your dive... or destroy your mind?"
          </p>
        </div>

        {/* Sector Volatility Odds Meter (100 / 80 / 50 / 25 / 10 / 1) */}
        <div className="bg-[#120914] border border-amber-900/50 p-3 rounded relative z-10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              SECTOR {sector} CAUSALITY EQUILIBRIUM:
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-emerald-400 font-bold">
                STABILIZATION: {volatileRate}%
              </span>
              <span className="text-red-400 font-bold">
                BACKFIRE RISK: {backfireRate}%
              </span>
            </div>
          </div>

          {/* Graphical Volatility Bar */}
          <div className="w-full h-3 bg-[#1e0f24] rounded overflow-hidden flex border border-[#3b1c47]">
            <div
              style={{ width: `${volatileRate}%` }}
              className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full transition-all duration-500 relative group"
            />
            <div
              style={{ width: `${backfireRate}%` }}
              className="bg-gradient-to-r from-red-600 to-rose-900 h-full transition-all duration-500"
            />
          </div>

          <div className="flex justify-between items-center text-[9px] text-[#9c8ea6]">
            <span>SECTOR SCALE: S1:100% → S2:80% → S3:50% → S4:25% → S5:10% → S6+:1%</span>
            <span className="italic text-amber-400 font-mono">DIFFICULTY: {difficulty.toUpperCase()}</span>
          </div>
        </div>

        {/* The Trade Arena: Your Offering vs The Trader's Offering */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto flex-1 pr-1 relative z-10">
          {/* Left Column: Your Inventory (Pick 1 to give) */}
          <div className="bg-[#0e0a16] border border-[#2b193b] p-3 rounded space-y-2.5 flex flex-col">
            <div className="flex justify-between items-center border-b border-[#21132f] pb-1.5">
              <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                1. SELECT YOUR ITEM TO SACRIFICE
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">
                {inventory.length} AVAILABLE
              </span>
            </div>

            {inventory.length === 0 ? (
              <div className="p-4 text-center text-[#7e6d8a] italic my-auto">
                "Your pockets are completely bare, user. You have no items in memory to trade with me."
              </div>
            ) : (
              <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1 flex-1">
                {inventory.map((itemId, idx) => {
                  const item = INVENTORY_ITEMS[itemId] || { id: itemId, name: itemId, desc: 'Unknown deep-sea relic', usable: false };
                  const isSelected = selectedInventoryItem === itemId;

                  return (
                    <button
                      key={`${itemId}-${idx}`}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        audio.playClick();
                        setSelectedInventoryItem(itemId);
                      }}
                      className={`w-full text-left p-2 rounded border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'bg-[#150f21] border-[#2b1e3b] hover:border-cyan-800 text-[#b5a6c7]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.usable && (
                            <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800">
                              USABLE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#8e7e9e] line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                      <span className={`text-xs ml-2 ${isSelected ? 'text-cyan-400 font-black' : 'text-transparent'}`}>
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: The Trader's Cursed Relic Offering */}
          <div className="bg-[#140b18] border border-amber-800/60 p-3 rounded space-y-2.5 flex flex-col">
            <div className="flex justify-between items-center border-b border-amber-950 pb-1.5">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                2. THE TRADER'S OFFERING
              </span>
              <span className="text-[9px] bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700">
                VOLATILE RELIC
              </span>
            </div>

            {offeredItem && (
              <div className="space-y-2 flex-1">
                <div>
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                    <span>{offeredItem.name}</span>
                  </h4>
                  <p className="text-[11px] text-[#c9bcd4] mt-1 leading-relaxed">
                    {offeredItem.desc}
                  </p>
                </div>

                {/* Success vs Backfire Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-amber-950 text-[10px]">
                  <div className="bg-emerald-950/40 border border-emerald-900/60 p-2 rounded">
                    <span className="text-emerald-400 font-bold block flex justify-between">
                      <span>✓ IF STABILIZED ({volatileRate}% CHANCE):</span>
                      <span className="text-emerald-300">BLESSING</span>
                    </span>
                    <p className="text-emerald-200/90 text-[10px] mt-0.5">
                      Restores +{offeredItem.sanityHeal || 40} Sanity &amp; Purges -{offeredItem.corruptionReduce || 15}% Corruption!
                    </p>
                  </div>

                  <div className="bg-red-950/40 border border-red-900/60 p-2 rounded">
                    <span className="text-red-400 font-bold block flex justify-between">
                      <span>⚠️ IF BACKFIRES ({backfireRate}% CHANCE):</span>
                      <span className="text-red-400 font-bold">CALAMITY</span>
                    </span>
                    <p className="text-red-200/90 text-[10px] mt-0.5">
                      Violent neural feedback drains -{offeredItem.backfireDamage?.sanity || 25} Sanity, spikes +{offeredItem.backfireDamage?.corruption || 20}% Corruption, and triggers emergency alert!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-amber-950/80 flex flex-col sm:flex-row justify-between items-center gap-2 relative z-10 shrink-0">
          <div className="text-[10px] text-[#8e819b] text-center sm:text-left">
            {selectedInventoryItem ? (
              <span>
                Trading <b className="text-cyan-300 uppercase">{INVENTORY_ITEMS[selectedInventoryItem]?.name || selectedInventoryItem}</b> for <b className="text-amber-400 uppercase">{offeredItem?.name}</b>
              </span>
            ) : (
              <span className="text-red-400 italic">Select an inventory item above to proceed with the trade</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#1b1222] hover:bg-[#281c33] text-[#a394b3] hover:text-white border border-[#3b284c] rounded text-xs font-bold uppercase transition cursor-pointer"
            >
              DECLINE OFFER
            </button>

            <button
              disabled={!selectedInventoryItem || inventory.length === 0}
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black rounded text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(217,119,6,0.4)]"
            >
              ACCEPT THE TRADER'S DEAL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
