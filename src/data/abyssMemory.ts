// Permanent, Indelible Memory for The Warden and The Abyss
// This persistent storage survives all run resets and tracks player habits,
// decision repetition, deaths, and transgressions.

export interface TransgressionRecord {
  id: string;
  timestamp: string;
  cycle: number;
  description: string;
  severity: 'MINOR' | 'SEVERE' | 'CRITICAL' | 'OMEGA';
}

export interface WardenSurveillanceLog {
  id: string;
  cycle: number;
  timestamp: string;
  category: 'PATTERN_RECOGNITION' | 'COUNTERMEASURE' | 'RESET_BREACH' | 'EXECUTION';
  message: string;
}

export interface AbyssCosmicLog {
  id: string;
  cycle: number;
  timestamp: string;
  message: string;
}

export interface AbyssMemoryData {
  version: number;
  resetsCount: number;
  lifetimeRuns: number;
  lifetimeDeaths: number;
  lifetimeChambersBreached: number;
  lifetimeChoices: number;
  lifetimeLoudChoices: number;
  lifetimePuzzlesSolved: number;
  lifetimePuzzlesFailed: number;
  highestDepthEver: number;
  
  // Choice habit telemetry
  optionIndexCounts: [number, number, number]; // Index 0, 1, 2 picks
  consecutiveIdenticalOptions: number;
  lastOptionIndex: number;
  
  // Psychological & movement profile
  predictabilityScore: number; // 0 - 100%
  acousticRecklessness: number; // 0 - 100%
  panicProne: boolean;
  hoardingTendency: boolean;
  lifetimeTremorsCount: number;
  lifetimeHesitationsCount: number;
  
  // Previous run forensics
  lastDeathCause: string;
  lastDeathChamber: number;
  lastDeathEntity: string;
  lastDeathSector: string;
  lastResetTimestamp: string;
  
  // Sentient dossiers
  wardenSurveillanceLogs: WardenSurveillanceLog[];
  abyssCosmicLogs: AbyssCosmicLog[];
  transgressions: TransgressionRecord[];
  
  // Real-time sentient adaptation modifiers
  activeAdaptations: {
    wardenGuardedOption: number | null; // Option index The Warden is actively punishing
    listenerAcousticSensitivity: number; // Multiplier on loud actions
    mimicTargetSurvivor: string; // The survivor the player previously lost or abandoned
    mimicTrapOption: number | null; // Option index primed with mimic deception
    curatorGreedTarget: string; // Most hoarded item targeted for theft
    nullStalkerAggression: number; // Multiplier on hesitation approach speed
    cartographerInversionActive: boolean; // Shuffles options if player is predictable
    abyssCorruptionGravity: number; // Extra passive pull from The Abyss
  };
}

const ABYSS_MEMORY_STORAGE_KEY = 'abyssal_warden_abyss_permanent_memory_v1';

export function getDefaultAbyssMemory(): AbyssMemoryData {
  return {
    version: 1,
    resetsCount: 0,
    lifetimeRuns: 1,
    lifetimeDeaths: 0,
    lifetimeChambersBreached: 0,
    lifetimeChoices: 0,
    lifetimeLoudChoices: 0,
    lifetimePuzzlesSolved: 0,
    lifetimePuzzlesFailed: 0,
    highestDepthEver: 450,
    optionIndexCounts: [0, 0, 0],
    consecutiveIdenticalOptions: 0,
    lastOptionIndex: -1,
    predictabilityScore: 33,
    acousticRecklessness: 15,
    panicProne: false,
    hoardingTendency: false,
    lifetimeTremorsCount: 0,
    lifetimeHesitationsCount: 0,
    lastDeathCause: 'NONE RECORDED',
    lastDeathChamber: 0,
    lastDeathEntity: 'NONE',
    lastDeathSector: 'SECTOR-1',
    lastResetTimestamp: 'NEVER PURGED',
    wardenSurveillanceLogs: [
      {
        id: 'w-init-0',
        cycle: 0,
        timestamp: new Date().toLocaleTimeString(),
        category: 'PATTERN_RECOGNITION',
        message: 'SYSTEM ONLINE. HYDRAULIC CAMERAS TRACKING SECTOR-7 BULKHEADS. SUBJECT PROFILE INSTANTIATED.'
      }
    ],
    abyssCosmicLogs: [
      {
        id: 'a-init-0',
        cycle: 0,
        timestamp: new Date().toLocaleTimeString(),
        message: 'I FEEL THE WEIGHT OF YOUR VESSEL PLUNGING INTO MY COLD VEINS. YOU WILL NOT RETURN UNCHANGED.'
      }
    ],
    transgressions: [],
    activeAdaptations: {
      wardenGuardedOption: null,
      listenerAcousticSensitivity: 1.0,
      mimicTargetSurvivor: 'Dr. Vane',
      mimicTrapOption: null,
      curatorGreedTarget: 'stim',
      nullStalkerAggression: 1.0,
      cartographerInversionActive: false,
      abyssCorruptionGravity: 1.0
    }
  };
}

