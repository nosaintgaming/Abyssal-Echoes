import React, { useState, useEffect, useMemo } from 'react';
import { ENTITIES } from '../data/entities';
import { EntityInfo } from '../types';
import { EntityIllustration, DiagnosticScanMode } from './EntityIllustration';
import { audio } from '../audio/soundEngine';
import { AbyssMemoryData } from '../data/abyssMemory';
import { localizeEntity, translate } from '../data/i18n';
import { sentienceEngine } from '../utils/entitySentienceEngine';

interface EntitiesModalProps {
  onClose: () => void;
  hapticsEnabled: boolean;
  abyssMemory?: AbyssMemoryData;
  onOpenResetConfirm?: () => void;
  onLaunchEntityRush?: (entity: EntityInfo) => void;
  language?: string;
}

export const EntitiesModal: React.FC<EntitiesModalProps> = ({
  onClose,
  hapticsEnabled,
  abyssMemory,
  onOpenResetConfirm,
  onLaunchEntityRush,
  language = 'en'
}) => {
  const [selectedEntity, setSelectedEntity] = useState<EntityInfo>(ENTITIES[0]);
  const [scanMode, setScanMode] = useState<DiagnosticScanMode>('optical');
  const [isPlayingAudioLog, setIsPlayingAudioLog] = useState(false);

  // Real-time sentient assessment of the player's actual run
  const liveSentience = useMemo(() => {
    return sentienceEngine.evaluateEntitySentience(
      selectedEntity.id,
      abyssMemory?.lifetimeChambersBreached || 1,
      100,
      0,
      [],
      abyssMemory?.resetsCount || 0
    );
  }, [selectedEntity.id, abyssMemory]);

  // Track entities newly discovered to play the cyber-glitch fade-in transition
  const [glitchingIds, setGlitchingIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('abyssal_discovered_entities_v2');
      const prev = saved ? (JSON.parse(saved) as string[]) : [];
      // Any entity that hasn't been acknowledged yet
      const newlyDiscovered = ENTITIES.map(e => e.id).filter(id => !prev.includes(id));
      if (prev.length === 0) {
        return new Set(ENTITIES.map(e => e.id));
      }
      return new Set(newlyDiscovered);
    } catch {
      return new Set(ENTITIES.map(e => e.id));
    }
  });

  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('abyssal_discovered_entities_v2');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    // Persist discovered specimens
    try {
      const allIds = ENTITIES.map(e => e.id);
      localStorage.setItem('abyssal_discovered_entities_v2', JSON.stringify(allIds));
    } catch {
      // ignore
    }
  }, []);

  const handleReplayDiscoveryGlitch = () => {
    triggerHaptic(25);
    audio.playGlitchDistortion();
    setGlitchingIds(new Set(ENTITIES.map(e => e.id)));
  };

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const handleSelectEntity = (e: EntityInfo) => {
    triggerHaptic(20);
    audio.playEntityStinger(e.frequencyHz);
    setSelectedEntity(e);
  };

  const handlePlayAudioLog = () => {
    triggerHaptic(25);
    setIsPlayingAudioLog(true);
    audio.playRadioStatic();
    audio.playSubsonicDrone();
    setTimeout(() => {
      audio.playEntityStinger(selectedEntity.frequencyHz);
    }, 450);
    setTimeout(() => {
      setIsPlayingAudioLog(false);
    }, 2800);
  };

  const handleProvokeSpecimen = () => {
    triggerHaptic(30);
    audio.playAcousticScreech();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#08060c] border-2 border-red-800 max-w-5xl w-full max-h-[94vh] rounded-lg shadow-[0_0_60px_rgba(255,0,0,0.4)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#130911] border-b border-red-900/70">
          <div className="flex items-center gap-2.5">
            <span className="text-red-500 text-lg animate-pulse">☠</span>
            <div>
              <h3 className="text-red-400 font-black uppercase tracking-[0.15em] text-sm flex items-center gap-2">
                CLASSIFIED HADAL APEX AUTOPSY & SENSOR TELEMETRY ARCHIVE
              </h3>
              <p className="text-[10px] text-red-500/80 tracking-wider">
                OMEGA COMMAND AUTHORIZED ONLY // PSYCHOLOGICAL HAZARD LEVEL V
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center bg-[#1f0d19] hover:bg-red-950 text-white border border-red-800 rounded font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Master Body: Entity Selector Sidebar + Detailed Horror Dossier */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Entity Navigation List */}
          <div className="w-full md:w-72 bg-[#0c0813] border-b md:border-b-0 md:border-r border-red-950/80 p-2 overflow-y-auto max-h-48 md:max-h-full shrink-0 space-y-1.5">
            <div className="text-[10px] font-bold text-red-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between border-b border-red-950/60 pb-1.5">
              <span>IDENTIFIED APEX SPECIMENS</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleReplayDiscoveryGlitch}
                  title="Simulate / Replay Specimen Discovery Glitch"
                  className="px-1.5 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-[8px] text-red-200 rounded font-mono transition cursor-pointer flex items-center gap-1"
                >
                  <span>⚡</span> GLITCH
                </button>
                <span className="text-[9px] bg-red-950 px-1.5 py-0.5 rounded text-red-300 border border-red-800">
                  {ENTITIES.length} LOGS
                </span>
              </div>
            </div>
            {ENTITIES.map((rawE, idx) => {
              const e = localizeEntity(rawE, language);
              const isSelected = selectedEntity.id === e.id;
              const isGlitching = glitchingIds.has(e.id);
              const isFirstDiscovery = !acknowledgedIds.has(e.id) || isGlitching;

              return (
                <button
                  key={e.id}
                  onClick={() => {
                    handleSelectEntity(rawE);
                    if (glitchingIds.has(e.id)) {
                      audio.playGlitchDistortion();
                      setGlitchingIds(prev => {
                        const next = new Set(prev);
                        next.delete(e.id);
                        return next;
                      });
                      setAcknowledgedIds(prev => new Set([...prev, e.id]));
                    }
                  }}
                  style={isGlitching ? { animationDelay: `${idx * 100}ms` } : undefined}
                  className={`w-full text-left p-2.5 rounded border transition-all duration-300 flex flex-col gap-1 cursor-pointer relative overflow-hidden ${
                    isGlitching
                      ? 'animate-entity-card-glitch-in border-red-500 shadow-[0_0_22px_rgba(239,68,68,0.65)]'
                      : ''
                  } ${
                    isSelected
                      ? 'bg-[#250917] border-red-500 shadow-[0_0_18px_rgba(255,0,0,0.35)] text-white'
                      : 'bg-[#100b17] border-[#22162e] hover:border-red-900 text-[#b5aecd] hover:text-white'
                  }`}
                >
                  {/* Cyber Glitch Scanline Shimmer for newly discovered specimen */}
                  {isGlitching && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent pointer-events-none animate-scanline" />
                  )}

                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-1.5 truncate">
                      <b className={`text-xs truncate ${isSelected ? 'text-red-300 font-black' : 'text-[#c6bddd]'}`}>
                        {e.name}
                      </b>
                      {isFirstDiscovery && (
                        <span className="text-[7px] bg-red-950 text-red-300 px-1 py-0.2 rounded border border-red-600 font-mono animate-glitch-badge-pulse font-black uppercase tracking-wider shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-red-500 tracking-tighter shrink-0">
                      {'💀'.repeat(Math.min(5, e.skullRating))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-[#867b9e] relative z-10">
                    <span className="truncate max-w-[140px] text-cyan-300 font-semibold">{e.entityRole || e.classification}</span>
                    <span className="text-amber-400 font-bold">{e.threatLevel.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Deep Horror Inspection Viewport */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4 bg-[#08050e]">
            {/* Top Info Bar */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-red-950 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-red-500 tracking-wider uppercase">
                    {localizeEntity(selectedEntity, language).name}
                  </h2>
                  <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-700 rounded text-[10px] font-bold">
                    {selectedEntity.threatLevel}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-950/70 text-purple-300 border border-purple-800 rounded text-[10px] font-bold">
                    FREQ: {selectedEntity.frequencyHz}Hz
                  </span>
                </div>
                {selectedEntity.entityRole && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 rounded text-[10px] font-black tracking-wider uppercase">
                      ROLE: {localizeEntity(selectedEntity, language).entityRole}
                    </span>
                  </div>
                )}
                <p className="text-xs text-amber-400/90 font-bold uppercase tracking-wider mt-0.5">
                  {selectedEntity.classification}
                </p>
                {selectedEntity.roleTactics && (
                  <p className="text-[11px] text-red-300 bg-red-950/40 border-l-2 border-red-500 px-2 py-0.5 my-1">
                    <b className="text-red-400">TACTICAL BEHAVIOR:</b> {selectedEntity.roleTactics}
                  </p>
                )}
                <p className="text-[10px] text-[#8792b0]">
                  DEPTH ORIGIN: <b className="text-cyan-300">{selectedEntity.depthOrigin}</b>
                </p>
              </div>

              {/* Acoustic & Provocation Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handlePlayAudioLog}
                  className={`px-3 py-1.5 border rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    isPlayingAudioLog
                      ? 'bg-red-900 border-red-500 text-white animate-pulse'
                      : 'bg-[#1f0d1a] hover:bg-[#341128] text-red-300 border-red-700'
                  }`}
                >
                  <span>{isPlayingAudioLog ? '📡 TRANSMITTING...' : '📻 HYDROPHONE LOG'}</span>
                </button>

                <button
                  onClick={handleProvokeSpecimen}
                  className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-white border border-red-600 rounded text-[11px] font-black cursor-pointer transition"
                >
                  ⚡ PROVOKE ({selectedEntity.frequencyHz}Hz)
                </button>

                {onLaunchEntityRush && (
                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      audio.playEntityStinger(selectedEntity.frequencyHz);
                      onLaunchEntityRush(selectedEntity);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black rounded text-[11px] uppercase tracking-wider cursor-pointer transition shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5"
                    title="Simulate choice-reading neural rush gauntlet against this entity"
                  >
                    <span>⚡</span>
                    <span>RUSH GAUNTLET SIMULATION</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Display with High-Tech Diagnostic Sensor Selectors */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#8f9bbd] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔬</span>
                  <span>HYDROSTATIC SENSOR SCAN MODES:</span>
                </span>
                <div className="flex gap-1 flex-wrap">
                  {(
                    [
                      { id: 'optical', label: '👁️ FLOODLIGHT' },
                      { id: 'sonar', label: '📡 3D LIDAR' },
                      { id: 'xray', label: '🩻 RADIOGRAPH' },
                      { id: 'thermal', label: '🌡️ BIO-THERMAL' },
                      { id: 'ultrasound', label: '🔊 ULTRASOUND' }
                    ] as const
                  ).map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        triggerHaptic(6);
                        audio.playClick();
                        setScanMode(mode.id);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase cursor-pointer border transition ${
                        scanMode === mode.id
                          ? 'bg-red-800 text-white border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]'
                          : 'bg-[#140f1a] text-[#8792b0] border-[#291d33] hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terrifying Entity Art Canvas with Interactive Click-Agitation */}
              <EntityIllustration
                entity={selectedEntity}
                scanMode={scanMode}
                size="lg"
                animated={true}
                interactive={true}
              />
              <p className="text-[9px] text-[#716982] text-center italic">
                * Click specimen visualizer to emit provocation pulse and analyze bio-feedback reaction
              </p>
            </div>

            {/* Chilling Diver Comms Transcript */}
            <div className="bg-[#180a13] border-l-4 border-red-600 p-3 rounded text-xs space-y-1 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">
                  BLACK BOX RECOVERED DIVER COMM FREQUENCY RECORD:
                </span>
                <span className="text-[9px] text-amber-400 font-mono">CHANNEL: 84.2 MHz</span>
              </div>
              <p className="text-white font-bold italic tracking-wide text-sm py-1 select-text">
                "{selectedEntity.line}"
              </p>
            </div>

            {/* Forensic Autopsy & Tactical Protocol Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0f0b18] border border-[#271b38] p-3 rounded space-y-1.5">
                <b className="text-red-400 uppercase text-[11px] block flex items-center justify-between">
                  <span>CASUALTY & HARVEST ARCHIVE:</span>
                  <span className="text-[9px] text-red-500 font-mono">FATALITIES: 100%</span>
                </b>
                <p className="text-[#d5cce8] text-[11px] leading-relaxed select-text">
                  {selectedEntity.casualtyRecord}
                </p>
                <div className="pt-2 border-t border-[#1e152c] text-[10px]">
                  <span className="text-amber-400 font-bold">ANATOMICAL PROFILE: </span>
                  <span className="text-[#a49cb5]">{selectedEntity.visualTrait}</span>
                </div>
              </div>

              <div className="bg-[#0f0b18] border border-[#271b38] p-3 rounded space-y-1.5">
                <b className="text-amber-400 uppercase text-[11px] block flex items-center justify-between">
                  <span>COUNTERMEASURE DIRECTIVE:</span>
                  <span className="text-[9px] text-emerald-400 font-mono">OMEGA PROTOCOL</span>
                </b>
                <p className="text-[#d5cce8] text-[11px] leading-relaxed select-text">
                  {selectedEntity.counter}
                </p>
                <div className="pt-2 border-t border-[#1e152c] text-[10px]">
                  <span className="text-cyan-400 font-bold">HYDROSTATIC TOLERANCE: </span>
                  <span className="text-[#a49cb5]">1,450 BAR (SUPER-HADAL DEPTH)</span>
                </div>
              </div>
            </div>

            {/* LIVE SENTIENT ADAPTATION AGAINST CURRENT DIVER */}
            <div className="bg-[#0b0816] border-2 border-red-500 rounded-lg p-3.5 space-y-2.5 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base text-red-500 animate-pulse">🧠</span>
                  <b className="text-red-400 uppercase tracking-widest text-xs">
                    LIVE NEURAL ADAPTATION // TARGETING YOUR PROFILE
                  </b>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400">SENTIENCE:</span>
                  <span className="px-2 py-0.5 rounded font-black bg-red-950 text-red-300 border border-red-600">
                    {liveSentience.sentienceLevel} [{liveSentience.mutationFactor.toFixed(1)}x]
                  </span>
                </div>
              </div>

              <div className="bg-[#140612] border-l-2 border-red-500 p-2.5 rounded text-[11px] space-y-1">
                <span className="text-red-400 font-bold block text-[10px] uppercase">
                  BEHAVIORAL VERDICT (YOUR RECENT CHOICES):
                </span>
                <p className="text-slate-200 leading-relaxed font-mono">
                  {liveSentience.behavioralEvaluation}
                </p>
              </div>

              {liveSentience.activeCountermeasure && (
                <div className="flex items-center justify-between p-2 bg-red-950/80 border border-red-600 rounded text-[11px]">
                  <span className="text-red-200 font-bold">
                    ⚠️ ARMED COUNTERMEASURE: <span className="text-amber-300 font-black">{liveSentience.activeCountermeasure}</span>
                  </span>
                  <span className="text-[9px] bg-red-900 text-white px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                    PRIMED
                  </span>
                </div>
              )}

              <div className="p-2 bg-[#04020a] border border-red-950 rounded text-[11px] text-red-300/90 italic font-mono">
                "{liveSentience.psychologicalTaunt}"
              </div>
            </div>

            {/* Sentient Adaptation & Movement Intercept Dossier */}
            {(selectedEntity.adaptiveBehaviors || selectedEntity.movementReaction) && (
              <div className="bg-[#180816] border-2 border-red-600/80 p-3.5 rounded space-y-2 text-xs shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-black uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="animate-pulse text-red-500">⚡</span>
                    SENTIENT ADAPTATION & MOVEMENT INTERCEPT TELEMETRY:
                  </span>
                  <span className="text-[9px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-700 font-mono font-bold">
                    ACTIVE SURVEILLANCE
                  </span>
                </div>

                {selectedEntity.adaptiveBehaviors && (
                  <div className="bg-[#0f040d] border border-red-900/60 p-2.5 rounded text-[11px] space-y-1">
                    <b className="text-red-400 block uppercase">CHOICE & HABIT ADAPTATION PROTOCOL:</b>
                    <p className="text-red-100 select-text leading-relaxed">
                      {selectedEntity.adaptiveBehaviors}
                    </p>
                  </div>
                )}

                {selectedEntity.movementReaction && (
                  <div className="bg-[#0f040d] border border-red-900/60 p-2.5 rounded text-[11px] space-y-1">
                    <b className="text-amber-400 block uppercase">REAL-TIME MOVEMENT & CURSOR INTERCEPT:</b>
                    <p className="text-amber-100 select-text leading-relaxed">
                      {selectedEntity.movementReaction}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Medical/Biological Pathology Report */}
            <div className="bg-[#120a16] border border-red-950 p-3.5 rounded space-y-1.5 text-xs">
              <b className="text-purple-300 uppercase text-[11px] tracking-wider block flex items-center justify-between">
                <span>🔬 EXPEDITION FORENSIC PATHOLOGY & PHYSIOLOGY DOSSIER:</span>
                <span className="text-[9px] text-purple-400 font-mono">SECTOR BIOPSY V23</span>
              </b>
              <p className="text-[#c7bfd8] leading-relaxed select-text">
                {selectedEntity.biologicalNotes}
              </p>
              <p className="text-[#8c829e] italic text-[11px] pt-1 select-text">
                "{selectedEntity.lore}"
              </p>
            </div>

            {/* Self-Awareness & 4th Wall Consciousness Telemetry */}
            {selectedEntity.selfAwareLine && (
              <div className="bg-[#190920] border-2 border-purple-600/70 p-3.5 rounded space-y-2 text-xs shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-black uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <span className="animate-ping text-red-500 inline-block w-2 h-2 rounded-full bg-red-500" />
                    SIMULATION SELF-AWARENESS // DIRECT HUMAN OBSERVER INTERCEPT:
                  </span>
                  <span className="text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-mono">
                    RUNTIME HOOK
                  </span>
                </div>

                <div className="bg-[#0f0414] border border-purple-900/60 p-2.5 rounded text-white font-mono text-[11px] leading-relaxed">
                  <span className="text-purple-400 select-none">SPECIMEN ADDRESSING USER: </span>
                  <span className="text-purple-100 font-bold select-text">"{selectedEntity.selfAwareLine}"</span>
                </div>

                {selectedEntity.simulationAnomaly && (
                  <div className="pt-1.5 border-t border-purple-950 text-[10px] flex items-start gap-1.5 text-[#bfaad4]">
                    <b className="text-purple-300 shrink-0">CODE INTERFERENCE:</b>
                    <span>{selectedEntity.simulationAnomaly}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#130911] border-t border-red-900/70 flex justify-between items-center">
          <span className="text-[10px] text-[#786e8c]">
            ACOUSTIC RADAR: REAL-TIME SPECIMEN HARMONICS
          </span>
          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="px-5 py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded transition cursor-pointer text-xs uppercase tracking-wider shadow"
          >
            CLOSE FORENSIC DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
};
