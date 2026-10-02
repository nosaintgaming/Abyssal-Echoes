import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../audio/soundEngine';

export type LoadingMode = 'boot' | 'descent' | 'sector_transition';

export interface LoadingScreenProps {
  mode: LoadingMode;
  mapName?: string;
  mapTier?: string;
  targetDepth?: number;
  durationMs?: number;
  hapticsEnabled?: boolean;
  onComplete: () => void;
}

const SURVIVAL_TIPS = [
  "THE LISTENER: Completely eyeless. Panicked cursor movement (>1200 px/s) generates acoustic turbulence that reveals your coordinates.",
  "MIMIC AIRLOCKS: Mimics disguise themselves as medical stims when your Sanity drops. Hover over suspicious bulkheads for 1.2s to expose their twitching fangs.",
  "THE WARDEN: The hydraulic mainframe predicts your door choices. Alternate your routes (Door 1 -> 2 -> 3) to prevent predictability lockdown retaliations.",
  "RADIO TRANSCEIVER: Emergency broadcasts at 94.2 MHz provide survivor telemetry and bypass codes for flooded quarantine sectors.",
  "NON-EUCLIDEAN ANOMALIES: Entity 00's Ivory Caliper stabilizes labyrinth shifts caused by The Cartographer.",
  "LEVIATHAN GULLET: Below 10,000 meters, infrasound pulses can reverse temporal causality and turn clock ticks backwards.",
  "HYDROSTATIC COMPRESSION: Every 1,000 meters descended adds 100 atmospheres of crush pressure onto the diving bell's titanium hull.",
  "RUSH MODE ARCHIVES: Solving rapid puzzle streaks unlocks persistent classified relics for your main expedition loadout."
];