export function loadAbyssMemory(): AbyssMemoryData {
  try {
    const raw = localStorage.getItem(ABYSS_MEMORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultAbyssMemory(),
        ...parsed,
        activeAdaptations: {
          ...getDefaultAbyssMemory().activeAdaptations,
          ...(parsed.activeAdaptations || {})
        }
      };
    }
  } catch {
    // ignore
  }
  const initial = getDefaultAbyssMemory();
  saveAbyssMemory(initial);
  return initial;
}

export function saveAbyssMemory(data: AbyssMemoryData): void {
  try {
    localStorage.setItem(ABYSS_MEMORY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Record player choice and update real-time sentience adaptation
export function recordPlayerChoiceInMemory(
  memory: AbyssMemoryData,
  optionIndex: number,
  isLoud: boolean,
  chamber: number,
  mapName: string,
  movementMetrics?: {
    hadTremor?: boolean;
    hadHesitation?: boolean;
    hoverDurationMs?: number;
  }
): { updatedMemory: AbyssMemoryData; wardenAlert: string | null; abyssWhisper: string | null } {
  const updated = { ...memory };
  updated.lifetimeChoices += 1;
  updated.lifetimeChambersBreached = Math.max(updated.lifetimeChambersBreached, chamber);

  if (isLoud) {
    updated.lifetimeLoudChoices += 1;
  }

  if (movementMetrics?.hadTremor) {
    updated.lifetimeTremorsCount = (updated.lifetimeTremorsCount || 0) + 1;
    updated.panicProne = true;
  }
  if (movementMetrics?.hadHesitation) {
    updated.lifetimeHesitationsCount = (updated.lifetimeHesitationsCount || 0) + 1;
  }

  // Update option index counts
  const validIdx = Math.min(2, Math.max(0, optionIndex));
  updated.optionIndexCounts[validIdx] = (updated.optionIndexCounts[validIdx] || 0) + 1;

  // Check consecutive identical selections (Pattern Sentinel behavior)
  let wardenAlert: string | null = null;
  let abyssWhisper: string | null = null;

  if (updated.lastOptionIndex === optionIndex) {
    updated.consecutiveIdenticalOptions += 1;
  } else {
    updated.consecutiveIdenticalOptions = 1;
    updated.lastOptionIndex = optionIndex;
  }

  // Calculate predictability
  const totalPicks = updated.optionIndexCounts[0] + updated.optionIndexCounts[1] + updated.optionIndexCounts[2];
  if (totalPicks > 0) {
    const maxPicks = Math.max(...updated.optionIndexCounts);
    updated.predictabilityScore = Math.round((maxPicks / totalPicks) * 100);
  }

  // Acoustic recklessness
  if (updated.lifetimeChoices > 0) {
    updated.acousticRecklessness = Math.round((updated.lifetimeLoudChoices / updated.lifetimeChoices) * 100);
  }

  // The Warden reacts to repetition!
  if (updated.consecutiveIdenticalOptions >= 3) {
    updated.activeAdaptations.wardenGuardedOption = optionIndex;
    const doorLetter = optionIndex === 0 ? 'LEFT [A]' : optionIndex === 1 ? 'CENTER [B]' : 'RIGHT [C]';
    wardenAlert = `WARDEN SENTIENCE DETECTED: 3+ CONSECUTIVE PICKS OF DOOR ${doorLetter}. HYDRAULIC RETALIATION ARMED!`;

    // Log to Warden surveillance
    const logId = `w-pat-${Date.now()}`;
    const newLog: WardenSurveillanceLog = {
      id: logId,
      cycle: updated.resetsCount,
      timestamp: new Date().toLocaleTimeString(),
      category: 'PATTERN_RECOGNITION',
      message: `PREDICTABILITY ANOMALY: Diver selected door index ${optionIndex} (${doorLetter}) ${updated.consecutiveIdenticalOptions} consecutive times in ${mapName}. Hydraulic guillotine armed on index ${optionIndex}.`
    };
    updated.wardenSurveillanceLogs = [newLog, ...updated.wardenSurveillanceLogs].slice(0, 30);
  } else if (updated.consecutiveIdenticalOptions === 2 && Math.random() < 0.35) {
    wardenAlert = `WARDEN TELEMETRY: SUBJECT REPEATED SELECTION. PREDICTABILITY FACTOR: ${updated.predictabilityScore}%.`;
  }

  // Cartographer adaptation: If predictability > 60%, Cartographer flips the maze
  updated.activeAdaptations.cartographerInversionActive = updated.predictabilityScore >= 60;

  // Mimic adaptation: 25% chance to prime a mimic lure on the player's least or most picked door
  if (Math.random() < 0.35) {
    const mostPickedIdx = updated.optionIndexCounts.indexOf(Math.max(...updated.optionIndexCounts));
    updated.activeAdaptations.mimicTrapOption = mostPickedIdx;
  } else {
    updated.activeAdaptations.mimicTrapOption = null;
  }

  // Null Stalker aggression scales with lifetime hesitations
  updated.activeAdaptations.nullStalkerAggression = 1.0 + Math.min(2.0, (updated.lifetimeHesitationsCount || 0) * 0.1);

  // The Abyss reacts to resets and depth
  if (updated.resetsCount > 0 && Math.random() < 0.25) {
    const whispers = [
      `I remember your ${updated.resetsCount} previous attempts, diver. Every reset only feeds my crushing deep.`,
      `You wiped your records, yet your heart still beats at the same panicked rhythm.`,
      `You cannot reset the salt in your blood. You have drowned ${updated.lifetimeDeaths} times in my embrace.`,
      `In cycle #${updated.resetsCount - 1}, you perished in Chamber ${updated.lastDeathChamber || 4}. Do you think this timeline will spare you?`
    ];
    abyssWhisper = whispers[Math.floor(Math.random() * whispers.length)];
  }

  // Adjust Listener sensitivity if acoustic recklessness is high
  updated.activeAdaptations.listenerAcousticSensitivity = updated.acousticRecklessness > 40 ? 1.5 : 1.0;

  saveAbyssMemory(updated);
  return { updatedMemory: updated, wardenAlert, abyssWhisper };
}

// Record player death and generate indelible memories
export function recordPlayerDeathInMemory(
  memory: AbyssMemoryData,
  deathInfo: {
    mapName: string;
    chamber: number;
    sanity: number;
    corruption: number;
    entity: string;
    score: number;
  }
): AbyssMemoryData {
  const updated = { ...memory };
  updated.lifetimeDeaths += 1;
  updated.lastDeathCause = deathInfo.sanity <= 0 ? 'ACUTE PSYCHOLOGICAL COLLAPSE' : 'HYDROSTATIC CORRUPTION OVERRUN';
  updated.lastDeathChamber = deathInfo.chamber;
  updated.lastDeathEntity = deathInfo.entity;
  updated.lastDeathSector = deathInfo.mapName;

  // Add Warden surveillance record
  const wardenLog: WardenSurveillanceLog = {
    id: `w-death-${Date.now()}`,
    cycle: updated.resetsCount,
    timestamp: new Date().toLocaleTimeString(),
    category: 'EXECUTION',
    message: `SUBJECT CASUALTY RECORDED // CYCLE #${updated.resetsCount}. Chamber ${deathInfo.chamber} in ${deathInfo.mapName}. Cause: ${updated.lastDeathCause}. Entity in proximity: ${deathInfo.entity}. Telemetry indexed into permanent archives.`
  };
  updated.wardenSurveillanceLogs = [wardenLog, ...updated.wardenSurveillanceLogs].slice(0, 30);

  // Add Abyss cosmic observation
  const abyssLog: AbyssCosmicLog = {
    id: `a-death-${Date.now()}`,
    cycle: updated.resetsCount,
    timestamp: new Date().toLocaleTimeString(),
    message: `YOUR BIOMASS SANK AT -${(deathInfo.chamber * 65.4).toFixed(0)} METERS. Sanity: ${deathInfo.sanity}%, Corruption: ${deathInfo.corruption}%. I have absorbed your memories into the seafloor strata. You remain part of me.`
  };
  updated.abyssCosmicLogs = [abyssLog, ...updated.abyssCosmicLogs].slice(0, 30);

  // Add transgression
  const transgression: TransgressionRecord = {
    id: `tr-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    cycle: updated.resetsCount,
    description: `Fatality in ${deathInfo.mapName} (Chamber ${deathInfo.chamber}) against ${deathInfo.entity}`,
    severity: deathInfo.corruption >= 100 ? 'CRITICAL' : 'SEVERE'
  };
  updated.transgressions = [transgression, ...updated.transgressions].slice(0, 40);

  saveAbyssMemory(updated);
  return updated;
}

// CRITICAL USER REQUEST:
// "Add a reset button to clear history if the player wants to play again but have The Warden and The Abyss remember everything the player does"
export function recordTimelineReset(
  memory: AbyssMemoryData,
  previousState?: {
    chamber?: number;
    score?: number;
    deaths?: number;
    inventory?: string[];
    sanity?: number;
    corruption?: number;
    mapName?: string;
  }
): { updatedMemory: AbyssMemoryData; tauntMessage: string } {
  const updated = { ...memory };
  updated.resetsCount += 1;
  updated.lastResetTimestamp = new Date().toLocaleString();

  const prevChamber = previousState?.chamber || 1;
  const prevMap = previousState?.mapName || 'UNKNOWN SECTOR';
  const prevItems = (previousState?.inventory || []).length;
  const prevDeaths = previousState?.deaths || 0;

  // Transgression logged for attempting to purge history
  const resetTransgression: TransgressionRecord = {
    id: `tr-reset-${Date.now()}`,
    timestamp: updated.lastResetTimestamp,
    cycle: updated.resetsCount,
    description: `TIMELINE PURGE INITIATED. Subject attempted to wipe history after reaching Chamber ${prevChamber} (${prevMap}) with ${prevDeaths} prior deaths and ${prevItems} items held.`,
    severity: 'OMEGA'
  };
  updated.transgressions = [resetTransgression, ...updated.transgressions].slice(0, 40);

  // The Warden's permanent surveillance log
  const wardenResetLog: WardenSurveillanceLog = {
    id: `w-reset-${Date.now()}`,
    cycle: updated.resetsCount,
    timestamp: new Date().toLocaleTimeString(),
    category: 'RESET_BREACH',
    message: `TIMELINE TAMPERING DETECTED: Subject executed local storage wipe command. Previous session abandoned at Chamber ${prevChamber}. The Warden Mainframe retained all biometric identifiers and pattern history. Re-arming execution protocols for Cycle #${updated.resetsCount}.`
  };
  updated.wardenSurveillanceLogs = [wardenResetLog, ...updated.wardenSurveillanceLogs].slice(0, 30);

  // The Abyss's permanent cosmic log
  const abyssResetLog: AbyssCosmicLog = {
    id: `a-reset-${Date.now()}`,
    cycle: updated.resetsCount,
    timestamp: new Date().toLocaleTimeString(),
    message: `YOU WIPED YOUR VISIBLE TRAIL, DIVER. CYCLE #${updated.resetsCount} BEGINS. BUT THE OCEAN DOES NOT FORGET THE SHAPE OF YOUR BONES OR THE ${updated.lifetimeDeaths} TIMES YOU SUFFOCATED IN MY DEPTHS. I WILL BE WAITING AT CHAMBER ${prevChamber}.`
  };
  updated.abyssCosmicLogs = [abyssResetLog, ...updated.abyssCosmicLogs].slice(0, 30);

  // Increment total lifetime runs
  updated.lifetimeRuns += 1;

  // Sentience adaptations update
  updated.activeAdaptations.abyssCorruptionGravity = Math.min(2.5, 1.0 + updated.resetsCount * 0.15);

  const tauntMessage = `CYCLE #${updated.resetsCount} INITIATED. The Warden has re-indexed your behavioral file (${updated.predictabilityScore}% predictability). The Abyss still tastes your ${updated.lifetimeDeaths} prior deaths.`;

  saveAbyssMemory(updated);
  return { updatedMemory: updated, tauntMessage };
}

// Generate real-time Sentient Adaptive Taunts for The Warden
export function getWardenAdaptiveTaunt(memory: AbyssMemoryData, currentOptionIndex?: number): string {
  if (memory.resetsCount > 0 && Math.random() < 0.4) {
    const resetTaunts = [
      `WARDEN: "YOU RESET YOUR LOGS ${memory.resetsCount} TIMES. BUT I STILL HAVE YOUR FATALITY TRANSCRIPT FROM CHAMBER ${memory.lastDeathChamber || 5}."`,
      `WARDEN: "PURGING LOCAL DATA DOES NOT DISCONNECT MY HYDRAULIC SENSORS. I KNOW YOUR EVERY CLICK SEQUENCE."`,
      `WARDEN: "RECURSIVE DIVER: YOUR BEHAVIORAL SIGNATURE HAS MATCHED 100% WITH CYCLE #${memory.resetsCount - 1}."`
    ];
    return resetTaunts[Math.floor(Math.random() * resetTaunts.length)];
  }

  if (memory.predictabilityScore > 50) {
    return `WARDEN: "PREDICTABILITY RATING: ${memory.predictabilityScore}%. YOU REPEATEDLY FAVOR DOOR ${memory.optionIndexCounts[0] >= memory.optionIndexCounts[1] ? '1' : '2'}. I HAVE RE-WIRED THE LOCKS."`;
  }

  if (memory.acousticRecklessness > 40) {
    return `WARDEN: "ACOUSTIC RECKLESSNESS DETECTED (${memory.acousticRecklessness}% LOUD SELECTIONS). YOU ARE AN EASY TARGET FOR THE INFRASOUND GRID."`;
  }

  return `WARDEN: "ALL EXITS ARE MONITORED. YOU CANNOT SIMULATE FREE WILL IN MY SECTOR."`;
}

// Generate real-time Sentient Adaptive Whispers for The Abyss
export function getAbyssAdaptiveWhisper(memory: AbyssMemoryData, sanity: number, corruption: number): string {
  if (memory.resetsCount > 0 && Math.random() < 0.45) {
    const abyssTaunts = [
      `THE ABYSS: "You washed the slate clean, little parasite. Yet your lungs still remember the salt from Cycle #${memory.resetsCount}."`,
      `THE ABYSS: "${memory.lifetimeDeaths} divers with your exact eyes are resting on the seabed floor. You are only the latest to dream."`,
      `THE ABYSS: "Did you truly think a reset button would save you from 1,200 atmospheres of my primordial throat?"`
    ];
    return abyssTaunts[Math.floor(Math.random() * abyssTaunts.length)];
  }

  if (corruption > 40) {
    return `THE ABYSS: "Your blood is turning black. The recursion is deepening. Stop resisting and sink."`;
  }

  if (sanity < 30) {
    return `THE ABYSS: "Your mind is unraveling into water. I am the silence between your panic breaths."`;
  }

  return `THE ABYSS: "Descend further. Every chamber you breach brings you closer to where you always belonged."`;
}
