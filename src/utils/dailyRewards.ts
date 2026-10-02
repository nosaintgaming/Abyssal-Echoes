import { DailyData, DailyMission, GameState } from '../types';
import { INVENTORY_ITEMS } from '../data/items';

/**
 * Resolves a daily mission reward string into an inventory item ID.
 * Examples:
 * - 'ADRENALINE STIM' -> 'stim'
 * - 'ECHO KEY' -> 'echo_key'
 * - 'SURGICAL TRAUMA KIT' -> 'trauma_kit'
 * - 'Ω-FRAGMENT' / 'OMEGA SHARD' -> 'omega_shard'
 */
export function resolveRewardItemId(reward: string): string {
  const norm = reward.trim().toLowerCase();

  if (norm.includes('adrenaline') || norm.includes('stim')) return 'stim';
  if (norm.includes('echo key') || norm.includes('echo_key')) return 'echo_key';
  if (norm.includes('surgical') || norm.includes('trauma kit') || norm.includes('trauma_kit')) return 'trauma_kit';
  if (norm.includes('medkit')) return 'medkit';
  if (norm.includes('omega') || norm.includes('ω') || norm.includes('shard') || norm.includes('fragment')) return 'omega_shard';
  if (norm.includes('flare')) return 'flare';
  if (norm.includes('flashlight')) return 'flashlight';
  if (norm.includes('crowbar')) return 'crowbar';
  if (norm.includes('wire')) return 'wire';
  if (norm.includes('lens')) return 'lens';
  if (norm.includes('earplugs') || norm.includes('damper')) return 'earplugs';
  if (norm.includes('keycard')) return 'keycard';
  if (norm.includes('scanner')) return 'uv_scanner';
  if (norm.includes('grapple')) return 'grapple_rig';
  if (norm.includes('null coin') || norm.includes('null_coin')) return 'null_coin';
  if (norm.includes('last signal') || norm.includes('last_signal')) return 'last_signal';
  if (norm.includes('compass')) return 'architects_compass';
  if (norm.includes('pearl')) return 'abyssal_black_pearl';
  if (norm.includes('hook')) return 'scavenger_hook';
  if (norm.includes('lure')) return 'scavenger_lure';

  // Direct lookup in item dictionary
  if (INVENTORY_ITEMS[reward]) return reward;
  const match = Object.keys(INVENTORY_ITEMS).find(
    k => INVENTORY_ITEMS[k].name.toLowerCase() === norm
  );
  if (match) return match;

  // Safe fallback
  return 'stim';
}

export function getRewardItemInfo(reward: string, rewardItemId?: string) {
  const id = rewardItemId || resolveRewardItemId(reward);
  const item = INVENTORY_ITEMS[id];
  return {
    id,
    name: item ? item.name : reward,
    desc: item ? item.desc : 'Emergency tactical supply.',
    rarity: item ? item.rarity : 'common',
    usable: item ? item.usable : false
  };
}

export interface DailyMissionEvalContext {
  chamber: number;
  choicesCount: number;
  corruption: number;
  sanity: number;
  threatMeter: number;
  consumablesUsed: number;
  isRunEnded?: boolean;
}

export interface DailyMissionEvalResult {
  updatedMissions: DailyMission[];
  newItemsGained: string[];
  newlyCompletedMissions: DailyMission[];
  allCompleted: boolean;
}

/**
 * Checks and updates daily missions based on active run metrics.
 * Any mission that completes immediately dispenses its promised reward item to newItemsGained.
 */
export function evaluateDailyMissions(
  missions: DailyMission[],
  context: DailyMissionEvalContext
): DailyMissionEvalResult {
  const newItemsGained: string[] = [];
  const newlyCompletedMissions: DailyMission[] = [];

  const updatedMissions = missions.map(mission => {
    let progress = mission.progress;
    let done = mission.done;
    let secretDone = mission.secretDone;
    let rewardClaimed = mission.rewardClaimed ?? mission.done;

    if (!done) {
      if (mission.id === 'chambers') {
        // PENETRATE THE DEPTH: Reach and conquer Chamber 7
        progress = Math.min(mission.goal, context.chamber);
        if (context.chamber >= mission.goal) {
          done = true;
          if (context.threatMeter < 80) {
            secretDone = true;
          }
        }
      } else if (mission.id === 'choices') {
        // TACTICAL DISCIPLINE: Make 6 survival decisions
        progress = Math.min(mission.goal, context.choicesCount);
        if (context.choicesCount >= mission.goal) {
          done = true;
        }
      } else if (mission.id === 'clean') {
        // NEURAL INTEGRITY: Maintain low corruption (< 30%) through Chamber 5
        progress = context.corruption < 30 ? Math.min(mission.goal, context.chamber) : 0;
        if (context.chamber >= mission.goal && context.corruption < 30) {
          done = true;
          if (context.sanity >= 70) {
            secretDone = true;
          }
        }
      } else if (mission.id === 'supplies') {
        // RESOURCE PRESERVATION: Reach Chamber 6 with <= 1 consumable used
        progress = context.consumablesUsed <= 1 ? Math.min(mission.goal, context.chamber) : 0;
        if (context.chamber >= mission.goal && context.consumablesUsed <= 1) {
          done = true;
          if (context.consumablesUsed === 0) {
            secretDone = true;
          }
        }
      } else {
        // Fallback for custom mission criteria
        if (progress >= mission.goal) {
          done = true;
        }
      }
    }

    // Direct Reward Delivery: When a mission transitions to completed, immediately deliver reward
    if (done && !rewardClaimed) {
      const rewardItemId = mission.rewardItemId || resolveRewardItemId(mission.reward);
      newItemsGained.push(rewardItemId);
      rewardClaimed = true;
      newlyCompletedMissions.push({
        ...mission,
        progress,
        done,
        secretDone,
        rewardClaimed: true
      });
    }

    return {
      ...mission,
      progress,
      done,
      secretDone,
      rewardClaimed
    };
  });

  const allCompleted = updatedMissions.every(m => m.done);

  return {
    updatedMissions,
    newItemsGained,
    newlyCompletedMissions,
    allCompleted
  };
}
