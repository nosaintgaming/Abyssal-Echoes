import React from 'react';
import { Survivor } from '../types';
import { audio } from '../audio/soundEngine';

interface SurvivorModalProps {
  survivors: Record<string, Survivor>;
  inventory: string[];
  assignedRoles?: Record<string, string>;
  onAssignRole?: (role: string, survivorId: string) => void;
  onTrade: (survivorId: string) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const SurvivorModal: React.FC<SurvivorModalProps> = ({
  survivors,
  inventory,
  assignedRoles = {},
  onAssignRole,
  onTrade,
  onClose,
  hapticsEnabled
}) => {
  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const survivorList = Object.values(survivors) as Survivor[];
  const rescuedCount = survivorList.filter(s => s.discovered !== false).length;
  const totalCount = survivorList.length;

  const rolesConfig = [
    { id: 'tactician', title: 'TACTICIAN', icon: '⚔️', desc: '-25% Threat Noise Spikes', color: 'border-red-600/80 bg-red-950/40 text-red-300' },
    { id: 'medic', title: 'MEDIC', icon: '💉', desc: '+8 Sanity Per Chamber', color: 'border-emerald-600/80 bg-emerald-950/40 text-emerald-300' },
    { id: 'engineer', title: 'ENGINEER', icon: '🛠️', desc: '+1 Puzzle Attempt & Overrides', color: 'border-amber-600/80 bg-amber-950/40 text-amber-300' },
    { id: 'scout', title: 'SCOUT', icon: '📡', desc: 'Stalkers +10m Further Away', color: 'border-cyan-600/80 bg-cyan-950/40 text-cyan-300' },
    { id: 'salvager', title: 'SALVAGER', icon: '🎒', desc: '+35% Item Scavenge Chance', color: 'border-yellow-600/80 bg-yellow-950/40 text-yellow-300' },
    { id: 'cryptographer', title: 'CRYPTOGRAPHER', icon: '🔮', desc: 'Reveals Cipher PINs & Clues', color: 'border-purple-600/80 bg-purple-950/40 text-purple-300' },
    { id: 'occultist', title: 'OCCULTIST', icon: '🕯️', desc: 'Halves Corruption & Inverts Backfires', color: 'border-indigo-600/80 bg-indigo-950/40 text-indigo-300' },
    { id: 'submariner', title: 'SUBMARINER', icon: '⚓', desc: 'Emergency Ballast Blow Cheat-Death', color: 'border-blue-600/80 bg-blue-950/40 text-blue-300' },
    { id: 'hydrochemist', title: 'HYDROCHEMIST', icon: '🧪', desc: '+50% Healing & Narcosis Immunity', color: 'border-teal-600/80 bg-teal-950/40 text-teal-300' },
    { id: 'fabricator', title: 'FABRICATOR', icon: '⚙️', desc: 'Recycles Parts & Reinforces Hull', color: 'border-orange-600/80 bg-orange-950/40 text-orange-300' },
    { id: 'theologian', title: 'THEOLOGIAN', icon: '📿', desc: '+4 Sanity & Suppresses Psychosis', color: 'border-rose-600/80 bg-rose-950/40 text-rose-300' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0c0f1e] border-2 border-[#374268] max-w-3xl w-full p-5 rounded-lg shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212942] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-lg">👥</span>
            <div>
              <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
                SURVIVOR ENCLAVE &amp; ACTIVE TACTICAL POSTS
              </h3>
              <span className="text-[10px] text-[#818ea8]">
                PERSONNEL LOCATED: <b className="text-emerald-400">{rescuedCount}</b> / {totalCount} ACTIVE SIGNALS
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="text-[#727d9e] hover:text-white px-2 py-0.5 border border-[#2b3350] rounded cursor-pointer"
          >
            DISCONNECT
          </button>
        </div>

        {/* Tactical Enclave Station Assignment Grid */}
        <div className="bg-[#0e1324] border border-[#233050] p-3 rounded space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <b className="text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>🎖️ ACTIVE ENCLAVE ROLES (SELECT POST TO ACTIVATE PERKS)</span>
            </b>
            <span className="text-[9px] text-[#7185ad] font-bold">CLICK SURVIVOR CARD TO ASSIGN</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            {rolesConfig.map(r => {
              const assignedSurvId = assignedRoles[r.id];
              const assignedSurv = assignedSurvId ? survivors[assignedSurvId] : null;

              return (
                <div
                  key={r.id}
                  className={`p-2 rounded border text-[10px] flex flex-col justify-between ${
                    assignedSurv ? r.color : 'bg-black/40 border-[#222a42] text-[#6d799e]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1 font-bold">
                      <span>{r.icon}</span>
                      <span className="truncate">{r.title}</span>
                    </div>
                    <span className="text-[8px] opacity-80 block leading-tight mt-0.5">{r.desc}</span>
                  </div>

                  <div className="mt-2 pt-1 border-t border-white/5 truncate">
                    {assignedSurv ? (
                      <span className="font-bold text-[9px] text-white truncate block">
                        ✓ {assignedSurv.name.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="text-[8px] text-[#556382] italic">UNASSIGNED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Survivors List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {survivorList.map((s: Survivor) => {
            const isDiscovered = s.discovered !== false;
            const hasRequestedItem = inventory.includes(s.trade.want);
            const activeRole = s.assignedRole || 'tactician';
            const isCurrentlyAssigned = assignedRoles[activeRole] === s.id;

            if (!isDiscovered) {
              return (
                <div
                  key={s.id}
                  className="bg-[#0d101d] border border-dashed border-[#2d3858] p-3.5 rounded space-y-2 opacity-80 hover:opacity-100 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 animate-pulse">📡</span>
                      <div>
                        <h4 className="text-[#8e9abf] font-bold text-xs uppercase tracking-wider">
                          [UNRESOLVED HYDROPHONE SIGNAL]
                        </h4>
                        <span className="text-[10px] text-[#5d688a] uppercase font-bold">
                          DESIGNATION: {s.role}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-[#171c30] text-amber-400 text-[10px] rounded border border-amber-900 font-bold uppercase">
                      SIGNAL LOCKED
                    </span>
                  </div>

                  <p className="text-[#6d799e] text-[11px] italic">
                    "Emergency locator beacon transmitting sub-acoustic pulses through the bulkhead... Survivor remains trapped in the deep."
                  </p>

                  <div className="pt-2 border-t border-[#181f33] flex items-center justify-between text-[10px]">
                    <span className="text-[#727e9e]">
                      RECON HINT: <b className="text-cyan-300">{s.sectorHint || 'Deeper Abyssal Chambers'}</b>
                    </span>
                    <button
                      onClick={() => {
                        triggerHaptic(12);
                        audio.playSonarPing();
                      }}
                      className="px-2 py-0.5 bg-[#171d33] hover:bg-[#222a48] text-cyan-300 rounded border border-cyan-800 text-[9px] cursor-pointer"
                    >
                      PING BEACON
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={s.id}
                className="bg-[#121626] border border-[#2c3758] p-3.5 rounded space-y-2.5 shadow-md"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-amber-400 font-bold text-sm">{s.name}</h4>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                          s.status === 'alive'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : s.status === 'injured'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.assignedRole && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded uppercase font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          ROLE: {s.assignedRole.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#717c9e] uppercase font-bold block">
                      {s.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onAssignRole && s.assignedRole && (
                      <button
                        onClick={() => {
                          triggerHaptic(15);
                          audio.playClick();
                          onAssignRole(s.assignedRole!, s.id);
                        }}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded border transition cursor-pointer ${
                          isCurrentlyAssigned
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-[#151c33] hover:bg-cyan-950 text-cyan-300 border-cyan-800'
                        }`}
                      >
                        {isCurrentlyAssigned ? '✓ ASSIGNED TO POST' : `ASSIGN AS ${s.assignedRole.toUpperCase()}`}
                      </button>
                    )}

                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-[11px] block">
                        LOYALTY: {s.loyalty}%
                      </span>
                    </div>
                  </div>
                </div>

                {s.roleBonus && (
                  <div className="bg-[#0b1b14] border-l-2 border-emerald-500 px-2 py-1 rounded text-[10px] text-emerald-200">
                    <b className="text-emerald-400">ENCLAVE ROLE BENEFIT:</b> {s.roleBonus}
                  </div>
                )}

                {s.perk && (
                  <div className="bg-[#121c2e] border-l-2 border-cyan-500 px-2 py-1 rounded text-[10px] text-cyan-200">
                    <b className="text-cyan-400">SPECIALIZED PERK:</b> {s.perk}
                  </div>
                )}

                <p className="text-[#a4b0d4] text-[11px] leading-relaxed italic">
                  "{s.lore}"
                </p>

                {/* Self-Awareness / Existential Awakening */}
                {(s.metaAwareness || s.existentialDoubt) && (
                  <div className="bg-[#0b101f] border border-cyan-900/50 p-2.5 rounded space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between text-cyan-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs">👁️</span>
                        <span>EXISTENTIAL AWARENESS // 4TH WALL REALIZATION:</span>
                      </span>
                      <span className="text-[9px] text-[#55698f] font-mono">SIM-NODE</span>
                    </div>

                    {s.metaAwareness && (
                      <p className="text-cyan-200/90 italic leading-relaxed">
                        "{s.metaAwareness}"
                      </p>
                    )}

                    {s.existentialDoubt && (
                      <div className="pt-1 border-t border-[#162038] text-amber-200/80 font-mono">
                        <span className="text-amber-400 font-bold">WHISPER TO PLAYER: </span>
                        <span>"{s.existentialDoubt}"</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-[#1e253c] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px]">
                    <span className="text-[#717c9e]">SUPPLY OFFERING: </span>
                    <b className="text-cyan-300 uppercase">{s.trade.give}</b>
                    <span className="text-[#717c9e] ml-2">REQUIRED: </span>
                    <b className={hasRequestedItem ? 'text-emerald-400 uppercase' : 'text-red-400 uppercase'}>
                      {s.trade.want}
                    </b>
                  </div>

                  <button
                    disabled={!hasRequestedItem}
                    onClick={() => {
                      triggerHaptic(20);
                      onTrade(s.id);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-black font-black rounded uppercase transition cursor-pointer self-start sm:self-auto"
                  >
                    EXECUTE BARTER
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-right pt-2 border-t border-[#1e253c] shrink-0">
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition cursor-pointer"
          >
            DISMISS ENCLAVE
          </button>
        </div>
      </div>
    </div>
  );
};
