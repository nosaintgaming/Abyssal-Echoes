import React, { useState, useEffect, useRef } from 'react';
import { EntityInfo, GameState, DifficultyId } from '../types';
import { AbyssMemoryData } from '../data/abyssMemory';
import { EntityIllustration } from './EntityIllustration';
import { audio } from '../audio/soundEngine';

export interface SectorEntityRushModalProps {
  entity: EntityInfo;
  state: GameState;
  abyssMemory: AbyssMemoryData;
  onSuccess: (rewards: { sanityBonus: number; threatReduction: number; scoreEarned: number; itemReward?: string }) => void;
  onFailure: (penalties: { sanityPenalty: number; threatIncrease: number }) => void;
  onClose: () => void;
  hapticsEnabled?: boolean;
}

interface ConduitChoice {
  id: string;
  label: string;
  subLabel: string;
  isCorrect: boolean;
  isTrapped: boolean;
  trapType?: 'warden_lock' | 'mimic_fang' | 'acoustic_spike' | 'static_discharge';
  isLoud?: boolean;
}

export const SectorEntityRushModal: React.FC<SectorEntityRushModalProps> = ({
  entity,
  state,
  abyssMemory,
  onSuccess,
  onFailure,
  onClose,
  hapticsEnabled = true
}) => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 5;
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const maxStrikes = 3;

  // Time limit based on stage and difficulty
  const getRoundTimeLimit = (round: number, diff: DifficultyId): number => {
    let baseTime = 6.0 - (round - 1) * 0.8; // Round 1: 6s, Round 5: 2.8s
    if (diff === 'easy') baseTime += 2.0;
    if (diff === 'hard') baseTime -= 0.4;
    if (diff === 'extreme') baseTime -= 0.8;
    if (diff === 'nightmare') baseTime -= 1.4;
    return Math.max(1.8, +baseTime.toFixed(1));
  };

  const initialTime = getRoundTimeLimit(currentRound, state.difficulty);
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [maxTime, setMaxTime] = useState<number>(initialTime);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [lastFeedback, setLastFeedback] = useState<{ text: string; type: 'success' | 'trap' | 'timeout' } | null>(null);
  const [recentChoices, setRecentChoices] = useState<number[]>([]);
  const [mouseVelocity, setMouseVelocity] = useState<number>(0);
  const [noiseLevel, setNoiseLevel] = useState<number>(15);

  const timerRef = useRef<number | null>(null);
  const lastMousePos = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: Date.now() });

  const triggerHaptic = (len = 20) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  // Analyze player choices from memory
  const counts = abyssMemory.optionIndexCounts || [1, 1, 1];
  const totalChoicesLogged = counts[0] + counts[1] + counts[2] || 1;
  const favoriteIndex = counts.indexOf(Math.max(...counts));
  const favoritePercent = Math.round((counts[favoriteIndex] / totalChoicesLogged) * 100);
  const predictabilityScore = Math.min(99, Math.max(25, abyssMemory.predictabilityScore || 65));

  // Entity dynamic commentary reading the player's choices
  const getEntityTaunt = () => {
    if (currentRound === 1) {
      return `I HAVE ANALYZED YOUR BEHAVIOR. YOU FAVOR CONDUIT #${favoriteIndex + 1} (${favoritePercent}% SELECTION RATE). YOUR FIRST REFLEX WILL BE YOUR DOWNFALL.`;
    }
    if (currentRound === 2) {
      return `PREDICTABILITY AT ${predictabilityScore}%. YOU ARE HESITATING BEFORE EACH CLICK. I AM READING YOUR HOVER TIME IN MEMORY BYTES.`;
    }
    if (currentRound === 3) {
      return `STAGE 3 BREACH: MY SENSORS PREDICT YOUR NEXT MANEUVER. THE BYPASS YOU WANT HAS ALREADY BEEN CORRUPTED.`;
    }
    if (currentRound === 4) {
      return `HYDROSTATIC COMPRESSION INTENSIFIES. YOUR SANITY (${state.sanity}%) MAKES YOU SUSCEPTIBLE TO ILLUSIONS. IDENTIFY THE TRUE FREQUENCY.`;
    }
    return `APEX TRIAL // OVERDRIVE: SUB-SECOND DECISION MATRIX. FAIL HERE AND THE ABYSS SHALL ABSORB YOUR CORPSE.`;
  };

  // Track cursor velocity to simulate acoustic detection (Listener mechanic)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = (now - lastMousePos.current.time) / 1000;
      if (dt > 0.05) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const dist = Math.hypot(dx, dy);
        const speed = dist / dt; // px/sec
        setMouseVelocity(speed);

        if (speed > 1100 && entity.id.includes('listener')) {
          setNoiseLevel(p => Math.min(100, p + 8));
        }

        lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [entity.id]);

  // Generate Conduits for current round
  const [conduits, setConduits] = useState<ConduitChoice[]>([]);

  const generateConduitsForRound = (round: number): ConduitChoice[] => {
    const isWarden = entity.id.includes('warden');
    const isMimic = entity.id.includes('mimic');
    const isListener = entity.id.includes('listener');

    // Number of options (3 or 4 based on round)
    const count = round >= 3 ? 4 : 3;

    // The index the entity predicts the player will click based on historical habit
    const predictedIndex = (favoriteIndex + round - 1) % count;

    // Pick a correct index that is NOT the predicted index on higher rounds
    let correctIdx = Math.floor(Math.random() * count);
    if (round >= 2 && correctIdx === predictedIndex && count > 1) {
      correctIdx = (correctIdx + 1) % count;
    }

    const labels = [
      { l: 'PNEUMATIC BYPASS ALPHA', s: 'Acoustic Damping Valve // 18 Hz' },
      { l: 'HYDRAULIC RELIEF BRAVO', s: 'High-Pressure Bleed // 42 Hz' },
      { l: 'QUANTUM SHUNT CHARLIE', s: 'Harmonic Phase Inverter // 65 Hz' },
      { l: 'EMERGENCY AIRLOCK DELTA', s: 'Titanium Bulkhead Latch // 88 Hz' }
    ];

    return Array.from({ length: count }).map((_, i) => {
      const isPredicted = i === predictedIndex;
      const isCorrect = i === correctIdx;

      let isTrapped = false;
      let trapType: ConduitChoice['trapType'] = undefined;
      let isLoud = false;

      if (!isCorrect) {
        if (isPredicted) {
          isTrapped = true;
          trapType = isWarden ? 'warden_lock' : isMimic ? 'mimic_fang' : 'static_discharge';
        } else if (isListener && Math.random() > 0.5) {
          isLoud = true;
          trapType = 'acoustic_spike';
        }
      }

      // Mimic deceptive disguises
      let displayLabel = labels[i].l;
      let displaySub = labels[i].s;

      if (isMimic && isTrapped && round >= 3) {
        displayLabel = '⚠️ SECURE SURVIVOR AIRLOCK';
        displaySub = 'Unverified Beacon // Twitching Handle';
      }

      return {
        id: `conduit-${round}-${i}`,
        label: displayLabel,
        subLabel: displaySub,
        isCorrect,
        isTrapped,
        trapType,
        isLoud
      };
    });
  };

  // Initialize first round
  useEffect(() => {
    const t = getRoundTimeLimit(1, state.difficulty);
    setTimeLeft(t);
    setMaxTime(t);
    setConduits(generateConduitsForRound(1));
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isGameOver || isVictory) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          handleRoundTimeout();
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRound, isGameOver, isVictory, strikes]);

  const handleRoundTimeout = () => {
    triggerHaptic(40);
    audio.playError();
    audio.playHullCreak();

    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setStreak(0);
    setLastFeedback({
      text: `TEMPORAL EXPIRATION // ${entity.name} EXPLOITED YOUR HESITATION!`,
      type: 'timeout'
    });

    if (newStrikes >= maxStrikes) {
      handleFinalDefeat();
    } else {
      advanceToNextRound(false);
    }
  };

  const handleSelectConduit = (index: number, conduit: ConduitChoice) => {
    if (isGameOver || isVictory) return;

    // Track chosen index
    setRecentChoices(prev => [...prev.slice(-4), index]);

    // Check if player repeated identical index consecutively (The Warden penalty)
    const isRepetition = recentChoices.length > 0 && recentChoices[recentChoices.length - 1] === index;

    if (conduit.isCorrect && !isRepetition) {
      // SUCCESSFUL BYPASS
      triggerHaptic(25);
      audio.playSolve();

      const timeBonus = Math.round(timeLeft * 100);
      const roundScore = 300 + currentRound * 150 + timeBonus;
      setScore(s => s + roundScore);
      setStreak(st => st + 1);

      setLastFeedback({
        text: `BYPASS VERIFIED // ${conduit.label} CLEARED (+${roundScore} PTS)`,
        type: 'success'
      });

      if (currentRound >= totalRounds) {
        handleFinalVictory();
      } else {
        advanceToNextRound(true);
      }
    } else {
      // TRAPPED OR WRONG OR PREDICTED
      triggerHaptic(60);
      audio.playError();

      if (conduit.trapType === 'warden_lock' || isRepetition) {
        audio.playWardenLockdown();
      } else if (conduit.trapType === 'mimic_fang') {
        audio.playMimicSnarl();
      } else if (conduit.trapType === 'acoustic_spike') {
        audio.playAcousticScreech();
      } else {
        audio.playGlitchDistortion();
      }

      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setStreak(0);

      const penaltyMsg = isRepetition
        ? `WARDEN LOCKDOWN: CONSECUTIVE PICK OF NODE #${index + 1} RETALIATED!`
        : conduit.trapType === 'warden_lock'
        ? `PREDICTIVE GUILLOTINE: ${entity.name} CAUGHT YOUR HABITUAL NODE #${index + 1}!`
        : conduit.trapType === 'mimic_fang'
        ? `MIMIC AMBUSH: POLYMORPHIC TEETH CLAMPED ON YOUR ARM!`
        : `ACOUSTIC BREACH: NOISE THRESHOLD COMPROMISED!`;

      setLastFeedback({
        text: penaltyMsg,
        type: 'trap'
      });

      if (newStrikes >= maxStrikes) {
        handleFinalDefeat();
      } else {
        advanceToNextRound(false);
      }
    }
  };

  const advanceToNextRound = (wasSuccess: boolean) => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    const nextLimit = getRoundTimeLimit(nextRound, state.difficulty);
    setTimeLeft(nextLimit);
    setMaxTime(nextLimit);
    setConduits(generateConduitsForRound(nextRound));
  };

  const handleFinalVictory = () => {
    setIsVictory(true);
    triggerHaptic(80);
    audio.playHarmonicAlign();
    audio.playSonarPing();

    const finalScore = score + (streak * 200) + 1000;
    setScore(finalScore);

    // Call success reward callback
    setTimeout(() => {
      onSuccess({
        sanityBonus: 25,
        threatReduction: 30,
        scoreEarned: finalScore,
        itemReward: 'acoustic_damper'
      });
    }, 1500);
  };

  const handleFinalDefeat = () => {
    setIsGameOver(true);
    triggerHaptic(100);
    audio.playDeath();

    setTimeout(() => {
      onFailure({
        sanityPenalty: 18,
        threatIncrease: 25
      });
    }, 1500);
  };

  // Timer Bar Color
  const timePercent = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  const timerBarColor =
    timePercent > 50 ? 'bg-cyan-500' : timePercent > 25 ? 'bg-amber-500' : 'bg-red-600 animate-pulse';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-5 font-mono select-none overflow-y-auto">
      <div className="bg-[#08050e] border-2 border-red-600/90 max-w-3xl w-full rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.4)] flex flex-col overflow-hidden relative">
        {/* Background Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_1px,transparent_1px,transparent_3px)] opacity-60 z-30" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#17050d] border-b border-red-900/80 relative z-40">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-red-400 font-black uppercase tracking-wider text-sm">
                  SECTOR NEURAL RUSH GAUNTLET
                </h3>
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-700 px-1.5 py-0.2 rounded font-bold uppercase">
                  {state.difficulty.toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] text-[#9b8bb8] block">
                INTERCEPTED BY: <b className="text-white">{entity.name}</b> // HADAL DEPTH: {state.chamber * 120}m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] text-[#8e82a8] block uppercase">SCORE ACCUMULATED</span>
              <b className="text-amber-400 text-sm font-mono">{score} PTS</b>
            </div>
            <button
              onClick={() => {
                triggerHaptic(10);
                audio.playClick();
                onClose();
              }}
              className="w-7 h-7 flex items-center justify-center bg-[#240a13] hover:bg-red-900 text-white border border-red-800 rounded font-bold cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-Header: Stage & Strikes Telemetry */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0f0714] border-b border-[#29142b] text-xs relative z-40">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">
              STAGE {currentRound} / {totalRounds}
            </span>
            <span className="text-[11px] text-[#8678a1]">
              STREAK: <b className="text-amber-400 font-mono">×{streak}</b>
            </span>
          </div>

          {/* Strikes Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-red-400 uppercase font-bold">SYSTEM INTEGRITY:</span>
            {Array.from({ length: maxStrikes }).map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < strikes ? 'text-red-600 animate-pulse' : 'text-[#442b4d]'}`}
              >
                💀
              </span>
            ))}
          </div>
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-5 space-y-4 relative z-40">
          {/* Top Panel: Entity Bio-Feed & Psychological Choice-Reading HUD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#11081a] border border-[#2d163a] p-3 rounded-lg">
            {/* Entity Visual Avatar */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center gap-1.5">
              <div className="w-28 h-28 border border-red-800/80 rounded bg-black overflow-hidden relative shadow-[0_0_20px_rgba(255,0,0,0.2)]">
                <EntityIllustration entity={entity} scanMode="optical" size="sm" animated={true} />
              </div>
              <span className="text-[9px] text-[#a093be] uppercase tracking-wider text-center">
                BIO-ACOUSTIC: {entity.frequencyHz} Hz
              </span>
            </div>

            {/* Neural Telemetry: Reading Player Habits */}
            <div className="sm:col-span-2 space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#8e80ab]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    PSYCHOLOGICAL HABIT LOG:
                  </span>
                  <span className="font-mono text-cyan-300">
                    PREDICTABILITY: {predictabilityScore}%
                  </span>
                </div>
                <div className="p-2 bg-[#09030e] border-l-2 border-cyan-500 rounded text-[11px] text-[#d1c8ea] leading-relaxed italic">
                  "{getEntityTaunt()}"
                </div>
              </div>

              {/* Habit Metrics Bar */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] pt-1 border-t border-[#23122e]">
                <div className="bg-[#170a24] p-1 rounded">
                  <span className="text-[#7c6f96] block text-[9px]">FAVORITE NODE</span>
                  <b className="text-amber-400">#{favoriteIndex + 1} ({favoritePercent}%)</b>
                </div>
                <div className="bg-[#170a24] p-1 rounded">
                  <span className="text-[#7c6f96] block text-[9px]">DECISION SPEED</span>
                  <b className="text-cyan-300 font-mono">{timeLeft.toFixed(1)}s LEFT</b>
                </div>
                <div className="bg-[#170a24] p-1 rounded">
                  <span className="text-[#7c6f96] block text-[9px]">HADAL SENSITIVITY</span>
                  <b className="text-red-400 font-mono">{noiseLevel}% NOISE</b>
                </div>
              </div>
            </div>
          </div>

          {/* Temporal Compression Countdown Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-[#8b7ba8]">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>⏱️</span>
                <span>DECISION WINDOW // STAGE {currentRound}</span>
              </span>
              <span className="font-mono font-bold text-amber-300 text-xs">
                {timeLeft.toFixed(1)}s / {maxTime.toFixed(1)}s
              </span>
            </div>
            <div className="w-full h-3 bg-[#11071c] border border-[#2b143a] rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full ${timerBarColor} rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(239,68,68,0.7)]`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
          </div>

          {/* Feedback Banner */}
          {lastFeedback && (
            <div
              className={`p-2 rounded text-xs font-bold flex items-center justify-between animate-in fade-in duration-150 ${
                lastFeedback.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                  : 'bg-red-950/90 border border-red-600 text-red-300 animate-shake'
              }`}
            >
              <span>{lastFeedback.text}</span>
              <span className="text-[10px] uppercase font-mono">
                {lastFeedback.type === 'success' ? '✔ VERIFIED' : '✖ BREACH'}
              </span>
            </div>
          )}

          {/* Interactive Conduits Grid (The Player's Choice Challenge) */}
          {!isGameOver && !isVictory && (
            <div className="space-y-2">
              <div className="text-[10px] text-[#8477a3] uppercase tracking-wider flex items-center justify-between">
                <span>SELECT AN UNPREDICTED BYPASS CONDUIT:</span>
                <span className="text-red-400 text-[9px] font-bold">
                  * AVOID NODE #{favoriteIndex + 1} IF PREDICTED BY WARDEN
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {conduits.map((conduit, i) => {
                  const isPredictedTarget = i === favoriteIndex;

                  return (
                    <button
                      key={conduit.id}
                      onClick={() => handleSelectConduit(i, conduit)}
                      className={`p-3.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                        isPredictedTarget
                          ? 'bg-[#1e0a16] border-red-600/90 hover:border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                          : 'bg-[#120b1f] border-[#29173c] hover:border-cyan-400 hover:bg-[#1c1130]'
                      }`}
                    >
                      {/* Top Header inside Button */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition">
                          NODE #{i + 1}: {conduit.label}
                        </span>
                        {isPredictedTarget && (
                          <span className="text-[9px] bg-red-950 text-red-300 border border-red-700 px-1 py-0.2 rounded font-black tracking-tighter uppercase animate-pulse">
                            PREDICTED TARGET
                          </span>
                        )}
                      </div>

                      {/* Sub-label & Frequency Telemetry */}
                      <span className="text-[10px] text-[#8e81ab] group-hover:text-[#b7a8d9]">
                        {conduit.subLabel}
                      </span>

                      {/* Bottom corner cue */}
                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-[#231238] text-[9px] text-[#695d82]">
                        <span>REFLEX LATENCY &lt; {maxTime}s</span>
                        <span className="text-cyan-400 font-bold group-hover:translate-x-0.5 transition">
                          EXECUTE BYPASS ➔
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Victory Modal State */}
          {isVictory && (
            <div className="p-6 bg-[#091b15] border-2 border-emerald-500 rounded-lg text-center space-y-3 animate-in zoom-in-95 duration-200">
              <span className="text-4xl">⚡</span>
              <h4 className="text-xl sm:text-2xl font-black text-emerald-400 uppercase tracking-widest">
                GAUNTLET MASTERED // ENTITY SUBDUED
              </h4>
              <p className="text-xs text-[#a2d8be] max-w-lg mx-auto leading-relaxed">
                You outmaneuvered {entity.name}'s predictive models across all {totalRounds} stages.
                The stalker's neural link has ruptured, pushing them back into the deep hadal trench.
              </p>
              <div className="p-3 bg-[#0a261c] border border-emerald-600/80 rounded inline-block text-left text-xs space-y-1">
                <b className="text-amber-400 block text-[11px] uppercase">EXPEDITION REWARDS GRANTED:</b>
                <p className="text-white">✔ Restored +25 Sanity &amp; Subdued Sector Threat (-30%)</p>
                <p className="text-white">✔ Gained +{score} Rush Bonus Score</p>
                <p className="text-cyan-300 font-bold">✔ Stalker Entity pushed back +25.0 meters</p>
              </div>
              <div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs rounded tracking-wider transition cursor-pointer shadow-lg shadow-emerald-950"
                >
                  RETURN TO EXPEDITION ➔
                </button>
              </div>
            </div>
          )}

          {/* Defeat Modal State */}
          {isGameOver && (
            <div className="p-6 bg-[#210912] border-2 border-red-600 rounded-lg text-center space-y-3 animate-in zoom-in-95 duration-200">
              <span className="text-4xl animate-bounce">💀</span>
              <h4 className="text-xl sm:text-2xl font-black text-red-500 uppercase tracking-widest">
                NEURAL INTEGRITY CRUSHED
              </h4>
              <p className="text-xs text-[#dca6b4] max-w-lg mx-auto leading-relaxed">
                {entity.name} accurately calculated your choices and breached your diving bell terminal.
                Hydraulic conduits clamped, and acoustic turbulence spiked.
              </p>
              <div className="p-3 bg-[#320f1b] border border-red-700/80 rounded inline-block text-left text-xs space-y-1">
                <b className="text-red-400 block text-[11px] uppercase">BREACH RETALIATION:</b>
                <p className="text-white">✖ Suffered -18 Sanity Loss</p>
                <p className="text-white">✖ Sector Threat Meter Spiked (+25%)</p>
                <p className="text-red-300 font-bold">✖ Stalker Entity advanced closer</p>
              </div>
              <div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs rounded tracking-wider transition cursor-pointer shadow-lg shadow-red-950"
                >
                  DISMISS TERMINAL // ENDURE BREACH
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2.5 bg-[#0a0410] border-t border-[#23122c] flex items-center justify-between text-[10px] text-[#71648a] relative z-40">
          <span>READING CYCLIC MEMORY TELEMETRY // ESCAPE WINDOW EXPIRING</span>
          <span className="text-amber-400 font-bold">
            STAGE SCALING: +15% TIME COMPRESSION PER ROUND
          </span>
        </div>
      </div>
    </div>
  );
};
