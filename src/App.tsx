import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GameState,
  DifficultyId,
  ScreenId,
  MapData,
  TerminalTheme,
  DailyData,
  PuzzleType,
  SurvivorNote,
  SurvivorNoteTag,
  VoidEventData,
  EntityInfo
} from './types';
import { SUPPORTED_LANGUAGES, translate, localizeScenario } from './data/i18n';
import { ATLAS_MAPS } from './data/maps';
import { SCENARIOS } from './data/scenarios';
import { SURVIVORS } from './data/survivors';
import { INVENTORY_ITEMS, CRAFTING_RECIPES } from './data/items';
import { ENTITIES } from './data/entities';
import { audio } from './audio/soundEngine';

// Components
import { HeaderBar } from './components/HeaderBar';
import { ChamberView } from './components/ChamberView';
import { HelpModal } from './components/HelpModal';
import { PauseModal } from './components/PauseModal';
import { PuzzlesModal } from './components/PuzzlesModal';
import { RadioModal } from './components/RadioModal';
import { InventoryModal } from './components/InventoryModal';
import { SurvivorModal } from './components/SurvivorModal';
import { EntitiesModal } from './components/EntitiesModal';
import { AtlasModal } from './components/AtlasModal';
import { DailyModal } from './components/DailyModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { SettingsModal } from './components/SettingsModal';
import { DifficultyModal } from './components/DifficultyModal';
import { CustomDescentModal, CustomDescentConfig } from './components/CustomDescentModal';
import { TraderModal, getTraderVolatileRate } from './components/TraderModal';
import { VoidEventTerminal } from './components/VoidEventTerminal';
import { RushModeModal } from './components/RushModeModal';
import { HorrorParanoiaOverlay } from './components/HorrorParanoiaOverlay';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SecretsCodexModal } from './components/SecretsCodexModal';
import { SectorEntityRushModal } from './components/SectorEntityRushModal';
import { LoadingScreen, LoadingMode } from './components/LoadingScreen';
import { AndroidSystemBar } from './components/AndroidSystemBar';
import { generateVoidEvent } from './data/voidEvents';
import {
  loadAbyssMemory,
  recordPlayerChoiceInMemory,
  recordPlayerDeathInMemory,
  recordTimelineReset,
  AbyssMemoryData
} from './data/abyssMemory';
import { useDailyCountdown } from './utils/countdown';
import {
  evaluateDailyMissions,
  resolveRewardItemId,
  getRewardItemInfo
} from './utils/dailyRewards';
import { sentienceEngine } from './utils/entitySentienceEngine';

const SAVE_KEY = 'abyssal_omega_save_v23';

