import React, { useState, useEffect } from 'react';
import { PuzzleType } from '../types';
import { audio } from '../audio/soundEngine';

interface PuzzlesModalProps {
  puzzleType: PuzzleType;
  chamber?: number;
  difficulty?: string;
  onSolve: (success: boolean) => void;
  onClose: () => void;
  hapticsEnabled: boolean;
}

export const PuzzlesModal: React.FC<PuzzlesModalProps> = ({
  puzzleType,
  chamber = 1,
  difficulty = 'easy',
  onSolve,
  onClose,
  hapticsEnabled
}) => {
  const triggerHaptic = (len = 10) => {
    if (hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  };

  // Difficulty / depth scaling factor
  const isDeepChamber = chamber >= 10;
  const isMidChamber = chamber >= 5 && chamber < 10;
  const diffMultiplier = difficulty === 'nightmare' || difficulty === 'extreme' ? 1.5 : 1;

  // -------------------------------------------------------------
  // 1. KEYPAD STATE
  // -------------------------------------------------------------
  const keypadTarget = isDeepChamber
    ? '926418'
    : isMidChamber
    ? '83715'
    : '4920';
  const [pin, setPin] = useState<string>('');
  const [keypadAttempts, setKeypadAttempts] = useState<number>(0);

  const handleKeypadPress = (digit: string) => {
    if (pin.length < keypadTarget.length) {
      triggerHaptic(8);
      audio.playClick();
      setPin(prev => prev + digit);
    }
  };

  const handleKeypadSubmit = () => {
    if (pin === keypadTarget) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      const nextAtt = keypadAttempts + 1;
      setKeypadAttempts(nextAtt);
      setPin('');
      if (nextAtt >= 3) {
        // Severe lockout
        setTimeout(() => onSolve(false), 400);
      }
    }
  };

  // -------------------------------------------------------------
  // 2. POWER GRID / HARMONIC CAPACITOR STATE
  // -------------------------------------------------------------
  const gridNodeCount = isDeepChamber ? 5 : isMidChamber ? 4 : 3;
  const gridTargetSeq = isDeepChamber
    ? [3, 1, 5, 2, 4]
    : isMidChamber
    ? [2, 4, 1, 3]
    : [1, 3, 2];
  const [nodeSeq, setNodeSeq] = useState<number[]>([]);
  const [isDiagnosticFlashing, setIsDiagnosticFlashing] = useState<boolean>(false);
  const [flashActiveNode, setFlashActiveNode] = useState<number | null>(null);

  const triggerDiagnosticFlash = () => {
    if (isDiagnosticFlashing) return;
    setIsDiagnosticFlashing(true);
    setNodeSeq([]);
    triggerHaptic(15);
    audio.playSonarPing();

    gridTargetSeq.forEach((nodeNum, i) => {
      window.setTimeout(() => {
        setFlashActiveNode(nodeNum);
        audio.playClick();
        triggerHaptic(10);
      }, (i + 1) * 600);
      window.setTimeout(() => {
        setFlashActiveNode(null);
      }, (i + 1) * 600 + 400);
    });

    window.setTimeout(() => {
      setIsDiagnosticFlashing(false);
    }, (gridTargetSeq.length + 1) * 600 + 300);
  };

  const handleNodeToggle = (n: number) => {
    if (isDiagnosticFlashing || nodeSeq.includes(n)) return;
    triggerHaptic(12);
    audio.playClick();
    const updated = [...nodeSeq, n];
    setNodeSeq(updated);

    if (updated.length === gridTargetSeq.length) {
      const isCorrect = updated.every((val, idx) => val === gridTargetSeq[idx]);
      if (isCorrect) {
        audio.playSolve();
        triggerHaptic(40);
        setTimeout(() => onSolve(true), 350);
      } else {
        audio.playError();
        triggerHaptic(60);
        setTimeout(() => {
          setNodeSeq([]);
          onSolve(false);
        }, 400);
      }
    }
  };

  // -------------------------------------------------------------
  // 3. AIRLOCK HYDRO-MANIFOLD STATE
  // -------------------------------------------------------------
  const [valveA, setValveA] = useState<number>(25);
  const [valveB, setValveB] = useState<number>(75);
  const [valveC, setValveC] = useState<number>(30);
  const [valveD, setValveD] = useState<number>(80);

  // Depth Hydrostatic Drift
  useEffect(() => {
    if (puzzleType !== 'airlock' || !isDeepChamber) return;
    const interval = setInterval(() => {
      setValveA(prev => Math.min(100, Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1))));
      setValveC(prev => Math.min(100, Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1200);
    return () => clearInterval(interval);
  }, [puzzleType, isDeepChamber]);

  const handleAirlockPurge = () => {
    let isBalanced = false;
    const tolerance = isDeepChamber ? 5 : isMidChamber ? 7 : 10;

    if (isDeepChamber) {
      isBalanced =
        Math.abs(valveA - 50) <= tolerance &&
        Math.abs(valveB - 50) <= tolerance &&
        Math.abs(valveC - 50) <= tolerance &&
        Math.abs(valveD - 50) <= tolerance;
    } else if (isMidChamber) {
      isBalanced =
        Math.abs(valveA - 50) <= tolerance &&
        Math.abs(valveB - 50) <= tolerance &&
        Math.abs(valveC - 50) <= tolerance;
    } else {
      isBalanced =
        Math.abs(valveA - 50) <= tolerance &&
        Math.abs(valveB - 50) <= tolerance;
    }

    if (isBalanced) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 4. OBSIDIAN CIPHER ALIGNMENT STATE
  // -------------------------------------------------------------
  const cipherTargetShift = 3;
  const [cipherShift, setCipherShift] = useState<number>(11);
  const rawCipherTexts = [
    { enc: 'WKH DEBTT KDV HBHV', dec: 'THE ABYSS HAS EYES' },
    { enc: 'KDGDO GHSWKV GLVSODFHPHQW', dec: 'HADAL DEPTHS DISPLACEMENT' },
    { enc: 'RPHJD FRUH ELRORJLFDO EUHDFK', dec: 'OMEGA CORE BIOLOGICAL BREACH' }
  ];
  const activeCipher = isDeepChamber ? rawCipherTexts[2] : isMidChamber ? rawCipherTexts[1] : rawCipherTexts[0];

  const decodeCaesar = (str: string, shift: number) => {
    return str.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        // Shift backwards
        let decodedCode = code - shift;
        if (decodedCode < 65) decodedCode += 26;
        return String.fromCharCode(decodedCode);
      }
      return char;
    }).join('');
  };

  const currentDecrypted = decodeCaesar(activeCipher.enc, cipherShift);

  const handleCipherSubmit = () => {
    if (cipherShift === cipherTargetShift || currentDecrypted === activeCipher.dec) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 5. SONAR FREQUENCY RESONANCE MATCHING
  // -------------------------------------------------------------
  const targetSonarFreq = isDeepChamber ? 144 : isMidChamber ? 96 : 60;
  const targetSonarPhase = isDeepChamber ? 180 : 90;
  const targetSonarAmp = 70;

  const [sonarFreq, setSonarFreq] = useState<number>(40);
  const [sonarPhase, setSonarPhase] = useState<number>(0);
  const [sonarAmp, setSonarAmp] = useState<number>(40);

  const freqDiff = Math.abs(sonarFreq - targetSonarFreq);
  const phaseDiff = Math.abs(sonarPhase - targetSonarPhase);
  const ampDiff = Math.abs(sonarAmp - targetSonarAmp);

  const sonarResonance = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - (freqDiff * 0.85 + phaseDiff * 0.15 + ampDiff * 0.4))
    )
  );

  const handleSonarLock = () => {
    if (sonarResonance >= 88) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 6. REACTOR COOLANT VALVES (Cross-Coupled Thermal Matrix)
  // -------------------------------------------------------------
  const [tempAlpha, setTempAlpha] = useState<number>(76);
  const [tempBeta, setTempBeta] = useState<number>(34);
  const [tempGamma, setTempGamma] = useState<number>(84);
  const [tempDelta, setTempDelta] = useState<number>(66);

  const injectCoolant = (zone: 'alpha' | 'beta' | 'gamma' | 'delta') => {
    triggerHaptic(12);
    audio.playClick();
    if (zone === 'alpha') {
      setTempAlpha(t => Math.max(20, t - 9));
      setTempBeta(t => Math.min(100, t + 6));
      setTempDelta(t => Math.min(100, t + 4));
    } else if (zone === 'beta') {
      setTempBeta(t => Math.max(20, t - 10));
      setTempAlpha(t => Math.min(100, t + 5));
      setTempGamma(t => Math.min(100, t + 3));
    } else if (zone === 'gamma') {
      setTempGamma(t => Math.max(20, t - 9));
      setTempBeta(t => Math.min(100, t + 6));
      setTempDelta(t => Math.max(20, t - 4));
    } else if (zone === 'delta') {
      setTempDelta(t => Math.max(20, t - 9));
      setTempGamma(t => Math.min(100, t + 5));
      setTempAlpha(t => Math.min(100, t + 3));
    }
  };

  const handleReactorStabilize = () => {
    const safeMin = 44;
    const safeMax = 56;
    const isStable =
      tempAlpha >= safeMin && tempAlpha <= safeMax &&
      tempBeta >= safeMin && tempBeta <= safeMax &&
      tempGamma >= safeMin && tempGamma <= safeMax &&
      tempDelta >= safeMin && tempDelta <= safeMax;

    if (isStable) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 7. CIRCUIT BREAKER LOGIC GATES
  // -------------------------------------------------------------
  const [switchA, setSwitchA] = useState<boolean>(false);
  const [switchB, setSwitchB] = useState<boolean>(true);
  const [switchC, setSwitchC] = useState<boolean>(false);
  const [switchD, setSwitchD] = useState<boolean>(false);

  // Logic equation:
  // Gate 1 (AND): A & B
  // Gate 2 (XOR): C ^ D
  // Master Latch (OR/XOR depending on depth): Gate 1 ^ Gate 2 (XOR)
  const gate1 = switchA && switchB;
  const gate2 = switchC !== switchD; // XOR
  const masterLatch = isDeepChamber ? (gate1 !== gate2) : (gate1 || gate2);

  const handleCircuitBypass = () => {
    if (masterLatch) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 8. HYDROACOUSTIC OSCILLOSCOPE (Biosonar Waveform Decryption)
  // -------------------------------------------------------------
  const targetFreq = isDeepChamber ? 520 : isMidChamber ? 380 : 240;
  const targetAmp = 70;
  const targetPhase = isDeepChamber ? 180 : 90;

  const [tunedFreq, setTunedFreq] = useState<number>(300);
  const [tunedAmp, setTunedAmp] = useState<number>(50);
  const [tunedPhase, setTunedPhase] = useState<number>(0);

  const freqDelta = Math.abs(tunedFreq - targetFreq);
  const ampDelta = Math.abs(tunedAmp - targetAmp);
  const phaseDelta = Math.abs(tunedPhase - targetPhase) % 360;

  const isWaveformLocked = freqDelta <= 25 && ampDelta <= 8 && (phaseDelta <= 15 || phaseDelta >= 345);
  const matchPercentage = Math.max(0, Math.min(100, Math.round(
    100 - (freqDelta / 4 + ampDelta + phaseDelta / 3)
  )));

  const handleWaveformSolve = () => {
    if (isWaveformLocked) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 9. DECONTAMINATION QUAD-MANIFOLD BALANCER
  // -------------------------------------------------------------
  const [valveP1, setValveP1] = useState<number>(140);
  const [valveP2, setValveP2] = useState<number>(60);
  const [valveP3, setValveP3] = useState<number>(120);
  const [valveP4, setValveP4] = useState<number>(80);

  const turnManifoldValve = (valve: 1 | 2 | 3 | 4) => {
    audio.playValveTurn(180 + valve * 40);
    triggerHaptic(12);
    if (valve === 1) {
      setValveP1(p => Math.max(30, p - 12));
      setValveP2(p => Math.min(180, p + 8));
      setValveP4(p => Math.min(180, p + 4));
    } else if (valve === 2) {
      setValveP2(p => Math.max(30, p - 10));
      setValveP1(p => Math.min(180, p + 5));
      setValveP3(p => Math.min(180, p + 5));
    } else if (valve === 3) {
      setValveP3(p => Math.max(30, p - 12));
      setValveP2(p => Math.min(180, p + 7));
      setValveP4(p => Math.max(30, p - 5));
    } else if (valve === 4) {
      setValveP4(p => Math.max(30, p - 10));
      setValveP3(p => Math.min(180, p + 6));
      setValveP1(p => Math.min(180, p + 4));
    }
  };

  const isManifoldBalanced = 
    Math.abs(valveP1 - 100) <= 8 &&
    Math.abs(valveP2 - 100) <= 8 &&
    Math.abs(valveP3 - 100) <= 8 &&
    Math.abs(valveP4 - 100) <= 8;

  const handleDeconSolve = () => {
    if (isManifoldBalanced) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 10. QUANTUM REGISTER HARMONICS
  // -------------------------------------------------------------
  const quantumNodes = [0, 1, 2, 3, 4, 5];
  const targetQuantumSequence = isDeepChamber ? [1, 4, 2, 5, 0] : isMidChamber ? [3, 0, 4, 2] : [2, 0, 3];
  const [quantumInput, setQuantumInput] = useState<number[]>([]);
  const [isQuantumPlaying, setIsQuantumPlaying] = useState<boolean>(false);
  const [activeQuantumLit, setActiveQuantumLit] = useState<number | null>(null);

  const playQuantumChimeSeq = () => {
    if (isQuantumPlaying) return;
    setIsQuantumPlaying(true);
    setQuantumInput([]);
    targetQuantumSequence.forEach((node, idx) => {
      window.setTimeout(() => {
        setActiveQuantumLit(node);
        audio.playQuantumBeep(node);
        triggerHaptic(10);
      }, (idx + 1) * 550);
      window.setTimeout(() => {
        setActiveQuantumLit(null);
      }, (idx + 1) * 550 + 380);
    });
    window.setTimeout(() => {
      setIsQuantumPlaying(false);
    }, (targetQuantumSequence.length + 1) * 550);
  };

  const handleQuantumClick = (node: number) => {
    if (isQuantumPlaying) return;
    audio.playQuantumBeep(node);
    triggerHaptic(12);
    const nextInput = [...quantumInput, node];
    setQuantumInput(nextInput);

    const currStep = nextInput.length - 1;
    if (nextInput[currStep] !== targetQuantumSequence[currStep]) {
      audio.playError();
      triggerHaptic(60);
      setQuantumInput([]);
      return;
    }

    if (nextInput.length === targetQuantumSequence.length) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    }
  };

  // -------------------------------------------------------------
  // 11. SPECTROGRAM FREQUENCY (ACOUSTIC SPECTRUM MATCHING)
  // -------------------------------------------------------------
  const specBandLabels = ['SUB 30Hz', 'LOW 120Hz', 'MID 500Hz', 'HIGH 2kHz', 'ULTRA 8kHz'];
  const specTarget = isDeepChamber ? [80, 35, 95, 20, 65] : isMidChamber ? [60, 45, 80, 40, 70] : [45, 75, 35, 80, 40];
  const [specBands, setSpecBands] = useState<number[]>([25, 50, 40, 65, 30]);
  const specTolerance = isDeepChamber ? 4 : isMidChamber ? 6 : 8;

  const handleSpecBandChange = (idx: number, val: number) => {
    const next = [...specBands];
    next[idx] = val;
    setSpecBands(next);
    audio.playSpectrogramSweep(200 + idx * 250);
    triggerHaptic(6);
  };

  const specDiffs = specBands.map((v, i) => Math.abs(v - specTarget[i]));
  const isSpectrogramAligned = specDiffs.every(d => d <= specTolerance);
  const specResonance = Math.max(0, Math.min(100, Math.round(
    100 - (specDiffs.reduce((a, b) => a + b, 0) / (specBands.length * 50)) * 100
  )));

  const handleSpecSubmit = () => {
    if (isSpectrogramAligned) {
      audio.playHarmonicAlign();
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 12. PRESSURE DEPTH REGULATOR (3-STAGE PISTON BALANCER)
  // -------------------------------------------------------------
  const [pistonPressures, setPistonPressures] = useState<number[]>([70, 135, 45]);
  const [pistonLocked, setPistonLocked] = useState<boolean[]>([false, false, false]);
  const pistonTarget = 100;
  const pistonTolerance = isDeepChamber ? 4 : isMidChamber ? 7 : 10;

  const handlePistonAdjust = (idx: number, delta: number) => {
    if (pistonLocked[idx]) return;
    const next = [...pistonPressures];
    next[idx] = Math.max(0, Math.min(200, next[idx] + delta));
    setPistonPressures(next);
    audio.playPistonThud(next[idx]);
    triggerHaptic(12);
  };

  const handlePistonLockToggle = (idx: number) => {
    const next = [...pistonLocked];
    next[idx] = !next[idx];
    setPistonLocked(next);
    audio.playValveTurn(next[idx] ? 440 : 220);
    triggerHaptic(18);
  };

  const areAllPistonsBalanced = pistonPressures.every(p => Math.abs(p - pistonTarget) <= pistonTolerance);
  const areAllPistonsLocked = pistonLocked.every(Boolean);

  const handlePistonSubmit = () => {
    if (areAllPistonsBalanced && areAllPistonsLocked) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playAlarm();
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 13. CONTAINMENT LASER GRID (OPTICAL PRISM REDIRECTION)
  // -------------------------------------------------------------
  // 3x3 grid. Emitter is at (0, 0) pointing East (0, 1). Receptor is at (2, 2).
  // Initial mirror angles: 0: '/', 1: '\', 2: '-', 3: '|'
  const [mirrors, setMirrors] = useState<Record<string, number>>({
    '0,2': 0, // Initially '/'
    '1,1': 1, // Initially '\'
    '1,2': 3, // Initially '|'
    '2,1': 0  // Initially '/'
  });

  const rotateMirror = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (mirrors[key] !== undefined) {
      const nextAngle = (mirrors[key] + 1) % 4;
      setMirrors(prev => ({ ...prev, [key]: nextAngle }));
      audio.playLaserDeflect(nextAngle);
      triggerHaptic(10);
    }
  };

  // Compute laser raycast path
  const computeLaserPath = () => {
    let r = 0;
    let c = 0;
    let dr = 0;
    let dc = 1; // Start moving East
    const path: Array<[number, number]> = [[0, 0]];
    let steps = 0;
    let locked = false;

    while (steps < 16) {
      steps++;
      r += dr;
      c += dc;

      if (r < 0 || r > 2 || c < 0 || c > 2) break; // Out of bounds
      path.push([r, c]);

      if (r === 2 && c === 2) {
        locked = true;
        break;
      }

      const key = `${r},${c}`;
      if (mirrors[key] !== undefined) {
        const angle = mirrors[key];
        if (angle === 0) { // '/'
          if (dr === 0 && dc === 1) { dr = -1; dc = 0; } // East -> North
          else if (dr === 0 && dc === -1) { dr = 1; dc = 0; } // West -> South
          else if (dr === 1 && dc === 0) { dr = 0; dc = -1; } // South -> West
          else if (dr === -1 && dc === 0) { dr = 0; dc = 1; } // North -> East
        } else if (angle === 1) { // '\'
          if (dr === 0 && dc === 1) { dr = 1; dc = 0; } // East -> South
          else if (dr === 0 && dc === -1) { dr = -1; dc = 0; } // West -> North
          else if (dr === 1 && dc === 0) { dr = 0; dc = 1; } // South -> East
          else if (dr === -1 && dc === 0) { dr = 0; dc = -1; } // North -> West
        } else if (angle === 2) { // '-'
          if (dr === 1 && dc === 0) { dr = -1; } // reflect vertical
          else if (dr === -1 && dc === 0) { dr = 1; }
          else break; // absorbed
        } else if (angle === 3) { // '|'
          if (dr === 0 && dc === 1) { dc = -1; } // reflect horizontal
          else if (dr === 0 && dc === -1) { dc = 1; }
          else break; // absorbed
        }
      }
    }
    return { path, locked };
  };

  const laserResult = computeLaserPath();

  const handleLaserSubmit = () => {
    if (laserResult.locked) {
      audio.playHarmonicAlign();
      audio.playSolve();
      triggerHaptic(45);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 14. BIOMETRIC NEURAL HARMONIC SIPHON
  // -------------------------------------------------------------
  const [deltaBand, setDeltaBand] = useState<number>(30);
  const [thetaBand, setThetaBand] = useState<number>(75);
  const [alphaBand, setAlphaBand] = useState<number>(45);

  const targetDelta = isDeepChamber ? 72 : isMidChamber ? 60 : 50;
  const targetTheta = isDeepChamber ? 35 : isMidChamber ? 45 : 40;
  const targetAlpha = isDeepChamber ? 85 : isMidChamber ? 75 : 80;
  const neuralTolerance = 6;

  const isDeltaAligned = Math.abs(deltaBand - targetDelta) <= neuralTolerance;
  const isThetaAligned = Math.abs(thetaBand - targetTheta) <= neuralTolerance;
  const isAlphaAligned = Math.abs(alphaBand - targetAlpha) <= neuralTolerance;
  const isNeuralHarmonicLocked = isDeltaAligned && isThetaAligned && isAlphaAligned;

  const handleNeuralSubmit = () => {
    if (isNeuralHarmonicLocked) {
      audio.playHarmonicAlign();
      audio.playSolve();
      triggerHaptic(45);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 15. CRYO-STASIS COOLANT MANIFOLD
  // -------------------------------------------------------------
  const [cryoTemps, setCryoTemps] = useState<number[]>([
    -175,
    -240,
    -25,
    -60
  ]);
  const targetCryoTemps = [-196, -268, -45, -78];
  const cryoLabels = ['LINE A (N2 LIQUID)', 'LINE B (HELIUM-4)', 'LINE C (GLYCOL HEAT)', 'LINE D (CO2 VENT)'];
  const cryoTolerance = 4;

  const handleCryoTempAdjust = (idx: number, delta: number) => {
    triggerHaptic(8);
    audio.playValveTurn(180 + idx * 40);
    setCryoTemps(prev => {
      const next = [...prev];
      next[idx] = next[idx] + delta;
      return next;
    });
  };

  const isCryoManifoldStable = cryoTemps.every((temp, idx) => Math.abs(temp - targetCryoTemps[idx]) <= cryoTolerance);

  const handleCryoSubmit = () => {
    if (isCryoManifoldStable) {
      audio.playHarmonicAlign();
      audio.playSolve();
      triggerHaptic(50);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 16. OPTIC PRISM ALIGNMENT STATE
  // -------------------------------------------------------------
  const [prismAngles, setPrismAngles] = useState<number[]>([0, 0, 0]);
  const targetPrismAngles = [45, 90, 135];
  const handleRotatePrism = (idx: number) => {
    triggerHaptic(10);
    audio.playLaserDeflect(idx);
    setPrismAngles(prev => {
      const next = [...prev];
      next[idx] = (next[idx] + 45) % 180;
      return next;
    });
  };
  const isPrismAligned = prismAngles.every((a, idx) => a === targetPrismAngles[idx]);
  const handlePrismSubmit = () => {
    if (isPrismAligned) {
      audio.playHarmonicAlign();
      audio.playSolve();
      triggerHaptic(45);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 17. SONAR ECHO TRIANGULATION STATE
  // -------------------------------------------------------------
  const [sonarAzimuth, setSonarAzimuth] = useState<number>(90);
  const [sonarDelayMs, setSonarDelayMs] = useState<number>(80);
  const targetAzimuth = isDeepChamber ? 285 : 210;
  const targetDelay = isDeepChamber ? 175 : 140;
  const isAzimuthAligned = Math.abs(sonarAzimuth - targetAzimuth) <= 15;
  const isDelayAligned = Math.abs(sonarDelayMs - targetDelay) <= 15;
  const isSonarTriangulated = isAzimuthAligned && isDelayAligned;
  const handleSonarTriangulateSubmit = () => {
    if (isSonarTriangulated) {
      audio.playSonarPing();
      audio.playSolve();
      triggerHaptic(45);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 18. BIOCHEMICAL ANTIDOTE TITRATION STATE
  // -------------------------------------------------------------
  const [currentPh, setCurrentPh] = useState<number>(isDeepChamber ? 9.20 : 5.15);
  const targetPh = 7.35;
  const phTolerance = 0.15;
  const isPhBalanced = Math.abs(currentPh - targetPh) <= phTolerance;
  const handleAdjustPh = (delta: number) => {
    triggerHaptic(8);
    audio.playValveTurn(Math.round(currentPh * 60));
    setCurrentPh(prev => Number(Math.max(1, Math.min(14, prev + delta)).toFixed(2)));
  };
  const handleTitrationSubmit = () => {
    if (isPhBalanced) {
      audio.playSolve();
      triggerHaptic(40);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  // -------------------------------------------------------------
  // 19. SUBSEA MULTI-CONDUCTOR PATCH ROUTER STATE
  // -------------------------------------------------------------
  const [selectedCable, setSelectedCable] = useState<string | null>(null);
  const [cablePatches, setCablePatches] = useState<Record<string, string>>({});
  const correctCableMapping: Record<string, string> = {
    power_440v: 'socket_b',
    sonar_data: 'socket_d',
    oxygen_sensor: 'socket_a',
    neural_damper: 'socket_c'
  };
  const handleConnectCable = (socketId: string) => {
    if (!selectedCable) return;
    triggerHaptic(12);
    audio.playClick();
    setCablePatches(prev => ({ ...prev, [selectedCable]: socketId }));
    setSelectedCable(null);
  };
  const isPatchBayComplete = Object.keys(correctCableMapping).every(
    key => cablePatches[key] === correctCableMapping[key]
  );
  const handlePatchSubmit = () => {
    if (isPatchBayComplete) {
      audio.playHarmonicAlign();
      audio.playSolve();
      triggerHaptic(45);
      onSolve(true);
    } else {
      audio.playError();
      triggerHaptic(60);
      onSolve(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto">
      <div className="bg-[#0c0f1e] border-2 border-[#374268] max-w-lg w-full p-5 rounded-lg shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212942] pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-base">⚙️</span>
            <div>
              <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">
                {puzzleType === 'keypad' && 'HYDRAULIC KEYPAD OVERRIDE'}
                {puzzleType === 'power_grid' && 'CAPACITOR MATRIX HARMONICS'}
                {puzzleType === 'airlock' && 'PRESSURE AIRLOCK MANIFOLD'}
                {puzzleType === 'cipher' && 'OBSIDIAN CIPHER ALIGNMENT'}
                {puzzleType === 'sonar_frequency' && 'ACOUSTIC SONAR RESONANCE'}
                {puzzleType === 'reactor_valves' && 'REACTOR COOLANT MATRIX'}
                {puzzleType === 'circuit_breaker' && 'LOGIC GATE CIRCUIT BREAKER'}
                {puzzleType === 'hydroacoustic_waveform' && 'HYDROACOUSTIC OSCILLOSCOPE'}
                {puzzleType === 'decontamination_valves' && 'DECONTAMINATION MANIFOLD BALANCER'}
                {puzzleType === 'quantum_sequence' && 'QUANTUM REGISTER HARMONICS'}
                {puzzleType === 'spectrogram_frequency' && 'ACOUSTIC SPECTROGRAM HARMONIZER'}
                {puzzleType === 'pressure_depth_regulator' && 'HYDROSTATIC CAVITATION REGULATOR'}
                {puzzleType === 'containment_laser_grid' && 'ULTRAVIOLET CONTAINMENT MATRIX'}
                {puzzleType === 'biometric_neural_siphon' && 'BIOMETRIC NEURAL HARMONIC SIPHON'}
                {puzzleType === 'cryo_coolant_manifold' && 'CRYO-STASIS COOLANT MANIFOLD'}
                {puzzleType === 'optic_prism_align' && 'QUARTZ REFRACTION PRISM CALIBRATION'}
                {puzzleType === 'sonar_echo_triangulate' && 'ACOUSTIC TRIANGULATION HYDROPHONE GRID'}
                {puzzleType === 'biochemical_antidote_titration' && 'BIOCHEMICAL TITRATION MANIFOLD'}
                {puzzleType === 'subsea_cable_patch' && 'DEEP-SEA MULTI-CONDUCTOR PATCH ROUTER'}
              </h3>
              <span className="text-[10px] text-[#7885a5]">
                DEPTH RATING: CHAMBER {chamber} // COMPLEXITY LEVEL:{' '}
                <b className={isDeepChamber ? 'text-red-400' : isMidChamber ? 'text-amber-400' : 'text-emerald-400'}>
                  {isDeepChamber ? 'EXTREME' : isMidChamber ? 'ADVANCED' : 'STANDARD'}
                </b>
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
            ABORT
          </button>
        </div>

        {/* Puzzle Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* ========================================================= */}
          {/* 1. KEYPAD OVERRIDE */}
          {/* ========================================================= */}
          {puzzleType === 'keypad' && (
            <div className="space-y-3 text-center">
              <p className="text-[#a4b0d4] text-[11px] leading-relaxed">
                ENTER {keypadTarget.length}-DIGIT SECURITY OVERRIDE PIN.<br />
                {isDeepChamber ? (
                  <span className="text-amber-400 font-bold">[ENCRYPTED PARITY HASH: 9 2 6 4 1 8]</span>
                ) : isMidChamber ? (
                  <span className="text-amber-400 font-bold">[SUBSEA CHECKSUM HINT: 8 3 7 1 5]</span>
                ) : (
                  <span className="text-amber-400 font-bold">[MAINTENANCE LOG ENTRY: 4 9 2 0]</span>
                )}
              </p>

              {keypadAttempts > 0 && (
                <div className="text-[10px] text-red-400">
                  FAILED ATTEMPTS: {keypadAttempts}/3 (3 FAILURES TRIGGERS DISCHARGE)
                </div>
              )}

              <div className="bg-[#121626] border-2 border-emerald-600/80 py-3 text-2xl font-black tracking-[0.35em] text-emerald-400 rounded shadow-inner">
                {pin.padEnd(keypadTarget.length, '_')}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                  <button
                    key={digit}
                    onClick={() => handleKeypadPress(String(digit))}
                    className="py-2.5 bg-[#171b30] hover:bg-[#242b4a] text-white border border-[#303858] rounded text-base font-bold transition cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => {
                    triggerHaptic(8);
                    setPin(p => p.slice(0, -1));
                  }}
                  className="py-2.5 bg-[#1b1f32] text-[#8e9abf] hover:text-white border border-[#313958] rounded font-bold uppercase text-[11px] cursor-pointer"
                >
                  DEL
                </button>
                <button
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 bg-[#171b30] hover:bg-[#242b4a] text-white border border-[#303858] rounded text-base font-bold transition cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    triggerHaptic(8);
                    setPin('');
                  }}
                  className="py-2.5 bg-[#1b1f32] text-[#8e9abf] hover:text-white border border-[#313958] rounded font-bold uppercase text-[11px] cursor-pointer"
                >
                  CLR
                </button>
              </div>

              <button
                onClick={handleKeypadSubmit}
                disabled={pin.length !== keypadTarget.length}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                AUTHORIZE OVERRIDE PIN
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. POWER GRID / CAPACITOR MATRIX */}
          {/* ========================================================= */}
          {puzzleType === 'power_grid' && (
            <div className="space-y-4 text-center">
              <p className="text-[#a4b0d4] text-[11px] leading-relaxed">
                TRIGGER DIAGNOSTIC PATTERN OR READ HARMONIC ORDER, THEN ENGAGE CAPACITORS IN SEQUENCE:
                <br />
                <span className="text-cyan-400 font-bold block mt-1">
                  TARGET SEQUENCE: [{gridTargetSeq.join(' → ')}]
                </span>
              </p>

              <button
                disabled={isDiagnosticFlashing}
                onClick={triggerDiagnosticFlash}
                className="px-4 py-1.5 bg-[#17243c] hover:bg-[#213254] text-cyan-300 border border-cyan-700 rounded text-[11px] font-bold uppercase cursor-pointer"
              >
                {isDiagnosticFlashing ? 'TRANSMITTING HARMONIC FLASH...' : '▶ FLASH DIAGNOSTIC PATTERN'}
              </button>

              <div className="flex justify-center flex-wrap gap-3 py-2">
                {Array.from({ length: gridNodeCount }, (_, i) => i + 1).map(n => {
                  const isSelected = nodeSeq.includes(n);
                  const orderIdx = nodeSeq.indexOf(n);
                  const isFlashHighlighted = flashActiveNode === n;

                  return (
                    <button
                      key={n}
                      disabled={isDiagnosticFlashing}
                      onClick={() => handleNodeToggle(n)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded border-2 flex flex-col items-center justify-center font-bold transition cursor-pointer ${
                        isFlashHighlighted
                          ? 'bg-amber-400 border-white text-black shadow-[0_0_20px_#f59e0b] scale-105'
                          : isSelected
                          ? 'bg-cyan-900 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-900/50'
                          : 'bg-[#15192c] border-[#303a5e] text-[#a0abd0] hover:border-amber-400'
                      }`}
                    >
                      <span className="text-lg">⚡ {n}</span>
                      <span className="text-[10px] opacity-75">
                        {isFlashHighlighted ? 'PULSE' : isSelected ? `#${orderIdx + 1}` : 'IDLE'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] text-[#7b89ad] pt-1">
                <span>INPUT PROGRESS: {nodeSeq.length}/{gridTargetSeq.length}</span>
                <button
                  onClick={() => {
                    triggerHaptic(8);
                    setNodeSeq([]);
                  }}
                  className="px-2 py-1 bg-[#1a1f33] text-[#8e9abf] hover:text-white border border-[#313958] rounded font-bold uppercase cursor-pointer"
                >
                  RESET GRID
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. AIRLOCK PRESSURE MANIFOLD */}
          {/* ========================================================= */}
          {puzzleType === 'airlock' && (
            <div className="space-y-4 text-center">
              <p className="text-[#a4b0d4] text-[11px] leading-relaxed">
                CALIBRATE HYDRO-PRESSURE VALVES TO 50% (+/- {isDeepChamber ? '5%' : isMidChamber ? '7%' : '10%'}) PRIOR TO PURGE.
                {isDeepChamber && (
                  <span className="text-red-400 block mt-0.5 font-bold">
                    WARNING: HIGH HYDROSTATIC PRESSURE CAUSING ACTIVE SENSOR DRIFT!
                  </span>
                )}
              </p>

              <div className="space-y-3 bg-[#111424] p-3.5 rounded border border-[#232b45] text-left">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>VALVE A (OUTER HATCH):</span>
                    <span className={`font-bold ${Math.abs(valveA - 50) <= (isDeepChamber ? 5 : 8) ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {valveA}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={valveA}
                    onChange={e => setValveA(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>VALVE B (CHAMBER EQUALIZER):</span>
                    <span className={`font-bold ${Math.abs(valveB - 50) <= (isDeepChamber ? 5 : 8) ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {valveB}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={valveB}
                    onChange={e => setValveB(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {(isMidChamber || isDeepChamber) && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>VALVE C (BILGE BALLAST):</span>
                      <span className={`font-bold ${Math.abs(valveC - 50) <= (isDeepChamber ? 5 : 8) ? 'text-emerald-400' : 'text-purple-400'}`}>
                        {valveC}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={valveC}
                      onChange={e => setValveC(Number(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>
                )}

                {isDeepChamber && (
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>VALVE D (DEPTH RELIEF CONDUIT):</span>
                      <span className={`font-bold ${Math.abs(valveD - 50) <= 5 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {valveD}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={valveD}
                      onChange={e => setValveD(Number(e.target.value))}
                      className="w-full accent-red-400 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleAirlockPurge}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                PURGE SEALS &amp; OPEN BULKHEAD
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. OBSIDIAN CIPHER ALIGNMENT */}
          {/* ========================================================= */}
          {puzzleType === 'cipher' && (
            <div className="space-y-4 text-center">
              <p className="text-[#a4b0d4] text-[11px] leading-relaxed">
                ALIGN THE OBSIDIAN ROTATION RING TO DECRYPT THE INTERCEPTED HYDROPHONE TRANSMISSION:
              </p>

              <div className="bg-[#101428] border-2 border-purple-600/70 p-4 rounded text-center space-y-2">
                <span className="text-[10px] text-[#727d9e] uppercase font-bold block">
                  INTERCEPTED HADAL CRYPTOGRAM:
                </span>
                <div className="text-red-400 text-sm font-bold tracking-widest font-mono">
                  "{activeCipher.enc}"
                </div>

                <div className="pt-2 border-t border-[#1f2642] flex items-center justify-center gap-2">
                  <span className="text-xs text-[#8c9ac2]">ROTATION SHIFT:</span>
                  <b className="text-cyan-300 text-sm">{cipherShift}</b>
                </div>

                <input
                  type="range"
                  min="0"
                  max="25"
                  value={cipherShift}
                  onChange={e => {
                    triggerHaptic(5);
                    setCipherShift(Number(e.target.value));
                  }}
                  className="w-full accent-purple-400 cursor-pointer"
                />

                <div className="pt-2">
                  <span className="text-[10px] text-[#727d9e] uppercase block">
                    DECRYPTED BUFFER PREVIEW:
                  </span>
                  <div className={`text-base font-black tracking-wider transition ${currentDecrypted === activeCipher.dec ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
                    "{currentDecrypted}"
                  </div>
                </div>
              </div>

              <button
                onClick={handleCipherSubmit}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                SUBMIT DECRYPTED TRANSMISSION
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. SONAR FREQUENCY RESONANCE */}
          {/* ========================================================= */}
          {puzzleType === 'sonar_frequency' && (
            <div className="space-y-4 text-center">
              <p className="text-[#a4b0d4] text-[11px] leading-relaxed">
                TUNE CARRIER FREQUENCY AND PHASE OFFSET TO CANCEL THE PREDATOR'S ACOUSTIC SIGNATURE:
              </p>

              {/* Sonar Canvas Waveform Visualizer */}
              <div className="bg-[#0a0d1a] border border-[#232b45] p-3 rounded flex flex-col items-center">
                <svg className="w-full h-24 bg-black/50 rounded" viewBox="0 0 300 80">
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="300" y2="40" stroke="#1d2640" strokeWidth="1" strokeDasharray="4 2" />
                  
                  {/* Target Wave (Red) */}
                  <path
                    d={`M 0,${40 + Math.sin(0) * (targetSonarAmp * 0.4)} ${Array.from({ length: 60 }, (_, i) => {
                      const x = i * 5;
                      const rad = (x * (targetSonarFreq * 0.08) + targetSonarPhase) * (Math.PI / 180);
                      const y = 40 + Math.sin(rad) * (targetSonarAmp * 0.35);
                      return `L ${x},${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                  />

                  {/* Player Tuned Wave (Cyan) */}
                  <path
                    d={`M 0,${40 + Math.sin(0) * (sonarAmp * 0.4)} ${Array.from({ length: 60 }, (_, i) => {
                      const x = i * 5;
                      const rad = (x * (sonarFreq * 0.08) + sonarPhase) * (Math.PI / 180);
                      const y = 40 + Math.sin(rad) * (sonarAmp * 0.35);
                      return `L ${x},${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="2 1"
                  />
                </svg>

                {/* Resonance Meter */}
                <div className="w-full mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#8997be]">ACOUSTIC RESONANCE:</span>
                    <span className={`font-black ${sonarResonance >= 88 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
                      {sonarResonance}% {sonarResonance >= 88 ? '[LOCK ACQUIRED]' : '[SEARCHING]'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#171b30] rounded-full overflow-hidden border border-[#2b3558]">
                    <div
                      className={`h-full transition-all duration-150 ${sonarResonance >= 88 ? 'bg-emerald-400' : 'bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400'}`}
                      style={{ width: `${sonarResonance}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-2.5 bg-[#111424] p-3 rounded border border-[#232b45] text-left text-[11px]">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>CARRIER FREQ:</span>
                    <span className="text-cyan-300 font-bold">{sonarFreq} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    value={sonarFreq}
                    onChange={e => setSonarFreq(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>PHASE ANGLE:</span>
                    <span className="text-amber-300 font-bold">{sonarPhase}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="10"
                    value={sonarPhase}
                    onChange={e => setSonarPhase(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>PULSE AMPLITUDE:</span>
                    <span className="text-purple-300 font-bold">{sonarAmp}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={sonarAmp}
                    onChange={e => setSonarAmp(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleSonarLock}
                disabled={sonarResonance < 88}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-35 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                LOCK HARMONIC RESONANCE
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. REACTOR COOLANT MATRIX */}
          {/* ========================================================= */}
          {puzzleType === 'reactor_valves' && (
            <div className="space-y-4 text-center">
              <p className="text-[#a4b0d4] text-[11px] leading-relaxed">
                BALANCE ALL FOUR CONDUITS INTO THE GREEN OPERATING BAND (45°C - 55°C):
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'alpha', label: 'ZONE α', temp: tempAlpha },
                  { id: 'beta', label: 'ZONE β', temp: tempBeta },
                  { id: 'gamma', label: 'ZONE γ', temp: tempGamma },
                  { id: 'delta', label: 'ZONE δ', temp: tempDelta }
                ].map(z => {
                  const isGreen = z.temp >= 44 && z.temp <= 56;
                  return (
                    <div key={z.id} className="bg-[#121626] border border-[#2b3558] p-3 rounded text-left space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[#96a5ce]">{z.label}</span>
                        <span className={`font-black ${isGreen ? 'text-emerald-400' : 'text-red-400'}`}>
                          {z.temp}°C
                        </span>
                      </div>

                      <div className="w-full h-2 bg-[#1b2138] rounded overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${isGreen ? 'bg-emerald-400' : z.temp > 56 ? 'bg-red-500' : 'bg-cyan-400'}`}
                          style={{ width: `${Math.min(100, Math.max(0, z.temp))}%` }}
                        />
                      </div>

                      <button
                        onClick={() => injectCoolant(z.id as any)}
                        className="w-full py-1.5 bg-[#1a233b] hover:bg-[#253254] text-cyan-300 border border-cyan-800 rounded text-[10px] font-bold uppercase transition cursor-pointer"
                      >
                        INJECT COOLANT
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleReactorStabilize}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                COMMIT COOLANT BALANCE
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. CIRCUIT BREAKER LOGIC GATES */}
          {/* ========================================================= */}
          {puzzleType === 'circuit_breaker' && (
            <div className="space-y-4 text-center">
              <p className="text-[#a4b0d4] text-[11px] leading-relaxed">
                TOGGLE CIRCUIT RELAYS TO ACHIEVE HIGH SIGNAL (1) ON THE EMERGENCY BULKHEAD LATCH:
              </p>

              <div className="bg-[#101428] border-2 border-[#2b3558] p-4 rounded text-left space-y-3 font-mono text-[11px]">
                {/* Switches */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSwitchA(s => !s)}
                    className={`py-2 px-3 rounded border font-bold flex justify-between items-center transition cursor-pointer ${
                      switchA ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-[#15192c] border-[#303858] text-[#8692b6]'
                    }`}
                  >
                    <span>RELAY A</span>
                    <span>{switchA ? '[HIGH 1]' : '[LOW 0]'}</span>
                  </button>

                  <button
                    onClick={() => setSwitchB(s => !s)}
                    className={`py-2 px-3 rounded border font-bold flex justify-between items-center transition cursor-pointer ${
                      switchB ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-[#15192c] border-[#303858] text-[#8692b6]'
                    }`}
                  >
                    <span>RELAY B</span>
                    <span>{switchB ? '[HIGH 1]' : '[LOW 0]'}</span>
                  </button>

                  <button
                    onClick={() => setSwitchC(s => !s)}
                    className={`py-2 px-3 rounded border font-bold flex justify-between items-center transition cursor-pointer ${
                      switchC ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-[#15192c] border-[#303858] text-[#8692b6]'
                    }`}
                  >
                    <span>RELAY C</span>
                    <span>{switchC ? '[HIGH 1]' : '[LOW 0]'}</span>
                  </button>

                  <button
                    onClick={() => setSwitchD(s => !s)}
                    className={`py-2 px-3 rounded border font-bold flex justify-between items-center transition cursor-pointer ${
                      switchD ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-[#15192c] border-[#303858] text-[#8692b6]'
                    }`}
                  >
                    <span>RELAY D</span>
                    <span>{switchD ? '[HIGH 1]' : '[LOW 0]'}</span>
                  </button>
                </div>

                {/* Sub Gates Visual */}
                <div className="pt-2 border-t border-[#1d2642] space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-[#8291b8]">GATE 1 [A AND B]:</span>
                    <span className={gate1 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {gate1 ? 'SIGNAL 1 (ACTIVE)' : 'SIGNAL 0 (OFF)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8291b8]">GATE 2 [C XOR D]:</span>
                    <span className={gate2 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {gate2 ? 'SIGNAL 1 (ACTIVE)' : 'SIGNAL 0 (OFF)'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#1d2642] text-xs">
                    <span className="font-bold text-white">
                      MASTER LATCH [{isDeepChamber ? 'GATE 1 XOR GATE 2' : 'GATE 1 OR GATE 2'}]:
                    </span>
                    <span className={masterLatch ? 'text-emerald-400 font-black' : 'text-red-500 font-black'}>
                      {masterLatch ? 'UNLOCKED (1)' : 'LOCKED (0)'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCircuitBypass}
                disabled={!masterLatch}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                TRIGGER MASTER LATCH
              </button>
            </div>
          )}

          {/* 8. HYDROACOUSTIC OSCILLOSCOPE (Biosonar Waveform Decryption) */}
          {puzzleType === 'hydroacoustic_waveform' && (
            <div className="space-y-4">
              <div className="bg-[#080b18] border border-[#232d4b] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-[#8ea0c7]">
                  TUNE FREQUENCY, AMPLITUDE, AND PHASE TO MATCH BLACK BOX HYDROACOUSTIC TELEMETRY:
                </span>
                <div className="flex justify-center items-center gap-4 text-xs pt-1">
                  <span className="text-red-400 font-bold">--- TARGET GHOST SIGNAL</span>
                  <span className="text-cyan-400 font-bold">─── DIVER TUNER WAVE</span>
                </div>
              </div>

              {/* Oscilloscope SVG Display */}
              <div className="h-36 bg-[#04060f] border-2 border-[#1c243f] rounded relative overflow-hidden flex items-center justify-center">
                {/* CRT Scanline Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

                <svg viewBox="0 0 400 120" className="w-full h-full">
                  {/* Center Line */}
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Target Waveform (Red dashed) */}
                  <path
                    d={Array.from({ length: 80 }).reduce((acc, _, i) => {
                      const x = (i / 79) * 400;
                      const rad = (i / 79) * (targetFreq / 25) * Math.PI * 2 + (targetPhase * Math.PI) / 180;
                      const y = 60 + Math.sin(rad) * (targetAmp * 0.5);
                      return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }, '')}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    fill="none"
                    opacity="0.85"
                  />

                  {/* Diver's Tuned Waveform (Cyan glow) */}
                  <path
                    d={Array.from({ length: 80 }).reduce((acc, _, i) => {
                      const x = (i / 79) * 400;
                      const rad = (i / 79) * (tunedFreq / 25) * Math.PI * 2 + (tunedPhase * Math.PI) / 180;
                      const y = 60 + Math.sin(rad) * (tunedAmp * 0.5);
                      return `${acc} ${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }, '')}
                    stroke={isWaveformLocked ? "#10b981" : "#06b6d4"}
                    strokeWidth="2.5"
                    fill="none"
                  />
                </svg>

                {/* Match indicator pill */}
                <div className="absolute bottom-2 right-2 bg-black/80 border border-[#2d3b66] px-2 py-0.5 rounded text-[10px] font-bold">
                  <span className={isWaveformLocked ? 'text-emerald-400 animate-pulse' : matchPercentage > 75 ? 'text-amber-400' : 'text-cyan-400'}>
                    RESONANCE MATCH: {matchPercentage}% {isWaveformLocked && '● [LOCKED]'}
                  </span>
                </div>
              </div>

              {/* Tuning Sliders */}
              <div className="space-y-3 bg-[#111629] p-3 rounded border border-[#252f4e]">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#8997bd]">OSCILLATOR FREQUENCY:</span>
                    <span className="text-cyan-400 font-bold">{tunedFreq} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="680"
                    step="5"
                    value={tunedFreq}
                    onChange={e => {
                      setTunedFreq(Number(e.target.value));
                      audio.playWaveformTunePing(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#8997bd]">TRANSDUCER AMPLITUDE:</span>
                    <span className="text-cyan-400 font-bold">{tunedAmp}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    step="2"
                    value={tunedAmp}
                    onChange={e => {
                      setTunedAmp(Number(e.target.value));
                      triggerHaptic(4);
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#8997bd]">HYDROPHONE PHASE OFFSET:</span>
                    <span className="text-cyan-400 font-bold">{tunedPhase}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="355"
                    step="5"
                    value={tunedPhase}
                    onChange={e => {
                      setTunedPhase(Number(e.target.value));
                      triggerHaptic(4);
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleWaveformSolve}
                disabled={!isWaveformLocked}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                {isWaveformLocked ? 'DECRYPT HYDROPHONE BLACK BOX' : `ALIGN HARMONICS (${matchPercentage}%)`}
              </button>
            </div>
          )}

          {/* 9. DECONTAMINATION QUAD-MANIFOLD BALANCER */}
          {puzzleType === 'decontamination_valves' && (
            <div className="space-y-4">
              <div className="bg-[#0a0f1d] border border-[#232d4b] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-[#8ea0c7]">
                  EQUILIBRATE ALL FOUR CROSS-COUPLED HYDROSTATIC CONDUITS TO 100 BAR (±8 BAR):
                </span>
                <p className="text-[10px] text-amber-400/90">
                  Each valve turn regulates flow and transfers ballast displacement to adjacent conduits.
                </p>
              </div>

              {/* 4 Conduits Gauge Bars */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: 'CONDUIT ALPHA', p: valveP1, id: 1 as const },
                  { name: 'CONDUIT BETA', p: valveP2, id: 2 as const },
                  { name: 'CONDUIT GAMMA', p: valveP3, id: 3 as const },
                  { name: 'CONDUIT DELTA', p: valveP4, id: 4 as const }
                ].map(c => {
                  const inRange = Math.abs(c.p - 100) <= 8;
                  return (
                    <div key={c.id} className="bg-[#0f1424] border border-[#212942] p-2.5 rounded flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-[#94a3b8]">{c.name}</span>
                        <span className={`font-mono font-bold ${inRange ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {c.p} BAR
                        </span>
                      </div>
                      
                      {/* Gauge bar */}
                      <div className="h-3 w-full bg-[#080a13] rounded-full overflow-hidden border border-[#252c46] relative">
                        <div
                          className={`h-full transition-all duration-300 ${
                            inRange ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : c.p > 108 ? 'bg-red-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${Math.min(100, (c.p / 180) * 100)}%` }}
                        />
                        {/* Target Marker */}
                        <div className="absolute top-0 bottom-0 left-[55.5%] w-1 bg-white opacity-80" />
                      </div>

                      <button
                        onClick={() => turnManifoldValve(c.id)}
                        className="py-1.5 bg-[#171e35] hover:bg-[#253055] border border-[#3b4772] text-[#cbd5e1] font-bold text-[10px] rounded transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>🔄 PURGE VALVE {c.id}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Equilibrium Status */}
              <div className="bg-[#0f1629] p-2.5 rounded border border-[#222c48] flex justify-between items-center text-xs">
                <span className="text-[#8897bd]">MANIFOLD INTEGRITY:</span>
                <span className={isManifoldBalanced ? 'text-emerald-400 font-black animate-pulse' : 'text-amber-400 font-bold'}>
                  {isManifoldBalanced ? 'EQUILIBRIUM ACHIEVED (100% SAFE)' : 'UNBALANCED DISPLACEMENT'}
                </span>
              </div>

              <button
                onClick={handleDeconSolve}
                disabled={!isManifoldBalanced}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer"
              >
                {isManifoldBalanced ? 'ENGAGE DECONTAMINATION AIRLOCK PURGE' : 'BALANCE ALL 4 CONDUITS TO PROCEED'}
              </button>
            </div>
          )}

          {/* 10. QUANTUM REGISTER HARMONICS */}
          {puzzleType === 'quantum_sequence' && (
            <div className="space-y-4">
              <div className="bg-[#080c1a] border border-[#253052] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-[#93a2c8]">
                  TRANSMIT HARMONIC SEQUENCE INTO HADAL QUANTUM MEMORY CRYSTALS:
                </span>
                <p className="text-[10px] text-purple-400/90">
                  {isQuantumPlaying ? 'TRANSMITTING HARMONIC PATTERN...' : 'CLICK CRYSTALS TO REPRODUCE CHIME SEQUENCE'}
                </p>
              </div>

              {/* Play Pattern Trigger Button */}
              <button
                onClick={playQuantumChimeSeq}
                disabled={isQuantumPlaying}
                className="w-full py-2 bg-[#191530] hover:bg-[#2a2254] border border-[#58488e] text-purple-300 font-bold text-xs rounded transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔊</span>
                <span>{isQuantumPlaying ? 'TRANSMITTING SEQUENCE...' : 'LISTEN TO QUANTUM HARMONICS'}</span>
              </button>

              {/* Quantum Crystal Hex Ring */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#0a0715] border border-[#2b1f48] rounded">
                {quantumNodes.map(node => {
                  const isLit = activeQuantumLit === node;
                  return (
                    <button
                      key={node}
                      onClick={() => handleQuantumClick(node)}
                      disabled={isQuantumPlaying}
                      className={`h-20 rounded border-2 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        isLit
                          ? 'bg-purple-600 border-white text-white shadow-[0_0_25px_#c084fc] scale-105'
                          : 'bg-[#150f28] border-[#38265f] text-[#c0b3dc] hover:border-purple-400'
                      }`}
                    >
                      <span className="text-xl">♦</span>
                      <span className="text-[10px] font-bold font-mono">NODE 0{node + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sequence Progress Bar */}
              <div className="flex justify-between items-center bg-[#0d091e] px-3 py-2 rounded border border-[#241740] text-xs">
                <span className="text-[#8f82b0]">REGISTER LOCK:</span>
                <div className="flex gap-1.5">
                  {targetQuantumSequence.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border ${
                        idx < quantumInput.length
                          ? 'bg-purple-400 border-purple-200 shadow-[0_0_8px_#c084fc]'
                          : 'bg-[#1a1230] border-[#37235a]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 11. SPECTROGRAM FREQUENCY HARMONIZER */}
          {/* ========================================================= */}
          {puzzleType === 'spectrogram_frequency' && (
            <div className="space-y-4">
              <div className="bg-[#0a101f] border border-[#203254] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-[#93b0dc]">
                  MATCH LIVE ACOUSTIC BANDS TO TARGET SPECTROGRAM PROFILE:
                </span>
                <p className="text-[10px] text-cyan-400 font-bold">
                  TOLERANCE THRESHOLD: ±{specTolerance}% // CURRENT HARMONIC RESONANCE: {specResonance}%
                </p>
              </div>

              {/* Spectral Visualizer Bars */}
              <div className="bg-[#070b16] border border-[#1b2844] rounded p-3 space-y-3">
                <div className="h-28 flex items-end justify-between gap-3 px-2 border-b border-[#1b2b48] pb-2 relative">
                  {specBands.map((val, idx) => {
                    const target = specTarget[idx];
                    const isAligned = Math.abs(val - target) <= specTolerance;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative">
                        {/* Target Ghost Line Marker */}
                        <div
                          className="absolute w-full border-t-2 border-dashed border-amber-400 z-10 pointer-events-none"
                          style={{ bottom: `${target}%` }}
                        >
                          <span className="absolute -top-3 right-0 text-[8px] font-mono text-amber-300 bg-black/80 px-0.5 rounded">
                            {target}%
                          </span>
                        </div>

                        {/* Live Frequency Bar */}
                        <div
                          className={`w-full rounded-t transition-all duration-150 relative ${
                            isAligned
                              ? 'bg-gradient-to-t from-emerald-800 to-emerald-400 shadow-[0_0_12px_#34d399]'
                              : 'bg-gradient-to-t from-cyan-900 to-cyan-500'
                          }`}
                          style={{ height: `${val}%` }}
                        >
                          <span className="absolute top-1 inset-x-0 text-center text-[8px] font-bold text-black drop-shadow">
                            {val}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Individual Band Adjusters */}
                <div className="space-y-2">
                  {specBands.map((val, idx) => {
                    const target = specTarget[idx];
                    const isAligned = Math.abs(val - target) <= specTolerance;
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-[#0c1224] p-1.5 rounded border border-[#1b2645]">
                        <span className="w-20 text-[9px] font-bold text-[#8ba2cc] truncate">
                          {specBandLabels[idx]}
                        </span>
                        <button
                          onClick={() => handleSpecBandChange(idx, Math.max(0, val - 5))}
                          className="px-2 py-1 bg-[#141d36] hover:bg-[#1e2c52] text-[#9fb5db] rounded font-mono font-bold cursor-pointer"
                        >
                          -5
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={val}
                          onChange={e => handleSpecBandChange(idx, Number(e.target.value))}
                          className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-[#172340] rounded-lg"
                        />
                        <button
                          onClick={() => handleSpecBandChange(idx, Math.min(100, val + 5))}
                          className="px-2 py-1 bg-[#141d36] hover:bg-[#1e2c52] text-[#9fb5db] rounded font-mono font-bold cursor-pointer"
                        >
                          +5
                        </button>
                        <span
                          className={`w-12 text-right text-[10px] font-mono font-bold ${
                            isAligned ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {val}% {isAligned ? '✓' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSpecSubmit}
                disabled={!isSpectrogramAligned}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {isSpectrogramAligned ? 'RESONANCE LOCKED // TRANSMIT FREQUENCY' : `ALIGN ALL BANDS (±${specTolerance}%)`}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 12. PRESSURE DEPTH REGULATOR */}
          {/* ========================================================= */}
          {puzzleType === 'pressure_depth_regulator' && (
            <div className="space-y-4">
              <div className="bg-[#1a0f0a] border border-[#522915] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-[#dc9e78]">
                  BALANCE ALL 3 HYDROSTATIC PISTONS TO {pistonTarget} BAR (±{pistonTolerance} BAR) & ENGAGE PINS:
                </span>
                <p className="text-[10px] font-bold text-amber-400">
                  {areAllPistonsBalanced
                    ? 'PRESSURE IS BALANCED — LOCK ALL PINS TO COMPLETE'
                    : 'WARNING: CAVITATION OVERPRESSURE UNBALANCED'}
                </p>
              </div>

              {/* 3 Piston Channels */}
              <div className="grid grid-cols-3 gap-2.5">
                {pistonPressures.map((press, idx) => {
                  const isBalanced = Math.abs(press - pistonTarget) <= pistonTolerance;
                  const isLocked = pistonLocked[idx];
                  const labels = ['ALPHA (P-1)', 'BETA (P-2)', 'GAMMA (P-3)'];
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded border-2 flex flex-col items-center justify-between gap-2 transition ${
                        isLocked
                          ? isBalanced
                            ? 'bg-[#0a1e15] border-emerald-500'
                            : 'bg-[#1f0f0f] border-red-500'
                          : 'bg-[#140d1c] border-[#3f2136]'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-[#bfa4b4] tracking-wider">
                        {labels[idx]}
                      </span>

                      {/* Gauge Indicator */}
                      <div className="relative w-full h-24 bg-[#0a060e] border border-[#2b172a] rounded flex items-end justify-center p-1">
                        {/* 100 BAR Target Reference Line */}
                        <div
                          className="absolute inset-x-0 border-t-2 border-dashed border-amber-400 z-10"
                          style={{ bottom: '50%' }}
                        />
                        <div
                          className={`w-4/5 rounded-t transition-all duration-200 ${
                            isBalanced
                              ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                              : press > 100
                              ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                              : 'bg-amber-500'
                          }`}
                          style={{ height: `${Math.min(100, (press / 200) * 100)}%` }}
                        />
                      </div>

                      <div className="text-center font-mono">
                        <span className={`text-base font-black ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {press}
                        </span>
                        <span className="text-[8px] text-[#7d6f78] block">BAR</span>
                      </div>

                      {/* Adjust Controls */}
                      <div className="flex gap-1 w-full">
                        <button
                          onClick={() => handlePistonAdjust(idx, 15)}
                          disabled={isLocked}
                          className="flex-1 py-1 bg-[#25152b] hover:bg-[#3b2046] disabled:opacity-30 text-[#e9c5f8] border border-[#482855] rounded text-[9px] font-bold cursor-pointer"
                        >
                          +15
                        </button>
                        <button
                          onClick={() => handlePistonAdjust(idx, -10)}
                          disabled={isLocked}
                          className="flex-1 py-1 bg-[#25152b] hover:bg-[#3b2046] disabled:opacity-30 text-[#e9c5f8] border border-[#482855] rounded text-[9px] font-bold cursor-pointer"
                        >
                          -10
                        </button>
                      </div>

                      {/* Lock Toggle */}
                      <button
                        onClick={() => handlePistonLockToggle(idx)}
                        className={`w-full py-1 text-[9px] font-bold rounded border cursor-pointer ${
                          isLocked
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : 'bg-[#1b1922] text-[#938ba0] border-[#393347] hover:text-white'
                        }`}
                      >
                        {isLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handlePistonSubmit}
                disabled={!areAllPistonsBalanced || !areAllPistonsLocked}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {areAllPistonsBalanced && areAllPistonsLocked
                  ? 'ENGAGE HYDRAULIC PRESSURE SEAL'
                  : 'BALANCE & LOCK ALL 3 PISTONS TO STABILIZE'}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 13. ULTRAVIOLET CONTAINMENT LASER MATRIX */}
          {/* ========================================================= */}
          {puzzleType === 'containment_laser_grid' && (
            <div className="space-y-4">
              <div className="bg-[#0a0e1c] border border-[#1e2b4f] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-[#8ea7de]">
                  ROTATE DEFLECTION PRISMS TO CHANNEL THE CONTAINMENT BEAM TO THE QUANTUM RECEPTOR:
                </span>
                <p className="text-[10px] font-bold text-cyan-400">
                  {laserResult.locked
                    ? '⚡ RECEPTOR STABILIZED // CONTAINMENT CIRCUIT COMPLETE!'
                    : 'LASER PATH DEFLECTED // PRISMS OUT OF ALIGNMENT'}
                </p>
              </div>

              {/* 3x3 Optical Chamber Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 bg-[#050811] border-2 border-[#162344] rounded relative">
                {[0, 1, 2].map(r =>
                  [0, 1, 2].map(c => {
                    const isEmitter = r === 0 && c === 0;
                    const isReceptor = r === 2 && c === 2;
                    const mirrorKey = `${r},${c}`;
                    const hasMirror = mirrors[mirrorKey] !== undefined;
                    const angle = mirrors[mirrorKey];
                    const isInPath = laserResult.path.some(([pr, pc]) => pr === r && pc === c);

                    const mirrorSymbols = ['╱', '╲', '―', '│'];

                    return (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => hasMirror && rotateMirror(r, c)}
                        className={`h-20 rounded border-2 flex flex-col items-center justify-center relative transition ${
                          hasMirror ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                        } ${
                          isEmitter
                            ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_15px_#a855f7]'
                            : isReceptor
                            ? laserResult.locked
                              ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_20px_#10b981]'
                              : 'bg-cyan-950/60 border-cyan-600'
                            : hasMirror
                            ? isInPath
                              ? 'bg-[#15233e] border-cyan-400 shadow-[0_0_12px_#38bdf8]'
                              : 'bg-[#0f172a] border-[#293d66]'
                            : isInPath
                            ? 'bg-[#0c192e] border-cyan-900/60'
                            : 'bg-[#080d18] border-[#18233c]'
                        }`}
                      >
                        {/* Emitter Cell */}
                        {isEmitter && (
                          <div className="text-center">
                            <span className="text-xl text-purple-300 animate-pulse">◉</span>
                            <span className="text-[8px] font-bold text-purple-300 block font-mono">EMITTER ▶</span>
                          </div>
                        )}

                        {/* Receptor Cell */}
                        {isReceptor && (
                          <div className="text-center">
                            <span className={`text-xl ${laserResult.locked ? 'text-emerald-300 animate-bounce' : 'text-cyan-400'}`}>
                              ◎
                            </span>
                            <span className="text-[8px] font-bold text-cyan-300 block font-mono">
                              {laserResult.locked ? 'LOCKED ✓' : 'RECEPTOR'}
                            </span>
                          </div>
                        )}

                        {/* Mirror Cell */}
                        {hasMirror && (
                          <div className="text-center select-none">
                            <span className={`text-2xl font-black ${isInPath ? 'text-cyan-300 drop-shadow-[0_0_8px_#38bdf8]' : 'text-slate-400'}`}>
                              {mirrorSymbols[angle]}
                            </span>
                            <span className="text-[7px] text-[#64748b] block font-mono">
                              CLICK TO ROTATE
                            </span>
                          </div>
                        )}

                        {/* Empty Node in Beam Path Indicator */}
                        {!isEmitter && !isReceptor && !hasMirror && isInPath && (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-ping" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={handleLaserSubmit}
                disabled={!laserResult.locked}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-30 text-white font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {laserResult.locked ? 'ENGAGE CONTAINMENT FIELD // SEAL ANOMALY' : 'ROTATE PRISMS TO COMPLETE BEAM CIRCUIT'}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 14. BIOMETRIC NEURAL HARMONIC SIPHON */}
          {/* ========================================================= */}
          {puzzleType === 'biometric_neural_siphon' && (
            <div className="space-y-4">
              <div className="bg-[#120a1f] border border-[#3b1d5c] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-purple-300">
                  SYNCHRONIZE DIVER BRAINWAVE HARMONICS (DELTA: {targetDelta}%, THETA: {targetTheta}%, ALPHA: {targetAlpha}% ±{neuralTolerance}%):
                </span>
                <p className="text-[10px] font-bold text-amber-300">
                  {isNeuralHarmonicLocked
                    ? 'NEURAL HARMONIC COHERENCE 100% — LOCK SYNAPSE TO PURGE CORRUPTION'
                    : 'SYNAPTIC OSCILLATION VOLATILE — ADJUST SIPHON BANDS'}
                </p>
              </div>

              {/* Animated Brainwave Scope */}
              <div className="bg-[#08050e] border border-[#2b1744] p-2.5 rounded h-28 relative overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 400 100">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#3b1d5c" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="100" y1="0" x2="100" y2="100" stroke="#221035" strokeWidth="1" />
                  <line x1="200" y1="0" x2="200" y2="100" stroke="#221035" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="100" stroke="#221035" strokeWidth="1" />

                  {/* Target Golden Coherence Waveform */}
                  <path
                    d={`M 0 50 Q 50 ${50 - targetDelta * 0.45} 100 50 T 200 50 T 300 50 T 400 50`}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.8"
                    strokeDasharray="5 3"
                    opacity="0.75"
                  />

                  {/* Diver's Current Neural Waveform */}
                  <path
                    d={`M 0 50 Q 50 ${50 - deltaBand * 0.45} 100 50 Q 150 ${50 + thetaBand * 0.35} 200 50 Q 250 ${50 - alphaBand * 0.4} 300 50 T 400 50`}
                    fill="none"
                    stroke={isNeuralHarmonicLocked ? '#34d399' : '#c084fc'}
                    strokeWidth="2.5"
                    className="filter drop-shadow-[0_0_8px_#c084fc]"
                  />
                </svg>
                <div className="absolute top-1 right-2 text-[9px] font-mono text-purple-300 bg-black/60 px-1 rounded">
                  {isNeuralHarmonicLocked ? '✓ COHERENCE SYNCHRONIZED' : '⚡ PHASE DESYNCHRONIZED'}
                </div>
              </div>

              {/* Sliders for 3 Bands */}
              <div className="space-y-2.5">
                {/* Delta */}
                <div className="bg-[#140b24] p-2 rounded border border-[#2d164f] flex items-center gap-2">
                  <div className="w-24">
                    <b className="text-[10px] text-purple-300 block">DELTA WAVE</b>
                    <span className="text-[8px] text-[#8e76ad]">Target: {targetDelta}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={deltaBand}
                    onChange={e => {
                      setDeltaBand(Number(e.target.value));
                      audio.playWaveformTunePing(180 + Number(e.target.value) * 2);
                    }}
                    className="flex-1 accent-purple-400 cursor-pointer h-1.5 bg-[#251340] rounded"
                  />
                  <span className={`w-12 text-right font-mono text-[10px] font-bold ${isDeltaAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {deltaBand}% {isDeltaAligned ? '✓' : ''}
                  </span>
                </div>

                {/* Theta */}
                <div className="bg-[#140b24] p-2 rounded border border-[#2d164f] flex items-center gap-2">
                  <div className="w-24">
                    <b className="text-[10px] text-purple-300 block">THETA DAMPENER</b>
                    <span className="text-[8px] text-[#8e76ad]">Target: {targetTheta}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={thetaBand}
                    onChange={e => {
                      setThetaBand(Number(e.target.value));
                      audio.playWaveformTunePing(260 + Number(e.target.value) * 2);
                    }}
                    className="flex-1 accent-purple-400 cursor-pointer h-1.5 bg-[#251340] rounded"
                  />
                  <span className={`w-12 text-right font-mono text-[10px] font-bold ${isThetaAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {thetaBand}% {isThetaAligned ? '✓' : ''}
                  </span>
                </div>

                {/* Alpha */}
                <div className="bg-[#140b24] p-2 rounded border border-[#2d164f] flex items-center gap-2">
                  <div className="w-24">
                    <b className="text-[10px] text-purple-300 block">ALPHA RESONANCE</b>
                    <span className="text-[8px] text-[#8e76ad]">Target: {targetAlpha}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alphaBand}
                    onChange={e => {
                      setAlphaBand(Number(e.target.value));
                      audio.playWaveformTunePing(340 + Number(e.target.value) * 2);
                    }}
                    className="flex-1 accent-purple-400 cursor-pointer h-1.5 bg-[#251340] rounded"
                  />
                  <span className={`w-12 text-right font-mono text-[10px] font-bold ${isAlphaAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {alphaBand}% {isAlphaAligned ? '✓' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={handleNeuralSubmit}
                disabled={!isNeuralHarmonicLocked}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 disabled:opacity-30 text-white font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {isNeuralHarmonicLocked ? 'ENGAGE BIO-SIPHON // RESTORE COHERENCE' : 'ALIGN BRAINWAVE HARMONICS'}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 15. CRYO-STASIS COOLANT MANIFOLD */}
          {/* ========================================================= */}
          {puzzleType === 'cryo_coolant_manifold' && (
            <div className="space-y-4">
              <div className="bg-[#0b1424] border border-[#1b345b] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-cyan-300">
                  EQUILIBRATE ALL 4 CRYOGENIC COOLANT PIPELINES TO TARGET THRESHOLDS (±{cryoTolerance}°C):
                </span>
                <p className="text-[10px] font-bold text-amber-300">
                  {isCryoManifoldStable
                    ? 'ALL LINES CRYO-STABILIZED — PURGE THERMAL OVERFLOW'
                    : 'THERMAL RUNAWAY IMMINENT // STABILIZE PRESSURIZED REFRIGERANTS'}
                </p>
              </div>

              {/* 4 Pipeline Gauges */}
              <div className="grid grid-cols-2 gap-2.5">
                {cryoTemps.map((temp, idx) => {
                  const target = targetCryoTemps[idx];
                  const isStable = Math.abs(temp - target) <= cryoTolerance;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border flex flex-col justify-between transition ${
                        isStable
                          ? 'bg-[#0e242b] border-emerald-500 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'bg-[#0a1020] border-[#1d2d50] text-[#90a5cf]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <b className="truncate text-cyan-300">{cryoLabels[idx]}</b>
                        <span className="text-[9px] text-[#7187ad]">GOAL: {target}°C</span>
                      </div>

                      <div className="text-center my-2">
                        <span className={`text-xl font-mono font-black ${isStable ? 'text-emerald-300' : 'text-cyan-400'}`}>
                          {temp}°C
                        </span>
                        <span className="block text-[8px] uppercase tracking-wider font-bold">
                          {isStable ? 'STABILIZED ✓' : `${Math.abs(temp - target)}°C VARIANCE`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleCryoTempAdjust(idx, -5)}
                          className="flex-1 py-1 bg-[#131c33] hover:bg-cyan-950 text-cyan-300 rounded font-bold text-[9px] cursor-pointer"
                        >
                          COOL -5°C
                        </button>
                        <button
                          onClick={() => handleCryoTempAdjust(idx, +5)}
                          className="flex-1 py-1 bg-[#131c33] hover:bg-red-950 text-red-300 rounded font-bold text-[9px] cursor-pointer"
                        >
                          WARM +5°C
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleCryoSubmit}
                disabled={!isCryoManifoldStable}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {isCryoManifoldStable ? 'SEAL COOLANT MANIFOLD // PREVENT RUPTURE' : 'ADJUST CRYOGENIC LINES TO EQUILIBRIUM'}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 16. OPTIC PRISM ALIGNMENT */}
          {/* ========================================================= */}
          {puzzleType === 'optic_prism_align' && (
            <div className="space-y-4">
              <div className="bg-[#0b1424] border border-[#1b345b] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-cyan-300">
                  ROTATE 3 QUARTZ PRISMS TO DEFLECT ULTRAVIOLET BEAM TO RECEPTOR:
                </span>
                <p className="text-[10px] font-bold text-amber-300">
                  {isPrismAligned
                    ? 'BEAM PATH LOCKED ON TARGET PHOTOELECTRIC SENSOR ✓'
                    : 'BEAM SCATTERED // ROTATE PRISMS IN 45° INCREMENTS'}
                </p>
              </div>

              {/* Laser Path Diagnostic Canvas */}
              <div className="bg-[#080d1a] border border-[#1a2948] p-3 rounded flex items-center justify-between text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-[#7185ad]">EMITTER</span>
                  <span className="text-xs text-purple-400 font-bold animate-pulse">⚡ UV 365nm</span>
                </div>
                <div className="flex-1 mx-2 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 relative">
                  <div className={`absolute -top-1 w-3 h-3 rounded-full transition-all ${isPrismAligned ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] right-0' : 'bg-purple-400 left-1/4'}`} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-[#7185ad]">RECEPTOR</span>
                  <span className={`text-xs font-bold ${isPrismAligned ? 'text-emerald-400 animate-pulse' : 'text-[#556588]'}`}>
                    {isPrismAligned ? 'LOCKED ✓' : 'DARK ✕'}
                  </span>
                </div>
              </div>

              {/* 3 Prisms Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {prismAngles.map((angle, idx) => {
                  const target = targetPrismAngles[idx];
                  const isMatch = angle === target;
                  const labels = ['PRISM α', 'PRISM β', 'PRISM γ'];

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border flex flex-col items-center justify-between transition ${
                        isMatch
                          ? 'bg-[#0a2321] border-emerald-500 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'bg-[#0a1020] border-[#1d2d50] text-[#90a5cf]'
                      }`}
                    >
                      <b className="text-[10px] text-cyan-300">{labels[idx]}</b>
                      
                      {/* SVG Prism Graphic */}
                      <svg viewBox="0 0 60 60" className="w-12 h-12 my-2 transition-transform duration-300" style={{ transform: `rotate(${angle}deg)` }}>
                        <polygon points="30,8 54,50 6,50" fill={isMatch ? "#059669" : "#1e293b"} stroke={isMatch ? "#34d399" : "#38bdf8"} strokeWidth="2.5" />
                        <line x1="30" y1="20" x2="30" y2="40" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2 2" />
                      </svg>

                      <span className="text-xs font-mono font-bold text-white mb-2">{angle}°</span>

                      <button
                        onClick={() => handleRotatePrism(idx)}
                        className="w-full py-1.5 bg-[#151f38] hover:bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-bold text-[9px] cursor-pointer"
                      >
                        ROTATE +45°
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handlePrismSubmit}
                disabled={!isPrismAligned}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 disabled:opacity-30 text-white font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {isPrismAligned ? 'CONFIRM REFRACTIVE LOCK // DISCHARGE LASER' : 'ALIGN ALL 3 PRISMS TO REFLECTION VECTOR'}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 17. SONAR ECHO TRIANGULATION */}
          {/* ========================================================= */}
          {puzzleType === 'sonar_echo_triangulate' && (
            <div className="space-y-4">
              <div className="bg-[#0b1424] border border-[#1b345b] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-cyan-300">
                  TRIANGULATE SEISMIC ANOMALY (AZIMUTH ~{targetAzimuth}°, DELAY ~{targetDelay}ms):
                </span>
                <p className="text-[10px] font-bold text-amber-300">
                  {isSonarTriangulated
                    ? 'ACOUSTIC BEARING AND TIME-OF-FLIGHT SYNCHRONIZED ✓'
                    : 'CALIBRATING HYDROPHONE PHASE DELAY AND AZIMUTH ANGLE'}
                </p>
              </div>

              {/* Radar Compass Display */}
              <div className="relative w-44 h-44 mx-auto rounded-full border-2 border-cyan-800 bg-[#040814] flex items-center justify-center overflow-hidden shadow-inner">
                {/* Crosshairs */}
                <line x1="0" y1="88" x2="176" y2="88" stroke="#164e63" strokeWidth="1" />
                <line x1="88" y1="0" x2="88" y2="176" stroke="#164e63" strokeWidth="1" />
                <circle cx="88" cy="88" r="60" fill="none" stroke="#155e75" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="88" cy="88" r="30" fill="none" stroke="#155e75" strokeWidth="1" strokeDasharray="2 2" />

                {/* Sweeping Sonar Beam */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: '4s' }} />

                {/* Hydrophone Target Blip */}
                <div
                  className={`absolute w-3.5 h-3.5 rounded-full transition-all ${
                    isSonarTriangulated
                      ? 'bg-emerald-400 shadow-[0_0_12px_#10b981] animate-ping'
                      : 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse'
                  }`}
                  style={{
                    left: `${88 + Math.cos((sonarAzimuth - 90) * (Math.PI / 180)) * (sonarDelayMs * 0.35)}px`,
                    top: `${88 + Math.sin((sonarAzimuth - 90) * (Math.PI / 180)) * (sonarDelayMs * 0.35)}px`
                  }}
                />
              </div>

              {/* Sliders / Controls */}
              <div className="space-y-3 bg-[#0a1020] border border-[#1d2d50] p-3 rounded">
                <div>
                  <div className="flex justify-between text-[10px] text-cyan-300 font-bold mb-1">
                    <span>AZIMUTH ANGLE: {sonarAzimuth}°</span>
                    <span className={isAzimuthAligned ? 'text-emerald-400' : 'text-amber-400'}>
                      {isAzimuthAligned ? 'LOCKED ✓' : 'SEEKING'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={sonarAzimuth}
                    onChange={e => {
                      triggerHaptic(4);
                      setSonarAzimuth(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-cyan-300 font-bold mb-1">
                    <span>DELAY TIME-OF-FLIGHT: {sonarDelayMs} ms</span>
                    <span className={isDelayAligned ? 'text-emerald-400' : 'text-amber-400'}>
                      {isDelayAligned ? 'LOCKED ✓' : 'CALIBRATING'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="260"
                    value={sonarDelayMs}
                    onChange={e => {
                      triggerHaptic(4);
                      setSonarDelayMs(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleSonarTriangulateSubmit}
                disabled={!isSonarTriangulated}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {isSonarTriangulated ? 'LOCK HYDROPHONE BEARING // RESOLVE TARGET' : 'SYNCHRONIZE AZIMUTH & DELAY'}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 18. BIOCHEMICAL ANTIDOTE TITRATION */}
          {/* ========================================================= */}
          {puzzleType === 'biochemical_antidote_titration' && (
            <div className="space-y-4">
              <div className="bg-[#0b1424] border border-[#1b345b] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-cyan-300">
                  TITRATE STABILIZING BRINE TO PHYSIOLOGICAL EQUILIBRIUM ({targetPh} pH ±{phTolerance}):
                </span>
                <p className="text-[10px] font-bold text-amber-300">
                  {isPhBalanced
                    ? 'SOLUTION NEUTRALIZED // CELLULAR HEMOGLOBIN STABLE ✓'
                    : currentPh > targetPh
                    ? 'ALKALINE TOXICITY // INJECT ACIDIC BUFFER'
                    : 'ACIDIC ACIDOSIS // INJECT ALKALINE BASE'}
                </p>
              </div>

              {/* Chemical Beaker Flask Visualizer */}
              <div className="bg-[#080d1a] border border-[#1a2948] p-4 rounded flex items-center justify-around">
                <div className="w-20 h-28 border-2 border-white/20 rounded-b-xl flex flex-col justify-end p-1 relative overflow-hidden bg-black/40">
                  <div
                    className={`w-full transition-all duration-300 rounded-b-lg ${
                      isPhBalanced
                        ? 'bg-emerald-500/80 shadow-[0_0_15px_#10b981]'
                        : currentPh > targetPh
                        ? 'bg-cyan-500/80'
                        : 'bg-red-500/80'
                    }`}
                    style={{ height: `${Math.min(100, (currentPh / 14) * 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-white drop-shadow">
                    {currentPh} pH
                  </div>
                </div>

                <div className="text-left space-y-1 text-[11px]">
                  <div className="text-[#8997bd]">TARGET pH: <b className="text-emerald-400">{targetPh} pH</b></div>
                  <div className="text-[#8997bd]">CURRENT: <b className={isPhBalanced ? 'text-emerald-400' : 'text-red-400'}>{currentPh} pH</b></div>
                  <div className="text-[10px] font-mono font-bold">
                    {isPhBalanced ? (
                      <span className="text-emerald-300">EQUILIBRATED ✓</span>
                    ) : (
                      <span className="text-amber-400">VARIANCE: {Math.abs(currentPh - targetPh).toFixed(2)} pH</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pipette Dispenser Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAdjustPh(-0.40)}
                  className="py-2 bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-300 rounded font-bold text-[10px] cursor-pointer"
                >
                  🧪 +ACID (-0.40)
                </button>
                <button
                  onClick={() => handleAdjustPh(currentPh > targetPh ? -0.10 : +0.10)}
                  className="py-2 bg-purple-950/70 hover:bg-purple-900 border border-purple-700 text-purple-300 rounded font-bold text-[10px] cursor-pointer"
                >
                  ⚖️ BUFFER (±0.10)
                </button>
                <button
                  onClick={() => handleAdjustPh(+0.40)}
                  className="py-2 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 rounded font-bold text-[10px] cursor-pointer"
                >
                  💧 +BASE (+0.40)
                </button>
              </div>

              <button
                onClick={handleTitrationSubmit}
                disabled={!isPhBalanced}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {isPhBalanced ? 'INJECT STABILIZED ANTIDOTE // PURGE NARCOSIS' : 'TITRATE BRINE TO EQUILIBRIUM'}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 19. SUBSEA MULTI-CONDUCTOR PATCH ROUTER */}
          {/* ========================================================= */}
          {puzzleType === 'subsea_cable_patch' && (
            <div className="space-y-4">
              <div className="bg-[#0b1424] border border-[#1b345b] rounded p-3 text-center space-y-1">
                <span className="text-[11px] text-cyan-300">
                  CONNECT 4 TELEMETRY BUS CONDUCTORS TO CORRESPONDING SYSTEM TERMINALS:
                </span>
                <p className="text-[10px] font-bold text-amber-300">
                  {isPatchBayComplete
                    ? 'ALL CIRCUITS PATCHED WITH ZERO PHASE IMPEDANCE ✓'
                    : 'SELECT CABLE THEN SELECT DESTINATION TERMINAL'}
                </p>
              </div>

              {/* Patch Matrix Board */}
              <div className="grid grid-cols-2 gap-3 bg-[#080d1a] border border-[#1a2948] p-3 rounded">
                {/* Left: Input Cables */}
                <div className="space-y-2">
                  <span className="text-[9px] text-[#7185ad] font-bold uppercase block">1. BUS CHANNELS</span>
                  {[
                    { id: 'power_440v', label: 'POWER 440V', color: 'border-red-500 text-red-300 bg-red-950/40' },
                    { id: 'sonar_data', label: 'SONAR DATA', color: 'border-cyan-500 text-cyan-300 bg-cyan-950/40' },
                    { id: 'oxygen_sensor', label: 'O2 SENSOR', color: 'border-amber-500 text-amber-300 bg-amber-950/40' },
                    { id: 'neural_damper', label: 'NEURAL DAMP', color: 'border-purple-500 text-purple-300 bg-purple-950/40' }
                  ].map(c => {
                    const isSelected = selectedCable === c.id;
                    const connectedSocket = cablePatches[c.id];

                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          triggerHaptic(8);
                          audio.playClick();
                          setSelectedCable(c.id);
                        }}
                        className={`w-full p-2 rounded border text-left text-[10px] font-bold transition flex items-center justify-between cursor-pointer ${
                          isSelected ? 'ring-2 ring-white ' + c.color : c.color
                        }`}
                      >
                        <span>{c.label}</span>
                        <span className="text-[8px] opacity-80">
                          {connectedSocket ? `→ ${connectedSocket.replace('socket_', 'PORT ').toUpperCase()}` : 'UNPATCHED'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right: Sockets */}
                <div className="space-y-2">
                  <span className="text-[9px] text-[#7185ad] font-bold uppercase block">2. RECEIVER SOCKETS</span>
                  {[
                    { id: 'socket_a', label: 'PORT A [LIFE SUPPORT]' },
                    { id: 'socket_b', label: 'PORT B [HYDRAULICS]' },
                    { id: 'socket_c', label: 'PORT C [PSYCHIC SHIELD]' },
                    { id: 'socket_d', label: 'PORT D [SONAR ARRAY]' }
                  ].map(s => {
                    const mappedCable = Object.keys(cablePatches).find(k => cablePatches[k] === s.id);
                    const isCorrect = correctCableMapping[mappedCable || ''] === s.id;

                    return (
                      <button
                        key={s.id}
                        onClick={() => handleConnectCable(s.id)}
                        disabled={!selectedCable}
                        className={`w-full p-2 rounded border text-left text-[10px] font-bold transition flex items-center justify-between cursor-pointer ${
                          mappedCable
                            ? isCorrect
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                              : 'bg-red-950/60 border-red-500 text-red-300'
                            : 'bg-[#12182c] border-[#253258] text-[#8ea0cc] hover:border-cyan-400'
                        }`}
                      >
                        <span className="truncate">{s.label}</span>
                        <span className="text-[8px] font-mono">
                          {mappedCable ? (isCorrect ? '✓' : '✕') : 'OPEN'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handlePatchSubmit}
                disabled={!isPatchBayComplete}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-30 text-black font-black rounded uppercase tracking-wider transition cursor-pointer shadow-lg"
              >
                {isPatchBayComplete ? 'ENERGIZE TELEMETRY BUS // SECURE CIRCUITS' : 'ROUTE ALL 4 CONDUCTORS TO TARGET PORTS'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
