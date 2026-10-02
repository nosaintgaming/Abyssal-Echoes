// Sentient Entity Neural Adaptation Engine
// Dynamically analyzes diver decision habits, input velocity, acoustic discipline,
// inventory hoarding, and previous cycle fatalities to formulate adaptive countermeasures.

export interface PlayerDecisionHabits {
  doorFrequency: [number, number, number]; // Picks for options 0, 1, 2
  totalChoices: number;
  loudChoices: number;
  stealthChoices: number;
  consecutiveLoud: number;
  consecutiveStealth: number;
  consecutiveIdenticalDoor: number;
  lastDoorIndex: number;
  averageDecisionTimeMs: number;
  recentDecisionTimesMs: number[];
  hoardedItemsCount: number;
  survivorsAbandoned: number;
  survivorsRescued: number;
  cycleDeaths: number;
  lastDeathEntity: string;
  lastDeathChamber: number;
}

export interface ActiveEntitySentienceState {
  entityId: string;
  entityName: string;
  sentienceLevel: 'DORMANT' | 'OBSERVING' | 'ATTUNED' | 'HYPER_SENTIENT' | 'PREDATOR_APEX';
  threatClassification: string;
  behavioralEvaluation: string;
  activeCountermeasure: string | null;
  psychologicalTaunt: string;
  targetedResource: 'SANITY' | 'CORRUPTION' | 'INVENTORY' | 'TIME' | 'ACOUSTIC';
  mutationFactor: number; // 1.0 to 3.0 scale of adaptation intensity
  specificAdaptations: {
    guardedDoorIndex?: number | null;
    disguisedDoorIndex?: number | null;
    infrasoundActive?: boolean;
    hoardedItemTarget?: string | null;
    spatialInversionActive?: boolean;
    temporalShearActive?: boolean;
    stalkerApproachAccelerated?: boolean;
    liturgicalVerse?: string | null;
  };
}

class EntitySentienceEngine {
  private habits: PlayerDecisionHabits = {
    doorFrequency: [0, 0, 0],
    totalChoices: 0,
    loudChoices: 0,
    stealthChoices: 0,
    consecutiveLoud: 0,
    consecutiveStealth: 0,
    consecutiveIdenticalDoor: 0,
    lastDoorIndex: -1,
    averageDecisionTimeMs: 2500,
    recentDecisionTimesMs: [],
    hoardedItemsCount: 0,
    survivorsAbandoned: 0,
    survivorsRescued: 0,
    cycleDeaths: 0,
    lastDeathEntity: 'NONE',
    lastDeathChamber: 0
  };

  private lastDecisionStartTime: number = Date.now();

  public markDecisionStart() {
    this.lastDecisionStartTime = Date.now();
  }

  public recordDecision(
    doorIndex: number,
    isLoud: boolean,
    inventory: string[],
    survivorsCount: number,
    activeEntity?: string
  ): { elapsedMs: number } {
    const now = Date.now();
    const elapsedMs = Math.max(200, now - this.lastDecisionStartTime);
    this.lastDecisionStartTime = now;

    this.habits.totalChoices += 1;
    const validIdx = Math.min(2, Math.max(0, doorIndex));
    this.habits.doorFrequency[validIdx] += 1;

    // Track consecutive doors
    if (this.habits.lastDoorIndex === doorIndex) {
      this.habits.consecutiveIdenticalDoor += 1;
    } else {
      this.habits.consecutiveIdenticalDoor = 1;
      this.habits.lastDoorIndex = doorIndex;
    }

    // Acoustic habits
    if (isLoud) {
      this.habits.loudChoices += 1;
      this.habits.consecutiveLoud += 1;
      this.habits.consecutiveStealth = 0;
    } else {
      this.habits.stealthChoices += 1;
      this.habits.consecutiveStealth += 1;
      this.habits.consecutiveLoud = 0;
    }

    // Decision speed
    this.habits.recentDecisionTimesMs.push(elapsedMs);
    if (this.habits.recentDecisionTimesMs.length > 8) {
      this.habits.recentDecisionTimesMs.shift();
    }
    const sum = this.habits.recentDecisionTimesMs.reduce((a, b) => a + b, 0);
    this.habits.averageDecisionTimeMs = Math.round(sum / this.habits.recentDecisionTimesMs.length);

    // Hoarding
    this.habits.hoardedItemsCount = inventory.length;

    return { elapsedMs };
  }

  public recordDeath(entityName: string, chamber: number) {
    this.habits.cycleDeaths += 1;
    this.habits.lastDeathEntity = entityName;
    this.habits.lastDeathChamber = chamber;
  }

