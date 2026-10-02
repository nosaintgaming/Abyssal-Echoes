import React, { useState } from 'react';
import { audio } from '../audio/soundEngine';

interface SecretsCodexModalProps {
  unlockedSecrets: string[];
  discoveredCodes?: string[];
  onClose: () => void;
  hapticsEnabled: boolean;
  onTuneRadio?: (freq: number) => void;
}

interface SecretEntry {
  id: string;
  name: string;
  category: 'NON-EUCLIDEAN' | 'RADIO CIPHER' | 'RELIC & CRAFT' | 'CHAMBER ANOMALY';
  desc: string;
  solutionHint: string;
  frequency?: number;
  rewardText: string;
}

const ALL_SECRETS: SecretEntry[] = [
  {
    id: 'sec_01',
    name: "ENTITY 00: THE PALE ARCHITECT",
    category: 'NON-EUCLIDEAN',
    desc: 'The pre-human demiurge that drafted the oceanic megastructure. Resides in Chamber 0 beyond the physical station perimeter.',
    solutionHint: 'Solve Rush Mode Tier-3 milestone or tune radio to 84.4 MHz to decrypt its harmonic frequency.',
    frequency: 84.4,
    rewardText: 'Unlocks Non-Euclidean Ivory Caliper & Chamber Zero access'
  },
  {
    id: 'sec_02',
    name: "CHRONO-LEVIATHAN CAUSALITY LOOP",
    category: 'NON-EUCLIDEAN',
    desc: 'A city-sized abyssal leviathan whose infrasound reverses room causality and turns clock ticks backwards.',
    solutionHint: 'Listen to frequency 106.2 MHz or survive 12,000m depth without using medical stims.',
    frequency: 106.2,
    rewardText: 'Unlocks Chrono-Reversal Cog & Temporal immunity'
  },
  {
    id: 'sec_03',
    name: "THE 4 Ω-FRAGMENTS OF CHALLENGER DEEP",
    category: 'NON-EUCLIDEAN',
    desc: 'Four fractured quantum singularity cores scattered across Omega sectors (Gateway, Reactor, Silent City, Crown).',
    solutionHint: 'Descend through Omega sectors and recover all 4 fragments to shatter the recursion singularity.',
    rewardText: 'Unlocks Transcendence Ending & Shatters The Abyss cycle'
  },
  {
    id: 'sec_04',
    name: "RADIO 94.2 MHz: SECTION 12 SOS",
    category: 'RADIO CIPHER',
    desc: 'The final desperate broadcast from survivor Dr. Vane before the lower quarantine flooded.',
    solutionHint: 'Tune transceiver to 94.2 MHz and verify transponder before opening emergency airlocks.',
    frequency: 94.2,
    rewardText: 'Unmasks Mimic ambush traps and reveals safe airlock bypass codes'
  },
  {
    id: 'sec_05',
    name: "RADIO 91.8 MHz: U-884 GHOST SONAR",
    category: 'RADIO CIPHER',
    desc: 'Active sonar echoes and diesel hum from a 1944 submarine crushed under 5,000 meters of water.',
    solutionHint: 'Tune transceiver to 91.8 MHz during deep transit corridors.',
    frequency: 91.8,
    rewardText: 'Reveals ghost torpedo bearing and disables acoustic pressure mines'
  },
  {
    id: 'sec_06',
    name: "RADIO 101.4 MHz: BASILICA REQUIEM",
    category: 'RADIO CIPHER',
    desc: '18Hz infrasonic choir sung through bone organ pipes in the sunken limestone cathedral.',
    solutionHint: 'Tune transceiver to 101.4 MHz when encountering The Hadal Liturgist.',
    frequency: 101.4,
    rewardText: 'Counter-resonates liturgical hymns, preventing sanity lobotomy'
  },
  {
    id: 'sec_07',
    name: "FOSSILIZED LEVIATHAN AMBER",
    category: 'RELIC & CRAFT',
    desc: 'The calcified bio-electric heart of a prehistoric titan harvested at the ocean floor.',
    solutionHint: 'Reach Round 24 in Puzzle Rush or explore Leviathan Gullet in Sector 13.',
    rewardText: 'Consumable: Fully restores Sanity to 100% and purges 50% Corruption'
  },
  {
    id: 'sec_08',
    name: "NON-EUCLIDEAN IVORY CALIPER",
    category: 'RELIC & CRAFT',
    desc: 'Drafting caliper of Entity 00 that measures 4-dimensional spatial angles.',
    solutionHint: 'Craft using Architect’s Compass + Obsidian Focus Crystal in the Workbench.',
    rewardText: 'Consumable: Neutralizes Cartographer labyrinth shuffling, restores +60 Sanity'
  },
  {
    id: 'sec_09',
    name: "THE WARDEN'S BLIND SPOT",
    category: 'CHAMBER ANOMALY',
    desc: 'The Corrupted Hydraulic Mainframe predicts door choices based on player click habits.',
    solutionHint: 'Vary door selections (Option 1 -> 2 -> 3) to prevent predictability from exceeding 50%.',
    rewardText: 'Prevents lethal hydraulic bulkhead guillotine retaliations'
  },
  {
    id: 'sec_10',
    name: "THE LISTENER'S SPLASH TELEMETRY",
    category: 'CHAMBER ANOMALY',
    desc: 'The eyeless apex predator detects rapid, jerky cursor movement (>1200 px/s) as panicked splashing.',
    solutionHint: 'Move your cursor smoothly and slowly when The Listener stalks your chamber.',
    rewardText: 'Reduces acoustic detection meter spikes by 80%'
  },
  {
    id: 'sec_11',
    name: "MIMIC POLYMORPHIC AIRLOCKS",
    category: 'CHAMBER ANOMALY',
    desc: 'The Mimic disguises lethal jaw traps as Adrenaline Stims when your Sanity is critical.',
    solutionHint: 'Hover your cursor over suspect options for 1.2+ seconds to force its fangs to twitch and reveal the disguise.',
    rewardText: 'Prevents -16 Sanity jumpscare ambushes'
  },
  {
    id: 'sec_12',
    name: "THE SCAVENGER'S RETRIBUTION NEST",
    category: 'RELIC & CRAFT',
    desc: 'The parasitic thief caches filched supplies in flooded aeration ducts at Sector 4.',
    solutionHint: 'Deploy Photic Lure Mines or use the Scavenger Hook in Scenario S21.',
    rewardText: 'Recovers all filched quick-belt items at once'
  }
];

