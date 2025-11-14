import type {
  MultiTargetSkillResult,
  SingleTargetSkillResult,
} from '@/core/battle/combat/skill-executor'
import {
  checkAndConsumeSurviveLethal,
  getBuffsForStat,
  getDebuffsForStat,
} from '@/core/battle/combat/status-effects'
import { getStateIdForContext } from '@/core/battle/engine/utils/state-ids'
import { getEquipmentById } from '@/core/equipment-lookup'
import type {
  BattleEvent,
  BattleContext,
  BattlefieldState,
} from '@/types/battle-engine'
import type { ExtraStats } from '@/types/equipment'

export function transformSkillResults(
  result: SingleTargetSkillResult | MultiTargetSkillResult,
  targets: BattleContext[]
): BattleEvent['skillResults'] {
  // Debug logging to track the issue
  console.debug('transformSkillResults called with:', {
    resultType: 'damageResults' in result ? 'SingleTarget' : 'MultiTarget',
    hasResults: 'results' in result,
    targetCount: targets.length,
    targetNames: targets.map(t => t.unit.name),
  })

  if ('damageResults' in result) {
    if (targets.length > 1) {
      console.warn(
        `⚠️  Single target skill received ${targets.length} targets:`,
        targets.map(t => t.unit.name)
      )
    }
    const target = targets[0]
    if (!target) return undefined
    return {
      targetResults: [
        {
          targetId: target.unit.id,
          targetName: target.unit.name,
          hits: result.damageResults.map(dmgResult => ({
            hit: dmgResult.hit,
            damage: dmgResult.damage,
            wasCritical: dmgResult.wasCritical,
            wasGuarded: dmgResult.wasGuarded,
            hitChance: dmgResult.hitChance,
          })),
          totalDamage: result.totalDamage,
        },
      ],
    }
  }

  return {
    targetResults: result.results.map((singleResult, index) => {
      const target = targets[index]
      if (!target) {
        console.warn(`Missing target for index ${index}`)
        return {
          targetId: 'unknown',
          targetName: 'Unknown',
          hits: [],
          totalDamage: 0,
        }
      }
      return {
        targetId: target.unit.id,
        targetName: target.unit.name,
        hits: singleResult.damageResults.map(dmgResult => ({
          hit: dmgResult.hit,
          damage: dmgResult.damage,
          wasCritical: dmgResult.wasCritical,
          wasGuarded: dmgResult.wasGuarded,
          hitChance: dmgResult.hitChance,
        })),
        totalDamage: singleResult.totalDamage,
      }
    }),
    summary: result.summary,
  }
}

export function buildPostAttackSets(
  result: SingleTargetSkillResult | MultiTargetSkillResult,
  targets: BattleContext[]
): { attackedIds: string[]; hitIds: string[]; anyGuarded: boolean } {
  // Get IDs of all targets regardless of hit status
  const attackedIds = targets.map(getStateIdForContext)

  // Determine which targets were actually hit
  let hitIds: string[] = []
  let anyGuarded = false

  if ('results' in result) {
    // Multi-target case: Check each result separately
    result.results.forEach((singleResult, index) => {
      const target = targets[index]
      if (singleResult.anyHit && target) {
        const sid = getStateIdForContext(target)
        if (!hitIds.includes(sid)) {
          hitIds.push(sid)
        }
      }

      // Check for guarded hits in this result
      if (singleResult.damageResults.some(hit => hit.wasGuarded)) {
        anyGuarded = true
      }
    })
  } else {
    // Single-target case: Only check the one result
    if (result.anyHit && targets[0]) {
      hitIds = [getStateIdForContext(targets[0])]
    }

    // Check for guarded hits
    anyGuarded = result.damageResults.some(hit => hit.wasGuarded)
  }

  return { attackedIds, hitIds, anyGuarded }
}

