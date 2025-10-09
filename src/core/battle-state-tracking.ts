import type { BattlefieldState } from '@/types/battle-engine'
import type { ActiveSkill } from '@/types/skills'

/**
 * Track skill usage during battle
 * This should be called after each unit action
 */
export const trackSkillUsage = (
  state: BattlefieldState,
  skill: ActiveSkill
): Partial<BattlefieldState> => {
  // If a non-standby skill was used, reset consecutive standby rounds
  if (skill.id !== 'standby') {
    return {
      consecutiveStandbyRounds: 0,
      lastActiveSkillRound: state.currentRound,
    }
  }
  
  // For standby actions, we don't change anything here
  // We'll handle round-level tracking when the round ends
  return {}
}