// Real-time Player Movement & Behavioral Telemetry Tracker
// Observes player mouse movements, tremors, hesitation, decision velocity,
// and feeds live biological telemetry into entity sentience engines.

export type MovementState = 'STEADY_CALCULATED' | 'PANICKED_TREMOR' | 'PARALYZED_FREEZE' | 'HESITANT_HOVER';

export interface MovementTelemetry {
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  rawX: number;
  rawY: number;
  velocityPxPerSec: number;
  movementState: MovementState;
  hoveredOptionIndex: number | null;
  hoverDurationMs: number;
  idleDurationMs: number;
  lastMovementTimestamp: number;
}

export interface EntitySentienceAssessment {
  entityId: string;
  threatEvaluation: string;
  behavioralVerdict: string;
  activeCountermeasure: string | null;
  psychologicalTrigger: string | null;
}

class PlayerBehaviorTracker {
  private telemetry: MovementTelemetry = {
    x: 0.5,
    y: 0.5,
    rawX: 500,
    rawY: 400,
    velocityPxPerSec: 0,
    movementState: 'STEADY_CALCULATED',
    hoveredOptionIndex: null,
    hoverDurationMs: 0,
    idleDurationMs: 0,
    lastMovementTimestamp: Date.now()
  };

  private lastPos = { x: 500, y: 400, t: Date.now() };
  private velocityHistory: number[] = [];
  private listeners: Set<(telemetry: MovementTelemetry) => void> = new Set();
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });

    // Periodic idle and hesitation evaluation
    setInterval(() => {
      const now = Date.now();
      const idleTime = now - this.telemetry.lastMovementTimestamp;
      this.telemetry.idleDurationMs = idleTime;

      if (this.telemetry.hoveredOptionIndex !== null) {
        this.telemetry.hoverDurationMs += 200;
        if (this.telemetry.hoverDurationMs >= 2500) {
          this.telemetry.movementState = 'HESITANT_HOVER';
        }
      } else if (idleTime >= 3200) {
        this.telemetry.movementState = 'PARALYZED_FREEZE';
      } else if (this.telemetry.velocityPxPerSec < 600) {
        this.telemetry.movementState = 'STEADY_CALCULATED';
      }

      this.notifyListeners();
    }, 200);
  }

  private handleMouseMove = (e: MouseEvent) => {
    const now = Date.now();
    const dt = Math.max(1, now - this.lastPos.t);
    const dx = e.clientX - this.lastPos.x;
    const dy = e.clientY - this.lastPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const instantaneousVelocity = (dist / dt) * 1000; // px/sec

    this.velocityHistory.push(instantaneousVelocity);
    if (this.velocityHistory.length > 5) this.velocityHistory.shift();
    const avgVelocity = this.velocityHistory.reduce((a, b) => a + b, 0) / this.velocityHistory.length;

    this.telemetry.rawX = e.clientX;
    this.telemetry.rawY = e.clientY;
    this.telemetry.x = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
    this.telemetry.y = Math.max(0, Math.min(1, e.clientY / window.innerHeight));
    this.telemetry.velocityPxPerSec = Math.round(avgVelocity);
    this.telemetry.lastMovementTimestamp = now;
    this.telemetry.idleDurationMs = 0;

    // Detect panicked tremors (rapid frantic back-and-forth or velocity > 1300 px/sec)
    if (avgVelocity > 1350) {
      this.telemetry.movementState = 'PANICKED_TREMOR';
    } else if (this.telemetry.hoveredOptionIndex === null) {
      this.telemetry.movementState = 'STEADY_CALCULATED';
    }

    this.lastPos = { x: e.clientX, y: e.clientY, t: now };
    this.notifyListeners();
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      } as MouseEvent);
    }
  };

  public setHoveredOption(index: number | null) {
    if (this.telemetry.hoveredOptionIndex !== index) {
      this.telemetry.hoveredOptionIndex = index;
      this.telemetry.hoverDurationMs = 0;
      if (index === null && this.telemetry.movementState === 'HESITANT_HOVER') {
        this.telemetry.movementState = 'STEADY_CALCULATED';
      }
      this.notifyListeners();
    }
  }

  public getTelemetry(): MovementTelemetry {
    return { ...this.telemetry };
  }

  public subscribe(fn: (t: MovementTelemetry) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.telemetry));
  }

  // Generate dynamic sentience assessment based on movement telemetry
  public assessEntityReaction(
    entityId: string,
    predictabilityScore: number,
    consecutiveChoices: number,
    sanity: number
  ): EntitySentienceAssessment {
    const t = this.telemetry;

    switch (entityId.toLowerCase()) {
      case 'warden': {
        const isHesitant = t.movementState === 'HESITANT_HOVER' && t.hoverDurationMs >= 2500;
        const isRepetitive = consecutiveChoices >= 2 || predictabilityScore >= 50;

        return {
          entityId: 'warden',
          threatEvaluation: isHesitant ? 'HESITATION REGISTERED' : isRepetitive ? 'PREDICTABLE VECTOR' : 'TRACKING SECTOR EXIT',
          behavioralVerdict: isHesitant
            ? `Lingered ${(t.hoverDurationMs / 1000).toFixed(1)}s at Door ${(t.hoveredOptionIndex ?? 0) + 1}. Hydraulic lock pre-armed.`
            : isRepetitive
            ? `Pattern repetition detected (${predictabilityScore}% predictability). Guillotine trap primed.`
            : `Telemetry scan normal. Hydraulic cameras tracking cursor coordinates [${Math.round(t.x * 100)}%, ${Math.round(t.y * 100)}%].`,
          activeCountermeasure: isHesitant || isRepetitive ? 'HYDRAULIC BULKHEAD LOCKDOWN' : null,
          psychologicalTrigger: isHesitant ? 'DOUBT_EXPLOIT' : isRepetitive ? 'REPETITION_PUNISH' : null
        };
      }

      case 'listener': {
        const isPanicking = t.movementState === 'PANICKED_TREMOR';
        return {
          entityId: 'listener',
          threatEvaluation: isPanicking ? 'ACOUSTIC TURBULENCE SPIKE' : 'INFRASOUND APEX LISTENING',
          behavioralVerdict: isPanicking
            ? `Hand tremor detected (${t.velocityPxPerSec} px/s). Acoustic signature spiking through titanium hull.`
            : `Listening to sub-surface vibration. Keep mouse and keys quiet.`,
          activeCountermeasure: isPanicking ? 'ACOUSTIC SHOCKWAVE DISCHARGE' : null,
          psychologicalTrigger: isPanicking ? 'PANIC_AMPLIFICATION' : null
        };
      }

      case 'null_stalker': {
        const isFrozen = t.movementState === 'PARALYZED_FREEZE';
        return {
          entityId: 'null_stalker',
          threatEvaluation: isFrozen ? 'PREY IMMOBILIZED' : 'SHADOW OBSERVER ACTIVE',
          behavioralVerdict: isFrozen
            ? `Subject frozen in place for ${(t.idleDurationMs / 1000).toFixed(1)}s. The Null Stalker steps into your blind spot.`
            : `Shadow apparition stalks cursor periphery. It feeds when you blink.`,
          activeCountermeasure: isFrozen ? 'SUB-DIMENSIONAL LUNGE' : null,
          psychologicalTrigger: isFrozen ? 'FREEZE_STALK' : null
        };
      }

      case 'mimic': {
        const isHoveringOption = t.hoveredOptionIndex !== null && t.hoverDurationMs >= 1500;
        return {
          entityId: 'mimic',
          threatEvaluation: isHoveringOption ? 'LURE INSPECTION ACTIVE' : 'POLYMORPHIC DECOY DEPLOYED',
          behavioralVerdict: isHoveringOption
            ? `Diver hesitating before the hatch... The teeth beneath the latch are shivering in anticipation.`
            : `Broadcasting synthesized survivor distress beacons tailored to your lowest vital stat.`,
          activeCountermeasure: isHoveringOption ? 'POLYMORPHIC AMBUSH' : null,
          psychologicalTrigger: 'GREED_DESPERATION'
        };
      }

      case 'the_abyss': {
        return {
          entityId: 'the_abyss',
          threatEvaluation: 'PRIMORDIAL SINGULARITY GRAVITY',
          behavioralVerdict: `You move the cursor, yet every coordinate still rests at the bottom of the Mariana Rift. 1,400 atmospheres of salt pressure await.`,
          activeCountermeasure: 'RECURSION SINGULARITY PULL',
          psychologicalTrigger: 'EXISTENTIAL_DISSOLUTION'
        };
      }

      default:
        return {
          entityId,
          threatEvaluation: 'HADAL SPECIMEN SURVEILLANCE',
          behavioralVerdict: `Entity sensors attuned to diver movement velocity [${t.velocityPxPerSec} px/s].`,
          activeCountermeasure: null,
          psychologicalTrigger: null
        };
    }
  }
}

export const behaviorTracker = new PlayerBehaviorTracker();