  public getPredictabilityPercentage(): number {
    const total = this.habits.doorFrequency[0] + this.habits.doorFrequency[1] + this.habits.doorFrequency[2];
    if (total === 0) return 33;
    const max = Math.max(...this.habits.doorFrequency);
    return Math.round((max / total) * 100);
  }

  public getPlayerPlaystyleProfile(): string {
    const h = this.habits;
    const isRash = h.averageDecisionTimeMs < 1200 && h.totalChoices >= 3;
    const isHesitant = h.averageDecisionTimeMs > 4000;
    const isLoud = (h.loudChoices / Math.max(1, h.totalChoices)) > 0.45;
    const isHoarder = h.hoardedItemsCount >= 5;

    if (isRash && isLoud) return 'RECKLESS_BREACHER';
    if (isRash) return 'RASH_IMPULSIVE';
    if (isHesitant) return 'PARALYZED_OVERTHINKER';
    if (isHoarder) return 'ANXIOUS_HOARDER';
    if (isLoud) return 'ACOUSTIC_PROVOCATEUR';
    return 'CALCULATING_SURVIVOR';
  }

  // Synthesize comprehensive sentience dossier for an entity
  public evaluateEntitySentience(
    entityId: string,
    currentChamber: number,
    sanity: number,
    corruption: number,
    inventory: string[],
    resetsCount: number
  ): ActiveEntitySentienceState {
    const h = this.habits;
    const predictability = this.getPredictabilityPercentage();
    const playstyle = this.getPlayerPlaystyleProfile();
    const entId = (entityId || 'the_abyss').toLowerCase();

    // The Warden
    if (entId.includes('warden')) {
      const mostPickedIdx = h.doorFrequency.indexOf(Math.max(...h.doorFrequency));
      const isRepetitive = h.consecutiveIdenticalDoor >= 2 || predictability >= 50;
      const guardedDoor = isRepetitive ? (h.consecutiveIdenticalDoor >= 2 ? h.lastDoorIndex : mostPickedIdx) : null;

      return {
        entityId: 'warden',
        entityName: 'THE WARDEN',
        sentienceLevel: isRepetitive ? 'HYPER_SENTIENT' : 'ATTUNED',
        threatClassification: 'CORRUPTED HYDRAULIC DEFENSE CORE',
        behavioralEvaluation: isRepetitive
          ? `Subject demonstrates ${predictability}% bias towards Door ${(guardedDoor ?? 0) + 1}. Hydraulic lock pre-armed.`
          : `Tracking divergence vector. Average decision latency: ${(h.averageDecisionTimeMs / 1000).toFixed(1)}s.`,
        activeCountermeasure: guardedDoor !== null ? `BULKHEAD LOCKDOWN ON DOOR ${(guardedDoor + 1)}` : null,
        psychologicalTaunt: isRepetitive
          ? `WARDEN: "YOU HAVE CHOSEN DOOR ${(guardedDoor ?? 0) + 1} REPEATEDLY. DO YOU THINK MY PNEUMATICS CANNOT PREDICT A TWO-BIT ALGORITHM?"`
          : `WARDEN: "VARY YOUR VECTORS ALL YOU WISH, DIVER. EVERY AIRLOCK CLOSES INTO STEEL."`,
        targetedResource: 'SANITY',
        mutationFactor: Math.min(2.5, 1.0 + (predictability / 100)),
        specificAdaptations: {
          guardedDoorIndex: guardedDoor
        }
      };
    }

    // The Listener
    if (entId.includes('listener')) {
      const isReckless = h.consecutiveLoud >= 2 || (h.loudChoices / Math.max(1, h.totalChoices)) > 0.4;
      const isTooQuiet = h.consecutiveStealth >= 3;

      return {
        entityId: 'listener',
        entityName: 'THE LISTENER',
        sentienceLevel: isReckless ? 'PREDATOR_APEX' : 'ATTUNED',
        threatClassification: 'CLASS VI HYDROSTATIC ACOUSTIC APEX',
        behavioralEvaluation: isReckless
          ? `Acoustic spikes detected (${h.consecutiveLoud} consecutive loud decisions). Infrasound cilia resonating.`
          : isTooQuiet
          ? `Prolonged silence (${h.consecutiveStealth} stealth decisions). Listener emitting high-frequency sonar ping to flush prey.`
          : `Infrasound gills tuning to diver breathing through titanium bulkheads.`,
        activeCountermeasure: isReckless ? 'INFRASOUND RESONATOR SHOCKWAVE' : isTooQuiet ? 'HIGH-FREQUENCY SONAR PURGE' : null,
        psychologicalTaunt: isReckless
          ? `LISTENER: "YOUR METALLIC BOOTS SCRAPE THE HULL. I DO NOT NEED EYES TO PULVERIZE YOUR SKULL."`
          : `LISTENER: "I HEAR THE LIQUID SHIFTING IN YOUR MIDDLE EAR. HOLD YOUR BREATH."`,
        targetedResource: 'SANITY',
        mutationFactor: isReckless ? 2.0 : 1.3,
        specificAdaptations: {
          infrasoundActive: isReckless || isTooQuiet
        }
      };
    }

    // The Mimic
    if (entId.includes('mimic')) {
      // Disguises bait as whatever the player needs most
      const needsSanity = sanity < 45;
      const needsCure = corruption > 30;
      const disguisedDoor = h.lastDoorIndex >= 0 ? (h.lastDoorIndex === 0 ? 1 : 0) : 1;

      return {
        entityId: 'mimic',
        entityName: 'THE MIMIC',
        sentienceLevel: 'HYPER_SENTIENT',
        threatClassification: 'CLASS VI POLYMORPHIC FLESH DECOY',
        behavioralEvaluation: `Scanning physiological distress: Sanity ${sanity}%, Corruption ${corruption}%. Synthesizing distress beacon lure.`,
        activeCountermeasure: `POLYMORPHIC AMBUSH PRIMED ON DOOR ${disguisedDoor + 1}`,
        psychologicalTaunt: needsSanity
          ? `MIMIC: "Diver, over here... I have an unspent Adrenaline Stim... Just unseal this hatch..."`
          : needsCure
          ? `MIMIC: "The water is clean inside this airlock... You can wash the black brine from your skin..."`
          : `MIMIC: "It is Dr. Vane... We survived the pressure breach... Open up..."`,
        targetedResource: 'CORRUPTION',
        mutationFactor: 1.8,
        specificAdaptations: {
          disguisedDoorIndex: disguisedDoor
        }
      };
    }

    // The Curator
    if (entId.includes('curator')) {
      const isHoarding = inventory.length >= 4;
      const targetItem = inventory.find(i => ['stim', 'medkit', 'echo_key', 'omega_shard'].includes(i)) || inventory[0] || 'gear';

      return {
        entityId: 'curator',
        entityName: 'THE CURATOR',
        sentienceLevel: isHoarding ? 'PREDATOR_APEX' : 'OBSERVING',
        threatClassification: 'MULTI-JOINTED OSTEOPHAGIC SCAVENGER',
        behavioralEvaluation: isHoarding
          ? `Diver carrying ${inventory.length} artifacts. Scavenger limbs twitching to excise ${targetItem.toUpperCase()}.`
          : `Watching diver supply belt with 17 multi-jointed spider eyes.`,
        activeCountermeasure: isHoarding ? `TARGETED PICKPOCKET: ${targetItem.toUpperCase()}` : null,
        psychologicalTaunt: isHoarding
          ? `CURATOR: "YOUR PACK WEIGHS HEAVY WITH THAT ${targetItem.toUpperCase()}. DROP IT IN THE BRINE OR I WILL WEAVE YOUR FINGERS INTO MY CEILING."`
          : `CURATOR: "EVERY ARTIFACT YOU FIND IS ONLY BEING HELD IN TRUST FOR MY BONE VAULT."`,
        targetedResource: 'INVENTORY',
        mutationFactor: isHoarding ? 2.2 : 1.2,
        specificAdaptations: {
          hoardedItemTarget: targetItem
        }
      };
    }

    // The Null Stalker
    if (entId.includes('null_stalker') || entId.includes('stalker')) {
      const isHesitant = h.averageDecisionTimeMs > 3500;

      return {
        entityId: 'null_stalker',
        entityName: 'THE NULL STALKER',
        sentienceLevel: isHesitant ? 'HYPER_SENTIENT' : 'ATTUNED',
        threatClassification: 'SUB-DIMENSIONAL NEURAL VOID',
        behavioralEvaluation: isHesitant
          ? `Subject exhibits cognitive paralysis (${(h.averageDecisionTimeMs / 1000).toFixed(1)}s decision lag). Sub-dimensional lunge primed.`
          : `Stalking cursor coordinates. Shadow silhouette bleeding into peripheral vision.`,
        activeCountermeasure: isHesitant ? 'SHADOW BLINDNESS FIELD' : null,
        psychologicalTaunt: isHesitant
          ? `NULL STALKER: "YOU HESITATE BEFORE EVERY HATCH. WHILE YOU THINK, MY SHADOW HAS ALREADY ENTERED YOUR DIVE SUIT."`
          : `NULL STALKER: "I EXIST IN THE THREE SECONDS BETWEEN YOUR BLINKS."`,
        targetedResource: 'SANITY',
        mutationFactor: isHesitant ? 2.4 : 1.4,
        specificAdaptations: {
          stalkerApproachAccelerated: isHesitant
        }
      };
    }

    // The Cartographer
    if (entId.includes('cartographer')) {
      const shouldInvert = predictability >= 45;

      return {
        entityId: 'cartographer',
        entityName: 'THE CARTOGRAPHER',
        sentienceLevel: shouldInvert ? 'HYPER_SENTIENT' : 'ATTUNED',
        threatClassification: 'GEOMORPHIC SCHEMATIC REWRITER',
        behavioralEvaluation: shouldInvert
          ? `Predictability score (${predictability}%) triggers geomorphic inversion. Bulkhead doors shifting in real time.`
          : `Mapping navigation history. Mercury tentacles dissolving station floorplans.`,
        activeCountermeasure: shouldInvert ? 'GEOMORPHIC MAZE INVERSION' : null,
        psychologicalTaunt: shouldInvert
          ? `CARTOGRAPHER: "YOU MEMORIZED THIS CHAMBER IN YOUR LAST CYCLE. I HAVE ALREADY DISSOLVED THE CORRIDOR BEHIND YOU."`
          : `CARTOGRAPHER: "THERE ARE NO RECTANGLES AT -10,000 METERS. ONLY FRACTALS."`,
        targetedResource: 'TIME',
        mutationFactor: 1.7,
        specificAdaptations: {
          spatialInversionActive: shouldInvert
        }
      };
    }

    // The Chrono-Leviathan
    if (entId.includes('chrono') || entId.includes('leviathan')) {
      const isSpeedClicking = h.averageDecisionTimeMs < 1000 && h.totalChoices >= 3;

      return {
        entityId: 'chrono_leviathan',
        entityName: 'THE CHRONO-LEVIATHAN',
        sentienceLevel: isSpeedClicking ? 'HYPER_SENTIENT' : 'ATTUNED',
        threatClassification: 'TEMPORAL HYDROSTATIC DISTORTION WHALE',
        behavioralEvaluation: isSpeedClicking
          ? `Impulsive decision velocity (${h.averageDecisionTimeMs}ms) detected. Causality shear primed to revert chamber progression.`
          : `12Hz heartbeat bending local space-time continuum around station hull.`,
        activeCountermeasure: isSpeedClicking ? 'TEMPORAL PROGRESSION REVERSION' : null,
        psychologicalTaunt: isSpeedClicking
          ? `CHRONO-LEVIATHAN: "YOU RUSH AS IF SECONDS EXIST HERE. YOU WILL DROWN IN THIS EXACT CHAMBER AGAIN YESTERDAY."`
          : `CHRONO-LEVIATHAN: "EVERY BEAT OF MY HEART UNWINDS THREE MINUTES OF YOUR REALITY."`,
        targetedResource: 'TIME',
        mutationFactor: 2.0,
        specificAdaptations: {
          temporalShearActive: isSpeedClicking
        }
      };
    }

    // Default: The Abyss / Primordial Singularity
    return {
      entityId: 'the_abyss',
      entityName: 'THE ABYSS',
      sentienceLevel: resetsCount > 0 ? 'PREDATOR_APEX' : 'HYPER_SENTIENT',
      threatClassification: 'PRIMORDIAL HYDROSTATIC SINGULARITY',
      behavioralEvaluation: `Synthesizing ${h.totalChoices} choices across ${resetsCount} timeline resets. Profiling playstyle: ${playstyle}.`,
      activeCountermeasure: 'HYDROSTATIC GRAVITATIONAL PULL',
      psychologicalTaunt: resetsCount > 0
        ? `THE ABYSS: "You wiped your logs ${resetsCount} times, ${playstyle.toLowerCase()}. Yet your salt still feeds my bottomless trench."`
        : `THE ABYSS: "Descend further. You are not exploring the ocean—you are being digested."`,
      targetedResource: 'SANITY',
      mutationFactor: 2.5,
      specificAdaptations: {}
    };
  }
}

export const sentienceEngine = new EntitySentienceEngine();
