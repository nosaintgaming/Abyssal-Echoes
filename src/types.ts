export type DifficultyId = 'easy' | 'hard' | 'extreme' | 'nightmare' | 'endless';
export type ScreenId = 'boot' | 'menu' | 'sectors' | 'game' | 'death' | 'ending';
export type MapTier = 'STANDARD' | 'SECRET' | 'OMEGA' | 'VOID' | 'ABYSS';
export type TerminalTheme = 'classic' | 'amber' | 'emerald' | 'cyan' | 'crimson';

export interface MapData {
  id: number;
  name: string;
  tier: MapTier;
  depth: number;
  desc: string;
  hazards: string[];
}

export type PuzzleType =
  | 'keypad'
  | 'power_grid'
  | 'airlock'
  | 'cipher'
  | 'sonar_frequency'
  | 'reactor_valves'
  | 'circuit_breaker'
  | 'hydroacoustic_waveform'
  | 'decontamination_valves'
  | 'quantum_sequence'
  | 'spectrogram_frequency'
  | 'pressure_depth_regulator'
  | 'containment_laser_grid'
  | 'biometric_neural_siphon'
  | 'cryo_coolant_manifold'
  | 'optic_prism_align'
  | 'sonar_echo_triangulate'
  | 'biochemical_antidote_titration'
  | 'subsea_cable_patch';

export interface ScenarioOption {
  text: string;
  isLoud?: boolean;
  s: number; // Sanity change
  c: number; // Corruption change
  sc: number; // Score gain
  itemReq?: string;
  itemConsume?: boolean;
  itemGain?: string;
  leadsToPuzzle?: PuzzleType;
  survivorFound?: string; // ID of survivor rescued or discovered
  survivorRescueText?: string;
}

export interface Scenario {
  id: string;
  title: string;
  desc: string;
  puzzleType?: PuzzleType;
  timerSeconds?: number;
  radioBroadcast?: boolean;
  survivorEncounter?: {
    id: string;
    name: string;
    role: string;
  };
  options: ScenarioOption[];
}

export type SurvivorNoteTag = 'general' | 'code' | 'entity' | 'survivor' | 'frequency';

export interface SurvivorNote {
  id: string;
  chamber: number;
  depth: string;
  timestamp: string;
  text: string;
  tag: SurvivorNoteTag;
}

export interface VoidEventData {
  active: boolean;
  chamber: number;
  depth: string;
  escapeCode: string;
  anomalyTitle: string;
  diagnosticDump: string[];
  attempts: number;
  clueHint: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  desc: string;
  rarity: 'common' | 'rare' | 'crafted' | 'secret';
  usable?: boolean;
  sanityHeal?: number;
  corruptionReduce?: number;
  isTraderItem?: boolean;
  volatileSuccessRate?: number;
  backfireDamage?: {
    sanity: number;
    corruption: number;
    threat: number;
  };
}

export interface CraftingRecipe {
  itemA: string;
  itemB: string;
  resultId: string;
  name: string;
  desc: string;
}

export interface Survivor {
  id: string;
  name: string;
  role: string;
  loyalty: number;
  status: 'alive' | 'injured' | 'compromised';
  lore: string;
  discovered?: boolean;
  sectorHint?: string;
  perk?: string;
  assignedRole?:
    | 'tactician'
    | 'medic'
    | 'engineer'
    | 'scout'
    | 'salvager'
    | 'cryptographer'
    | 'occultist'
    | 'submariner'
    | 'hydrochemist'
    | 'fabricator'
    | 'theologian';
  roleBonus?: string;
  metaAwareness?: string;
  existentialDoubt?: string;
  trade: {
    want: string;
    give: string;
  };
}

export interface EntityInfo {
  id: string;
  name: string;
  entityRole?: string;
  threatLevel: string;
  skullRating: number;
  classification: string;
  depthOrigin: string;
  casualtyRecord: string;
  counter: string;
  lore: string;
  biologicalNotes: string;
  line: string;
  visualTrait: string;
  frequencyHz: number;
  selfAwareLine?: string;
  simulationAnomaly?: string;
  roleTactics?: string;
  adaptiveBehaviors?: string;
  movementReaction?: string;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  condition: string;
  isSecret?: boolean;
}

export interface DailyMission {
  id: string;
  name: string;
  desc: string;
  goal: number;
  progress: number;
  done: boolean;
  secret: string;
  secretDone: boolean;
  reward: string;
  rewardItemId?: string;
  rewardClaimed?: boolean;
}

export interface DailyData {
  date: string;
  modifier: string;
  missions: DailyMission[];
  completed: boolean;
  streak: number;
  bestStreak: number;
  totalCompleted: number;
}

export interface DeathLog {
  id: string;
  date: string;
  mapName: string;
  chamber: number;
  difficulty: DifficultyId;
  sanity: number;
  corruption: number;
  entity: string;
  score: number;
}

export interface PlayerStats {
  runs: number;
  wins: number;
  chambers: number;
  choices: number;
  crafts: number;
  trades: number;
  highestDepth: number;
  deaths: number;
  nightmareWins: number;
}

export interface GameState {
  screen: ScreenId;
  difficulty: DifficultyId;
  language: string;
  mapId: number;
  mapName: string;
  mapTier: MapTier;
  chamber: number;
  maxChambers: number;
  sanity: number;
  corruption: number;
  score: number;
  highScore: number;
  inventory: string[];
  deaths: number;
  omegaFragments: string[];
  radioFreq: number;
  threatMeter: number;
  revives: number;
  activeEntity: string | null;
  logs: string[];
  
  // Accessibility & UX Settings
  crtEnabled: boolean;
  crtTheme: TerminalTheme;
  hapticsEnabled: boolean;
  fullscreen: boolean;
  reducedMotion: boolean;
  volume: number;
  musicVolume: number;
  musicMuted: boolean;

  // Horror & Psychological Terror Settings
  horrorIntensity: 'eerie' | 'terrifying' | 'nightmare';
  jumpscaresEnabled: boolean;
  hallucinationsEnabled: boolean;
  whispersEnabled: boolean;
  stalkerDistanceMeters?: number;
  isPanicking?: boolean;
  
  // Meta
  achievements: string[];
  unlockedMaps: number[];
  stats: PlayerStats;
  deathArchive: DeathLog[];
  daily: DailyData;
  isDailyRun: boolean;
  dailyRunChoices?: number;
  dailyConsumablesUsed?: number;
  isCustomRun: boolean;
  unlockedDifficulties: DifficultyId[];
  chambersInSector: number;
  stalkerAlert: string | null;
  discoveredSurvivors: string[];
  assignedSurvivorRoles?: Record<string, string>;
  traderEncounteredInSector?: number;
  traderLurking?: boolean;
  survivorNotes: SurvivorNote[];
  voidEvent: VoidEventData | null;
  rushModeHighScore?: number;
  rushModeSecretsUnlocked?: string[];
  stolenItemsByScavenger?: string[];
  secretEntityDiscovered?: boolean;
  customDescentConfig?: {
    title: string;
    synopsis: string;
    stages: number;
    startingSanity: number;
    startingRevives: number;
    stalkerEntity: string;
  };
}
