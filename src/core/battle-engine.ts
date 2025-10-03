import type { RandomNumberGeneratorType } from './random'

import { ActiveSkillsMap, type ActiveSkillsId } from '@/generated/skills-active'
import {
  PassiveSkillsMap,
  type PassiveSkillsId,
} from '@/generated/skills-passive'
import type { StatKey } from '@/types/base-stats'
import type { Effect, Flag } from '@/types/effects'
import type { ActiveSkill, PassiveSkill } from '@/types/skills'
import type { Tactic } from '@/types/tactics'

type Combatant = {
  id: string
  stats: Record<StatKey, number>
  currentHP: number
  AP: number
  PP: number
  flags: Flag[]
  team: 'A' | 'B'
  buffs: []
  debuffs: []
  afflictions: []
  skills: {
    active: ActiveSkill[]
    passive: PassiveSkill[]
  }
}

export interface BattleState {
  units: Combatant[]
  rng: RandomNumberGeneratorType
  // transient maps used by effects? not sure...
}

// Example BATTLE FLOW
// 0.0 - Select next active skill (skip if start of battle)
// 1.0 - Set activation window (ex Start of Battle, before ally attacks, etc.)
// 1.1 - Search for passive skills from combatants
// 1.2 - Filter/Validate by cost, user status, and tactics
// 1.3 - Sort by initiative
// 1.4 - Execute top skill
// 1.5 - Add new activation window type if applicable
// 1.6 - if new window was added or current window is not Limited, repeat from 1.1
// 2.0 - use active skill
// 2.1 - update active window if applicable, otherwise go to 0

function getActiveSkillById(id: ActiveSkillsId) {
  return ActiveSkillsMap[id]
}
function getPassiveSkillById(id: PassiveSkillsId) {
  return PassiveSkillsMap[id]
}

const evaluateTactic = (
  tactic: Tactic,
  owner: Combatant,
  targets: Combatant[]
) => {
  // we should not be evaluating blank tactics, those will simply be true
  // TODO evaluate tactic logic here...
  // returning true for now
  return true
}

/**
 * selectActiveSkillAndTarget:
 * - iterates a unit's skillSlots in order
 * - for each slot:
 *   - if points (AP) available for the active skill
 *   - resolve candidate targets from skill targeting
 *   - evaluate gating tactics: if owner provided any Condition or Resource tactics, require ANY of them to be true
 *     (if no gating tactics provided, treat as always-allowed)
 *   - if allowed, compute ordered targets using TargetPreference tactics and return first chosen target
 * - returns null if nothing available
 */
export function selectActiveSkillAndTarget(
  owner: Combatant,
  state: BattleState
) {
  // find all active slots in slot order
  for (const slot of owner.skills.active) {
    const active = getActiveSkillById(slot.id as ActiveSkillsId)
    if (owner.AP < active.ap) continue // not enough AP

    // resolve candidate targets (simple version: reuse your resolveTargets method or implement quick)
    const candidates = resolveActiveTargets(active, owner, state.units) // implement this function to return array of Combatant

    if (candidates.length === 0) continue

    // Evaluate gating tactics: ANY condition-type tactic true => allowed
    // collect condition-type tactics from both slots
    const gatingTactics = [slot.tactic1, slot.tactic2]
      .filter(Boolean)
      .filter(
        t => t!.kind === 'Condition' || t!.kind === 'ResourceThreshold'
      ) as Tactic[]
    let allowed: boolean
    if (gatingTactics.length === 0) {
      allowed = true // no gating tactics => always allowed (per your rule)
    } else {
      // allow if any gating tactic passes
      allowed = gatingTactics.some(gt =>
        evaluateGateTactic(gt, owner, candidates)
      )
    }

    if (!allowed) continue

    // Determine final target choice using TargetPreference tactics (if any)
    const prefTactics = [slot.tactic1, slot.tactic2]
      .filter(Boolean)
      .filter(t => t!.kind === 'TargetPreference') as Tactic[]
    const ordered = applyTargetPreferences(prefTactics, owner, candidates)
    const chosen = ordered[0]
    if (!chosen) continue

    return { slot, skill: active, target: chosen }
  }

  return null
}

// Strongly typed handlers
type EffectKind = Effect['kind']

type TypedEffectHandler<K extends EffectKind> = (
  unit: Combatant,
  target: Combatant,
  effect: Extract<Effect, { kind: K }>,
  rng: RandomNumberGeneratorType
) => void

