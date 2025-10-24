import type {
  MultiTargetSkillResult,
  SingleTargetSkillResult,
} from '@/core/battle/combat/skill-executor'
import { checkAndConsumeSurviveLethal } from '@/core/battle/combat/status-effects'
import { getStateIdForContext } from '@/core/battle/engine/utils/state-ids'
import type { BattleEvent, BattleContext } from '@/types/battle-engine'

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
  const attackedIds = targets.map(getStateIdForContext)
  const hitIds: string[] = []
  let anyGuarded = false

  if ('results' in result) {
    for (let i = 0; i < result.results.length; i += 1) {
      const r = result.results[i]
      if (r.anyHit) {
        const t = targets[i]
        if (t) {
          const sid = getStateIdForContext(t)
          if (hitIds.indexOf(sid) === -1) hitIds.push(sid)
        }
      }
      const hits = r.damageResults
      for (let j = 0; j < hits.length; j += 1) {
        if (hits[j].wasGuarded) anyGuarded = true
      }
    }
  } else {
    if (result.anyHit) {
      const t = targets[0]
      if (t) {
        const sid = getStateIdForContext(t)
        if (hitIds.indexOf(sid) === -1) hitIds.push(sid)
      }
    }
    const hits = result.damageResults
    for (let j = 0; j < hits.length; j += 1) {
      if (hits[j].wasGuarded) anyGuarded = true
    }
  }

  return { attackedIds, hitIds, anyGuarded }
}

export function applySkillDamageResults(
  state: import('@/types/battle-engine').BattlefieldState,
  targets: BattleContext[],
  result: SingleTargetSkillResult | MultiTargetSkillResult
): import('@/types/battle-engine').BattlefieldState {
  if ('results' in result) {
    // Multi-target
    for (let i = 0; i < result.results.length; i += 1) {
      const target = targets[i]
      const single = result.results[i]
      if (!target || !single) continue
      const sid = getStateIdForContext(target)
      const current = state.units[sid]
      if (!current) continue
      const calculatedHP = Math.max(0, current.currentHP - single.totalDamage)
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
      }
    }
  }
  return state
}
