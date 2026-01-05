import { processEffects } from '@/core/battle/combat/effect-processor'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { ActiveSkill } from '@/types/skills'

/**
 * Redirect attack targets back to the original attacker
 * ReflectMagic bounces the attack back at the caster - the attack hits the original attacker
 * The reflectMagic user reflects the attack, causing it to hit the original caster instead
 */
export const applyReflectMagicRedirection = (
  _originalTargets: BattleContext[], // Not used - always redirects back to original attacker
  originalAttacker: BattleContext
): BattleContext[] => {
  // ReflectMagic bounces the attack back at the original attacker (the caster)
  // The attack is redirected to hit the original attacker instead of original targets
  return [originalAttacker]
}

/**
 * Check for reflectMagic and redirect targets if reflection should occur
 * Returns redirected targets and suppression info, or null if no reflection
 *
 * Reflection works like cover - it just redirects targets before execution.
 * The normal attack path handles everything else (AP cost, healing, tracking, etc.)
 *
 * TODO: Passive System Integration (Phase 3)
 * When the passive skill execution system is built, reflectMagic will be handled
 * automatically when beforeEnemyAttacksMagic window fires. This function will be
 * replaced by the passive system's execution flow.
 */
export const checkAndApplyReflectMagicRedirection = (
  attacker: BattleContext,
  skill: ActiveSkill,
  targets: BattleContext[],
  battlefield: BattlefieldState
): {
  redirectedTargets: BattleContext[]
  suppressedUnitId: string // Unit ID that needs suppression cleanup
  reflectUser: BattleContext // Unit with reflectMagic
} | null => {
  // Only check for reflection on magical attacks
  if (skill.innateAttackType !== 'Magical') {
    return null
  }

  // Find units on opposing team with reflectMagic
  const opposingTeam = Object.values(battlefield.units).filter(
    u => u.team !== attacker.team && u.currentHP > 0
  )

  for (const potentialReflector of opposingTeam) {
    const hasReflectMagic = potentialReflector.unit.skillSlots.some(
      slot =>
        slot.skillId === ('reflectMagic' as string) &&
        slot.skillType === 'passive'
    )

    if (!hasReflectMagic) continue

    // Simulate passive execution to check for ReflectMagicAttackEffect
    // Create context with original attack info (this will be provided by passive system in Phase 3)
    const conditionContext = {
      attacker: potentialReflector,
      target: attacker,
      battlefield,
      originalAttack: {
        skill,
        targets,
      },
    }

    // Get reflectMagic skill and process effects
    const reflectMagicSkill =
      PassiveSkillsMap['reflectMagic' as keyof typeof PassiveSkillsMap]
    if (!reflectMagicSkill) continue

    const effectResults = processEffects(
      reflectMagicSkill.effects,
      conditionContext,
      'reflectMagic'
    )

    if (effectResults.reflectedAttack) {
      // Reflection should occur - redirect targets back to attacker
      const redirectedTargets = applyReflectMagicRedirection(targets, attacker)

      return {
        redirectedTargets,
        suppressedUnitId: attacker.unit.id,
        reflectUser: potentialReflector,
      }
    }
  }

  return null // No reflection occurred
}
