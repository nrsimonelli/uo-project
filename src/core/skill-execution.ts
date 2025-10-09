import { getDefaultTargets } from './skill-targeting'

import type { BattleContext, BattlefieldState, BattleEvent } from '@/types/battle-engine'
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
  console.log(`🎯 Executing ${skill.name} by ${actingUnit.unit.name}`)

  // Get targets for this skill
  const targets = getDefaultTargets(skill, actingUnit, battlefield)
  
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

  // For now, just apply basic damage effects (if any)
  const updatedUnits = { ...battlefield.units }
  
  for (const effect of skill.effects) {
    if (effect.kind === 'Damage') {
      // Simple damage calculation for now
      const physicalPotency = effect.potency.physical || 0
      const magicalPotency = effect.potency.magical || 0
      
      for (const target of targets) {
        // Skip if this is the acting unit (unless it's intentional self-targeting)
        if (target === actingUnit && skill.targeting.group !== 'Self') continue
        
        // Basic damage calculation (simplified)
        const physicalDamage = physicalPotency > 0 
          ? Math.max(1, Math.round((actingUnit.combatStats.PATK * physicalPotency / 100) - target.combatStats.PDEF))
          : 0
        const magicalDamage = magicalPotency > 0
          ? Math.max(1, Math.round((actingUnit.combatStats.MATK * magicalPotency / 100) - target.combatStats.MDEF))
          : 0
        
        const totalDamage = physicalDamage + magicalDamage
        
        if (totalDamage > 0) {
          const updatedTarget = {
            ...target,
            currentHP: Math.max(0, target.currentHP - totalDamage)
          }
          // Find the unit's key in the battlefield state
          const targetKey = Object.keys(battlefield.units).find(
            key => battlefield.units[key] === target
          )
          if (targetKey) {
            updatedUnits[targetKey] = updatedTarget
          }
          
          console.log(`💥 ${skill.name} deals ${totalDamage} damage to ${target.unit.name} (${target.currentHP} → ${updatedTarget.currentHP} HP)`)
        }
      }
    }
    // TODO: Add other effect types (heal, buff, debuff, etc.)
  }

  return {
    updatedBattlefield: {
      ...battlefield,
      units: updatedUnits
    },
    battleEvent
  }
}