const effectHandlers: { [K in EffectKind]: TypedEffectHandler<K> } = {
  Damage: (unit, target, effect, rng) => {
    const didHit =
      effect.hitRate === 'True' || rng.random() * 100 < effect.hitRate
    if (!didHit) return

    const didCrit = rollCrit(rng, unit.stats.CRT)
    const critMult = getCritMultiplier(didCrit)
    const guardMult = getGuardMultiplier(
      rollGuard(rng, target.stats.GRD),
      'none'
    )
    const potency = effect.potency.physical || 0
    const dmg = calculateDamage(
      unit.stats.PATK,
      target.stats.PDEF,
      potency,
      critMult,
      guardMult,
      1,
      true
    )
    target.currentHP -= dmg
    if (target.currentHP <= 0) target.alive = false
    console.log(
      `${unit.id} hits ${target.id} for ${dmg} damage (crit: ${didCrit})`
    )
  },

  GrantFlag: (unit, target, effect) => {
    const flagTarget = effect?.applyTo === 'Target' ? target : unit
    flagTarget.flags.push(effect.flag)
    console.log(`${unit.id} grants flag ${effect.flag} to ${flagTarget.id}`)
  },

  ResourceGain: (unit, _target, effect) => {
    unit[effect.resource] += effect.amount
    console.log(`${unit.id} gains ${effect.amount} ${effect.resource}`)
  },

  Buff: (unit, target, effect) => {
    const statTarget = effect?.applyTo === 'Target' ? target : unit
    statTarget.stats[effect.stat] += effect.value
    console.log(
      `${unit.id} buffs ${statTarget.id}'s ${effect.stat} by ${effect.value}`
    )
  },

  Debuff: (unit, target, effect) => {
    const statTarget = effect?.applyTo === 'Target' ? target : unit
    statTarget.stats[effect.stat] -= effect.value
    console.log(
      `${unit.id} debuffs ${statTarget.id}'s ${effect.stat} by ${effect.value}`
    )
  },

  Heal: (unit, target, effect) => {
    const healedAmount = effect.potency.physical || 0
    target.currentHP = Math.min(
      target.stats.HP,
      target.currentHP + healedAmount
    )
    console.log(`${unit.id} heals ${target.id} for ${healedAmount} HP`)
  },

  HealPercent: (unit, target, effect) => {
    const healedAmount = Math.round(target.stats.HP * (effect.value / 100))
    target.currentHP = Math.min(
      target.stats.HP,
      target.currentHP + healedAmount
    )
    console.log(
      `${unit.id} heals ${target.id} for ${healedAmount} HP (${effect.value}%)`
    )
  },

  PotencyBoost: (unit, target, effect) => {
    console.log(`${unit.id} boosts potency for this attack`, effect.amount)
    // This would modify the potency of the current DamageEffect in the functional logic
  },

  IgnoreDefense: (unit, target, effect) => {
    console.log(
      `${unit.id} ignores ${effect.fraction * 100}% defense of ${target.id}`
    )
    // This should be applied in calculateDamage logic
  },

  Cover: (unit, target, effect) => {
    console.log(`${unit.id} applies ${effect.guard} cover to ${target.id}`)
    // Should set the guard level on the target for damage calculation
  },
}

// Mini battle runner
export const runMiniBattle = (
  units: Combatant[],
  rng: RandomNumberGeneratorType
) => {
  let round = 1
  while (units.some(u => u.alive && u.AP > 0)) {
    console.log(`--- Round ${round} ---`)

    // Sort units by initiative or another criteria
    const actingUnits = units.filter(u => u.alive && u.AP > 0)

    for (const unit of actingUnits) {
      // Pick a target - simple example: first alive enemy
      const enemy = units.find(t => t.team !== unit.team && t.alive)
      if (!enemy) continue

      // Apply each effect of each skill
      const skills = unit.activeSkills.filter(
        s => s.type === 'active' && unit.AP >= s.ap
      )
      for (const skill of skills) {
        unit.AP -= skill.ap
        console.log(`${unit.id} uses ${skill.name}`)

        for (const effect of skill.effects) {
          const handler = effectHandlers[effect.kind]
          if (!handler)
            throw new Error(`No handler for effect kind: ${effect.kind}`)
          handler(unit, enemy, effect as any, rng) // TS is happy due to typed handlers
        }
      }
    }

    round++
  }

  console.log('Battle ended')
}