export const SecretsCodexModal: React.FC<SecretsCodexModalProps> = ({
  unlockedSecrets,
  onClose,
  hapticsEnabled,
  onTuneRadio
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedSecret, setSelectedSecret] = useState<SecretEntry>(ALL_SECRETS[0]);

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const categories = ['ALL', 'NON-EUCLIDEAN', 'RADIO CIPHER', 'RELIC & CRAFT', 'CHAMBER ANOMALY'];

  const filteredSecrets = activeCategory === 'ALL'
    ? ALL_SECRETS
    : ALL_SECRETS.filter(s => s.category === activeCategory);

  const discoveredCount = ALL_SECRETS.filter(s => 
    unlockedSecrets.some(u => u.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(u.toLowerCase()))
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#080a14] border-2 border-amber-600/80 max-w-4xl w-full max-h-[92vh] rounded-lg shadow-[0_0_60px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#171109] border-b border-amber-900/70">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400 text-xl animate-pulse">🔑</span>
            <div>
              <h3 className="text-amber-400 font-black uppercase tracking-[0.15em] text-sm flex items-center gap-2">
                HADAL CLASSIFIED SECRETS &amp; CRYPTOGRAM CODEX
              </h3>
              <p className="text-[10px] text-amber-500/80 tracking-wider">
                OMEGA CLEARANCE // {discoveredCount} / {ALL_SECRETS.length} ENIGMAS DOCUMENTED
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center bg-[#251b0f] hover:bg-amber-950 text-white border border-amber-700 rounded font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#0f0e1c] border-b border-amber-950/80">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic(6);
                audio.playClick();
                setActiveCategory(cat);
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-[#151326] text-[#838ba6] border-[#252442] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Content: List + Detail View */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Secret Entries List */}
          <div className="w-full md:w-80 bg-[#0b0c1a] border-b md:border-b-0 md:border-r border-amber-950/70 p-2 overflow-y-auto max-h-52 md:max-h-full shrink-0 space-y-1.5">
            {filteredSecrets.map(sec => {
              const isSelected = selectedSecret.id === sec.id;
              const isDiscovered = unlockedSecrets.some(u => 
                u.toLowerCase().includes(sec.name.toLowerCase()) || sec.name.toLowerCase().includes(u.toLowerCase())
              );

              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    triggerHaptic(10);
                    audio.playClick();
                    setSelectedSecret(sec);
                  }}
                  className={`w-full text-left p-2.5 rounded border transition flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-[#291b0d] border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-[#111224] border-[#222442] hover:border-amber-900 text-[#a9b3d1] hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <b className={`text-xs ${isSelected ? 'text-amber-300 font-black' : 'text-[#cfd6ed]'}`}>
                      {sec.name}
                    </b>
                    <span className="text-[10px]">
                      {isDiscovered ? '★' : '🔒'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-cyan-400 font-semibold">{sec.category}</span>
                    {sec.frequency && (
                      <span className="text-amber-400 font-mono">{sec.frequency.toFixed(1)} MHz</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Secret Intel */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#090b16]">
            <div className="border-b border-amber-950/80 pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-amber-400 uppercase tracking-wide">
                  {selectedSecret.name}
                </h2>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 rounded text-[10px] font-bold">
                  {selectedSecret.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#121426] border border-[#23284a] p-3.5 rounded text-xs space-y-1.5">
              <b className="text-amber-400 text-[11px] block uppercase tracking-wider">ANOMALY ARCHIVE INTELLIGENCE:</b>
              <p className="text-[#d8e0fa] leading-relaxed select-text">
                {selectedSecret.desc}
              </p>
            </div>

            {/* Hint & Discovery Protocol */}
            <div className="bg-[#171226] border-l-4 border-amber-500 p-3.5 rounded text-xs space-y-1.5 shadow-md">
              <b className="text-amber-300 text-[11px] block uppercase tracking-wider">HOW TO UNLOCK &amp; EXPLOIT:</b>
              <p className="text-[#e2e7fb] leading-relaxed select-text font-mono text-[11px]">
                {selectedSecret.solutionHint}
              </p>
            </div>

            {/* Reward / Benefit */}
            <div className="bg-[#101b22] border border-cyan-800/80 p-3.5 rounded text-xs space-y-1.5">
              <b className="text-cyan-400 text-[11px] block uppercase tracking-wider">TACTICAL UTILITY &amp; REWARD:</b>
              <p className="text-cyan-100 font-bold select-text">
                {selectedSecret.rewardText}
              </p>
            </div>

            {/* Frequency Quick Action if applicable */}
            {selectedSecret.frequency && (
              <div className="flex items-center justify-between p-3 bg-[#19152b] border border-purple-800 rounded">
                <div>
                  <span className="text-[10px] text-purple-300 font-bold block">RESONANT TRANSCEIVER FREQUENCY:</span>
                  <span className="text-base text-purple-400 font-black font-mono">
                    {selectedSecret.frequency.toFixed(1)} MHz
                  </span>
                </div>
                {onTuneRadio && (
                  <button
                    onClick={() => {
                      triggerHaptic(15);
                      audio.playRadioStatic();
                      onTuneRadio(selectedSecret.frequency!);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-600 rounded text-xs font-bold transition cursor-pointer"
                  >
                    📻 TUNE IN TRANSCEIVER ➔
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0d0f1e] border-t border-amber-950 flex items-center justify-between text-[11px] text-[#717a99]">
          <span>Every secret unravels the mystery of the descent and Entity 00</span>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1 bg-[#1a1c32] hover:bg-[#282b4a] text-white border border-[#353961] rounded font-bold cursor-pointer"
          >
            CLOSE CODEX
          </button>
        </div>
      </div>
    </div>
  );
};