const BOOT_LOG_LINES = [
  "INITIATING OMEGA-KERNEL FIRMWARE v24.1.8...",
  "CALIBRATING ACOUSTIC HYDROPHONES (18 Hz - 22,000 Hz)... [OK]",
  "VERIFYING TITANIUM PRESSURE HULL RATING: 1,480 ATM... [OK]",
  "SYNCHRONIZING NEURAL INTERFACE IMPLANT... [OK]",
  "MAPPING HADAL TRENCH GEOMETRY: 15,000 METERS... [OK]",
  "DETECTING RESIDUAL BIOLUMINESCENT ANOMALIES... [WARNING: 9 DETECTED]",
  "EQUALIZING INTERNAL OXYGEN PARTIAL PRESSURE... [OK]",
  "ESTABLISHING TRANSDUCER LINK TO HADAL HORIZON... [ONLINE]",
  "ALL BULKHEAD LOCKS ENGAGED // TERMINAL OPERATIONAL."
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  mode,
  mapName = 'TIDELOCK QUARANTINE',
  mapTier = 'STANDARD',
  targetDepth = 1850,
  durationMs = 2000,
  hapticsEnabled = true,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [currentDepth, setCurrentDepth] = useState(mode === 'descent' ? 0 : targetDepth);
  const [currentLogIdx, setCurrentLogIdx] = useState(0);
  const [selectedTip] = useState(() => SURVIVAL_TIPS[Math.floor(Math.random() * SURVIVAL_TIPS.length)]);
  const completedRef = useRef(false);

  const triggerHaptic = (len = 15) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    audio.playSonarPing();
    triggerHaptic(25);
    onComplete();
  };

  // Sound effects on mount
  useEffect(() => {
    try {
      audio.init();
      if (mode === 'boot') {
        audio.playSubsonicDrone();
      } else if (mode === 'descent') {
        audio.playPneumaticSteam();
        setTimeout(() => audio.playSonarPing(), 250);
      } else {
        audio.playHullCreak();
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [mode]);

  // Keyboard shortcut: Space or Enter to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Animation timer
  useEffect(() => {
    const stepTime = 30;
    const totalSteps = Math.max(10, Math.floor(durationMs / stepTime));
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const pct = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(pct);

      // Depth progression for descent mode
      if (mode === 'descent') {
        const easePct = Math.sin((pct / 100) * (Math.PI / 2));
        setCurrentDepth(Math.round(easePct * targetDepth));
      }

      // Log lines progression for boot mode
      if (mode === 'boot') {
        const logTarget = Math.min(
          BOOT_LOG_LINES.length - 1,
          Math.floor((pct / 100) * BOOT_LOG_LINES.length)
        );
        setCurrentLogIdx(logTarget);
      }

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          handleFinish();
        }, 120);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [durationMs, targetDepth, mode]);

  const atmPressure = Math.max(1, Math.round(currentDepth / 10));
  const waterTempC = Math.max(1.1, +(14 - (currentDepth / 15000) * 12.8).toFixed(1));

  return (
    <div
      onClick={handleFinish}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-[#04060d] text-[#c9d3ee] font-mono select-none p-4 sm:p-8 cursor-pointer overflow-hidden"
    >
      {/* Background Deep Ocean Grid & CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#09152a]/20 to-black/80" />
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] opacity-70" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#1b2b48] pb-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-black text-cyan-400 tracking-[0.2em] uppercase">
            {mode === 'boot' ? 'HADAL TERMINAL BOOT SEQUENCE' : mode === 'descent' ? 'EXPEDITION DESCENT INITIATION' : 'SECTOR AIRLOCK TRANSIT'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#7889b4]">
          <span className="hidden sm:inline">HULL TELEMETRY ACTIVE</span>
          <span className="bg-[#0e1c33] px-2 py-0.5 rounded border border-[#223d6a] text-cyan-300 font-bold">
            {progress}%
          </span>
          <button
            onClick={e => {
              e.stopPropagation();
              handleFinish();
            }}
            className="px-2.5 py-0.5 bg-[#17253d] hover:bg-cyan-900 text-cyan-200 border border-cyan-700/80 rounded font-bold transition text-[10px] cursor-pointer"
          >
            SKIP [SPACE]
          </button>
        </div>
      </div>

      {/* Centerpiece Content */}
      <div className="relative z-10 max-w-2xl w-full mx-auto my-auto space-y-6 py-4">
        {/* BOOT MODE: Terminal Diagnostic Log */}
        {mode === 'boot' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black text-red-500 tracking-[0.25em] uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                ABYSSAL ECHOES
              </h1>
              <p className="text-xs text-[#8ca0cc] tracking-[0.2em] uppercase">
                OMEGA DEFINITIVE // PSYCHOLOGICAL HORROR SURVIVAL TERMINAL
              </p>
            </div>

            {/* Diagnostic Log Output Box */}
            <div className="bg-[#070e1c]/90 border border-[#1b3156] rounded-md p-4 space-y-1.5 text-xs shadow-[0_0_30px_rgba(14,165,233,0.15)] max-h-48 overflow-hidden">
              {BOOT_LOG_LINES.slice(0, currentLogIdx + 1).map((line, i) => (
                <div key={i} className="flex items-start gap-2 leading-tight">
                  <span className="text-cyan-400 select-none">&gt;</span>
                  <span className={i === currentLogIdx ? 'text-white font-bold animate-pulse' : 'text-[#8ca1cf]'}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DESCENT OR SECTOR TRANSITION MODE: Diving Chamber Radar & Hydrostatic Gauges */}
        {(mode === 'descent' || mode === 'sector_transition') && (
          <div className="space-y-5">
            {/* Target Sector Header */}
            <div className="text-center space-y-1.5">
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700 uppercase tracking-widest font-black inline-block">
                [{mapTier} TIER SECTOR]
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-amber-400 tracking-[0.15em] uppercase drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                {mapName}
              </h2>
              <p className="text-[11px] text-[#899bc7] tracking-wider uppercase">
                FLOODING DIVING BELL // PRESSURE EQUALIZATION IN PROGRESS
              </p>
            </div>

            {/* Radar / Sonar + Live Depth Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Metric 1: Depth */}
              <div className="bg-[#091124] border border-[#1c305c] p-3 rounded text-center relative overflow-hidden">
                <span className="text-[10px] text-[#7185b5] block uppercase tracking-wider">CURRENT DEPTH</span>
                <b className="text-xl sm:text-2xl text-cyan-300 font-mono tracking-wider">
                  {currentDepth.toLocaleString()}m
                </b>
                <span className="text-[9px] text-cyan-500/80 block mt-0.5">TARGET: {targetDepth.toLocaleString()}m</span>
              </div>

              {/* Metric 2: Hydrostatic Pressure */}
              <div className="bg-[#091124] border border-[#1c305c] p-3 rounded text-center">
                <span className="text-[10px] text-[#7185b5] block uppercase tracking-wider">HYDROSTATIC PRESSURE</span>
                <b className="text-xl sm:text-2xl text-amber-300 font-mono tracking-wider">
                  {atmPressure} ATM
                </b>
                <span className="text-[9px] text-amber-500/80 block mt-0.5">{(atmPressure * 1.013).toFixed(0)} BAR</span>
              </div>

              {/* Metric 3: Water Temp */}
              <div className="bg-[#091124] border border-[#1c305c] p-3 rounded text-center">
                <span className="text-[10px] text-[#7185b5] block uppercase tracking-wider">AMBIENT WATER TEMP</span>
                <b className="text-xl sm:text-2xl text-blue-300 font-mono tracking-wider">
                  {waterTempC}°C
                </b>
                <span className="text-[9px] text-blue-400/80 block mt-0.5">SALINITY 35 PSU</span>
              </div>
            </div>

            {/* Tactical Sonar Visual Circle */}
            <div className="relative w-28 h-28 mx-auto border-2 border-cyan-800/80 rounded-full flex items-center justify-center overflow-hidden bg-[#050c18] shadow-[0_0_35px_rgba(6,182,212,0.2)]">
              {/* Concentric rings */}
              <div className="absolute inset-2 border border-cyan-900/50 rounded-full" />
              <div className="absolute inset-6 border border-cyan-900/40 rounded-full" />
              <div className="absolute inset-10 border border-cyan-900/30 rounded-full" />
              {/* Center blip */}
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              {/* Sweep Line */}
              <div className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-spin [animation-duration:2.5s]" />
              {/* Crosshairs */}
              <div className="absolute w-full h-[1px] bg-cyan-900/60" />
              <div className="absolute h-full w-[1px] bg-cyan-900/60" />
            </div>
          </div>
        )}

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between items-center text-[10px] text-[#8aa0ce]">
            <span>SYNCHRONIZING SECTOR TELEMETRY...</span>
            <span className="font-bold text-cyan-300 font-mono">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-[#0a1224] border border-[#1d335f] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 via-teal-400 to-amber-400 rounded-full transition-all duration-75 shadow-[0_0_15px_rgba(45,212,191,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Survival Tip / Intel Box */}
        <div className="p-3 bg-[#081021] border-l-4 border-amber-500 rounded text-xs space-y-1 shadow-md">
          <b className="text-amber-400 text-[10px] tracking-wider uppercase block">
            CLASSIFIED HADAL INTEL &amp; SURVIVAL DIRECTIVE:
          </b>
          <p className="text-[#c1ceef] text-[11px] leading-relaxed">
            {selectedTip}
          </p>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-t border-[#1b2b48] pt-3 text-[11px] text-[#7184b2] gap-2">
        <span className="text-center sm:text-left">
          CLICK ANYWHERE OR PRESS [SPACE] TO ENTER IMMEDIATELY
        </span>
        <button
          onClick={e => {
            e.stopPropagation();
            handleFinish();
          }}
          className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded border border-red-400 transition cursor-pointer shadow-md shadow-red-950"
        >
          ENTER EXPEDITION ➔
        </button>
      </div>
    </div>
  );
};