function applyLifeStealEffects(
  state: BattlefieldState,
  attackerId: string,
  targetId: string,
  totalDamage: number,
  lifeSteals: { percentage: number; target: 'User' | 'Target' }[],
  grantedFlags?: string[]
): BattlefieldState {
  const attackerState = state.units[attackerId]
  if (!attackerState) return state

  // Get drain effectiveness modifiers from buffs/debuffs
  const drainBuffs = getBuffsForStat(attackerState, 'DrainEff' as ExtraStats)
  const drainDebuffs = getDebuffsForStat(
    attackerState,
    'DrainEff' as ExtraStats
  )
  const drainEff =
    drainBuffs.reduce((sum, buff) => sum + (buff.value || 0), 0) +
    drainDebuffs.reduce((sum, debuff) => sum + (debuff.value || 0), 0)

  // Get HP recovery modifiers from buffs/debuffs
  const recoveryBuffs = getBuffsForStat(
    attackerState,
    'HPRecovery' as ExtraStats
  )
  const recoveryDebuffs = getDebuffsForStat(
    attackerState,
    'HPRecovery' as ExtraStats
  )
  const hpRecovery =
    recoveryBuffs.reduce((sum, buff) => sum + (buff.value || 0), 0) +
    recoveryDebuffs.reduce((sum, debuff) => sum + (debuff.value || 0), 0)

  for (const ls of lifeSteals) {
    // DrainEff adds directly to the LifeSteal percentage before calculating healing
    const effectiveLifeStealPercent = ls.percentage + drainEff
    const baseHeal = Math.round((totalDamage * effectiveLifeStealPercent) / 100)
    // Apply HPRecovery multiplier after calculating base life steal amount
    const finalHeal = Math.round(baseHeal * (1 + hpRecovery / 100))

    // Determine who receives the heal
    const healTargetState =
      ls.target === 'User' ? attackerState : state.units[targetId]
    if (healTargetState) {
      const allowOverheal = grantedFlags?.includes('Overheal')
      const newHP = healTargetState.currentHP + finalHeal
      const cappedHP = allowOverheal
        ? newHP
        : Math.min(newHP, healTargetState.combatStats.HP)

      state.units[ls.target === 'User' ? attackerId : targetId] = {
        ...healTargetState,
        unit: { ...healTargetState.unit },
        combatStats: { ...healTargetState.combatStats },
        afflictions: [...healTargetState.afflictions],
        buffs: [...healTargetState.buffs],
        debuffs: [...healTargetState.debuffs],
        currentHP: cappedHP,
      }
    }
  }

  return state
}

export function getOnActiveHealPercent(unit: BattleContext): number {
  let total = 0

  for (const equippedItem of unit.unit.equipment) {
    if (equippedItem.itemId) {
      const equipment = getEquipmentById(equippedItem.itemId)
      if (equipment?.stats?.OnActiveHealPercent) {
        total += equipment.stats.OnActiveHealPercent
      }
    }
  }

  // Get from buffs (skills can grant OnActiveHealPercent as a buff stat)
  const onActiveHealBuffs = getBuffsForStat(
    unit,
    'OnActiveHealPercent' as ExtraStats
  )
  total += onActiveHealBuffs.reduce((sum, buff) => sum + (buff.value || 0), 0)

  return total
}

export function calculateOnActiveHealAmount(unit: BattleContext): number {
  // Get OnActiveHealPercent from equipment and buffs
  const onActiveHealPercent = getOnActiveHealPercent(unit)
  if (onActiveHealPercent === 0) return 0

  // Get HP recovery modifiers from buffs/debuffs (additive)
  const recoveryBuffs = getBuffsForStat(unit, 'HPRecovery' as ExtraStats)
  const recoveryDebuffs = getDebuffsForStat(unit, 'HPRecovery' as ExtraStats)
  const hpRecovery =
    recoveryBuffs.reduce((sum, buff) => sum + (buff.value || 0), 0) +
    recoveryDebuffs.reduce((sum, debuff) => sum + (debuff.value || 0), 0)

  // Calculate base heal: (maxHP * OnActiveHealPercent) / 100
  const baseHeal = Math.round((unit.combatStats.HP * onActiveHealPercent) / 100)

  // Apply HPRecovery multiplier: baseHeal * (1 + hpRecovery / 100)
  const finalHeal = Math.round(baseHeal * (1 + hpRecovery / 100))

  return finalHeal
}

