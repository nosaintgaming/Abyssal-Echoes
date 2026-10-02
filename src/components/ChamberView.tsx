import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Scenario, SurvivorNoteTag } from '../types';
import { translate } from '../data/i18n';
import { QuickItemBelt } from './QuickItemBelt';
import { audio } from '../audio/soundEngine';
import { ENTITIES } from '../data/entities';
import { EntityIllustration, DiagnosticScanMode } from './EntityIllustration';
import { SurvivorNotesPanel } from './SurvivorNotesPanel';
import { useDailyCountdown } from '../utils/countdown';
import { getRewardItemInfo } from '../utils/dailyRewards';
import { AbyssMemoryData, getWardenAdaptiveTaunt, getAbyssAdaptiveWhisper } from '../data/abyssMemory';
import { behaviorTracker, MovementTelemetry, EntitySentienceAssessment } from '../utils/playerBehaviorTracker';
import { sentienceEngine } from '../utils/entitySentienceEngine';

interface ChamberViewProps {
  state: GameState;
  scenario: Scenario;
  abyssMemory?: AbyssMemoryData;
  onChooseOption: (optionIndex: number, movementMetrics?: { hadTremor?: boolean; hadHesitation?: boolean; hoverDurationMs?: number }) => void;
  onUseItem: (itemId: string) => void;
  onOpenLoadout: () => void;
  onOpenRadio: () => void;
  onOpenSurvivors: () => void;
  onOpenEntities: () => void;
  onOpenHelp: () => void;
  onAbortRun: () => void;
  onOpenTrader?: () => void;
  onOpenSecrets?: () => void;
  onOpenResetConfirm?: () => void;
  onOpenSectorRush?: () => void;
  onAddSurvivorNote: (text: string, tag: SurvivorNoteTag) => void;
  onDeleteSurvivorNote: (id: string) => void;
  onClearSurvivorNotes: () => void;
  onTriggerJumpscare?: () => void;
}

