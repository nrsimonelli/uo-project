import { calculateMultiHitDamage, calculateSkillDamage } from './battle-damage'
import { getDefaultTargets } from './skill-targeting'

import type {
  BattleContext,
  BattlefieldState,
  BattleEvent,
} from '@/types/battle-engine'
import type { DamageEffect } from '@/types/effects'
import type { ActiveSkill } from '@/types/skills'

/**
 * Execute a skill and return the updated battlefield state and battle event
 * For now, this is a basic implementation that handles simple damage effects
 */
export const executeSkill = (
  skill: ActiveSkill,
  actingUnit: BattleContext,
  battlefield: BattlefieldState
): {
  updatedBattlefield: BattlefieldState
  battleEvent: BattleEvent
} => {
  console.log('⚔️ SKILL EXECUTION START =====================')
  console.log(`🎯 ${actingUnit.unit.name} executes ${skill.name}`, {
    skillDetails: {
      id: skill.id,
      ap: skill.ap,
      damageType: skill.damageType,
      effectCount: skill.effects.length
    },
    casterStats: {
      PATK: actingUnit.combatStats.PATK,
      MATK: actingUnit.combatStats.MATK,
      ACC: actingUnit.combatStats.ACC,
      CRT: actingUnit.combatStats.CRT
    }
  })

  // Get targets for this skill
  const targets = getDefaultTargets(skill, actingUnit, battlefield)
  console.log(`🎯 Targeting: ${targets.length} target(s)`, targets.map(t => ({
    name: t.unit.name,
    currentHP: t.currentHP,
    stats: {
      PDEF: t.combatStats.PDEF,
      MDEF: t.combatStats.MDEF,
      EVA: t.combatStats.EVA,
      GRD: t.combatStats.GRD,
      GuardEff: t.combatStats.GuardEff || 0
    }
  })))

  // Create battle event
  const battleEvent: BattleEvent = {
    id: `skill-${skill.id}-${battlefield.actionCounter}`,
    type: 'skill-use',
    turn: battlefield.actionCounter + 1,
    description: `${actingUnit.unit.name} uses ${skill.name}`,
    actingUnit: {
      id: actingUnit.unit.id,
      name: actingUnit.unit.name,
      classKey: actingUnit.unit.classKey,
      team: actingUnit.team,
    },
    targets: targets.map(target => target.unit.id),
  }

  // Apply skill effects with comprehensive damage calculation
  const updatedUnits = { ...battlefield.units }

  console.log(`💫 Processing ${skill.effects.length} effect(s)...`)
  
  for (const effect of skill.effects) {
    console.log(`🔥 Processing ${effect.kind} effect`)
    
    if (effect.kind === 'Damage') {
      const damageEffect = effect as DamageEffect
      console.log(`⚔️ Damage effect:`, {
        potency: damageEffect.potency,
        hitRate: damageEffect.hitRate,
        hitCount: damageEffect.hitCount,
        flags: damageEffect.flags || []
      })
      
      for (const target of targets) {
        // Use comprehensive damage calculation system
        const damageResults = damageEffect.hitCount > 1 
          ? calculateMultiHitDamage(actingUnit, target, damageEffect, battlefield.rng)
          : [calculateSkillDamage(actingUnit, target, damageEffect, battlefield.rng)]

        // Apply damage from all hits
        let totalDamageDealt = 0
        let hitCount = 0
        let critCount = 0
        let guardCount = 0

        for (const result of damageResults) {
          if (result.hit) {
            totalDamageDealt += result.damage
            hitCount++
            if (result.wasCritical) critCount++
            if (result.wasGuarded) guardCount++
          }
        }

        // Apply damage to target
        if (totalDamageDealt > 0) {
          const updatedTarget = {
            ...target,
            currentHP: Math.max(0, target.currentHP - totalDamageDealt),
          }
          
          // Find the unit's key in the battlefield state
          const targetKey = Object.keys(battlefield.units).find(
            key => battlefield.units[key] === target
          )
          if (targetKey) {
            updatedUnits[targetKey] = updatedTarget
          }

          // Enhanced logging with hit/crit/guard info
          const hitInfo = damageEffect.hitCount > 1 
            ? `${hitCount}/${damageEffect.hitCount} hits`
            : `${hitCount > 0 ? 'Hit' : 'Miss'}`
          
          const specialInfo = []
          if (critCount > 0) specialInfo.push(`${critCount} Crit${critCount > 1 ? 's' : ''}`)
          if (guardCount > 0) specialInfo.push(`${guardCount} Guard${guardCount > 1 ? 's' : ''}`)
          
          const specialText = specialInfo.length > 0 ? ` (${specialInfo.join(', ')})` : ''
          
          console.log(
            `💥 ${skill.name} [${hitInfo}] deals ${totalDamageDealt} damage to ${target.unit.name}${specialText} (${target.currentHP} → ${updatedTarget.currentHP} HP)`
          )
        } else {
          // All attacks missed
          console.log(
            `💨 ${skill.name} misses ${target.unit.name} completely!`
          )
        }
      }
    } else {
      console.log(`⚠️ Effect type '${effect.kind}' not yet implemented`)
    }
    // TODO: Add other effect types (heal, buff, debuff, etc.)
  }
  
  if (skill.effects.length === 0) {
    console.log('💭 No effects to process (skill has no effects)')
  }

  console.log('⚔️ SKILL EXECUTION COMPLETE =====================')
  
  return {
    updatedBattlefield: {
      ...battlefield,
      units: updatedUnits,
    },
    battleEvent,
  }
}