export function applyOnActiveHealPercent(
  state: BattlefieldState,
  unitId: string
): BattlefieldState {
  const unitState = state.units[unitId]
  if (!unitState) return state

  const healAmount = calculateOnActiveHealAmount(unitState)
  if (healAmount === 0) return state

  // Save pre-heal currentHP for cap calculation
  const preHealCurrentHP = unitState.currentHP

  // Calculate new HP after healing
  const newHP = preHealCurrentHP + healAmount

  // Cap logic:
  // - If currentHP <= maxHP: cap at maxHP
  // - If currentHP > maxHP (overhealed): cap at pre-heal currentHP (preserves overheal, doesn't increase)
  const cap = Math.max(unitState.combatStats.HP, preHealCurrentHP)
  const cappedHP = Math.min(newHP, cap)

  state.units[unitId] = {
    ...unitState,
    unit: { ...unitState.unit },
    combatStats: { ...unitState.combatStats },
    afflictions: [...unitState.afflictions],
    buffs: [...unitState.buffs],
    debuffs: [...unitState.debuffs],
    currentHP: cappedHP,
  }

  return state
}

export function applySkillDamageResults(
  state: BattlefieldState,
  targets: BattleContext[],
  result: SingleTargetSkillResult | MultiTargetSkillResult
): BattlefieldState {
  if ('results' in result) {
    // Multi-target
    for (let i = 0; i < result.results.length; i += 1) {
      const target = targets[i]
      const single = result.results[i]
      if (target && single) {
        const sid = getStateIdForContext(target)
        const current = state.units[sid]
        if (current) {
          const calculatedHP = Math.max(
            0,
            current.currentHP - single.totalDamage
          )
          const finalHP = checkAndConsumeSurviveLethal(current, calculatedHP)
          state.units[sid] = {
            ...current,
            unit: { ...current.unit },
            combatStats: { ...current.combatStats },
            afflictions: [...current.afflictions],
            buffs: [...current.buffs],
            debuffs: [...current.debuffs],
            currentHP: finalHP,
          }

          // Apply LifeSteal healing if any were queued for this attack
          if (
            single.effectResults &&
            single.effectResults.lifeStealsToApply?.length &&
            single.totalDamage > 0
          ) {
            state = applyLifeStealEffects(
              state,
              single.attackerId,
              sid,
              single.totalDamage,
              single.effectResults.lifeStealsToApply,
              single.effectResults.grantedFlags
            )
          }
        }
      }
    }
  } else {
    // Single-target
    const target = targets[0]
    if (target) {
      const sid = getStateIdForContext(target)
      const current = state.units[sid]
      if (current) {
        const calculatedHP = Math.max(0, current.currentHP - result.totalDamage)
        const finalHP = checkAndConsumeSurviveLethal(current, calculatedHP)
        state.units[sid] = {
          ...current,
          unit: { ...current.unit },
          combatStats: { ...current.combatStats },
          afflictions: [...current.afflictions],
          buffs: [...current.buffs],
          debuffs: [...current.debuffs],
          currentHP: finalHP,
        }

        // Handle resurrect and lifesteal effects for single target case
        if (result.effectResults) {
          // Apply LifeSteal effects
          if (
            result.effectResults.lifeStealsToApply?.length &&
            result.totalDamage > 0
          ) {
            state = applyLifeStealEffects(
              state,
              result.attackerId,
              sid,
              result.totalDamage,
              result.effectResults.lifeStealsToApply,
              result.effectResults.grantedFlags
            )
          }
        }
      }
    }
  }
  return state
}