function getTodayUtc(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function generateDailyData(): DailyData {
  const today = getTodayUtc();
  const modifiers = [
    'ACOUSTIC SENSORS HYPER-ATTUNED (+20% THREAT ON LOUD CHOICES)',
    'HYDRAULIC PRESSURE VOLATILE (REDUCED RECOVERY EFFICIENCY)',
    'MIMIC FREQUENCIES ACTIVE (PROCEED WITH HIGH CAUTION)',
    'ABYSSAL PRESSURE SURGE (SANITY DECAYS GRADUALLY)',
    'RADIO CARRIER DISTORTION (COMMUNICATIONS COMPROMISED)'
  ];
  const modIdx = Math.abs(today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % modifiers.length;

  return {
    date: today,
    modifier: modifiers[modIdx],
    missions: [
      {
        id: 'chambers',
        name: 'PENETRATE THE DEPTH',
        desc: 'Reach and conquer Chamber 7.',
        goal: 7,
        progress: 0,
        done: false,
        secret: 'Avoid triggering any entity breaches.',
        secretDone: false,
        reward: 'ADRENALINE STIM',
        rewardItemId: 'stim',
        rewardClaimed: false
      },
      {
        id: 'choices',
        name: 'TACTICAL DISCIPLINE',
        desc: 'Make 6 survival decisions.',
        goal: 6,
        progress: 0,
        done: false,
        secret: 'Never repeat consecutive loud actions.',
        secretDone: false,
        reward: 'Ω-FRAGMENT',
        rewardItemId: 'omega_shard',
        rewardClaimed: false
      },
      {
        id: 'clean',
        name: 'NEURAL INTEGRITY',
        desc: 'Maintain neural integrity through Chamber 5 (Corruption < 30%).',
        goal: 5,
        progress: 0,
        done: false,
        secret: 'Finish with 70%+ Sanity.',
        secretDone: false,
        reward: 'SURGICAL TRAUMA KIT',
        rewardItemId: 'trauma_kit',
        rewardClaimed: false
      },
      {
        id: 'supplies',
        name: 'RESOURCE PRESERVATION',
        desc: 'Conquer Chamber 6 with no more than 1 medical consumable used.',
        goal: 6,
        progress: 0,
        done: false,
        secret: 'Zero consumables used.',
        secretDone: false,
        reward: 'ECHO KEY',
        rewardItemId: 'echo_key',
        rewardClaimed: false
      }
    ],
    completed: false,
    streak: 0,
    bestStreak: 0,
    totalCompleted: 0
  };
}

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    const defaultDaily = generateDailyData();
    const initialState: GameState = {
      screen: 'boot',
      difficulty: 'easy',
      language: 'en',
      mapId: 1,
      mapName: 'TIDELOCK QUARANTINE',
      mapTier: 'STANDARD',
      chamber: 1,
      maxChambers: 10,
      sanity: 100,
      corruption: 0,
      score: 0,
      highScore: 0,
      inventory: ['stim', 'medkit', 'flashlight', 'crowbar', 'wire', 'lens'],
      deaths: 0,
      omegaFragments: ['Ω-01'],
      radioFreq: 94.2,
      threatMeter: 10,
      revives: 1,
      activeEntity: null,
      logs: ['OMEGA KERNEL v23.0 BOOTED SUCCESSFULLY.'],
      crtEnabled: true,
      crtTheme: 'amber',
      hapticsEnabled: true,
      fullscreen: false,
      reducedMotion: false,
      volume: 0.7,
      musicVolume: 0.45,
      musicMuted: false,

      // Horror Calibration
      horrorIntensity: 'terrifying',
      jumpscaresEnabled: true,
      hallucinationsEnabled: true,
      whispersEnabled: true,
      stalkerDistanceMeters: 14.8,
      isPanicking: false,

      achievements: [],
      unlockedMaps: [1, 2, 3, 4, 5, 6, 7],
      stats: {
        runs: 0,
        wins: 0,
        chambers: 0,
        choices: 0,
        crafts: 0,
        trades: 0,
        highestDepth: 450,
        deaths: 0,
        nightmareWins: 0
      },
      deathArchive: [],
      daily: defaultDaily,
      isDailyRun: false,
      isCustomRun: false,
      unlockedDifficulties: ['easy'],
      chambersInSector: 1,
      stalkerAlert: null,
      discoveredSurvivors: ['vane', 'mira', 'cipher'],
      traderEncounteredInSector: 0,
      traderLurking: false,
      survivorNotes: [],
      voidEvent: null,
      customDescentConfig: null
    };

    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const resolvedUnlocked = parsed.unlockedDifficulties || (
          parsed.stats?.nightmareWins > 0
            ? ['easy', 'hard', 'extreme', 'nightmare', 'endless']
            : parsed.stats?.wins >= 3
            ? ['easy', 'hard', 'extreme', 'nightmare']
            : parsed.stats?.wins >= 2
            ? ['easy', 'hard', 'extreme']
            : parsed.stats?.wins >= 1
            ? ['easy', 'hard']
            : ['easy']
        );

        return {
          ...initialState,
          ...parsed,
          inventory: Array.isArray(parsed.inventory) ? parsed.inventory : initialState.inventory,
          unlockedDifficulties: resolvedUnlocked,
          discoveredSurvivors: parsed.discoveredSurvivors || ['vane', 'mira', 'cipher'],
          survivorNotes: parsed.survivorNotes || [],
          voidEvent: parsed.voidEvent || null,
          chambersInSector: 1,
          stalkerAlert: null,
          screen: 'boot', // start at boot for audio setup
          daily: parsed.daily?.date === defaultDaily.date ? parsed.daily : defaultDaily
        };
      }
    } catch {
      // ignore
    }
    return initialState;
  });

  const [survivors, setSurvivors] = useState(() => {
    const initialMap = { ...SURVIVORS };
    (state.discoveredSurvivors || ['vane', 'mira', 'cipher']).forEach(id => {
      if (initialMap[id]) {
        initialMap[id] = { ...initialMap[id], discovered: true };
      }
    });
    return initialMap;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dailyCountdown = useDailyCountdown();
  const [abyssMemory, setAbyssMemory] = useState<AbyssMemoryData>(() => loadAbyssMemory());

  // Modal active states
  const [activeModal, setActiveModal] = useState<
    'help' | 'pause' | 'puzzle' | 'radio' | 'inventory' | 'survivors' | 'entities' | 'atlas' | 'daily' | 'analytics' | 'settings' | 'difficulty' | 'custom_descent' | 'trader' | 'rush_mode' | 'reset_confirm' | 'secrets' | 'sector_rush' | null
  >(null);

  const [sectorRushEntity, setSectorRushEntity] = useState<EntityInfo | null>(null);

  // Transition & Loading Screen State
  const [loadingState, setLoadingState] = useState<{
    active: boolean;
    mode: LoadingMode;
    mapName?: string;
    mapTier?: string;
    targetDepth?: number;
    durationMs?: number;
    onFinish?: () => void;
  } | null>(null);

  const [jumpscareTrigger, setJumpscareTrigger] = useState(0);
  const handleTriggerJumpscare = () => {
    setJumpscareTrigger(prev => prev + 1);
  };

  const [activePuzzle, setActivePuzzle] = useState<PuzzleType>('keypad');
  const [pendingPuzzleSurvivor, setPendingPuzzleSurvivor] = useState<string | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        highScore: state.highScore,
        inventory: state.inventory,
        deaths: state.deaths,
        omegaFragments: state.omegaFragments,
        language: state.language,
        achievements: state.achievements,
        unlockedMaps: state.unlockedMaps,
        unlockedDifficulties: state.unlockedDifficulties,
        stats: state.stats,
        deathArchive: state.deathArchive,
        daily: state.daily,
        crtEnabled: state.crtEnabled,
        crtTheme: state.crtTheme,
        hapticsEnabled: state.hapticsEnabled,
        reducedMotion: state.reducedMotion,
        volume: state.volume,
        musicVolume: state.musicVolume,
        survivorNotes: state.survivorNotes,
        rushModeHighScore: state.rushModeHighScore,
        rushModeSecretsUnlocked: state.rushModeSecretsUnlocked,
        secretEntityDiscovered: state.secretEntityDiscovered,
        stolenItemsByScavenger: state.stolenItemsByScavenger
      }));
    } catch {
      // ignore
    }
  }, [state]);

  // Sync RTL and lang attribute
  useEffect(() => {
    const meta = SUPPORTED_LANGUAGES[state.language] || SUPPORTED_LANGUAGES.en;
    document.body.setAttribute('dir', meta.dir || 'ltr');
    document.documentElement.lang = state.language;
  }, [state.language]);

  // Android Exclusive: Native Back Button / Gesture Interception
  useEffect(() => {
    try {
      window.history.pushState({ app: 'abyssal_omega_terminal' }, '');
    } catch {
      // ignore
    }

    const handlePopState = () => {
      try {
        window.history.pushState({ app: 'abyssal_omega_terminal' }, '');
      } catch {
        // ignore
      }

      if (activeModal !== null) {
        setActiveModal(null);
        audio.playClick();
      } else if (state.screen === 'game') {
        setActiveModal('pause');
      } else if (state.screen !== 'menu' && state.screen !== 'boot') {
        setState(p => ({ ...p, screen: 'menu' }));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeModal, state.screen]);

  // Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 2400);
  }, []);

  // Haptic trigger
  const triggerHaptic = useCallback((len = 12) => {
    if (state.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(len); } catch { /* ignore */ }
    }
  }, [state.hapticsEnabled]);

  // Unlock Achievement
  const unlockAchievement = useCallback((id: string) => {
    setState(prev => {
      if (prev.achievements.includes(id)) return prev;
      showToast(`ACHIEVEMENT UNLOCKED: ${id}`);
      audio.playSolve();
      return {
        ...prev,
        achievements: [...prev.achievements, id]
      };
    });
  }, [showToast]);

  // Start Expedition
  const handleLaunchDescent = (map: MapData, difficultyOverride?: DifficultyId) => {
    const diff = difficultyOverride || state.difficulty;
    const stages = diff === 'hard' ? 20 : diff === 'extreme' ? 25 : diff === 'nightmare' ? 30 : diff === 'endless' ? 9999 : 10;
    const sanity = diff === 'hard' ? 60 : diff === 'extreme' ? 30 : diff === 'nightmare' ? 10 : diff === 'endless' ? 20 : 100;
    const revives = diff === 'easy' ? 1 : 0;

    audio.init();
    triggerHaptic(25);
    setActiveModal(null);

    setLoadingState({
      active: true,
      mode: 'descent',
      mapName: map.name,
      mapTier: map.tier,
      targetDepth: map.depth,
      durationMs: 1800,
      onFinish: () => {
        audio.playSolve();
        setState(prev => ({
          ...prev,
          screen: 'game',
          mapId: map.id,
          mapName: map.name,
          mapTier: map.tier,
          difficulty: diff,
          chamber: 1,
          chambersInSector: 1,
          stalkerAlert: null,
          maxChambers: stages,
          sanity,
          corruption: 0,
          score: 0,
          revives,
          threatMeter: 10,
          activeEntity: ENTITIES[0].name,
          survivorNotes: [],
          voidEvent: null,
          isDailyRun: false,
          isCustomRun: false,
          customDescentConfig: null,
          stats: {
            ...prev.stats,
            runs: prev.stats.runs + 1
          }
        }));
      }
    });
  };

  // Launch Custom Descent (5 to 250 stages, custom story or known sector)
  const handleLaunchCustomDescent = (config: CustomDescentConfig) => {
    audio.init();
    triggerHaptic(30);
    setActiveModal(null);

    setLoadingState({
      active: true,
      mode: 'descent',
      mapName: config.title,
      mapTier: 'OMEGA',
      targetDepth: 10000,
      durationMs: 1800,
      onFinish: () => {
        audio.playSolve();
        setState(prev => ({
          ...prev,
          screen: 'game',
          mapId: config.mapId ?? 999,
          mapName: config.title,
          mapTier: 'OMEGA',
          difficulty: 'custom',
          chamber: 1,
          chambersInSector: 1,
          stalkerAlert: null,
          maxChambers: Math.max(5, Math.min(250, config.stages)),
          sanity: config.startingSanity,
          corruption: 0,
          score: 0,
          revives: config.startingRevives,
          threatMeter: 10,
          activeEntity: config.stalkerEntity,
          survivorNotes: [],
          voidEvent: null,
          isDailyRun: false,
          isCustomRun: true,
          customDescentConfig: {
            title: config.title,
            synopsis: config.synopsis,
            stages: config.stages,
            startingSanity: config.startingSanity,
            startingRevives: config.startingRevives,
            stalkerEntity: config.stalkerEntity
          },
          stats: {
            ...prev.stats,
            runs: prev.stats.runs + 1
          }
        }));
        showToast(`CUSTOM DESCENT INITIATED // ${config.stages} STAGES`);
      }
    });
  };

  // Launch Daily Run
  const handleStartDaily = () => {
    const map = ATLAS_MAPS[0];
    setActiveModal(null);
    audio.init();
    triggerHaptic(25);

    setLoadingState({
      active: true,
      mode: 'descent',
      mapName: `DAILY SECTOR: ${map.name}`,
      mapTier: map.tier,
      targetDepth: map.depth,
      durationMs: 1800,
      onFinish: () => {
        audio.playSolve();
        setState(prev => ({
          ...prev,
          screen: 'game',
          mapId: map.id,
          mapName: map.name,
          mapTier: map.tier,
          difficulty: 'hard',
          chamber: 1,
          chambersInSector: 1,
          stalkerAlert: null,
          maxChambers: 20,
          sanity: 60,
          corruption: 0,
          score: 0,
          revives: 0,
          threatMeter: 10,
          activeEntity: ENTITIES[0].name,
          survivorNotes: [],
          voidEvent: null,
          isDailyRun: true,
          isCustomRun: false,
          dailyRunChoices: 0,
          dailyConsumablesUsed: 0,
          customDescentConfig: null,
          stats: {
            ...prev.stats,
            runs: prev.stats.runs + 1
          }
        }));
        showToast(`DAILY DESCENT INITIATED // ${state.daily.modifier}`);
      }
    });
  };

  // Claim Daily Mission Reward
  const handleClaimDailyReward = (missionId: string) => {
    const mission = state.daily.missions.find(m => m.id === missionId);
    if (!mission || !mission.done || mission.rewardClaimed) return;

    const rewardItemId = mission.rewardItemId || resolveRewardItemId(mission.reward);
    const itemInfo = INVENTORY_ITEMS[rewardItemId];
    const rewardName = itemInfo ? itemInfo.name.toUpperCase() : mission.reward.toUpperCase();

    audio.playHarmonicAlign();
    triggerHaptic(40);
    showToast(`🎁 CLAIMED: ${rewardName} TRANSFERRED TO YOUR INVENTORY!`);

    setState(prev => {
      const nextMissions = prev.daily.missions.map(m =>
        m.id === missionId ? { ...m, rewardClaimed: true } : m
      );
      const nextInv = [...prev.inventory, rewardItemId];

      return {
        ...prev,
        inventory: nextInv,
        daily: {
          ...prev.daily,
          missions: nextMissions
        }
      };
    });
  };

  // Claim All Unclaimed Completed Daily Rewards
  const handleClaimAllDailyRewards = () => {
    const unclaimed = state.daily.missions.filter(m => m.done && !m.rewardClaimed);
    if (unclaimed.length === 0) return;

    const itemsToAdd: string[] = [];
    const names: string[] = [];

    unclaimed.forEach(m => {
      const rewardItemId = m.rewardItemId || resolveRewardItemId(m.reward);
      itemsToAdd.push(rewardItemId);
      const itemInfo = INVENTORY_ITEMS[rewardItemId];
      names.push(itemInfo ? itemInfo.name : m.reward);
    });

    audio.playHarmonicAlign();
    triggerHaptic(45);
    showToast(`🎁 CLAIMED ${itemsToAdd.length} DAILY REWARD(S): ${names.join(', ').toUpperCase()}!`);

    setState(prev => ({
      ...prev,
      inventory: [...prev.inventory, ...itemsToAdd],
      daily: {
        ...prev.daily,
        missions: prev.daily.missions.map(m => (m.done ? { ...m, rewardClaimed: true } : m))
      }
    }));
  };

  // Option Chosen
  const handleChooseOption = (
    idx: number,
    movementMetrics?: { hadTremor?: boolean; hadHesitation?: boolean; hoverDurationMs?: number }
  ) => {
    const currentScenario = SCENARIOS[(state.chamber - 1) % SCENARIOS.length];
    const opt = currentScenario.options[idx];
    if (!opt) return;

    if (opt.survivorFound) {
      const survId = opt.survivorFound;
      const surv = SURVIVORS[survId];

      if (opt.leadsToPuzzle) {
        setPendingPuzzleSurvivor(survId);
        setActivePuzzle(opt.leadsToPuzzle);
        setActiveModal('puzzle');
        return;
      }

      if (surv) {
        setSurvivors(prev => ({
          ...prev,
          [survId]: {
            ...prev[survId],
            discovered: true,
            loyalty: Math.min(100, (prev[survId]?.loyalty || 60) + 20)
          }
        }));
        setState(prev => ({
          ...prev,
          discoveredSurvivors: prev.discoveredSurvivors.includes(survId)
            ? prev.discoveredSurvivors
            : [...prev.discoveredSurvivors, survId]
        }));
        audio.playSolve();
        showToast(opt.survivorRescueText || `👥 SURVIVOR RESCUED: ${surv.name.toUpperCase()} JOINED YOUR ENCLAVE!`);
      }
    }

    if (opt.leadsToPuzzle) {
      setPendingPuzzleSurvivor(null);
      setActivePuzzle(opt.leadsToPuzzle);
      setActiveModal('puzzle');
      return;
    }

    processChoice(opt.s, opt.c, opt.sc, opt.isLoud, opt.itemConsume ? opt.itemReq : undefined, opt.itemGain, idx, movementMetrics);
  };

  const processChoice = (
    sDelta: number,
    cDelta: number,
    scoreGain: number,
    isLoud?: boolean,
    consumedItem?: string,
    gainedItem?: string,
    chosenOptionIndex?: number,
    movementMetrics?: { hadTremor?: boolean; hadHesitation?: boolean; hoverDurationMs?: number }
  ) => {
    audio.playChoice();

    // Sentient Adaptation & Memory Hook
    if (chosenOptionIndex !== undefined) {
      const memoryRes = recordPlayerChoiceInMemory(
        abyssMemory,
        chosenOptionIndex,
        !!isLoud,
        state.chamber,
        state.mapName,
        movementMetrics
      );
      setAbyssMemory(memoryRes.updatedMemory);

      if (memoryRes.wardenAlert) {
        audio.playWardenLockdown();
        showToast(memoryRes.wardenAlert);
      }
      if (memoryRes.abyssWhisper) {
        audio.playWhisper(memoryRes.abyssWhisper);
      }

      // Check if player picked the option The Warden actively locked/guarded
      if (abyssMemory.activeAdaptations?.wardenGuardedOption === chosenOptionIndex) {
        sDelta -= 12;
        cDelta += 10;
        audio.playWardenLockdown();
        triggerHaptic(50);
        showToast('⚠️ THE WARDEN ENFORCED HYDRAULIC RETALIATION FOR PREDICTABLE DOOR REPETITION! (-12 SANITY, +10 CORRUPTION)');
      }

      // Check if player triggered a Mimic Polymorphic Ambush
      if (abyssMemory.activeAdaptations?.mimicTrapOption === chosenOptionIndex) {
        sDelta -= 16;
        cDelta += 14;
        audio.playMimicSnarl();
        handleTriggerJumpscare();
        triggerHaptic(60);
        showToast('💀 THE MIMIC AMBUSH: THE AIRLOCK WAS A POLYMORPHIC FLESH TRAP! (-16 SANITY, +14 CORRUPTION)');
      }

      // The Listener reacts to erratic hand tremors
      if (movementMetrics?.hadTremor && (state.activeEntity?.toLowerCase().includes('listener') || state.threatMeter >= 45)) {
        sDelta -= 6;
        audio.playAcousticScreech();
        triggerHaptic(30);
        showToast('🚨 THE LISTENER SENSED ACOUSTIC TURBULENCE FROM YOUR TREMBLING CONTROLS! (-6 SANITY)');
      }

      // Record decision into Sentience Engine
      const sentienceResult = sentienceEngine.recordDecision(
        chosenOptionIndex,
        !!isLoud,
        state.inventory,
        state.discoveredSurvivors.length,
        state.activeEntity
      );

      // Chrono-Leviathan: Punish frantic speed-clicking (<900ms) with temporal causality shear
      if (sentienceResult.elapsedMs < 900 && (state.activeEntity || '').toLowerCase().includes('chrono')) {
        sDelta -= 12;
        cDelta += 8;
        audio.playGlitchDistortion();
        triggerHaptic([40, 80, 40]);
        showToast('⏳ CHRONO-LEVIATHAN: IMPULSIVE SPEED-CLICKING TRIGGERED CAUSALITY DISTORTION! (-12 SANITY, +8 CORRUPTION)');
      }

      // Null Stalker: Punish prolonged freezing (>3500ms) with cold sub-dimensional lunge
      if (movementMetrics?.hadHesitation && (state.activeEntity || '').toLowerCase().includes('stalker')) {
        sDelta -= 8;
        audio.playWhisper('The shadow breathes in your hesitation...');
        triggerHaptic(35);
        showToast('🌑 THE NULL STALKER: ADVANCED INTO BLIND SPOT DURING COGNITIVE FREEZE! (-8 SANITY)');
      }
    }

    let newInventory = [...state.inventory];
    if (consumedItem) {
      newInventory = newInventory.filter(i => i !== consumedItem);
      showToast(`CONSUMED: ${consumedItem.toUpperCase()}`);
    }
    if (gainedItem && !newInventory.includes(gainedItem)) {
      newInventory.push(gainedItem);
      showToast(`ACQUIRED: ${gainedItem.toUpperCase()}`);
    }

    // Threat calculation with Tactician Role reduction
    let newThreat = state.threatMeter;
    if (isLoud) {
      const hasTactician = !!state.assignedSurvivorRoles?.tactician;
      const spike = hasTactician ? 16 : 25;
      newThreat = Math.min(100, newThreat + spike);
      showToast(hasTactician ? 'LOUD ACTION // TACTICIAN DAMPENED SPIKE (+16% NOISE)' : 'LOUD ACTION // ACOUSTIC SIGNATURE SPIKED (+25%)');
    } else {
      newThreat = Math.max(5, newThreat - 8);
    }

    // Salvager Role Scavenge Benefit
    if (state.assignedSurvivorRoles?.salvager && Math.random() < 0.38) {
      const scavengePool = ['wire', 'lens', 'stim', 'flare', 'chitin_scalpel'];
      const loot = scavengePool[Math.floor(Math.random() * scavengePool.length)];
      if (!newInventory.includes(loot)) {
        newInventory.push(loot);
        showToast(`🎒 SALVAGER PERK: Discovered salvageable ${loot.toUpperCase()}!`);
      }
    }

    // Scavenger Theft & Retribution Encounter
    let nextStolen = [...(state.stolenItemsByScavenger || [])];
    const isScavengerLurking = (state.activeEntity || '').toLowerCase().includes('scavenger') || currentScenario.id === 's21' || currentScenario.title.toLowerCase().includes('scavenger');

    if (isScavengerLurking && (isLoud || Math.random() < 0.38)) {
      const eligibleItems = newInventory.filter(it => !['keycard', 'echo_key', 'omega_shard'].includes(it));
      if (eligibleItems.length > 0) {
        const stolen = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
        newInventory = newInventory.filter((_, idx) => idx !== newInventory.indexOf(stolen));
        nextStolen.push(stolen);
        const stolenName = INVENTORY_ITEMS[stolen]?.name || stolen;
        audio.playGlitchDistortion();
        triggerHaptic(45);
        showToast(`⚠️ THE SCAVENGER FILCHED YOUR ${stolenName.toUpperCase()}! (Retrieve in Scenario S21 or with a Hook)`);
        unlockAchievement('THIEF_BAFFLED');
      }
    }

    // Scavenger Nest Recovery (Scenario s21 resolution)
    if (currentScenario.id === 's21' && nextStolen.length > 0) {
      newInventory = [...newInventory, ...nextStolen];
      showToast(`🎒 GEAR RETRIEVED: Found ${nextStolen.length} items stashed in The Scavenger's flooded nest!`);
      unlockAchievement('ITEM_RECLAIMED');
      nextStolen = [];
    }

    // Entity 00: The Pale Architect Encounter
    let architectDiscovered = state.secretEntityDiscovered || false;
    if ((currentScenario.id === 's22' || newInventory.includes('architects_compass')) && !architectDiscovered) {
      architectDiscovered = true;
      unlockAchievement('SECRET_ENTITY_ENCOUNTERED');
      showToast('🌌 SECRET ENTITY DISCOVERED: ENTITY 00: THE PALE ARCHITECT');
      audio.playHarmonicAlign();
    }

    // Role adjustments to Sanity and Corruption
    let finalS = sDelta;
    let finalC = cDelta;

    // Medic Role Bonus
    if (state.assignedSurvivorRoles?.medic) {
      finalS += 8;
    }
    // Theologian Role Bonus
    if (state.assignedSurvivorRoles?.theologian) {
      finalS += 4;
    }
    // Occultist Role Bonus
    if (state.assignedSurvivorRoles?.occultist && finalC > 0) {
      finalC = Math.round(finalC * 0.5);
      finalS += 3;
    }
    // Hydrochemist Role Bonus
    if (state.assignedSurvivorRoles?.hydrochemist) {
      finalC = Math.max(0, finalC - 3);
    }

    // Nightmare Monkey Paw reversal
    if (state.difficulty === 'nightmare' && Math.random() < 0.18) {
      finalS = -15;
      finalC = +12;
      showToast('MONKEY PAW: THE DECISION TURNED AGAINST YOU');
      audio.playAlarm();
    }

    // =========================================================================
    // DYNAMIC DIFFICULTY SCALING: OMEGA FRAGMENTS & ABYSS MEMORY DEATH PATTERNS
    // =========================================================================

    // 1. Omega Fragments Dynamic Scaling
    // Carrying Omega fragments increases psychic resonance and cosmic hostility, but multiplies scores.
    const omegaCount = (state.omegaFragments?.length || 0) + (state.inventory?.filter(i => i.toLowerCase().includes('omega')).length || 0);
    let effectiveScoreGain = scoreGain;

    if (omegaCount > 0) {
      // Amplify score gain for carrying reality-shattering fragments (+25% per fragment)
      effectiveScoreGain = Math.round(effectiveScoreGain * (1 + omegaCount * 0.25));

      // Higher fragments exert psychic gravitational pressure
      if (finalS < 0) {
        const extraSanityDrain = Math.round(Math.abs(finalS) * (omegaCount * 0.15));
        finalS -= extraSanityDrain;
      }
      if (finalC > 0) {
        const extraCorruption = Math.round(finalC * (omegaCount * 0.18));
        finalC += extraCorruption;
      }

      // Loud actions echo through dimensional folds with fragments
      if (isLoud) {
        newThreat = Math.min(100, newThreat + omegaCount * 4);
      }

      if (omegaCount >= 4 && Math.random() < 0.25) {
        showToast('🌌 Ω-SINGULARITY RESONANCE // 4 FRAGMENTS DESTABILIZING HYDROSTATIC MATRIX!');
        audio.playHarmonicAlign();
      }
    }

    // 2. Historical Death Patterns from abyssMemory
    if (abyssMemory) {
      // A. Trauma Site Re-encounter: Entering the chamber where the player previously died
      const isPastDeathChamber =
        abyssMemory.lastDeathChamber &&
        Math.abs(state.chamber - abyssMemory.lastDeathChamber) <= 1 &&
        (!abyssMemory.lastDeathSector || abyssMemory.lastDeathSector === state.mapName);

      if (isPastDeathChamber) {
        finalS -= 7;
        newThreat = Math.min(100, newThreat + 12);
        triggerHaptic(30);
        audio.playHeartbeat();
        showToast(`💀 TRAUMA SITE RE-ENCOUNTER (CHAMBER ${state.chamber}): PAST FATALITY RECOLLECTION ESCALATES DREAD (-7 SANITY, +12% THREAT)!`);
      }

      // B. Nemesis Entity Proximity: Current entity matches the one that previously executed the player
      const isNemesisEntity =
        state.activeEntity &&
        abyssMemory.lastDeathEntity &&
        state.activeEntity.toLowerCase().includes(abyssMemory.lastDeathEntity.toLowerCase());

      if (isNemesisEntity) {
        finalS -= 5;
        finalC += 6;
        newThreat = Math.min(100, newThreat + 8);
        audio.playEntityStinger(60);
        showToast(`⚠️ RECURRING NEMESIS: ${state.activeEntity.toUpperCase()} RECOGNIZES YOUR NEURAL ECHOES FROM YOUR PREVIOUS FATALITY!`);
      }

      // C. Cause-of-Death Vulnerability Adaptation
      if (abyssMemory.lastDeathCause?.includes('PSYCHOLOGICAL')) {
        // The Abyss targets the player's demonstrated mental vulnerability
        if (finalS < 0) {
          finalS = Math.round(finalS * 1.25);
        }
      } else if (abyssMemory.lastDeathCause?.includes('CORRUPTION')) {
        // The Abyss accelerates brine infiltration due to previous tissue corruption history
        if (finalC > 0) {
          finalC = Math.round(finalC * 1.30);
        }
      }

      // D. Cumulative Mortality Scaling (Lifetime Deaths)
      const lifetimeDeaths = abyssMemory.lifetimeDeaths || 0;
      if (lifetimeDeaths > 0) {
        const deathStrain = Math.min(5, lifetimeDeaths);
        // Passive psychological scar from recursive resurrections
        if (finalS < 0) {
          finalS -= Math.floor(deathStrain * 0.8);
        }
        // Veteran resolve bonus on positive recovery
        if (finalS > 0) {
          finalS += Math.floor(deathStrain * 0.5);
        }
        // Score bonus for persevering through multiple recursive deaths
        effectiveScoreGain = Math.round(effectiveScoreGain * (1 + deathStrain * 0.05));
      }
    }

    // Entity Proximity check
    const nextEntity = ENTITIES[(state.chamber + state.mapId) % ENTITIES.length].name;
    if (newThreat >= 80) {
      finalS -= 10;
      finalC += 10;
      audio.playAlarm();
      showToast(`PROXIMITY BREACH: ${nextEntity} DETECTED`);
    }

    // Stalking mechanic: active entity has random chance each chamber to reduce player's sanity by 2
    // if they have been in the same sector for too long (>= 3 chambers)
    let stalkerHarassment: string | null = null;
    const chambersLinger = state.chambersInSector || 1;
    if (chambersLinger >= 3) {
      // 55% chance each chamber to stalk and drain 2 sanity
      if (Math.random() < 0.55) {
        finalS -= 2;
        stalkerHarassment = `${state.activeEntity || 'The Apex Entity'} stalked your lingering presence (-2 SANITY)`;
        audio.playHeartbeat();
        audio.playEntityStinger(55);
        triggerHaptic(40);
        showToast(`⚠️ STALKER HARASSMENT: ${state.activeEntity || 'Entity'} struck from behind! -2 SANITY`);
      }
    }

    const nextSanity = Math.max(0, Math.min(100, state.sanity + finalS));
    const nextCorruption = Math.max(0, Math.min(100, state.corruption + finalC));
    const nextScore = state.score + effectiveScoreGain;
    const nextHighScore = Math.max(state.highScore, nextScore);

    // Check Death
    if (nextSanity <= 0 || nextCorruption >= 100) {
      // Submariner Role Cheat-Death Blow Ballast
      if (state.assignedSurvivorRoles?.submariner && state.revives === 0) {
        audio.playSolve();
        triggerHaptic(50);
        showToast('⚓ SUBMARINER EMERGENCY BLOW: Cadence Thorne executed emergency ballast ascent! Rescued from death!');
        setState(prev => ({
          ...prev,
          sanity: 45,
          corruption: Math.max(0, nextCorruption - 20),
          threatMeter: 15,
          assignedSurvivorRoles: { ...prev.assignedSurvivorRoles, submariner: '' }
        }));
        return;
      }

      if (state.revives > 0) {
        audio.playSolve();
        showToast('REVIVE EXPENDED // NEURAL SHOCK ABSORBERS DEPLOYED');
        setState(prev => ({
          ...prev,
          sanity: 35,
          corruption: Math.max(0, nextCorruption - 15),
          revives: prev.revives - 1,
          threatMeter: 20
        }));
        return;
      }

      // Record collapse
      audio.playDeath();
      triggerHaptic(60);
      const newDeath: import('./types').DeathLog = {
        id: String(Date.now()),
        date: new Date().toISOString(),
        mapName: state.mapName,
        chamber: state.chamber,
        difficulty: state.difficulty,
        sanity: nextSanity,
        corruption: nextCorruption,
        entity: nextEntity,
        score: nextScore
      };

      const updatedMem = recordPlayerDeathInMemory(abyssMemory, {
        mapName: state.mapName,
        chamber: state.chamber,
        sanity: nextSanity,
        corruption: nextCorruption,
        entity: nextEntity,
        score: nextScore
      });
      setAbyssMemory(updatedMem);

      setState(prev => ({
        ...prev,
        screen: 'death',
        deaths: prev.deaths + 1,
        deathArchive: [newDeath, ...prev.deathArchive],
        stats: {
          ...prev.stats,
          deaths: prev.stats.deaths + 1,
          choices: prev.stats.choices + 1
        }
      }));
      return;
    }

    // Evaluate Daily Missions & Directly Grant Promised Rewards to Player Inventory
    let nextDaily = state.daily;
    const nextDailyChoices = (state.dailyRunChoices || 0) + 1;

    if (state.isDailyRun && state.daily?.missions) {
      const evalChamber = state.chamber >= state.maxChambers ? state.chamber : state.chamber + 1;
      const evalResult = evaluateDailyMissions(state.daily.missions, {
        chamber: evalChamber,
        choicesCount: nextDailyChoices,
        corruption: nextCorruption,
        sanity: nextSanity,
        threatMeter: newThreat,
        consumablesUsed: state.dailyConsumablesUsed || 0
      });

      if (evalResult.newItemsGained.length > 0) {
        newInventory = [...newInventory, ...evalResult.newItemsGained];
        audio.playHarmonicAlign();
        triggerHaptic(45);
        evalResult.newlyCompletedMissions.forEach(m => {
          const itemInfo = INVENTORY_ITEMS[m.rewardItemId || resolveRewardItemId(m.reward)];
          const rewardName = itemInfo ? itemInfo.name.toUpperCase() : m.reward.toUpperCase();
          showToast(`🎁 DAILY MISSION COMPLETED: [${m.name}]! ${rewardName} ADDED TO INVENTORY!`);
        });
      }

      let nextDailyCompleted = state.daily.completed;
      let nextStreak = state.daily.streak;
      let nextBestStreak = state.daily.bestStreak;
      let nextTotalCompleted = state.daily.totalCompleted;

      if (evalResult.allCompleted && !state.daily.completed) {
        nextDailyCompleted = true;
        nextStreak += 1;
        nextBestStreak = Math.max(nextBestStreak, nextStreak);
        nextTotalCompleted += 1;
        unlockAchievement('DAILY_DEVOTION');
        showToast(`🏆 ALL DAILY OBJECTIVES CONQUERED! EXPEDITION STREAK: ${nextStreak} DAYS!`);
      }

      nextDaily = {
        ...state.daily,
        missions: evalResult.updatedMissions,
        completed: nextDailyCompleted,
        streak: nextStreak,
        bestStreak: nextBestStreak,
        totalCompleted: nextTotalCompleted
      };
    }

    // Check Win / Transcendence
    if (state.chamber >= state.maxChambers) {
      audio.playSolve();
      triggerHaptic(50);
      unlockAchievement('FIRST_DESCENT');
      if (state.difficulty === 'hard') unlockAchievement('HARDENED_III');
      if (state.difficulty === 'nightmare') unlockAchievement('IMPOSSIBLE');
      if (nextCorruption === 0) unlockAchievement('CLEAN_HANDS');

      // Difficulty unlocking progression: beating a level on easy unlocks hard, and so forth
      const currentDiff = state.difficulty;
      let nextUnlocked = [...(state.unlockedDifficulties || ['easy'])];
      let newlyUnlockedTier: string | null = null;

      if (currentDiff === 'easy' && !nextUnlocked.includes('hard')) {
        nextUnlocked.push('hard');
        newlyUnlockedTier = 'HARD';
      } else if (currentDiff === 'hard' && !nextUnlocked.includes('extreme')) {
        nextUnlocked.push('extreme');
        newlyUnlockedTier = 'EXTREME';
      } else if (currentDiff === 'extreme' && !nextUnlocked.includes('nightmare')) {
        nextUnlocked.push('nightmare');
        newlyUnlockedTier = 'NIGHTMARE';
      } else if (currentDiff === 'nightmare' && !nextUnlocked.includes('endless')) {
        nextUnlocked.push('endless');
        newlyUnlockedTier = 'ENDLESS';
      }

      if (newlyUnlockedTier) {
        showToast(`🔓 TIER CONQUERED: ${newlyUnlockedTier} DIFFICULTY UNLOCKED!`);
      }

      setState(prev => ({
        ...prev,
        screen: 'ending',
        highScore: nextHighScore,
        unlockedDifficulties: nextUnlocked,
        daily: nextDaily,
        dailyRunChoices: nextDailyChoices,
        inventory: newInventory,
        stats: {
          ...prev.stats,
          wins: prev.stats.wins + 1,
          choices: prev.stats.choices + 1,
          nightmareWins: currentDiff === 'nightmare' ? prev.stats.nightmareWins + 1 : prev.stats.nightmareWins
        }
      }));
      return;
    }

    // Progress chamber
    const nextChamber = state.chamber + 1;
    const nextSector = Math.min(6, Math.max(1, Math.floor((nextChamber - 1) / 3) + 1));
    const stageInSector = ((nextChamber - 1) % 3) + 1;

    let triggerTraderEncounter = false;
    if (state.traderEncounteredInSector !== nextSector) {
      if (stageInSector === 1 && Math.random() < 0.45) {
        triggerTraderEncounter = true;
      } else if (stageInSector === 2 && Math.random() < 0.70) {
        triggerTraderEncounter = true;
      } else if (stageInSector >= 3) {
        triggerTraderEncounter = true;
      }
    }

    if (triggerTraderEncounter) {
      setTimeout(() => {
        audio.playEntityStinger(48);
        setActiveModal('trader');
        showToast(`⏳ THE TRADER HAS STEPPED OUT FROM THE SHADOWS OF SECTOR ${nextSector}!`);
      }, 650);
    }

    // Rare 'Void Event' that triggers every 25 chambers (e.g., Chamber 25, 50, 75, 100...)
    let voidEventToTrigger: VoidEventData | null = null;
    if (nextChamber > 0 && nextChamber % 25 === 0) {
      voidEventToTrigger = generateVoidEvent(nextChamber, state.mapId);
      setTimeout(() => {
        audio.playVoidBreachSound();
        showToast(`🌀 CRITICAL VOID SINGULARITY BREACH AT CHAMBER ${nextChamber}!`);
      }, 500);
    }

    if (stageInSector === 1 && nextChamber > 1) {
      setLoadingState({
        active: true,
        mode: 'sector_transition',
        mapName: `${state.mapName} // SECTOR ${nextSector}`,
        mapTier: state.mapTier,
        targetDepth: Math.round(nextChamber * 65.4 + state.mapId * 120),
        durationMs: 1200
      });
    }

    setState(prev => ({
      ...prev,
      chamber: nextChamber,
      chambersInSector: (prev.chambersInSector || 1) + 1,
      stalkerAlert: stalkerHarassment,
      sanity: nextSanity,
      corruption: nextCorruption,
      score: nextScore,
      highScore: nextHighScore,
      inventory: newInventory,
      threatMeter: newThreat,
      activeEntity: nextEntity,
      daily: nextDaily,
      dailyRunChoices: nextDailyChoices,
      traderEncounteredInSector: triggerTraderEncounter ? nextSector : prev.traderEncounteredInSector,
      traderLurking: triggerTraderEncounter ? true : prev.traderLurking,
      voidEvent: voidEventToTrigger !== null ? voidEventToTrigger : prev.voidEvent,
      stolenItemsByScavenger: nextStolen,
      secretEntityDiscovered: architectDiscovered,
      stats: {
        ...prev.stats,
        chambers: prev.stats.chambers + 1,
        choices: prev.stats.choices + 1,
        highestDepth: Math.max(prev.stats.highestDepth, Math.round(nextChamber * 65.4 + prev.mapId * 120))
      }
    }));
  };

  // Puzzle Outcome
  const handlePuzzleSolve = (success: boolean) => {
    setActiveModal(null);
    if (success) {
      if (activePuzzle === 'spectrogram_frequency') {
        unlockAchievement('SPECTROGRAM_ALIGNED');
      } else if (activePuzzle === 'containment_laser_grid') {
        unlockAchievement('LASER_GRID_MASTER');
      }

      if (pendingPuzzleSurvivor) {
        const survId = pendingPuzzleSurvivor;
        const surv = SURVIVORS[survId];
        if (surv) {
          setSurvivors(prev => ({
            ...prev,
            [survId]: {
              ...prev[survId],
              discovered: true,
              loyalty: Math.min(100, (prev[survId]?.loyalty || 60) + 25)
            }
          }));
          setState(prev => ({
            ...prev,
            discoveredSurvivors: prev.discoveredSurvivors.includes(survId)
              ? prev.discoveredSurvivors
              : [...prev.discoveredSurvivors, survId]
          }));
          audio.playSolve();
          showToast(`👥 SURVIVOR RESCUED: ${surv.name.toUpperCase()} JOINED YOUR ENCLAVE!`);
        }
      }
      showToast('SECURITY BYPASS SUCCESSFUL! +240 SCORE');
      processChoice(+18, -6, 240);
    } else {
      showToast('FAILURE! DEFENSIVE ELECTRICAL SURGE (-15 SANITY)');
      processChoice(-15, +10, 0);
    }
    setPendingPuzzleSurvivor(null);
  };

  // Use Consumable
  const handleUseItem = (id: string) => {
    const item = INVENTORY_ITEMS[id];
    if (!item || !item.usable) return;

    // Special Relic Interactions
    if ((id === 'scavenger_hook' || id === 'scavenger_lure') && state.stolenItemsByScavenger && state.stolenItemsByScavenger.length > 0) {
      const recovered = [...state.stolenItemsByScavenger];
      audio.playSolve();
      triggerHaptic(35);
      showToast(`🎒 GEAR RECLAIMED: The Scavenger dropped ${recovered.length} stolen items!`);
      unlockAchievement('ITEM_RECLAIMED');
      setState(prev => ({
        ...prev,
        inventory: [...prev.inventory.filter(i => i !== id), ...recovered],
        stolenItemsByScavenger: []
      }));
      return;
    }

    if (id === 'architects_compass') {
      audio.playHarmonicAlign();
      triggerHaptic(40);
      unlockAchievement('SECRET_ENTITY_ENCOUNTERED');
      showToast("🌌 COMPASS RESONANCE: ENTITY 00: THE PALE ARCHITECT DETECTED IN THE TRENCH");
      setState(prev => ({
        ...prev,
        secretEntityDiscovered: true,
        sanity: Math.min(100, prev.sanity + 45),
        corruption: Math.max(0, prev.corruption - 20)
      }));
      return;
    }

    if (id === 'abyssal_black_pearl') {
      audio.playSolve();
      triggerHaptic(50);
      showToast('🌑 HADAL PEARL CONSUMED: MAXIMUM SANITY RESTORED & THREAT PURGED');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: 100,
        corruption: Math.max(0, prev.corruption - 35),
        threatMeter: 0
      }));
      return;
    }

    if (id === 'void_chronometer') {
      audio.playHarmonicAlign();
      triggerHaptic(45);
      showToast('⌛ VOID CHRONOMETER ENGAGED: Causality frozen! Stalker repelled +20m, +35 Sanity, -20% Corruption');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 35),
        corruption: Math.max(0, prev.corruption - 20),
        threatMeter: 0,
        stalkerDistanceMeters: Math.min(35, (prev.stalkerDistanceMeters || 10) + 20)
      }));
      return;
    }

    if (id === 'hadal_titanium_drill') {
      audio.playSolve();
      triggerHaptic(35);
      showToast('⚙️ TITANIUM DRILL OPERATIONAL: Bypassed bulkhead locks! +25 Sanity');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 25)
      }));
      return;
    }

    if (id === 'neuro_sedative_mist') {
      audio.playPanickedBreath();
      audio.playSolve();
      triggerHaptic(35);
      showToast('🧪 NEURO-SEDATIVE INHALED: Acute delirium purged! +55 Sanity, -25% Corruption');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 55),
        corruption: Math.max(0, prev.corruption - 25),
        isPanicking: false
      }));
      return;
    }

    if (id === 'phantom_signal_emitter') {
      audio.playSonarPing();
      triggerHaptic(40);
      showToast('📡 PHANTOM BEACON BROADCASTING: Diverted apex entities! Threat dropped -35%, +15m Distance');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 15),
        threatMeter: Math.max(0, prev.threatMeter - 35),
        stalkerDistanceMeters: Math.min(30, (prev.stalkerDistanceMeters || 10) + 15)
      }));
      return;
    }

    if (id === 'chitin_scalpel') {
      audio.playSolve();
      triggerHaptic(25);
      showToast('🔪 CHITIN SCALPEL: Harvested biological stabilizers! +30 Sanity, -10% Corruption');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 30),
        corruption: Math.max(0, prev.corruption - 10)
      }));
      return;
    }

    if (id === 'abyssal_respirator_mk2') {
      audio.playPanickedBreath();
      audio.playSolve();
      triggerHaptic(40);
      showToast('🫁 ABYSSAL RESPIRATOR MK-II: Closed loop oxygen engaged! +50 Sanity, -15% Corruption');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 50),
        corruption: Math.max(0, prev.corruption - 15),
        isPanicking: false
      }));
      return;
    }

    if (id === 'pressure_equalizer_valve') {
      audio.playValveTurn(320);
      audio.playSolve();
      triggerHaptic(30);
      showToast('🚰 EQUALIZER ENGAGED: Hydraulic pressure stabilized! +35 Sanity, -20% Corruption');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 35),
        corruption: Math.max(0, prev.corruption - 20)
      }));
      return;
    }

    if (id === 'obsidian_focus_crystal') {
      audio.playHarmonicAlign();
      triggerHaptic(50);
      showToast('💎 OBSIDIAN FOCUS CRYSTAL: Volcanic resonance! +65 Sanity, -25% Corruption, +350 Score');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 65),
        corruption: Math.max(0, prev.corruption - 25),
        score: prev.score + 350
      }));
      return;
    }

    if (id === 'chronometric_reversal_dial') {
      audio.playHarmonicAlign();
      audio.playClockTick();
      triggerHaptic(50);
      unlockAchievement('CHRONO_REVERSAL');
      showToast('⌛ CHRONO-REVERSAL COG: Temporal recursion reversed! +50 Sanity, -30% Corruption, Stalker pushed +15m');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 50),
        corruption: Math.max(0, prev.corruption - 30),
        stalkerDistanceMeters: Math.min(35, (prev.stalkerDistanceMeters || 10) + 15)
      }));
      return;
    }

    if (id === 'pale_architect_ruler') {
      audio.playHarmonicAlign();
      triggerHaptic(45);
      unlockAchievement('PALE_ARCHITECT_APPRENTICE');
      showToast('📐 IVORY CALIPER ENGAGED: Labyrinth corrected by Entity 00! +60 Sanity, -25% Corruption');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        secretEntityDiscovered: true,
        sanity: Math.min(100, prev.sanity + 60),
        corruption: Math.max(0, prev.corruption - 25)
      }));
      return;
    }

    if (id === 'cryo_stasis_grenade') {
      audio.playSubsonicDrone();
      triggerHaptic(40);
      showToast('❄️ CRYO-BRINE CANISTER: Flash-frozen bulkhead! Stalker stalled +25m, -30% Noise');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 40),
        corruption: Math.max(0, prev.corruption - 15),
        threatMeter: Math.max(0, prev.threatMeter - 30),
        stalkerDistanceMeters: Math.min(35, (prev.stalkerDistanceMeters || 10) + 25)
      }));
      return;
    }

    if (id === 'siren_prism_decoy') {
      audio.playSonarPing();
      triggerHaptic(35);
      showToast('✨ SIPHONOPHORE PRISM DECOY: Hologram drawing predators away! Threat -40%');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 35),
        threatMeter: Math.max(0, prev.threatMeter - 40),
        stalkerDistanceMeters: Math.min(35, (prev.stalkerDistanceMeters || 10) + 15)
      }));
      return;
    }

    if (id === 'leviathan_heart_amber') {
      audio.playHarmonicAlign();
      triggerHaptic(60);
      unlockAchievement('LEVIATHAN_RESONANCE');
      showToast('❤️‍🔥 FOSSILIZED LEVIATHAN AMBER: Primordial pulse! Sanity fully restored (100%), -50% Corruption');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: 100,
        corruption: Math.max(0, prev.corruption - 50),
        threatMeter: 0
      }));
      return;
    }

    if (id === 'abyssal_mirror_shard') {
      audio.playSolve();
      triggerHaptic(45);
      showToast('🪞 QUANTUM MIRROR SHARD: Void reflection absorbed! +70 Sanity, -40% Corruption, +400 Score');
      setState(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i !== id),
        sanity: Math.min(100, prev.sanity + 70),
        corruption: Math.max(0, prev.corruption - 40),
        score: prev.score + 400
      }));
      return;
    }

    if (item.isTraderItem) {
      const currentSector = Math.min(6, Math.max(1, Math.floor((state.chamber - 1) / 3) + 1));
      const rate = item.volatileSuccessRate ?? getTraderVolatileRate(currentSector, state.difficulty);
      const roll = Math.random() * 100;
      const isSuccess = roll < rate;

      setState(prev => {
        const idx = prev.inventory.indexOf(id);
        if (idx === -1) return prev;
        const nextInv = [...prev.inventory];
        nextInv.splice(idx, 1);

        if (isSuccess) {
          audio.playSolve();
          triggerHaptic(35);
          showToast(`⚡ TRADER RELIC STABILIZED! (${rate}% SUCCESS) +${item.sanityHeal || 50} SANITY`);
          return {
            ...prev,
            inventory: nextInv,
            sanity: Math.min(100, prev.sanity + (item.sanityHeal || 50)),
            corruption: Math.max(0, prev.corruption - (item.corruptionReduce || 20)),
            score: prev.score + 350,
            threatMeter: Math.max(0, prev.threatMeter - 20),
            dailyConsumablesUsed: prev.isDailyRun ? (prev.dailyConsumablesUsed || 0) + 1 : prev.dailyConsumablesUsed
          };
        } else {
          // The item worked against them!
          audio.playAlarm();
          audio.playAcousticScreech();
          triggerHaptic(70);
          const dmg = item.backfireDamage || { sanity: 30, corruption: 20, threat: 30 };
          const newSanity = Math.max(1, prev.sanity - dmg.sanity);
          showToast(`⚠️ TRADER RELIC BACKFIRED! (${100 - rate}% RISK) -${dmg.sanity} SANITY, +${dmg.corruption}% CORRUPTION!`);
          return {
            ...prev,
            inventory: nextInv,
            sanity: newSanity,
            corruption: Math.min(100, prev.corruption + dmg.corruption),
            threatMeter: Math.min(100, prev.threatMeter + dmg.threat),
            stalkerAlert: 'THE TRADER LAUGHS ACROSS THE FOURTH WALL: "THE SECTOR ROLL WAS AGAINST YOU."',
            dailyConsumablesUsed: prev.isDailyRun ? (prev.dailyConsumablesUsed || 0) + 1 : prev.dailyConsumablesUsed
          };
        }
      });
      return;
    }

    const isMedicalConsumable = ['stim', 'medkit', 'trauma_kit'].includes(id);

    audio.playSolve();
    triggerHaptic(20);

    setState(prev => {
      const idx = prev.inventory.indexOf(id);
      if (idx === -1) return prev;
      const nextInv = [...prev.inventory];
      nextInv.splice(idx, 1);

      const heal = item.sanityHeal || 0;
      const corruptReduce = item.corruptionReduce || 0;

      showToast(`USED: ${item.name.toUpperCase()} (+${heal} SANITY)`);

      return {
        ...prev,
        inventory: nextInv,
        sanity: Math.min(100, prev.sanity + heal),
        corruption: Math.max(0, prev.corruption - corruptReduce),
        dailyConsumablesUsed: prev.isDailyRun
          ? (prev.dailyConsumablesUsed || 0) + (isMedicalConsumable ? 1 : 0)
          : prev.dailyConsumablesUsed
      };
    });
  };

  // Trader Barter Handlers
  const handleAcceptTraderDeal = (playerItemId: string, traderItemId: string, volatileRate: number) => {
    setState(prev => {
      const idx = prev.inventory.indexOf(playerItemId);
      if (idx === -1) return prev;
      const nextInv = [...prev.inventory];
      nextInv.splice(idx, 1);
      nextInv.push(traderItemId);

      const sacrificedName = INVENTORY_ITEMS[playerItemId]?.name || playerItemId;
      const gainedName = INVENTORY_ITEMS[traderItemId]?.name || traderItemId;
      showToast(`BARTER STRUCK: Exchanged ${sacrificedName} for ${gainedName} (${volatileRate}% Stability)!`);

      return {
        ...prev,
        inventory: nextInv,
        traderLurking: false,
        stats: {
          ...prev.stats,
          trades: prev.stats.trades + 1
        }
      };
    });
    setActiveModal(null);
  };

  const handleDeclineTraderDeal = () => {
    setState(prev => ({ ...prev, traderLurking: false }));
    showToast('DECLINED: The Trader retreats into the bulkhead shadows...');
    setActiveModal(null);
  };

  // Survivor Notes Handlers - Persist throughout the descent until ended
  const handleAddSurvivorNote = (text: string, tag: SurvivorNoteTag) => {
    if (!text.trim()) return;
    const currentDepth = ((state.chamber * 65.4) + (state.mapId * 120)).toFixed(1);
    const newNote: SurvivorNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      chamber: state.chamber,
      depth: currentDepth,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: text.trim(),
      tag
    };

    setState(prev => ({
      ...prev,
      survivorNotes: [newNote, ...(prev.survivorNotes || [])]
    }));
    showToast(`📝 NOTE LOGGED // CH.${state.chamber} (${tag.toUpperCase()})`);
  };

  const handleDeleteSurvivorNote = (noteId: string) => {
    setState(prev => ({
      ...prev,
      survivorNotes: (prev.survivorNotes || []).filter(n => n.id !== noteId)
    }));
    showToast('NOTE PURGED FROM LOGBOOK');
  };

  const handleClearSurvivorNotes = () => {
    setState(prev => ({
      ...prev,
      survivorNotes: []
    }));
    showToast('ALL SURVIVOR NOTES PURGED');
  };

  // Void Event Handlers
  const handleVoidEscapeSuccess = (escapeCode: string) => {
    audio.playVoidEscapeSuccess();
    showToast(`⚡ VOID ESCAPED // REALITY DECOMPRESSED! +750 SCORE`);

    const eventChamber = state.voidEvent?.chamber || state.chamber;
    const eventDepth = state.voidEvent?.depth || '1635.0';

    const note: SurvivorNote = {
      id: `note_void_${Date.now()}`,
      chamber: eventChamber,
      depth: eventDepth,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: `[VOID EVENT ESCAPED]: Hadal singularity decompressed via override key "${escapeCode}". Reality buffer stabilized.`,
      tag: 'code'
    };

    setState(prev => ({
      ...prev,
      voidEvent: null,
      sanity: Math.min(100, prev.sanity + 25),
      corruption: Math.max(0, prev.corruption - 20),
      score: prev.score + 750,
      highScore: Math.max(prev.highScore, prev.score + 750),
      survivorNotes: [note, ...(prev.survivorNotes || [])]
    }));
  };

  const handleVoidFailedAttempt = (attemptCount: number) => {
    setState(prev => {
      if (!prev.voidEvent) return prev;
      return {
        ...prev,
        sanity: Math.max(5, prev.sanity - 4),
        corruption: Math.min(95, prev.corruption + 4),
        voidEvent: {
          ...prev.voidEvent,
          attempts: attemptCount
        }
      };
    });
  };

  const handleTriggerTestVoidEvent = () => {
    const testChamber = state.chamber >= 25 ? state.chamber : 25;
    const voidData = generateVoidEvent(testChamber, state.mapId);
    setState(prev => ({
      ...prev,
      voidEvent: voidData
    }));
    audio.playVoidBreachSound();
    showToast('🌀 SIMULATED VOID EVENT BREACH INITIATED');
  };

  // Rush Mode Completion Handler
  const handleRushModeComplete = (rushScore: number, secretsGained: string[], itemsGained: string[]) => {
    setState(prev => {
      const nextHighScore = Math.max(prev.rushModeHighScore || 0, rushScore);
      const nextSecrets = Array.from(new Set([...(prev.rushModeSecretsUnlocked || []), ...secretsGained]));
      const nextInventory = [...prev.inventory, ...itemsGained];

      if (rushScore >= 2500) {
        unlockAchievement('RUSH_APPRENTICE');
      }
      if (rushScore >= 5000) {
        unlockAchievement('RUSH_MASTER');
      }
      if (secretsGained.length > 0 || nextSecrets.length > 0) {
        unlockAchievement('RUSH_SECRET_UNLOCKED');
      }

      showToast(`⚡ RUSH GAUNTLET CONCLUDED: ${rushScore} POINTS REGISTERED!`);

      return {
        ...prev,
        rushModeHighScore: nextHighScore,
        rushModeSecretsUnlocked: nextSecrets,
        inventory: nextInventory,
        score: prev.score + Math.floor(rushScore / 2)
      };
    });
  };

  // Craft Synthesis
  const handleCraftItem = (itemA: string, itemB: string, resultId: string) => {
    setState(prev => {
      const hasA = prev.inventory.includes(itemA);
      const hasB = prev.inventory.includes(itemB);
      if (!hasA || !hasB) return prev;

      const nextInv = [...prev.inventory];
      nextInv.splice(nextInv.indexOf(itemA), 1);
      nextInv.splice(nextInv.indexOf(itemB), 1);
      nextInv.push(resultId);

      const craftedName = INVENTORY_ITEMS[resultId]?.name || resultId;
      showToast(`SYNTHESIZED: ${craftedName.toUpperCase()}`);

      const newCrafts = prev.stats.crafts + 1;
      if (newCrafts >= 3) {
        unlockAchievement('SYNTHETIC_MASTERY');
      }

      return {
        ...prev,
        inventory: nextInv,
        stats: {
          ...prev.stats,
          crafts: newCrafts
        }
      };
    });
  };

  // Survivor Trade
  const handleSurvivorTrade = (survivorId: string) => {
    const surv = survivors[survivorId];
    if (!surv) return;

    if (!state.inventory.includes(surv.trade.want)) {
      showToast(`MISSING: ${surv.trade.want.toUpperCase()}`);
      return;
    }

    audio.playSolve();
    triggerHaptic(20);

    setState(prev => {
      const nextInv = [...prev.inventory];
      nextInv.splice(nextInv.indexOf(surv.trade.want), 1);
      nextInv.push(surv.trade.give);

      unlockAchievement('SURVIVOR_PACT');
      showToast(`BARTER COMPLETE WITH ${surv.name.toUpperCase()}`);

      return {
        ...prev,
        inventory: nextInv,
        stats: {
          ...prev.stats,
          trades: prev.stats.trades + 1
        }
      };
    });

    setSurvivors(prev => ({
      ...prev,
      [survivorId]: {
        ...prev[survivorId],
        loyalty: Math.min(100, prev[survivorId].loyalty + 20)
      }
    }));
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => {
        setState(prev => ({ ...prev, fullscreen: true }));
        showToast('FULLSCREEN ENABLED');
      }).catch(() => {
        showToast('FULLSCREEN NOT SUPPORTED IN THIS FRAME');
      });
    } else {
      document.exitFullscreen?.().then(() => {
        setState(prev => ({ ...prev, fullscreen: false }));
        showToast('FULLSCREEN EXIT');
      }).catch(() => {});
    }
  };

  // CRITICAL USER REQUEST:
  // "Add a reset button to clear history if the player wants to play again but have The Warden and The Abyss remember everything the player does"
  const handleResetTimeline = () => {
    const resetResult = recordTimelineReset(abyssMemory, {
      chamber: state.chamber,
      score: state.score,
      deaths: state.deaths,
      inventory: state.inventory,
      sanity: state.sanity,
      corruption: state.corruption,
      mapName: state.mapName
    });
    setAbyssMemory(resetResult.updatedMemory);

    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // ignore
    }

    const defaultDaily = generateDailyData();
    const freshState: GameState = {
      screen: 'menu',
      difficulty: 'easy',
      language: state.language,
      mapId: 1,
      mapName: 'TIDELOCK QUARANTINE',
      mapTier: 'STANDARD',
      chamber: 1,
      maxChambers: 10,
      sanity: 100,
      corruption: 0,
      score: 0,
      highScore: 0,
      inventory: ['stim', 'medkit', 'flashlight', 'crowbar', 'wire', 'lens'],
      deaths: 0,
      omegaFragments: ['Ω-01'],
      radioFreq: 94.2,
      threatMeter: 10,
      revives: 1,
      activeEntity: null,
      logs: [`CYCLE #${resetResult.updatedMemory.resetsCount} INITIATED. HISTORY CLEARED. WARDEN & ABYSS RETAIN MEMORY.`],
      crtEnabled: state.crtEnabled,
      crtTheme: state.crtTheme,
      hapticsEnabled: state.hapticsEnabled,
      fullscreen: state.fullscreen,
      reducedMotion: state.reducedMotion,
      volume: state.volume,
      musicVolume: state.musicVolume,
      musicMuted: state.musicMuted,
      horrorIntensity: state.horrorIntensity,
      jumpscaresEnabled: state.jumpscaresEnabled,
      hallucinationsEnabled: state.hallucinationsEnabled,
      whispersEnabled: state.whispersEnabled,
      stalkerDistanceMeters: 14.8,
      isPanicking: false,
      achievements: [],
      unlockedMaps: [1, 2, 3, 4, 5, 6, 7],
      stats: {
        runs: 0,
        wins: 0,
        chambers: 0,
        choices: 0,
        crafts: 0,
        trades: 0,
        highestDepth: 450,
        deaths: 0,
        nightmareWins: 0
      },
      deathArchive: [],
      daily: defaultDaily,
      isDailyRun: false,
      isCustomRun: false,
      unlockedDifficulties: ['easy'],
      chambersInSector: 1,
      stalkerAlert: null,
      discoveredSurvivors: ['vane', 'mira', 'cipher'],
      survivorNotes: [],
      voidEvent: null,
      customDescentConfig: null
    };

    setState(freshState);
    setSurvivors({ ...SURVIVORS });
    setActiveModal(null);
    audio.playGlassCrack();
    audio.playAbyssSubInfrasound();
    showToast(resetResult.tauntMessage);
  };

  // Export Save / HTML
  const handleExportSave = () => {
    const htmlContent = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abyssal_echoes_omega.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('STANDALONE FILE DOWNLOADED (abyssal_echoes_omega.html)');
  };

  const t = (k: string) => translate(k, state.language);
  const currentScenario = useMemo(
    () => localizeScenario(SCENARIOS[(state.chamber - 1) % SCENARIOS.length], state.language),
    [state.chamber, state.language]
  );

  return (
    <div className={`min-h-screen w-full flex flex-col bg-[#050508] text-[#c0c8e0] selection:bg-amber-500 selection:text-black ${state.crtTheme === 'emerald' ? 'hue-rotate-90' : state.crtTheme === 'cyan' ? 'hue-rotate-180' : state.crtTheme === 'crimson' ? 'hue-rotate-310' : ''}`}>
      {/* CRT Scanline and Vignette Effects */}
      {state.crtEnabled && <div className="scanlines" />}
      <div className={`crt-vignette ${state.sanity <= 25 ? 'critical-vignette' : ''}`} />

      {/* Floating Toast Banner (non-blocking, top center) */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#0c1020] border-2 border-amber-500 text-amber-300 px-4 py-2 rounded shadow-2xl text-xs font-mono font-bold tracking-wider animate-bounce pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Rare Void Event Terminal (Temporarily replaces the entire interface) */}
      {state.voidEvent ? (
        <VoidEventTerminal
          voidEvent={state.voidEvent}
          onEscapeSuccess={handleVoidEscapeSuccess}
          onEscapeFailedAttempt={handleVoidFailedAttempt}
          hapticsEnabled={state.hapticsEnabled}
        />
      ) : (
        <>
          {/* Android Exclusive Tactical OS Bar */}
          <AndroidSystemBar
            chamber={state.chamber}
            maxChambers={state.maxChambers}
            hapticsEnabled={state.hapticsEnabled}
            onToggleHaptics={() => {
              setState(p => ({ ...p, hapticsEnabled: !p.hapticsEnabled }));
              showToast(`HAPTICS: ${!state.hapticsEnabled ? 'ACTIVE' : 'MUTED'}`);
            }}
            activeEntity={state.activeEntity}
            onOpenEntities={() => setActiveModal('entities')}
          />

          {/* Top Accessible Header Bar (Never blocks game buttons) */}
          <HeaderBar
            state={state}
            abyssMemory={abyssMemory}
            onToggleFullscreen={handleToggleFullscreen}
            onToggleHaptics={() => {
              setState(p => ({ ...p, hapticsEnabled: !p.hapticsEnabled }));
              showToast(`HAPTICS: ${!state.hapticsEnabled ? 'ACTIVE' : 'MUTED'}`);
            }}
            onToggleAudio={() => {
              const muted = audio.toggleMusic();
              setState(p => ({ ...p, musicMuted: muted }));
              showToast(`AUDIO: ${muted ? 'MUTED' : 'ACTIVE'}`);
            }}
            onOpenHelp={() => setActiveModal('help')}
            onOpenPause={() => setActiveModal('pause')}
            onOpenSettings={() => setActiveModal('settings')}
            onNavigateHome={() => setState(p => ({ ...p, screen: 'menu' }))}
          />

          {/* Main Content Viewport */}
          <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-4 flex flex-col justify-center">
        {/* BOOT / TITLE SCREEN */}
        {state.screen === 'boot' && (
          <div className="my-auto text-center space-y-6 py-10 px-4 font-mono max-w-xl mx-auto select-none">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/70 border border-red-700/80 rounded text-[10px] text-red-300 font-bold tracking-[0.2em] uppercase">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>HADAL PRESSURE TERMINAL // CLASSIFIED HORROR</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-red-500 tracking-[0.2em] uppercase drop-shadow-[0_0_25px_rgba(255,56,56,0.6)]">
                {t('appTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-[#8a96bd] tracking-[0.25em] max-w-lg mx-auto uppercase">
                {t('appSubtitle')}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  audio.init();
                  audio.playSolve();
                  triggerHaptic(30);
                  setLoadingState({
                    active: true,
                    mode: 'boot',
                    durationMs: 2200,
                    onFinish: () => {
                      setState(p => ({ ...p, screen: 'menu' }));
                    }
                  });
                }}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xs sm:text-sm tracking-[0.2em] rounded border-2 border-red-400 hover:border-white shadow-2xl shadow-red-950 transition cursor-pointer flex items-center justify-center mx-auto uppercase hover:scale-105 active:scale-95 duration-150"
              >
                <span>{t('bootInit')}</span>
              </button>
            </div>

            <p className="text-[10px] text-[#55648b] tracking-widest uppercase">
              TITANIUM HULL • DEPTH 11,000M • TRANSDUCER SYNCHRONIZED
            </p>
          </div>
        )}

        {/* MAIN MENU / COMMAND DECK */}
        {state.screen === 'menu' && (
          <div className="w-full space-y-4 font-mono">
            <div className="text-center border-b border-[#2a3150] pb-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-red-500 tracking-wider">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-[#7885ab] tracking-wider mt-1">
                {t('appSubtitle')} // OMEGA DEFINITIVE EDITION
              </p>
            </div>

            {/* Tactical Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {/* RUSH MODE PROMINENT ENTRY */}
              <button
                onClick={() => {
                  audio.playClick();
                  triggerHaptic(20);
                  setActiveModal('rush_mode');
                }}
                className="p-3.5 bg-gradient-to-r from-[#2c1a05] via-[#3a2007] to-[#1d1028] hover:from-[#3e2508] hover:to-[#2f1940] text-amber-300 hover:text-white font-bold text-xs sm:text-sm rounded border-2 border-amber-500/90 text-left transition cursor-pointer shadow-lg shadow-amber-950/40 flex items-center justify-between col-span-1 sm:col-span-2 md:col-span-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl animate-pulse">⚡</span>
                  <div className="flex flex-col">
                    <span className="font-black tracking-wider text-amber-400 text-sm flex items-center gap-2">
                      RUSH MODE // TIMED PUZZLE GAUNTLET
                      <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.2 rounded border border-red-700 uppercase">
                        RAPID FIRE
                      </span>
                    </span>
                    <span className="text-[10px] text-[#c9b78e] font-normal">
                      Solve consecutive timed puzzles • Accumulate massive scores • Unlock secret relics &amp; sectors!
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-black border border-amber-700 block">
                    RECORD: {state.rushModeHighScore || 0} PTS
                  </span>
                  {state.rushModeSecretsUnlocked && state.rushModeSecretsUnlocked.length > 0 && (
                    <span className="text-[9px] text-purple-300 block mt-0.5 font-bold">
                      ★ {state.rushModeSecretsUnlocked.length} SECRETS DISCOVERED
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleLaunchDescent(ATLAS_MAPS[0])}
                className="p-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm tracking-wider rounded border-2 border-red-400 text-left transition cursor-pointer shadow-lg shadow-red-950/50 flex items-center justify-between"
              >
                <span>&gt; {t('startDescent')}</span>
                <span className="text-xs opacity-80 font-normal">LAUNCH</span>
              </button>

              <button
                onClick={() => setActiveModal('custom_descent')}
                className="p-3.5 bg-gradient-to-r from-[#14233a] to-[#251736] hover:from-[#1b3152] hover:to-[#381f50] text-cyan-300 hover:text-white font-bold text-xs sm:text-sm rounded border border-cyan-500/80 text-left transition cursor-pointer shadow-lg flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 font-black text-cyan-300">
                    🛠️ CUSTOM DESCENT
                  </span>
                  <span className="text-[10px] text-[#8ea4cc] font-normal">
                    Story &amp; Stages (5 - 250)
                  </span>
                </div>
                <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-black border border-cyan-800 uppercase">
                  CUSTOM
                </span>
              </button>

              {/* SECTOR ENTITY RUSH GAUNTLET ENTRY */}
              <button
                onClick={() => {
                  audio.playClick();
                  triggerHaptic(20);
                  const currentEntity = ENTITIES[(state.chamber + state.mapId) % ENTITIES.length] || ENTITIES[0];
                  setSectorRushEntity(currentEntity);
                  setActiveModal('sector_rush');
                }}
                className="p-3.5 bg-gradient-to-r from-[#2a0815] via-[#380b1e] to-[#1a0822] hover:from-[#3d0e21] hover:to-[#270c33] text-rose-300 hover:text-white font-bold text-xs sm:text-sm rounded border-2 border-red-500/80 text-left transition cursor-pointer shadow-lg shadow-red-950/40 flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 font-black text-red-400">
                    🧠 SECTOR NEURAL RUSH
                  </span>
                  <span className="text-[10px] text-rose-300/80 font-normal">
                    Confront Entity • Real-time choice-reading
                  </span>
                </div>
                <span className="text-[9px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded font-black border border-red-700 uppercase">
                  ACTIVE
                </span>
              </button>

              <button
                onClick={() => setActiveModal('difficulty')}
                className="p-3.5 bg-[#171c32] hover:bg-[#222946] text-amber-300 font-bold text-xs sm:text-sm rounded border border-amber-500/80 text-left transition cursor-pointer flex items-center justify-between"
              >
                <span>⚖️ {t('diffMatrix')}</span>
                <span className="text-[11px] font-black uppercase text-amber-400">
                  {state.difficulty}
                </span>
              </button>

              <button
                onClick={() => setActiveModal('daily')}
                className="p-3.5 bg-[#1a121d] hover:bg-[#28182d] text-purple-300 font-bold text-xs sm:text-sm rounded border border-purple-700 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span>☠ DAILY DESCENT</span>
                  <span className="text-[10px] text-amber-400 font-normal">
                    RESETS IN {dailyCountdown.formattedClock}
                  </span>
                </div>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                  STREAK: {state.daily.streak}
                </span>
              </button>

              <button
                onClick={() => setActiveModal('atlas')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-[#c0c8e0] hover:text-white font-bold text-xs rounded border border-[#313b63] text-left transition cursor-pointer"
              >
                🗺️ SECTOR ATLAS ({ATLAS_MAPS.length} SECTORS)
              </button>

              <button
                onClick={() => setActiveModal('inventory')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-[#c0c8e0] hover:text-white font-bold text-xs rounded border border-[#313b63] text-left transition cursor-pointer"
              >
                🎒 {t('loadout')} ({state.inventory.length})
              </button>

              <button
                onClick={() => setActiveModal('radio')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-[#c0c8e0] hover:text-white font-bold text-xs rounded border border-[#313b63] text-left transition cursor-pointer"
              >
                📻 {t('radioTerminal')}
              </button>

              <button
                onClick={() => setActiveModal('survivors')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-[#c0c8e0] hover:text-white font-bold text-xs rounded border border-[#313b63] text-left transition cursor-pointer"
              >
                👥 {t('survivors')}
              </button>

              <button
                onClick={() => setActiveModal('entities')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-red-300 hover:text-white font-bold text-xs rounded border border-red-900/80 text-left transition cursor-pointer"
              >
                👁️ {t('tormentLogs')}
              </button>

              <button
                onClick={() => setActiveModal('analytics')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-[#c0c8e0] hover:text-white font-bold text-xs rounded border border-[#313b63] text-left transition cursor-pointer"
              >
                📊 {t('analytics')} & ACHIEVEMENTS
              </button>

              <button
                onClick={() => {
                  triggerHaptic(10);
                  audio.playClick();
                  setActiveModal('secrets');
                }}
                className="p-3.5 bg-[#1f1709] hover:bg-[#33240e] text-amber-300 hover:text-white font-bold text-xs rounded border border-amber-700/80 text-left transition cursor-pointer flex items-center justify-between"
              >
                <span>🔑 SECRETS CODEX</span>
                <span className="text-[10px] bg-amber-950 px-2 py-0.5 rounded text-amber-300 border border-amber-800 font-mono">
                  {state.rushModeSecretsUnlocked?.length || 0} DISCOVERED
                </span>
              </button>

              <button
                onClick={() => setActiveModal('help')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-cyan-300 font-bold text-xs rounded border border-cyan-800 text-left transition cursor-pointer"
              >
                ❓ SURVIVAL FIELD GUIDE
              </button>

              <button
                onClick={() => setActiveModal('settings')}
                className="p-3.5 bg-[#121628] hover:bg-[#1e2444] text-amber-300 font-bold text-xs rounded border border-[#313b63] text-left transition cursor-pointer"
              >
                ⚙️ {t('settings')} [LANG: {state.language.toUpperCase()}]
              </button>

              <button
                onClick={() => {
                  triggerHaptic(20);
                  audio.playError();
                  setActiveModal('reset_confirm');
                }}
                className="p-3.5 bg-[#1c0812] hover:bg-[#2e0e1e] text-red-300 hover:text-white font-bold text-xs rounded border border-red-700 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 font-bold text-red-400">
                    💀 RESET EXPEDITION
                  </span>
                  <span className="text-[10px] text-red-400/80 font-normal">
                    Wipe run history • Start fresh expedition
                  </span>
                </div>
                <span className="text-[9px] bg-red-950 text-red-300 px-2.5 py-1 rounded font-bold border border-red-700 uppercase">
                  RESET EXPEDITION
                </span>
              </button>

              <button
                onClick={handleExportSave}
                className="p-3.5 bg-[#102416] hover:bg-[#173620] text-emerald-300 font-bold text-xs rounded border border-emerald-700 text-left transition cursor-pointer"
              >
                💾 EXPORT SAVE / .HTML
              </button>
            </div>

            {/* Bottom Status Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="p-2 bg-[#0c0f1c] border border-[#232942] rounded">
                <span className="text-[10px] text-[#717c9e] block">HIGH SCORE</span>
                <b className="text-amber-400 text-sm">{state.highScore}</b>
              </div>
              <div className="p-2 bg-[#0c0f1c] border border-[#232942] rounded">
                <span className="text-[10px] text-[#717c9e] block">EXPEDITION WINS</span>
                <b className="text-emerald-400 text-sm">{state.stats.wins}</b>
              </div>
              <div className="p-2 bg-[#0c0f1c] border border-[#232942] rounded">
                <span className="text-[10px] text-[#717c9e] block">AUTOPSIES RECORDED</span>
                <b className="text-red-400 text-sm">{state.deaths}</b>
              </div>
              <div className="p-2 bg-[#0c0f1c] border border-[#232942] rounded">
                <span className="text-[10px] text-[#717c9e] block">Ω-FRAGMENTS</span>
                <b className="text-purple-400 text-sm">{state.omegaFragments.length}/4</b>
              </div>
            </div>
          </div>
        )}

        {/* RARE VOID EVENT TERMINAL BREACH - REPLACES ENTIRE INTERFACE */}
        {state.voidEvent && state.voidEvent.active && (
          <VoidEventTerminal
            voidEvent={state.voidEvent}
            onEscapeSuccess={handleVoidEscapeSuccess}
            onEscapeFailedAttempt={handleVoidFailedAttempt}
            hapticsEnabled={state.hapticsEnabled}
          />
        )}

        {/* ACTIVE CHAMBER VIEW */}
        {state.screen === 'game' && (
          <ChamberView
            state={state}
            scenario={currentScenario}
            abyssMemory={abyssMemory}
            onChooseOption={handleChooseOption}
            onUseItem={handleUseItem}
            onOpenLoadout={() => setActiveModal('inventory')}
            onOpenRadio={() => setActiveModal('radio')}
            onOpenSurvivors={() => setActiveModal('survivors')}
            onOpenEntities={() => setActiveModal('entities')}
            onOpenHelp={() => setActiveModal('help')}
            onAbortRun={() => setState(p => ({ ...p, screen: 'menu' }))}
            onOpenTrader={() => setActiveModal('trader')}
            onOpenSecrets={() => setActiveModal('secrets')}
            onOpenResetConfirm={() => setActiveModal('reset_confirm')}
            onOpenSectorRush={() => {
              const currentEntity = ENTITIES.find(
                e => e.name.toLowerCase() === (state.activeEntity || '').toLowerCase()
              ) || ENTITIES[(state.chamber + state.mapId) % ENTITIES.length] || ENTITIES[0];
              setSectorRushEntity(currentEntity);
              setActiveModal('sector_rush');
            }}
            onAddSurvivorNote={handleAddSurvivorNote}
            onDeleteSurvivorNote={handleDeleteSurvivorNote}
            onClearSurvivorNotes={handleClearSurvivorNotes}
            onTriggerJumpscare={handleTriggerJumpscare}
          />
        )}

        {/* DEATH SCREEN */}
        {state.screen === 'death' && (
          <div className="my-auto text-center space-y-4 py-8 px-4 font-mono max-w-lg mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-red-500 tracking-widest uppercase animate-pulse">
              {t('deathTitle')}
            </h1>
            <p className="text-xs text-[#a0a8cc]">
              HYDROSTATIC CRUSH DEPTH EXCEEDED // NEURAL COHERENCE TERMINATED
            </p>

            <div className="bg-[#120f18] border-2 border-red-800 p-4 rounded text-left space-y-1.5 text-xs">
              <b className="text-amber-400 text-sm block mb-1 uppercase">
                {t('deathReport')}:
              </b>
              <p className="text-red-300">Sector: {state.mapName} (Chamber {state.chamber})</p>
              <p className="text-red-300">Primary Entity Threat: {state.activeEntity || 'The Listener'}</p>
              <p className="text-white">Score Accumulated: <b className="text-amber-400">{state.score}</b></p>
              {state.survivorNotes?.length > 0 && (
                <p className="text-cyan-300 pt-1 border-t border-red-900/60 font-mono text-[11px]">
                  📝 Survivor Field Logbook: {state.survivorNotes.length} notes recovered from crushed rig.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => {
                  audio.playClick();
                  setState(p => ({ ...p, screen: 'menu' }));
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded uppercase tracking-wider transition cursor-pointer"
              >
                {t('returnMenu')}
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  setActiveModal('reset_confirm');
                }}
                className="px-4 py-3 bg-[#1e070e] hover:bg-red-950 text-red-300 border border-red-800 hover:border-red-500 font-black text-xs rounded uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                title="RESET EXPEDITION"
              >
                <span>💀</span>
                <span>RESET EXPEDITION</span>
              </button>
            </div>
          </div>
        )}

        {/* ENDING SCREEN */}
        {state.screen === 'ending' && (
          <div className="my-auto text-center space-y-4 py-8 px-4 font-mono max-w-xl mx-auto">
            <h1 className="text-2xl sm:text-4xl font-black text-amber-400 tracking-wider uppercase">
              {t('endingTitle')}
            </h1>
            <p className="text-xs text-[#8c97b8]">
              DESCENT COMPLETED // CONSCIOUSNESS PRESERVED BEYOND THE TRENCH
            </p>

            <div className="bg-[#101426] border-2 border-amber-500/80 p-5 rounded text-left space-y-3 text-xs leading-relaxed">
              <p className="italic text-[#c8d2f2]">
                "You break through the final hydrostatic threshold. Beyond the pressure glass lies not an empty abyss, but an immense field of conscious luminescence. The recursion loop is broken."
              </p>
              <div className="pt-2 border-t border-[#232d4e] flex justify-between items-center text-sm font-bold">
                <span className="text-white">EXPEDITION SCORE:</span>
                <span className="text-amber-400 text-base">{state.score}</span>
              </div>
            </div>

            <button
              onClick={() => {
                audio.playSolve();
                setState(p => ({ ...p, screen: 'menu' }));
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm rounded uppercase tracking-wider transition cursor-pointer"
            >
              {t('returnMenu')}
            </button>
          </div>
        )}
      </main>

      {/* MODAL SUITE */}
      {activeModal === 'help' && (
        <HelpModal
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'pause' && (
        <PauseModal
          state={state}
          onResume={() => setActiveModal(null)}
          onAbort={() => {
            setActiveModal(null);
            setState(p => ({ ...p, screen: 'menu' }));
          }}
        />
      )}

      {activeModal === 'puzzle' && (
        <PuzzlesModal
          puzzleType={activePuzzle}
          chamber={state.chamber}
          difficulty={state.difficulty}
          onSolve={handlePuzzleSolve}
          onClose={() => {
            setPendingPuzzleSurvivor(null);
            setActiveModal(null);
          }}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'radio' && (
        <RadioModal
          currentFreq={state.radioFreq}
          onFreqChange={freq => setState(p => ({ ...p, radioFreq: freq }))}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          inventory={state.inventory}
          onUseItem={handleUseItem}
          onCraftItem={handleCraftItem}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
          language={state.language}
        />
      )}

      {activeModal === 'survivors' && (
        <SurvivorModal
          survivors={survivors}
          inventory={state.inventory}
          onTrade={handleSurvivorTrade}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'entities' && (
        <EntitiesModal
          abyssMemory={abyssMemory}
          onOpenResetConfirm={() => setActiveModal('reset_confirm')}
          onLaunchEntityRush={ent => {
            setSectorRushEntity(ent);
            setActiveModal('sector_rush');
          }}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
          language={state.language}
        />
      )}

      {activeModal === 'atlas' && (
        <AtlasModal
          unlockedMaps={state.unlockedMaps}
          onSelectSector={map => handleLaunchDescent(map)}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
          language={state.language}
        />
      )}

      {activeModal === 'daily' && (
        <DailyModal
          daily={state.daily}
          onStartDaily={handleStartDaily}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
          onClaimReward={handleClaimDailyReward}
          onClaimAllRewards={handleClaimAllDailyRewards}
        />
      )}

      {activeModal === 'analytics' && (
        <AnalyticsModal
          stats={state.stats}
          achievements={state.achievements}
          deathArchive={state.deathArchive}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'difficulty' && (
        <DifficultyModal
          currentDifficulty={state.difficulty}
          unlockedDifficulties={state.unlockedDifficulties || ['easy']}
          onSelectDifficulty={diff => {
            setState(p => ({ ...p, difficulty: diff }));
            setActiveModal(null);
            showToast(`DIFFICULTY: ${diff.toUpperCase()}`);
          }}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'custom_descent' && (
        <CustomDescentModal
          onLaunch={handleLaunchCustomDescent}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'trader' && (
        <TraderModal
          sector={Math.min(6, Math.max(1, Math.floor((state.chamber - 1) / 3) + 1))}
          chamber={state.chamber}
          difficulty={state.difficulty}
          inventory={state.inventory}
          onAcceptTrade={handleAcceptTraderDeal}
          onDeclineTrade={handleDeclineTraderDeal}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'rush_mode' && (
        <RushModeModal
          highScore={state.rushModeHighScore || 0}
          unlockedSecrets={state.rushModeSecretsUnlocked || []}
          onComplete={handleRushModeComplete}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          state={state}
          onChangeLanguage={lang => {
            setState(p => ({ ...p, language: lang }));
            showToast(`LANGUAGE: ${SUPPORTED_LANGUAGES[lang]?.native.toUpperCase()}`);
          }}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleHaptics={() => {
            setState(p => ({ ...p, hapticsEnabled: !p.hapticsEnabled }));
            showToast(`HAPTICS: ${!state.hapticsEnabled ? 'ACTIVE' : 'MUTED'}`);
          }}
          onToggleCRT={() => setState(p => ({ ...p, crtEnabled: !p.crtEnabled }))}
          onChangeTheme={theme => setState(p => ({ ...p, crtTheme: theme }))}
          onToggleReducedMotion={() => setState(p => ({ ...p, reducedMotion: !p.reducedMotion }))}
          onChangeVolume={vol => {
            audio.setVolume(vol);
            setState(p => ({ ...p, volume: vol }));
          }}
          onChangeMusicVolume={vol => {
            audio.setMusicVolume(vol);
            setState(p => ({ ...p, musicVolume: vol }));
          }}
          onChangeHorrorIntensity={val => {
            setState(p => ({ ...p, horrorIntensity: val }));
            showToast(`HORROR CALIBRATION: ${val.toUpperCase()}`);
          }}
          onToggleJumpscares={() => {
            setState(p => ({ ...p, jumpscaresEnabled: !(p.jumpscaresEnabled ?? true) }));
            showToast(`JUMPSCARES: ${state.jumpscaresEnabled ? 'OFF' : 'ARMED'}`);
          }}
          onToggleWhispers={() => {
            setState(p => ({ ...p, whispersEnabled: !(p.whispersEnabled ?? true) }));
            showToast(`WHISPERS: ${state.whispersEnabled ? 'MUTED' : 'ACTIVE'}`);
          }}
          onToggleHallucinations={() => {
            setState(p => ({ ...p, hallucinationsEnabled: !(p.hallucinationsEnabled ?? true) }));
            showToast(`DEMENTIA VISIONS: ${state.hallucinationsEnabled ? 'OFF' : 'ACTIVE'}`);
          }}
          onExportSave={handleExportSave}
          onTriggerVoidEvent={handleTriggerTestVoidEvent}
          onOpenResetConfirm={() => setActiveModal('reset_confirm')}
          onReplayBoot={() => setState(p => ({ ...p, screen: 'boot' }))}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'reset_confirm' && (
        <ResetConfirmModal
          memory={abyssMemory}
          onConfirmReset={handleResetTimeline}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}

      {activeModal === 'secrets' && (
        <SecretsCodexModal
          unlockedSecrets={state.rushModeSecretsUnlocked || []}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
          onTuneRadio={freq => {
            setState(p => ({ ...p, radioFreq: freq }));
            setActiveModal('radio');
          }}
        />
      )}

      {activeModal === 'sector_rush' && (
        <SectorEntityRushModal
          entity={
            sectorRushEntity ||
            ENTITIES.find(e => e.name.toLowerCase() === (state.activeEntity || '').toLowerCase()) ||
            ENTITIES[(state.chamber + state.mapId) % ENTITIES.length] ||
            ENTITIES[0]
          }
          state={state}
          abyssMemory={abyssMemory}
          onSuccess={rewards => {
            setState(prev => {
              const nextInv = rewards.itemReward && !prev.inventory.includes(rewards.itemReward)
                ? [...prev.inventory, rewards.itemReward]
                : prev.inventory;

              return {
                ...prev,
                sanity: Math.min(100, prev.sanity + rewards.sanityBonus),
                threatMeter: Math.max(0, prev.threatMeter - rewards.threatReduction),
                score: prev.score + rewards.scoreEarned,
                inventory: nextInv,
                stalkerDistanceMeters: (prev.stalkerDistanceMeters || 12.0) + 25.0,
                stats: {
                  ...prev.stats,
                  choices: prev.stats.choices + 5
                }
              };
            });
            setActiveModal(null);
            showToast(`🏆 SECTOR RUSH TRIAL MASTERED // +${rewards.scoreEarned} PTS // STALKER SUBDUED (+25m)!`);
          }}
          onFailure={penalties => {
            setState(prev => ({
              ...prev,
              sanity: Math.max(1, prev.sanity - penalties.sanityPenalty),
              threatMeter: Math.min(100, prev.threatMeter + penalties.threatIncrease),
              stalkerDistanceMeters: Math.max(1.0, (prev.stalkerDistanceMeters || 12.0) - 5.0)
            }));
            setActiveModal(null);
            showToast(`💀 SECTOR RUSH BREACH // SYSTEM RETALIATED (-${penalties.sanityPenalty} SANITY)`);
          }}
          onClose={() => setActiveModal(null)}
          hapticsEnabled={state.hapticsEnabled}
        />
      )}
        </>
      )}

      {/* Dynamic Dive Chamber & Transit Loading Screen */}
      {loadingState && loadingState.active && (
        <LoadingScreen
          mode={loadingState.mode}
          mapName={loadingState.mapName}
          mapTier={loadingState.mapTier}
          targetDepth={loadingState.targetDepth}
          durationMs={loadingState.durationMs}
          hapticsEnabled={state.hapticsEnabled}
          onComplete={() => {
            const cb = loadingState.onFinish;
            setLoadingState(null);
            if (cb) cb();
          }}
        />
      )}

      {/* Atmospheric Psychological Horror & Paranoia Overlay */}
      <HorrorParanoiaOverlay
        state={state}
        jumpscareTrigger={jumpscareTrigger}
        onClearJumpscare={() => {}}
      />
    </div>
  );
}
