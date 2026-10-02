import React, { useState, useEffect, useRef } from 'react';
import { PuzzleType, GameState } from '../types';
import { PuzzlesModal } from './PuzzlesModal';
import { audio } from '../audio/soundEngine';

interface RushModeModalProps {
  highScore: number;
  unlockedSecrets: string[];
  onComplete: (score: number, secretsGained: string[], itemsGained: string[]) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

const ALL_PUZZLE_TYPES: PuzzleType[] = [
  'keypad',
  'power_grid',
  'airlock',
  'cipher',
  'sonar_frequency',
  'reactor_valves',
  'circuit_breaker',
  'hydroacoustic_waveform',
  'decontamination_valves',
  'quantum_sequence',
  'spectrogram_frequency',
  'pressure_depth_regulator',
  'containment_laser_grid'
];

interface SecretMilestone {
  round: number;
  name: string;
  desc: string;
  rewardType: 'item' | 'location';
  rewardId: string;
}

const RUSH_SECRETS: SecretMilestone[] = [
  {
    round: 3,
    name: "ARCHITECT'S COMPASS",
    desc: 'Unlocks resonance frequencies for Entity 00: The Pale Architect.',
    rewardType: 'item',
    rewardId: 'architects_compass'
  },
  {
    round: 6,
    name: 'SECRET SECTOR: HADAL MONOLITH (SECTOR 07)',
    desc: 'Deepest abyss non-Euclidean sector charted in Atlas coordinates.',
    rewardType: 'location',
    rewardId: 'map_07'
  },
  {
    round: 9,
    name: 'ABYSSAL BLACK PEARL',
    desc: 'A super-dense pearl recovered from hadal benthos, grants +40 max Sanity.',
    rewardType: 'item',
    rewardId: 'abyssal_black_pearl'
  },
  {
    round: 12,
    name: 'SCAVENGER LURE MINE MATRIX',
    desc: 'Permanent defense schematics against abyssal equipment theft.',
    rewardType: 'item',
    rewardId: 'scavenger_lure'
  },
  {
    round: 15,
    name: 'CHRONO-REVERSAL COG',
    desc: 'Gears spinning across 4 dimensions; rewinds local causality and purges corruption.',
    rewardType: 'item',
    rewardId: 'chronometric_reversal_dial'
  },
  {
    round: 18,
    name: 'NON-EUCLIDEAN IVORY CALIPER',
    desc: 'Drafting instrument of Entity 00; neutralizes shifting labyrinth traps.',
    rewardType: 'item',
    rewardId: 'pale_architect_ruler'
  },
  {
    round: 21,
    name: 'QUANTUM MIRROR SHARD',
    desc: 'Reflects the gaze of the Void, turning corruption into harmonic score.',
    rewardType: 'item',
    rewardId: 'abyssal_mirror_shard'
  },
  {
    round: 24,
    name: 'FOSSILIZED LEVIATHAN AMBER',
    desc: 'Primordial titan core; fully restores Sanity to 100% and purges 50% Corruption.',
    rewardType: 'item',
    rewardId: 'leviathan_heart_amber'
  }
];

export const RushModeModal: React.FC<RushModeModalProps> = ({
  highScore,
  unlockedSecrets,
  onComplete,
  onClose,
  hapticsEnabled
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType>('keypad');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [secretsEarnedThisRun, setSecretsEarnedThisRun] = useState<string[]>([]);
  const [itemsEarnedThisRun, setItemsEarnedThisRun] = useState<string[]>([]);
  const [activeSecretBanner, setActiveSecretBanner] = useState<SecretMilestone | null>(null);

  const timerRef = useRef<number | null>(null);

  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  // Pick random puzzle different from current
  const getRandomPuzzle = (prev: PuzzleType): PuzzleType => {
    const pool = ALL_PUZZLE_TYPES.filter(p => p !== prev);
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  };

  // Countdown Loop
  useEffect(() => {
    if (isGameOver) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        if (prev === 10) {
          audio.playAlarm();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver]);

  const handleTimeExpired = () => {
    setIsGameOver(true);
    audio.playDeath();
    triggerHaptic(60);
  };

  const handlePuzzleOutcome = (success: boolean) => {
    if (isGameOver) return;

    if (success) {
      const addedTime = 12;
      const points = 250 + streak * 75 + timeLeft * 5;
      const nextScore = score + points;
      const nextStreak = streak + 1;
      const nextRound = round + 1;

      setScore(nextScore);
      setStreak(nextStreak);
      setRound(nextRound);
      setTimeLeft(prev => Math.min(120, prev + addedTime));

      audio.playSolve();
      triggerHaptic(25);

      // Check if milestone secret unlocked
      const secret = RUSH_SECRETS.find(s => s.round === nextRound - 1);
      if (secret && !secretsEarnedThisRun.includes(secret.name) && !unlockedSecrets.includes(secret.name)) {
        setActiveSecretBanner(secret);
        setSecretsEarnedThisRun(prev => [...prev, secret.name]);
        if (secret.rewardType === 'item') {
          setItemsEarnedThisRun(prev => [...prev, secret.rewardId]);
        }
        audio.playHarmonicAlign();
        triggerHaptic(50);
        window.setTimeout(() => setActiveSecretBanner(null), 4000);
      }

      // Next puzzle
      setCurrentPuzzle(prev => getRandomPuzzle(prev));
    } else {
      // Penalty
      setTimeLeft(prev => Math.max(0, prev - 10));
      setStreak(0);
      audio.playError();
      triggerHaptic(40);
      if (timeLeft <= 10) {
        setIsGameOver(true);
        audio.playDeath();
      }
    }
  };

  const handleFinish = () => {
    onComplete(score, secretsEarnedThisRun, itemsEarnedThisRun);
    onClose();
  };

  const restartRush = () => {
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setRound(1);
    setIsGameOver(false);
    setSecretsEarnedThisRun([]);
    setItemsEarnedThisRun([]);
    setCurrentPuzzle(getRandomPuzzle('keypad'));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-lg p-2 sm:p-4 font-mono text-xs overflow-y-auto">
      {/* Top HUD */}
      <div className="max-w-3xl w-full mx-auto bg-[#0a0e1c] border-2 border-amber-500/80 rounded-lg p-3 shadow-2xl space-y-2 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2947] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl text-amber-400 animate-pulse">⚡</span>
            <div>
              <h2 className="text-amber-400 font-black text-sm tracking-wider uppercase">
                RUSH MODE // TIMED GAUNTLET
              </h2>
              <span className="text-[10px] text-[#7988ad]">
                SOLVE SEQUENTIAL PUZZLES BEFORE DECOMPRESSION BURST
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(8);
              audio.playClick();
              onClose();
            }}
            className="text-[#7d8bb2] hover:text-white px-2.5 py-1 border border-[#2b3552] rounded hover:border-red-500 text-[11px] font-bold cursor-pointer"
          >
            ✕ EXIT
          </button>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {/* Time Remaining */}
          <div className={`p-2 rounded border ${timeLeft <= 15 ? 'bg-red-950/80 border-red-500 animate-pulse' : 'bg-[#0f172a] border-[#203050]'}`}>
            <span className="text-[9px] text-[#7e8eb8] block uppercase">TIME REMAINING</span>
            <span className={`text-xl font-black ${timeLeft <= 15 ? 'text-red-400' : 'text-amber-300'}`}>
              {timeLeft}s
            </span>
            <div className="w-full bg-black/60 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${timeLeft <= 15 ? 'bg-red-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, (timeLeft / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Current Score */}
          <div className="p-2 rounded border bg-[#0f172a] border-[#203050]">
            <span className="text-[9px] text-[#7e8eb8] block uppercase">RUSH SCORE</span>
            <span className="text-xl font-black text-emerald-400">
              {score}
            </span>
            <span className="text-[8px] text-[#556385] block">BEST: {Math.max(highScore, score)}</span>
          </div>

          {/* Round & Streak */}
          <div className="p-2 rounded border bg-[#0f172a] border-[#203050]">
            <span className="text-[9px] text-[#7e8eb8] block uppercase">GAUNTLET STAGE</span>
            <span className="text-xl font-black text-cyan-300">
              STAGE {round}
            </span>
            <span className="text-[8px] text-purple-400 block font-bold">STREAK: x{streak}</span>
          </div>

          {/* Next Secret Milestone */}
          <div className="p-2 rounded border bg-[#140d24] border-[#38225c]">
            <span className="text-[9px] text-purple-300 block uppercase">NEXT SECRET</span>
            {(() => {
              const nextSec = RUSH_SECRETS.find(s => s.round > round - 1);
              return nextSec ? (
                <div>
                  <span className="text-xs font-bold text-amber-300 block truncate">
                    STAGE {nextSec.round}
                  </span>
                  <span className="text-[8px] text-[#a78bfa] block truncate">
                    {nextSec.name}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold">ALL SECRETS CONQUERED</span>
              );
            })()}
          </div>
        </div>

        {/* Secret Unlocked Alert Banner */}
        {activeSecretBanner && (
          <div className="bg-gradient-to-r from-purple-950 via-amber-950 to-purple-950 border-2 border-amber-400 p-2.5 rounded text-center space-y-1 animate-bounce">
            <span className="text-amber-300 font-black text-xs tracking-widest block">
              ★ SECRET UNLOCKED: {activeSecretBanner.name} ★
            </span>
            <p className="text-[10px] text-purple-200">
              {activeSecretBanner.desc} ({activeSecretBanner.rewardType === 'item' ? 'Added to Equipment' : 'Unlocked in Atlas'})
            </p>
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto my-2 flex flex-col justify-center">
        {isGameOver ? (
          /* Game Over Screen */
          <div className="bg-[#0c0f1e] border-2 border-red-600/90 rounded-lg p-6 text-center space-y-4 max-w-md mx-auto w-full shadow-2xl">
            <span className="text-4xl">⏱️</span>
            <h3 className="text-2xl font-black text-red-500 uppercase tracking-widest">
              PRESSURE CONTAINMENT FAILED
            </h3>
            <p className="text-xs text-[#8e9cb8]">
              TIME ELAPSED // DECOMPRESSION BURST REACHED TERMINAL VELOCITY
            </p>

            <div className="bg-[#060812] border border-[#1b2644] p-3 rounded text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-[#1b2644] pb-1">
                <span className="text-[#7283aa]">STAGES CLEARED:</span>
                <span className="text-cyan-300 font-bold">{round - 1}</span>
              </div>
              <div className="flex justify-between border-b border-[#1b2644] pb-1">
                <span className="text-[#7283aa]">FINAL RUSH SCORE:</span>
                <span className="text-emerald-400 font-bold">{score}</span>
              </div>
              <div className="flex justify-between border-b border-[#1b2644] pb-1">
                <span className="text-[#7283aa]">ALL-TIME HIGH SCORE:</span>
                <span className="text-amber-400 font-bold">{Math.max(highScore, score)}</span>
              </div>
              {secretsEarnedThisRun.length > 0 && (
                <div className="pt-1 text-purple-300">
                  <span className="font-bold block text-[11px] mb-0.5">★ SECRETS CLAIMED THIS RUN:</span>
                  <ul className="list-disc list-inside text-[10px] space-y-0.5 text-amber-200">
                    {secretsEarnedThisRun.map((sec, i) => (
                      <li key={i}>{sec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={restartRush}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded uppercase tracking-wider transition cursor-pointer"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-[#1e2540] hover:bg-[#2c375e] text-white font-bold text-xs rounded uppercase tracking-wider transition cursor-pointer"
              >
                CLAIM & EXIT
              </button>
            </div>
          </div>
        ) : (
          /* Active Puzzle Embedded Frame */
          <div className="w-full flex-1 flex flex-col justify-center">
            <PuzzlesModal
              puzzleType={currentPuzzle}
              chamber={round}
              difficulty="extreme"
              onSolve={handlePuzzleOutcome}
              onClose={() => handlePuzzleOutcome(false)}
              hapticsEnabled={hapticsEnabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};
