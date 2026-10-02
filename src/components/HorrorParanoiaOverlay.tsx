import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { audio } from '../audio/soundEngine';

interface HorrorParanoiaOverlayProps {
  state: GameState;
  jumpscareTrigger?: number;
  onClearJumpscare?: () => void;
  onScarePlayer?: (reason: string) => void;
}

interface EyeCoords {
  id: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  color: string;
  visible: boolean;
}

export const HorrorParanoiaOverlay: React.FC<HorrorParanoiaOverlayProps> = ({
  state,
  jumpscareTrigger,
  onClearJumpscare
}) => {
  const sanity = Math.max(0, Math.min(100, state.sanity));
  const corruption = Math.max(0, Math.min(100, state.corruption));
  const threat = Math.max(0, Math.min(100, state.threatMeter));
  const isNightmare = state.difficulty === 'nightmare' || state.horrorIntensity === 'nightmare';
  const isCriticalSanity = sanity <= 20;

  // Jumpscare Visual Overlay Flash state
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [jumpscareImage, setJumpscareImage] = useState<number>(0);

  // Paranoia Whispers & Creeping Dread Banner
  const [phantomWhisper, setPhantomWhisper] = useState<string | null>(null);

  // Glass Crack Stress Level (0 = none, 1 = hairline, 2 = spiderweb, 3 = severe breach)
  const [glassStressLevel, setGlassStressLevel] = useState<number>(0);

  // Sudden Glass Knock Shock Ripple
  const [knockCoords, setKnockCoords] = useState<{ x: number; y: number } | null>(null);

  // Peripheral Shadow Diver Stalker Glimpse
  const [shadowSilhouette, setShadowSilhouette] = useState<'left' | 'right' | null>(null);

  // Watching Eyes in the dark
  const [watchingEyes, setWatchingEyes] = useState<EyeCoords[]>([
    { id: 1, top: '12%', left: '3%', color: '#ef4444', visible: true },
    { id: 2, top: '78%', right: '4%', color: '#f59e0b', visible: false },
    { id: 3, bottom: '8%', left: '8%', color: '#dc2626', visible: false },
    { id: 4, top: '22%', right: '8%', color: '#991b1b', visible: false },
  ]);

  const triggerHaptic = (len = 25) => {
    if (state.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  // Evaluate Glass Stress Level based on sanity, corruption, and threat
  useEffect(() => {
    let level = 0;
    if (sanity <= 15 || corruption >= 80 || threat >= 90) {
      level = 3; // Severe shatter
    } else if (sanity <= 35 || corruption >= 55 || threat >= 70) {
      level = 2; // Spiderweb fracture
    } else if (sanity <= 55 || corruption >= 35) {
      level = 1; // Hairline stress crack
    }
    setGlassStressLevel(level);

    if (level === 3 && Math.random() < 0.3) {
      audio.playGlassCrack();
      triggerHaptic(45);
    }
  }, [sanity, corruption, threat]);

  // Periodic Glass Knock & Shadow Diver Hallucination Scheduler
  useEffect(() => {
    if (state.screen !== 'game' || state.reducedMotion) return;

    const interval = setInterval(() => {
      const roll = Math.random();
      // Sudden tap on the glass when sanity is under 60%
      if (sanity <= 60 && roll < 0.35) {
        audio.playGlassKnock();
        triggerHaptic(30);
        const randX = 20 + Math.random() * 60;
        const randY = 20 + Math.random() * 60;
        setKnockCoords({ x: randX, y: randY });
        setTimeout(() => setKnockCoords(null), 900);
      } else if (sanity <= 45 && roll < 0.6) {
        // Shadow diver creeping in peripheral vision
        setShadowSilhouette(Math.random() < 0.5 ? 'left' : 'right');
        setTimeout(() => setShadowSilhouette(null), 1800);
      }
    }, (sanity <= 25 ? 8000 : 15000) + Math.random() * 6000);

    return () => clearInterval(interval);
  }, [state.screen, sanity, state.reducedMotion, state.hapticsEnabled]);

  // 1. Biological Dynamic Heartbeat Loop
  useEffect(() => {
    // Only run when in game and player is under psychological or acoustic strain
    if (state.screen !== 'game' || audio.volume <= 0.01) return;
    if (sanity > 55 && threat < 60) return;

    let timerId: number;

    const runHeartbeat = () => {
      // BPM scales as sanity decays:
      // 55% sanity = ~75 bpm (800ms)
      // 20% sanity = ~125 bpm (480ms)
      // 5% sanity  = ~160 bpm (375ms)
      const sanityRatio = Math.max(0, sanity) / 55; // 1.0 down to 0
      const intervalMs = 380 + sanityRatio * 440;
      const intensity = 1.0 + (1 - sanityRatio) * 0.4;

      audio.playVisceralHeartbeat(isCriticalSanity, intensity);
      if (isCriticalSanity) {
        triggerHaptic(18);
      }

      timerId = window.setTimeout(runHeartbeat, intervalMs);
    };

    timerId = window.setTimeout(runHeartbeat, 600);
    return () => clearTimeout(timerId);
  }, [sanity, threat, state.screen, isCriticalSanity, state.hapticsEnabled, audio.volume]);

  // 2. Psychological Audio & Sensory Hallucination Scheduler
  useEffect(() => {
    if (state.screen !== 'game' || state.reducedMotion) return;

    let timeoutId: number;
    let whisperClearId: number;

    const scheduleHorrorEvent = () => {
      // Frequency accelerates in nightmare mode or low sanity
      const baseDelay = isNightmare || isCriticalSanity ? 7000 : 16000;
      const randomJitter = Math.random() * (isNightmare ? 5000 : 9000);
      const delay = baseDelay + randomJitter;

      timeoutId = window.setTimeout(() => {
        if (state.screen !== 'game') return;

        const roll = Math.random();
        const whisperPhrases = [
          "It sees you through the bulkhead...",
          "Do not breathe...",
          "The water is already filling the deck...",
          "Look behind you...",
          "Something is tapping on the glass...",
          "They drowned down here...",
          "We can hear your heartbeat...",
          "Open the airlock...",
          "It is inside your suit...",
          "There is no surface left..."
        ];

        if (roll < 0.35 && (state.whispersEnabled ?? true)) {
          const phrase = whisperPhrases[Math.floor(Math.random() * whisperPhrases.length)];
          audio.playWhisper(phrase);
          setPhantomWhisper(phrase);
          whisperClearId = window.setTimeout(() => setPhantomWhisper(null), 3500);
        } else if (roll < 0.6) {
          audio.playHullCreak();
          triggerHaptic(20);
        } else if (roll < 0.8) {
          audio.playHullScratch();
          triggerHaptic(25);
        } else {
          audio.playPanickedBreath();
        }

        // Toggle watching eyes in random corners
        setWatchingEyes(prev =>
          prev.map(eye => ({
            ...eye,
            visible: Math.random() < (sanity <= 40 ? 0.65 : 0.25)
          }))
        );

        scheduleHorrorEvent();
      }, delay);
    };

    scheduleHorrorEvent();
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(whisperClearId);
    };
  }, [state.screen, sanity, isNightmare, isCriticalSanity, state.reducedMotion, state.whispersEnabled]);

  // 3. Jumpscare Stinger trigger via props
  const prevTriggerRef = useRef(jumpscareTrigger);
  useEffect(() => {
    if (jumpscareTrigger && jumpscareTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = jumpscareTrigger;
      if (state.jumpscaresEnabled ?? true) {
        setJumpscareImage(Math.floor(Math.random() * 3));
        setShowJumpscare(true);
        audio.playJumpscareStinger();
        triggerHaptic(60);

        const endId = setTimeout(() => {
          setShowJumpscare(false);
          if (onClearJumpscare) onClearJumpscare();
        }, 280);
        return () => clearTimeout(endId);
      }
    }
  }, [jumpscareTrigger, state.jumpscaresEnabled]);

  // Dismiss an eye when hovered/tapped
  const dismissEye = (id: number) => {
    audio.playTone(850, 0.05, 'sine', 0.05);
    setWatchingEyes(prev => prev.map(e => e.id === id ? { ...e, visible: false } : e));
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none">
      {/* Dynamic Blood Veins / Claustrophobia Vignette */}
      {(sanity <= 35 || corruption >= 50) && (
        <div
          className={`absolute inset-0 pointer-events-none ${
            isCriticalSanity ? 'animate-heartbeat-vignette' : 'box-shadow-horror'
          }`}
          style={{
            boxShadow: `inset 0 0 ${isCriticalSanity ? '140px' : '90px'} rgba(${
              corruption >= 50 ? '120, 20, 80' : '150, 0, 0'
            }, ${0.4 + (100 - sanity) * 0.005})`
          }}
        />
      )}

      {/* Creeping Peripheral Capillaries / Veins Overlay when critically low sanity */}
      {isCriticalSanity && !state.reducedMotion && (
        <div className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen animate-veins-pulse">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="vignetteGlow" cx="50%" cy="50%" r="50%">
                <stop offset="65%" stopColor="transparent" />
                <stop offset="95%" stopColor="#991b1b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#450a0a" stopOpacity="0.95" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#vignetteGlow)" />
            {/* Corner tendril silhouettes */}
            <path d="M0,0 Q60,120 180,60 T320,180" stroke="#7f1d1d" strokeWidth="2.5" fill="none" opacity="0.6" />
            <path d="M0,0 Q120,50 60,190 T140,300" stroke="#991b1b" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M100%,100% Qcalc(100% - 100px),calc(100% - 120px) calc(100% - 220px),calc(100% - 60px)" stroke="#7f1d1d" strokeWidth="2.5" fill="none" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* Inside-Glass Bloody Handprint Smudges (Sanity <= 30% or Corruption >= 45%) */}
      {(sanity <= 30 || corruption >= 45) && (
        <div className="absolute top-1/4 right-8 pointer-events-none opacity-25 hover:opacity-40 transition-opacity">
          <svg width="84" height="96" viewBox="0 0 100 120" fill="#7f1d1d">
            {/* Palm */}
            <ellipse cx="50" cy="75" rx="25" ry="30" />
            {/* Fingers */}
            <ellipse cx="28" cy="38" rx="6" ry="22" transform="rotate(-18 28 38)" />
            <ellipse cx="44" cy="24" rx="6.5" ry="26" transform="rotate(-4 44 24)" />
            <ellipse cx="60" cy="26" rx="6.5" ry="25" transform="rotate(8 60 26)" />
            <ellipse cx="76" cy="40" rx="5.5" ry="20" transform="rotate(22 76 40)" />
            {/* Thumb */}
            <ellipse cx="16" cy="72" rx="7" ry="16" transform="rotate(-45 16 72)" />
            {/* Slime Drips */}
            <rect x="42" y="100" width="3" height="18" rx="1.5" className="animate-blood-drip" />
            <rect x="58" y="98" width="2" height="14" rx="1" className="animate-blood-drip" style={{ animationDelay: '1.2s' }} />
          </svg>
        </div>
      )}

      {/* HYDROSTATIC GLASS STRESS CRACKS & SPIDERWEB FRACTURES */}
      {glassStressLevel > 0 && !state.reducedMotion && (
        <div className="absolute inset-0 pointer-events-none z-30 select-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glassRefract" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* Level 1: Hairline Top-Right Fracture */}
            <g stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.2" fill="none" filter="url(#glassRefract)">
              <path d="M100%,0 L92%,8% L95%,15% L88%,22% L89%,29% L82%,36%" />
              <path d="M92%,8% L86%,10% L80%,16%" strokeWidth="0.8" strokeOpacity="0.35" />
              <path d="M88%,22% L82%,26% L78%,24%" strokeWidth="0.8" strokeOpacity="0.3" />
            </g>

            {/* Level 2: Bottom-Left Spiderweb Impact Fracture */}
            {glassStressLevel >= 2 && (
              <g stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.6" fill="none">
                {/* Impact core */}
                <circle cx="8%" cy="92%" r="14" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 2" fill="rgba(255,255,255,0.06)" />
                <circle cx="8%" cy="92%" r="28" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="6 4" />
                {/* Radiating fracture legs */}
                <path d="M8%,92% L15%,84% L22%,82% L30%,74% L38%,72%" />
                <path d="M8%,92% L12%,78% L10%,68% L16%,56%" />
                <path d="M8%,92% L24%,90% L36%,94% L48%,92%" />
                <path d="M15%,84% L18%,75% L25%,70%" strokeWidth="0.9" strokeOpacity="0.4" />
                <path d="M22%,82% L28%,88% L34%,86%" strokeWidth="0.9" strokeOpacity="0.4" />
              </g>
            )}

            {/* Level 3: Severe Bulkhead Window Rupture Across Center */}
            {glassStressLevel >= 3 && (
              <g stroke="#ff4444" strokeOpacity="0.75" strokeWidth="2.2" fill="none">
                <path d="M0,45% L18%,42% L32%,48% L48%,40% L65%,46% L82%,38% L100%,44%" />
                <path d="M32%,48% L36%,60% L42%,72% L40%,88%" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.65" />
                <path d="M65%,46% L70%,32% L76%,18% L82%,0" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.65" />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* SUDDEN GLASS KNOCK IMPACT RIPPLE */}
      {knockCoords && (
        <div
          className="absolute pointer-events-none z-50 animate-ping rounded-full border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_35px_#22d3ee]"
          style={{
            top: `${knockCoords.y}%`,
            left: `${knockCoords.x}%`,
            width: '70px',
            height: '70px',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {/* PERIPHERAL SHADOW DIVER STALKER GLIMPSE */}
      {shadowSilhouette && !state.reducedMotion && (
        <div
          className={`absolute bottom-4 ${
            shadowSilhouette === 'left' ? 'left-0 -translate-x-4 animate-shadow-peek-left' : 'right-0 translate-x-4 animate-shadow-peek-right'
          } pointer-events-none z-35 opacity-60 mix-blend-multiply select-none transition-all duration-700`}
        >
          <svg width="120" height="220" viewBox="0 0 100 200" fill="#000000">
            {/* Drowned diver silhouette with cracked helmet */}
            <circle cx="50" cy="40" r="28" fill="#050505" />
            <ellipse cx="50" cy="40" rx="18" ry="14" fill="#151515" />
            {/* Visor slit glowing red */}
            <rect x="42" y="38" width="16" height="4" rx="2" fill="#ef4444" className="animate-pulse" />
            {/* Warped torso and grasping arm */}
            <path d="M25 65 C 20 120, 20 140, 30 190 L 70 190 C 80 140, 80 120, 75 65 Z" fill="#050505" />
            {shadowSilhouette === 'left' ? (
              <path d="M75 80 Q 95 110 98 135 Q 92 140 85 130 Z" fill="#030303" />
            ) : (
              <path d="M25 80 Q 5 110 2 135 Q 8 140 15 130 Z" fill="#030303" />
            )}
          </svg>
        </div>
      )}

      {/* Watching Abyssal Eyes in Dark Corners (Interactive: hover/click dispels) */}
      {(state.hallucinationsEnabled ?? true) && (
        watchingEyes.filter(e => e.visible).map(eye => (
          <div
            key={eye.id}
            onMouseEnter={() => dismissEye(eye.id)}
            onClick={() => dismissEye(eye.id)}
            className="pointer-events-auto absolute cursor-crosshair animate-watching-eye"
            style={{
              top: eye.top,
              bottom: eye.bottom,
              left: eye.left,
              right: eye.right
            }}
            title="A presence is watching from the darkness..."
          >
            <svg width="42" height="22" viewBox="0 0 50 25" fill="none">
              {/* Left Eye */}
              <ellipse cx="14" cy="12" rx="11" ry="6" stroke={eye.color} strokeWidth="1.5" fill="#000000dd" />
              <circle cx="14" cy="12" r="3" fill={eye.color} className="animate-ping" style={{ animationDuration: '2.5s' }} />
              <circle cx="14" cy="12" r="1.5" fill="#ffffff" />
              
              {/* Right Eye */}
              <ellipse cx="36" cy="12" rx="11" ry="6" stroke={eye.color} strokeWidth="1.5" fill="#000000dd" />
              <circle cx="36" cy="12" r="3" fill={eye.color} className="animate-ping" style={{ animationDuration: '2.5s' }} />
              <circle cx="36" cy="12" r="1.5" fill="#ffffff" />
            </svg>
          </div>
        ))
      )}

      {/* Phantom Auditory/Text Hallucination Banner */}
      {phantomWhisper && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/90 border-2 border-red-700/80 rounded-lg shadow-[0_0_35px_rgba(255,0,30,0.6)] animate-pulse flex items-center gap-2">
          <span className="text-red-500 text-sm">👁️</span>
          <span className="text-red-300 font-mono text-xs tracking-wider uppercase font-bold italic">
            "{phantomWhisper}"
          </span>
          <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800 font-mono">
            NEURAL ECHO
          </span>
        </div>
      )}

      {/* Terrifying Jumpscare Apparition Flash (Split-second nightmare shock) */}
      {showJumpscare && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center animate-jumpscare-shock overflow-hidden">
          <div className="relative w-80 h-80 sm:w-96 sm:h-96">
            <svg viewBox="0 0 200 200" className="w-full h-full filter invert drop-shadow-[0_0_60px_#ff0033]">
              {/* Abyssal Nightmare Skull / Apex Face */}
              <circle cx="100" cy="90" r="75" fill="#050505" stroke="#ff0033" strokeWidth="6" />
              
              {/* Hollow Gaping Eye Sockets */}
              <ellipse cx="70" cy="75" rx="20" ry="26" fill="#000" stroke="#ff0000" strokeWidth="4" />
              <circle cx="70" cy="75" r="7" fill="#ffffff" />
              <ellipse cx="130" cy="75" rx="20" ry="26" fill="#000" stroke="#ff0000" strokeWidth="4" />
              <circle cx="130" cy="75" r="7" fill="#ffffff" />
              
              {/* Nasal Cavity Void */}
              <polygon points="100,95 90,118 110,118" fill="#ff0033" />
              
              {/* Jagged Needled Predator Maw */}
              <path d="M50 135 Q100 175 150 135 Q100 120 50 135 Z" fill="#000" stroke="#ff0000" strokeWidth="3" />
              {[60, 72, 84, 96, 108, 120, 132, 140].map((x, i) => (
                <polygon key={i} points={`${x},130 ${x+4},148 ${x+8},130`} fill="#ffffff" />
              ))}
              {[65, 78, 90, 102, 114, 126, 136].map((x, i) => (
                <polygon key={i} points={`${x},150 ${x+4},134 ${x+8},150`} fill="#ffffff" />
              ))}

              {/* Red Scleral Bleed Lines */}
              <line x1="70" y1="50" x2="65" y2="25" stroke="#ff0000" strokeWidth="3" />
              <line x1="130" y1="50" x2="135" y2="25" stroke="#ff0000" strokeWidth="3" />
              <line x1="40" y1="85" x2="15" y2="90" stroke="#ff0000" strokeWidth="3" />
              <line x1="160" y1="85" x2="185" y2="90" stroke="#ff0000" strokeWidth="3" />
            </svg>
            
            <div className="absolute inset-x-0 bottom-2 text-center text-red-500 font-mono font-black text-lg tracking-widest uppercase bg-black/80 py-1">
              [BEHIND YOU]
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