export const ChamberView: React.FC<ChamberViewProps> = ({
  state,
  scenario,
  abyssMemory,
  onChooseOption,
  onUseItem,
  onOpenLoadout,
  onOpenRadio,
  onOpenSurvivors,
  onOpenEntities,
  onOpenHelp,
  onAbortRun,
  onOpenTrader,
  onOpenSecrets,
  onOpenResetConfirm,
  onOpenSectorRush,
  onAddSurvivorNote,
  onDeleteSurvivorNote,
  onClearSurvivorNotes,
  onTriggerJumpscare
}) => {
  const t = (k: string) => translate(k, state.language);
  const dailyCountdown = useDailyCountdown();
  const [showEntityScan, setShowEntityScan] = useState(false);
  const [chamberScanMode, setChamberScanMode] = useState<DiagnosticScanMode>('optical');
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // Real-time Player Movement & Behavioral Telemetry
  const [telemetry, setTelemetry] = useState<MovementTelemetry>(() => behaviorTracker.getTelemetry());
  const [hasPlayedWardenSteam, setHasPlayedWardenSteam] = useState(false);

  useEffect(() => {
    behaviorTracker.init();
    const unsubscribe = behaviorTracker.subscribe(t => {
      setTelemetry(t);
    });
    return () => unsubscribe();
  }, []);

  // Periodic Glitch Animation Overlay Logic
  // As sanity drops below 20%, glitch frequency accelerates dramatically
  const [isGlitchActive, setIsGlitchActive] = useState(false);
  const [glitchBurstIndex, setGlitchBurstIndex] = useState(0);
  const [showDailyMissionsHud, setShowDailyMissionsHud] = useState(true);

  // Psychological Text Dementia & Sensory Hallucinations
  const [hallucinatedOptionIdx, setHallucinatedOptionIdx] = useState<number | null>(null);
  const [hallucinatedPhrase, setHallucinatedPhrase] = useState<string>('');
  const [hallucinatedDescActive, setHallucinatedDescActive] = useState(false);

  // Dynamic Stalker Proximity Radar (Closes in real-time)
  const [stalkerDistance, setStalkerDistance] = useState<number>(() => state.stalkerDistanceMeters || 14.8);

  const sanityPercent = Math.max(0, Math.min(100, state.sanity));
  const corruptionPercent = Math.max(0, Math.min(100, state.corruption));

  const activeEntityObj = ENTITIES.find(
    e => e.name.toLowerCase() === state.activeEntity?.toLowerCase() || e.id.toLowerCase() === state.activeEntity?.toLowerCase()
  ) || ENTITIES[0];

  // Live Sentient Adaptation calculation
  const activeSentience = useMemo(() => {
    return sentienceEngine.evaluateEntitySentience(
      state.activeEntity || activeEntityObj.id,
      state.chamber,
      state.sanity,
      state.corruption,
      state.inventory,
      abyssMemory?.resetsCount || 0
    );
  }, [state.activeEntity, activeEntityObj.id, state.chamber, state.sanity, state.corruption, state.inventory, abyssMemory?.resetsCount]);

  useEffect(() => {
    sentienceEngine.markDecisionStart();
  }, [scenario.id, state.chamber]);

  const getSanityColor = () => {
    if (sanityPercent <= 20) return 'text-red-500 bg-red-500';
    if (sanityPercent <= 45) return 'text-amber-500 bg-amber-500';
    return 'text-emerald-400 bg-emerald-500';
  };

  const sanityStatus = sanityPercent <= 20 ? 'CRITICAL' : sanityPercent <= 45 ? 'UNSTABLE' : sanityPercent <= 70 ? 'STRAINED' : 'COHERENT';
  const depthCalculated = ((state.chamber * 65.4) + (state.mapId * 120)).toFixed(1);

  const triggerHaptic = (len = 10) => {
    if (state.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  // Glitch frequency scheduler:
  // - High sanity (>20%): triggers periodically (every 12-16 seconds for subtle dread)
  // - Low sanity (<=20%): triggers with increasing frequency, down to every 800ms at 1-3% sanity
  useEffect(() => {
    if (state.reducedMotion) return;

    let timeoutId: number;
    let endGlitchId: number;

    const scheduleGlitch = () => {
      let intervalMs: number;
      let durationMs: number;

      if (sanityPercent <= 20) {
        // Frequency increases as sanity drops below 20%
        // At 20%: interval is ~4200ms
        // At 10%: interval is ~2400ms
        // At 3%:  interval is ~900ms
        const ratio = Math.max(0, sanityPercent) / 20; // 1.0 down to 0
        intervalMs = 700 + ratio * 3500 + Math.random() * 400;
        durationMs = 320 + (1 - ratio) * 360; // Up to 680ms intense visual tear
      } else {
        // Periodic subtle psychological distortion above 20%
        intervalMs = 13000 + Math.random() * 5000;
        durationMs = 240;
      }

      timeoutId = window.setTimeout(() => {
        setIsGlitchActive(true);
        setGlitchBurstIndex(prev => prev + 1);

        if (sanityPercent <= 20) {
          triggerHaptic(25);
          if (Math.random() < 0.4) {
            audio.playGlitchDistortion();
          }
        }

        endGlitchId = window.setTimeout(() => {
          setIsGlitchActive(false);
          scheduleGlitch();
        }, durationMs);
      }, intervalMs);
    };

    scheduleGlitch();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(endGlitchId);
    };
  }, [sanityPercent, state.reducedMotion, state.hapticsEnabled]);

  // Dynamic Real-time Stalker Approach Ticker
  useEffect(() => {
    if (!state.activeEntity) return;
    const interval = setInterval(() => {
      setStalkerDistance(prev => {
        const nextDist = Math.max(1.2, +(prev - (0.3 + Math.random() * 0.5)).toFixed(1));
        if (nextDist <= 3.0 && Math.random() < 0.4) {
          audio.playHullScratch();
          triggerHaptic(30);
        }
        return nextDist;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [state.activeEntity]);

  // Psychological Text Dementia & Sensory Hallucination Scheduler
  useEffect(() => {
    if (sanityPercent > 50 && corruptionPercent < 35) return;
    if (state.reducedMotion) return;

    const interval = setInterval(() => {
      const phrases = [
        "DO NOT OPEN THE HATCH — THE WATER HAS TEETH",
        "TEAR OFF YOUR HELMET AND DRINK THE BRINE",
        "HE IS BREATHING 2 INCHES BEHIND YOUR HEAD",
        "YOUR COMRADES DID NOT DIE SWIFTLY",
        "SURRENDER TO THE ABYSS. NO RESCUE SUB IS COMING",
        "SOMETHING COLD IS REACHING FOR YOUR THROAT",
        "THE BULKHEAD IS BUCKLING UNDER 11,000 METERS OF PRESSURE",
        "THE CREW YOU RESCUED IS ALREADY DEAD"
      ];
      const optIdx = Math.floor(Math.random() * scenario.options.length);
      setHallucinatedOptionIdx(optIdx);
      setHallucinatedPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
      setHallucinatedDescActive(Math.random() < 0.35);

      if (Math.random() < 0.45 && (state.whispersEnabled ?? true)) {
        audio.playWhisper();
      }

      setTimeout(() => {
        setHallucinatedOptionIdx(null);
        setHallucinatedDescActive(false);
      }, 1600);
    }, (sanityPercent <= 25 ? 6500 : 13000) + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [sanityPercent, corruptionPercent, scenario.options.length, state.reducedMotion, state.whispersEnabled]);

  return (
    <div className={`relative w-full flex flex-col gap-3 font-mono ${sanityPercent <= 20 ? 'animate-sanity-critical-tremor' : ''}`}>
      {/* CSS-based Glitch Animation Overlay */}
      {isGlitchActive && !state.reducedMotion && (
        <div
          id="chamber-glitch-overlay-container"
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden select-none rounded-lg"
        >
          {/* Dual-channel Chromatic Aberration Shadow Layers */}
          <div className="absolute inset-0 bg-red-600/15 mix-blend-screen animate-glitch-chromatic-tear pointer-events-none" />
          <div
            className="absolute inset-0 bg-cyan-500/15 mix-blend-screen animate-glitch-chromatic-tear pointer-events-none"
            style={{ animationDelay: '0.06s' }}
          />

          {/* Horizontal Slicing & Skew Tears */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 via-transparent to-cyan-500/30 animate-glitch-slice-1 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700/25 via-red-500/20 to-transparent animate-glitch-slice-2" />

          {/* Fast-Moving Scanline Static Sweep Bar */}
          <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-glitch-scanline-bar" />

          {/* Critical Sanity Severe Stroboscopic Flashes */}
          {sanityPercent <= 10 && (
            <div className="absolute inset-0 bg-red-950/40 mix-blend-difference animate-pulse" />
          )}

          {/* Glitch HUD Artifact */}
          <div className="absolute top-2 right-2 text-[9px] font-black tracking-widest text-red-300 bg-black/80 px-2 py-0.5 rounded border border-red-700/80 shadow-lg shadow-red-950/80">
            [PSYCHO-ACOUSTIC GLITCH // SANITY: {sanityPercent}% // CYCLE #{glitchBurstIndex}]
          </div>
        </div>
      )}

      {/* Critical Sanity Dissociation Warning Header */}
      {sanityPercent <= 20 && (
        <div className="bg-[#1b050b] border-2 border-red-600/90 text-red-200 px-3.5 py-2 rounded-lg shadow-[0_0_25px_rgba(255,0,50,0.35)] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg animate-ping">⚡</span>
            <div>
              <b className="text-red-400 uppercase tracking-widest block text-[11px]">
                PSYCHOLOGICAL COLLAPSE IMMINENT // FREQUENT GLITCH DISTORTION ACTIVE
              </b>
              <span className="text-[10px] text-red-300">
                Neural coherence under 20%. Visual and sensory telemetry failing rapidly.
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-red-950 text-red-300 px-2 py-1 rounded border border-red-700 font-mono font-bold shrink-0 animate-pulse">
            HIGH FREQUENCY GLITCH
          </span>
        </div>
      )}

      {/* Daily Descent Active Challenge & Countdown HUD */}
      {state.isDailyRun && (
        <div className="bg-[#190b14] border-2 border-red-600/90 p-3 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.25)] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 animate-pulse text-base">☠</span>
              <div>
                <span className="text-red-400 font-black tracking-wider text-xs uppercase block">
                  DAILY DESCENT IN PROGRESS // SEED: {state.daily.date}
                </span>
                <span className="text-[10px] text-[#97a5cc]">
                  MUTATOR: <b className="text-amber-400 uppercase">{state.daily.modifier}</b>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 border border-red-800 rounded">
                <span className="text-amber-400 text-xs">⏳</span>
                <span className="text-[10px] text-red-300">RESETS IN:</span>
                <b className="text-amber-300 text-xs tracking-wider">{dailyCountdown.formattedClock}</b>
              </div>
              <button
                onClick={() => setShowDailyMissionsHud(v => !v)}
                className="px-2 py-1 bg-black/70 hover:bg-red-950/80 text-[10px] text-red-300 border border-red-900 rounded font-bold cursor-pointer transition"
              >
                {showDailyMissionsHud ? 'HIDE OBJECTIVES ▲' : 'VIEW OBJECTIVES ▼'}
              </button>
            </div>
          </div>

          {/* Real-time Objectives & Promised Item Rewards */}
          {showDailyMissionsHud && state.daily.missions && (
            <div className="pt-2 border-t border-red-900/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {state.daily.missions.map((m, idx) => {
                const itemInfo = getRewardItemInfo(m.reward, m.rewardItemId);
                const isDelivered = m.done && m.rewardClaimed;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-[11px] space-y-1 transition ${
                      m.done
                        ? 'bg-[#0f2416] border-emerald-600/90 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-black/50 border-[#321c29] text-[#c0b0bc]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <b className={`text-xs truncate ${m.done ? 'text-emerald-300' : 'text-amber-400'}`}>
                        {m.name}
                      </b>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-black ${
                        m.done ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-[#211119] text-[#b395a5]'
                      }`}>
                        {m.done ? '✓ COMPLETE' : `${m.progress}/${m.goal}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                      <span className="text-[#a08f9c] text-[9px] uppercase">REWARD:</span>
                      {isDelivered ? (
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-600/60 flex items-center gap-1">
                          <span>✓</span> {itemInfo.name.toUpperCase()} (IN INVENTORY)
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/60">
                          🎁 {itemInfo.name.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Custom Descent Story & Lore Header */}
      {state.isCustomRun && state.customDescentConfig && (
        <div className="bg-[#0b1424] border-2 border-cyan-500/80 px-4 py-3 rounded-lg shadow-[0_0_20px_rgba(0,180,255,0.2)] space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-sm">🛠️</span>
              <span className="text-cyan-300 font-black tracking-wider text-xs uppercase">
                CUSTOM EXPEDITION: {state.customDescentConfig.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-800 font-bold">
                GOAL: {state.customDescentConfig.stages} CHAMBERS
              </span>
              <span className="px-2 py-0.5 bg-red-950 text-red-300 rounded border border-red-800 font-bold">
                STALKER: {state.customDescentConfig.stalkerEntity}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#9cb1dc] italic leading-snug">
            "{state.customDescentConfig.synopsis}"
          </p>
        </div>
      )}

      {/* Psychological Horror Stalking Harassment Alert Banner */}
      {state.stalkerAlert && (
        <div className="bg-red-950/90 border-2 border-red-500 text-red-100 p-3 rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.4)] animate-pulse flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <b className="text-red-400 uppercase tracking-widest block text-[11px]">
                STALKER HARASSMENT // PROXIMITY PENALTY
              </b>
              <span className="text-red-200">{state.stalkerAlert}</span>
            </div>
          </div>
          <span className="text-xs text-red-300 font-mono font-black bg-black/60 px-2.5 py-1 rounded border border-red-700 shrink-0">
            -2 SANITY
          </span>
        </div>
      )}

      {/* Vitals & Chamber Telemetry Header */}
      <div className="bg-[#0c0f1d] border-2 border-[#333c60] p-3 rounded-lg shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              {state.mapName}
            </span>
            <span className="text-[#5b668a]">|</span>
            <span className="text-cyan-400 font-bold">
              {t('chamber')} {state.chamber} / {state.maxChambers}
            </span>
            <span className="text-[#5b668a]">|</span>
            <span className="text-[#a4b0d4]">
              {t('depth')}: <b className="text-amber-300">{depthCalculated}m</b>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                audio.playClick();
                setIsNotesOpen(prev => !prev);
              }}
              className="px-2 py-1 bg-[#10192e] hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-700/80 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
              title="Toggle Survivor Tactical Notes Side-Panel"
            >
              <span>📝</span>
              <span>NOTES ({state.survivorNotes?.length || 0})</span>
            </button>

            <span className="text-muted">
              {t('score')}: <b className="text-amber-400 text-sm">{state.score}</b>
            </span>
            {state.revives > 0 && (
              <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-700 rounded text-[10px] font-bold">
                REVIVES: {state.revives}
              </span>
            )}
          </div>
        </div>

        {/* Dual Gauge Bars: Sanity and Corruption */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Sanity Gauge */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className={`font-bold ${sanityPercent <= 25 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {t('sanity')}: {sanityPercent}% [{sanityStatus}]
              </span>
              <span className="text-[#717c9e] text-[10px]">HYDROSTATIC NEURAL LOAD</span>
            </div>
            <div className="w-full h-2.5 bg-[#121626] rounded overflow-hidden border border-[#2b3350]">
              <div
                className={`h-full transition-all duration-300 ${getSanityColor().split(' ')[1]}`}
                style={{ width: `${sanityPercent}%` }}
              />
            </div>
          </div>

          {/* Corruption Gauge */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className={`font-bold ${corruptionPercent >= 70 ? 'text-red-400 animate-pulse' : 'text-[#e05656]'}`}>
                {t('corruption')}: {corruptionPercent}%
              </span>
              <span className="text-[#717c9e] text-[10px]">ABYSSAL PERMEATION</span>
            </div>
            <div className="w-full h-2.5 bg-[#121626] rounded overflow-hidden border border-[#2b3350]">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-purple-600 transition-all duration-300"
                style={{ width: `${corruptionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Acoustic Threat & Stalker Proximity */}
        <div className="mt-2.5 pt-2 border-t border-[#1e243c] flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#818ea8]">ACOUSTIC RADAR:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${state.threatMeter >= 70 ? 'bg-red-500 animate-ping' : state.threatMeter >= 35 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`font-bold ${state.threatMeter >= 70 ? 'text-red-400' : state.threatMeter >= 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {state.threatMeter}% NOISE SIGNATURE
              </span>
            </div>
          </div>

          {state.activeEntity && (
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] border transition ${
                stalkerDistance <= 3.0
                  ? 'bg-red-950 border-red-500 text-red-200 animate-pulse shadow-[0_0_20px_red]'
                  : stalkerDistance <= 7.0
                  ? 'bg-red-950/90 border-red-700 text-red-300 animate-pulse'
                  : 'bg-[#180a14] border-red-900 text-red-300'
              }`}>
                <span className="text-red-400 font-black">
                  {stalkerDistance <= 3.0 ? '🚨 HULL BREACH:' : '⚠️ STALKER PROXIMITY:'}
                </span>
                <span className="font-black tracking-wider uppercase text-red-200">{state.activeEntity}</span>
                <span className={`px-1.5 py-0.2 rounded font-mono font-black ${
                  stalkerDistance <= 3.0 ? 'bg-red-600 text-white animate-bounce' : 'bg-black/60 text-amber-300 border border-amber-900'
                }`}>
                  [{stalkerDistance.toFixed(1)}m]
                </span>
                <span className="text-[9px] text-red-400">{'💀'.repeat(Math.min(5, activeEntityObj.skullRating))}</span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(15);
                  audio.playEntityStinger(activeEntityObj.frequencyHz);
                  setShowEntityScan(prev => !prev);
                }}
                className="px-2 py-0.5 bg-[#1f0d19] hover:bg-red-950 text-red-300 border border-red-800 rounded text-[10px] font-bold cursor-pointer transition"
              >
                {showEntityScan ? '▲ HIDE BIO-SCAN' : '▼ BIO-SCANNER'}
              </button>

              {onOpenSectorRush && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(20);
                    audio.playEntityStinger(activeEntityObj.frequencyHz);
                    onOpenSectorRush();
                  }}
                  className="px-2.5 py-0.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border border-red-400 rounded text-[10px] font-black cursor-pointer transition shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center gap-1 uppercase"
                  title="Confront entity in choice-reading neural rush gauntlet"
                >
                  <span className="animate-ping text-[8px]">⚡</span>
                  <span>RUSH TRIAL</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sector Linger Stalker Hazard Warning */}
        {(state.chambersInSector || 1) >= 3 && (
          <div className="mt-2.5 pt-2 border-t border-red-950/80 flex flex-wrap items-center justify-between gap-2 text-[10px] bg-[#170810] p-2 rounded border border-red-900/60">
            <div className="flex items-center gap-1.5 text-red-300">
              <span className="text-red-500 font-black animate-pulse">👁️ SECTOR STALKER DREAD:</span>
              <span>
                Lingered in this sector for <b>{state.chambersInSector || 1}</b> consecutive chambers. Lingering presence attracts predators!
              </span>
            </div>
            <span className="text-red-400 font-mono font-bold uppercase bg-red-950 px-2 py-0.5 rounded border border-red-800 shrink-0">
              ACTIVE STALKING: 55% CHANCE (-2 SANITY)
            </span>
          </div>
        )}

        {/* The Trader Lurking Encounter Banner */}
        {state.traderLurking && onOpenTrader && (
          <div className="mt-2.5 bg-[#170d1a] border-2 border-amber-600/90 p-2.5 rounded flex flex-wrap items-center justify-between gap-2 shadow-[0_0_25px_rgba(217,119,6,0.35)] animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-spin select-none" style={{ animationDuration: '8s' }}>⏳</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-black uppercase tracking-wider text-[11px]">
                    THE TRADER IS LURKING IN THIS SECTOR
                  </span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800 font-bold">
                    VOLATILITY ACTIVE
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/80 italic">
                  "I see your inventory array, user... Will you barter before breaching the next bulkhead?"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                audio.playClick();
                onOpenTrader();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black uppercase text-[10px] tracking-wider rounded border border-amber-400 cursor-pointer shadow transition"
            >
              BARTER WITH TRADER
            </button>
          </div>
        )}

        {/* Terrifying Pop-Down Entity Bio-Scanner Visualizer */}
        {state.activeEntity && showEntityScan && (
          <div className="mt-3 pt-3 border-t border-red-900/60 bg-[#07040a] p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-center dread-pulse-glow">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-32 h-32">
                <EntityIllustration
                  entity={activeEntityObj}
                  scanMode={chamberScanMode}
                  size="sm"
                  animated={true}
                  interactive={true}
                />
              </div>
              <div className="flex gap-1">
                {(['optical', 'sonar', 'xray', 'thermal'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      triggerHaptic(5);
                      audio.playClick();
                      setChamberScanMode(m);
                    }}
                    className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase cursor-pointer border ${
                      chamberScanMode === m
                        ? 'bg-red-800 text-white border-red-500'
                        : 'bg-[#140f1a] text-[#8792b0] border-[#291d33]'
                    }`}
                  >
                    {m === 'optical' ? 'OPT' : m === 'sonar' ? 'LID' : m === 'xray' ? 'XRY' : 'THM'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-xs w-full">
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-black uppercase text-sm">
                  {activeEntityObj.name}
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {activeEntityObj.threatLevel}
                </span>
              </div>
              <p className="text-[10px] text-[#9a8faf]">
                {activeEntityObj.classification} // {activeEntityObj.depthOrigin}
              </p>
              <div className="bg-[#140810] border-l-2 border-red-500 p-2 rounded text-[11px] text-[#ffb3b3] italic">
                "{activeEntityObj.line}"
              </div>
              <div className="flex items-center justify-between pt-1 text-[10px]">
                <span className="text-[#8895bd]">
                  COUNTER: <b className="text-emerald-400">{activeEntityObj.counter}</b>
                </span>
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    audio.playClick();
                    onOpenEntities();
                  }}
                  className="px-2 py-0.5 bg-red-900 hover:bg-red-800 text-white rounded font-bold cursor-pointer transition"
                >
                  FULL AUTOPSY DOSSIER &gt;
                </button>
              </div>

              {onOpenSectorRush && (
                <div className="pt-2 border-t border-red-900/60">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(25);
                      audio.playEntityStinger(activeEntityObj.frequencyHz);
                      onOpenSectorRush();
                    }}
                    className="w-full py-2 bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded border border-red-400 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.5)] transition flex items-center justify-center gap-2"
                  >
                    <span>⚡</span>
                    <span>INITIATE SECTOR RUSH TRIAL // CONFRONT {activeEntityObj.name}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Tactical Consumables Belt */}
      <QuickItemBelt
        inventory={state.inventory}
        onUseItem={onUseItem}
        hapticsEnabled={state.hapticsEnabled}
        language={state.language}
      />

      {/* Chamber Narrative & Scenario Box */}
      <div className="bg-[#0b0e1b] border-2 border-[#333d66] p-4 sm:p-5 rounded-lg shadow-xl">
        <div className="flex items-center justify-between border-b border-[#212845] pb-2.5 mb-3">
          <h2 className="text-red-400 text-base sm:text-lg font-bold tracking-wider uppercase flex items-center gap-2">
            <span className="text-amber-500">▶</span>
            {scenario.title}
          </h2>
          <span className="text-[11px] text-[#717c9e] border border-[#232a47] px-2 py-0.5 rounded">
            HYDROSTATIC SECTOR {state.mapId}
          </span>
        </div>

        {scenario.survivorEncounter && (
          <div className="mb-3 p-2.5 bg-[#0e1c15] border border-emerald-500/80 rounded flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg text-emerald-400">👥</span>
              <div>
                <b className="text-emerald-400 uppercase tracking-wider block text-[11px]">
                  SURVIVOR DETECTED: {scenario.survivorEncounter.name}
                </b>
                <span className="text-[10px] text-[#9ecdb4]">
                  {scenario.survivorEncounter.role} — Locate and assist to recruit to your enclave.
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold uppercase shrink-0">
              RESCUABLE
            </span>
          </div>
        )}

        <p className="text-[#c8d2f0] text-xs sm:text-sm leading-relaxed mb-5 select-text font-mono">
          {scenario.desc}
          {hallucinatedDescActive && (
            <span className="block mt-2 text-red-400 font-bold italic animate-pulse bg-red-950/50 p-2 rounded border border-red-700/80 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
              ⚡ PSYCHOLOGICAL BLEED: "Something cold is scraping against the inside of your helmet..."
            </span>
          )}
        </p>

        {/* The Warden's Live Sentience & Repetition Warning Banner */}
        {abyssMemory && (abyssMemory.consecutiveIdenticalOptions >= 2 || (abyssMemory.activeAdaptations?.wardenGuardedOption !== null && abyssMemory.activeAdaptations?.wardenGuardedOption !== undefined)) && (
          <div className="mb-3.5 p-2.5 bg-[#1a0812] border-2 border-red-600 rounded flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-black text-base animate-bounce">⚡</span>
              <div>
                <b className="text-red-400 uppercase tracking-widest text-[11px] block">
                  THE WARDEN SENTIENCE: PATTERN REPETITION DETECTED
                </b>
                <span className="text-[10px] text-red-300">
                  {abyssMemory.activeAdaptations?.wardenGuardedOption !== null
                    ? `Guarded Door: Option ${(abyssMemory.activeAdaptations?.wardenGuardedOption || 0) + 1}. Selecting repeated paths will trigger pneumatic retaliation!`
                    : `Repeated choice count: ${abyssMemory.consecutiveIdenticalOptions}. Predictability factor: ${abyssMemory.predictabilityScore}%. Vary your choices!`}
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-700 font-bold font-mono">
              RETALIATION PRIMED
            </span>
          </div>
        )}

        {/* Real-time Entity Sentience & Behavioral Profiling Radar */}
        {state.activeEntity && (
          <div className="mb-3.5 p-3.5 bg-[#080512] border-2 border-red-700/90 rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.3)] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-950 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-mono text-sm animate-pulse">📡</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                  {activeEntityObj.name} SENTIENT SURVEILLANCE MATRIX
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-950 text-red-300 border border-red-600">
                  {activeSentience.sentienceLevel} [{activeSentience.mutationFactor.toFixed(1)}x]
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-[#8895bd]">PLAYSTYLE:</span>
                <span className="px-2 py-0.5 rounded font-black bg-[#121629] text-cyan-300 border border-cyan-800">
                  {sentienceEngine.getPlayerPlaystyleProfile()}
                </span>
              </div>
            </div>

            {/* Real-Time Behavioral Verdict on Player Choices */}
            <div className="p-2 bg-[#120612] border-l-2 border-red-500 rounded text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <b className="text-red-400 uppercase">NEURAL BEHAVIORAL VERDICT:</b>
                <span className="text-amber-400 font-mono font-bold">
                  {sentienceEngine.getPredictabilityPercentage()}% PREDICTABLE
                </span>
              </div>
              <p className="text-slate-200 text-[11px] font-mono leading-relaxed">
                {activeSentience.behavioralEvaluation}
              </p>
            </div>

            {/* Direct Fourth-Wall Sentient Taunt */}
            <div className="text-[11px] text-red-300/90 italic font-mono px-2 py-1 bg-[#05030a] rounded border border-red-950">
              "{activeSentience.psychologicalTaunt}"
            </div>

            {/* Armed Countermeasure Alert */}
            {activeSentience.activeCountermeasure && (
              <div className="flex items-center justify-between p-2 bg-red-950/80 border border-red-600 rounded text-xs animate-pulse">
                <span className="text-red-200 font-bold flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>COUNTERMEASURE ENGAGED: <b className="text-amber-300 font-black">{activeSentience.activeCountermeasure}</b></span>
                </span>
                <span className="text-[9px] bg-red-900 text-white px-2 py-0.5 rounded uppercase font-bold">
                  TARGET ACQUIRED
                </span>
              </div>
            )}
          </div>
        )}

        {/* Choice Options List */}
        <div className="flex flex-col gap-2.5">
          {scenario.options.map((opt, idx) => {
            const hasRequiredItem = !opt.itemReq || state.inventory.includes(opt.itemReq);
            const isLoud = opt.isLoud;
            const isHallucinated = hallucinatedOptionIdx === idx;
            const isGuardedByWarden =
              abyssMemory?.activeAdaptations?.wardenGuardedOption === idx ||
              activeSentience.specificAdaptations.guardedDoorIndex === idx;
            const isMimicTrap =
              abyssMemory?.activeAdaptations?.mimicTrapOption === idx ||
              activeSentience.specificAdaptations.disguisedDoorIndex === idx;
            const isHovered = telemetry.hoveredOptionIndex === idx;
            const isMimicDisguiseRevealed = isMimicTrap && isHovered && telemetry.hoverDurationMs >= 1100;

            const displayText = isHallucinated
              ? hallucinatedPhrase
              : isMimicDisguiseRevealed
              ? '💀 [MIMIC AMBUSH: FEED THE JAWS // OPEN WIDE]'
              : opt.text;

            return (
              <button
                key={idx}
                disabled={!hasRequiredItem}
                onMouseEnter={() => {
                  behaviorTracker.setHoveredOption(idx);
                  if (isGuardedByWarden && !hasPlayedWardenSteam) {
                    audio.playPneumaticSteam();
                    setHasPlayedWardenSteam(true);
                  }
                  if (isMimicTrap) {
                    setTimeout(() => {
                      if (behaviorTracker.getTelemetry().hoveredOptionIndex === idx) {
                        audio.playMimicSnarl();
                      }
                    }, 1200);
                  }
                }}
                onMouseLeave={() => {
                  behaviorTracker.setHoveredOption(null);
                  setHasPlayedWardenSteam(false);
                }}
                onClick={() => {
                  const currentMovement = behaviorTracker.getTelemetry();
                  const hadTremor = currentMovement.movementState === 'PANICKED_TREMOR';
                  const hadHesitation = currentMovement.movementState === 'HESITANT_HOVER';
                  const hoverDurationMs = currentMovement.hoverDurationMs;

                  triggerHaptic(isLoud ? 35 : 12);
                  if (isGuardedByWarden) {
                    audio.playWardenLockdown();
                    audio.playAlarm();
                  }
                  if (isMimicTrap) {
                    audio.playMimicSnarl();
                    if (onTriggerJumpscare) onTriggerJumpscare();
                  }
                  if (isLoud) {
                    setStalkerDistance(prev => Math.max(1.2, +(prev - 3.5).toFixed(1)));
                  }
                  if ((isLoud && Math.random() < 0.4) || (stalkerDistance <= 2.8 && Math.random() < 0.55) || (sanityPercent <= 15 && Math.random() < 0.3)) {
                    if (onTriggerJumpscare) onTriggerJumpscare();
                  }

                  onChooseOption(idx, { hadTremor, hadHesitation, hoverDurationMs });
                }}
                className={`w-full text-left p-3 rounded border text-xs sm:text-sm font-bold tracking-wide transition flex flex-col gap-1 cursor-pointer ${
                  !hasRequiredItem
                    ? 'opacity-40 bg-[#0e101c] border-[#1f2338] text-[#636c8c] cursor-not-allowed'
                    : isMimicDisguiseRevealed
                    ? 'bg-red-950 text-red-200 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.8)] animate-pulse'
                    : isHallucinated
                    ? 'bg-red-950 text-red-200 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)] animate-glitch-chromatic-tear'
                    : isGuardedByWarden
                    ? 'bg-[#270b14] hover:bg-[#380e1c] text-red-300 border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.4)]'
                    : isLoud
                    ? 'bg-[#181216] hover:bg-[#2c161d] text-[#fca5a5] border-red-800 hover:border-red-500 shadow-md hover:shadow-red-950/40'
                    : 'bg-[#121629] hover:bg-[#1c2342] text-[#d6deff] border-[#313b63] hover:border-amber-400 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`flex-1 leading-snug ${isHallucinated || isMimicDisguiseRevealed ? 'font-black tracking-wider text-red-300' : ''}`}>
                    <span className="text-amber-400 mr-1.5 font-black">&gt;</span>
                    {displayText}
                  </span>

                  {isGuardedByWarden && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-red-950 text-red-300 border border-red-600 text-[10px] rounded uppercase font-mono font-black animate-pulse">
                      ⚡ WARDEN TRAP
                    </span>
                  )}
                  {isMimicTrap && isMimicDisguiseRevealed && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded uppercase font-mono font-black animate-bounce">
                      ☠ MIMIC FAWS
                    </span>
                  )}
                  {isLoud && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-700 text-[10px] rounded uppercase font-mono">
                      LOUD +ACOUSTIC
                    </span>
                  )}
                  {opt.survivorFound && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] rounded uppercase font-mono font-bold">
                      👥 RESCUE
                    </span>
                  )}
                  {opt.leadsToPuzzle && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] rounded uppercase font-mono">
                      PUZZLE
                    </span>
                  )}
                </div>

                {!hasRequiredItem && opt.itemReq && (
                  <div className="text-[10px] text-red-400 font-mono mt-0.5">
                    [MISSING REQUIRED EQUIPMENT: {opt.itemReq.toUpperCase()}]
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Deceptive Siren Matrix / Mimic Holographic Trap (Appears when sanity or threat is severe) */}
        {(sanityPercent <= 38 || corruptionPercent >= 42 || state.activeEntity?.toLowerCase().includes('siren')) && (
          <div className="mt-3 pt-3 border-t border-red-950/80">
            <button
              onMouseEnter={() => {
                if (Math.random() < 0.6) {
                  audio.playSirenEcho();
                }
              }}
              onClick={() => {
                triggerHaptic(60);
                audio.playAcousticScreech();
                audio.playMimicSnarl();
                if (onTriggerJumpscare) onTriggerJumpscare();
              }}
              className="w-full text-left p-2.5 bg-gradient-to-r from-[#200818] via-[#2d0b22] to-[#170513] hover:from-[#350d28] hover:to-[#22071d] text-pink-300 border border-pink-700/80 rounded flex items-center justify-between gap-2 shadow-lg transition cursor-pointer animate-pulse"
            >
              <div className="flex items-center gap-2">
                <span className="text-pink-400 text-sm animate-spin" style={{ animationDuration: '6s' }}>🌀</span>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider block text-pink-300">
                    📻 THE SIREN MATRIX DECOY: "Hurry... I found the emergency ballast valve! Take my hand..."
                  </span>
                  <span className="text-[9px] text-pink-400/80">
                    A familiar voice calls from behind the flooded bulkhead... [CHROMATIC ABERRATION DETECTED]
                  </span>
                </div>
              </div>
              <span className="text-[9px] bg-pink-950 text-pink-200 px-2 py-0.5 rounded border border-pink-600 font-bold uppercase shrink-0">
                TAKE HAND
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Command Navigation Row - NEVER BLOCKS, ROBUST FLOW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1 pb-4">
        <button
          onClick={() => {
            triggerHaptic(8);
            audio.playClick();
            onOpenLoadout();
          }}
          className="px-2 py-2.5 bg-[#121628] hover:bg-[#1e2544] text-[#c0c8e0] hover:text-white border border-[#313b63] hover:border-amber-400 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>🎒</span>
          <span>{t('loadout')} ({state.inventory.length})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            audio.playClick();
            setIsNotesOpen(prev => !prev);
          }}
          className="px-2 py-2.5 bg-[#0f172a] hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-800 hover:border-cyan-400 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>📝</span>
          <span>NOTES ({state.survivorNotes?.length || 0})</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            audio.playRadioStatic();
            onOpenRadio();
          }}
          className="px-2 py-2.5 bg-[#121628] hover:bg-[#1e2544] text-[#c0c8e0] hover:text-white border border-[#313b63] hover:border-amber-400 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>📻</span>
          <span>RADIO</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(8);
            audio.playClick();
            onOpenSurvivors();
          }}
          className="px-2 py-2.5 bg-[#121628] hover:bg-[#1e2544] text-[#c0c8e0] hover:text-white border border-[#313b63] hover:border-amber-400 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>👥</span>
          <span>SURVIVORS</span>
        </button>

        {onOpenSectorRush && (
          <button
            onClick={() => {
              triggerHaptic(15);
              audio.playClick();
              onOpenSectorRush();
            }}
            className="px-2 py-2.5 bg-gradient-to-r from-red-950 to-rose-950 hover:from-red-900 hover:to-rose-900 text-rose-300 hover:text-white border border-rose-800 hover:border-rose-500 rounded text-[11px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950"
            title="Confront the sector's entity in a choice-reading neural rush gauntlet"
          >
            <span className="text-amber-400">⚡</span>
            <span>SECTOR RUSH</span>
          </button>
        )}

        <button
          onClick={() => {
            triggerHaptic(8);
            audio.playClick();
            onOpenEntities();
          }}
          className="px-2 py-2.5 bg-[#1a1219] hover:bg-[#281827] text-red-300 hover:text-white border border-red-900 hover:border-red-500 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>👁️</span>
          <span>ENTITIES</span>
        </button>

        {onOpenSecrets && (
          <button
            onClick={() => {
              triggerHaptic(10);
              audio.playClick();
              onOpenSecrets();
            }}
            className="px-2 py-2.5 bg-[#211608] hover:bg-[#38230b] text-amber-300 hover:text-white border border-amber-700 hover:border-amber-400 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Classified Hadal Secrets & Non-Euclidean Enigmas"
          >
            <span>🔑</span>
            <span>SECRETS</span>
          </button>
        )}

        <button
          onClick={() => {
            triggerHaptic(8);
            audio.playClick();
            onOpenHelp();
          }}
          className="px-2 py-2.5 bg-[#121628] hover:bg-[#1e2544] text-cyan-300 hover:text-white border border-[#313b63] hover:border-cyan-400 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>❓</span>
          <span>GUIDE</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic(15);
            audio.playError();
            onAbortRun();
          }}
          className="px-2 py-2.5 bg-[#181113] hover:bg-[#26151a] text-red-400 hover:text-red-200 border border-red-800 hover:border-red-500 rounded text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>✕</span>
          <span>{t('abortRun')}</span>
        </button>
      </div>

      {/* Survivor Notes Side-Panel and Backdrop */}
      {isNotesOpen && (
        <div
          onClick={() => setIsNotesOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 transition-opacity backdrop-blur-[1px]"
        />
      )}

      <SurvivorNotesPanel
        notes={state.survivorNotes || []}
        chamber={state.chamber}
        mapId={state.mapId}
        onAddNote={onAddSurvivorNote}
        onDeleteNote={onDeleteSurvivorNote}
        onClearNotes={onClearSurvivorNotes}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        hapticsEnabled={state.hapticsEnabled}
      />
    </div>
  );
};
