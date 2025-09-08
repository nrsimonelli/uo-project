import type { AfflictionType, Comparator, StatKey, Target, Trait } from './core'

// --- Boolean-based conditions (must be true to apply) ---
export type BooleanCondition =
  | {
      kind: 'Stat'
      target: Target
      stat: StatKey | 'AP' | 'PP' | 'MaxHP'
      comparator: Comparator
      value: number
    }
  | {
      kind: 'Type'
      target: Target
      type: CombatantType
      required: boolean
    }
  | {
      kind: 'Trait'
      target: Target
      trait: Trait
      required: boolean
    }
  | {
      kind: 'Status'
      target: Target
      status: AfflictionType | 'Debuffed' | 'Buffed' | 'Afflicted'
      required: boolean
    }
  | {
      kind: 'Flag'
      target: Target
      flag: 'Stunned' | 'Frozen' | 'Blinded'
      required: boolean
    }

// --- Targeting-based conditions (influence targeting phase) ---
export type CombatantType =
  | 'Infantry'
  | 'Calvary'
  | 'Flying'
  | 'Armored'
  | 'Scout'
  | 'Archer'
  | 'Caster'
  | 'Elven'
  | 'Bestral'
  | 'Angel'

// These can filter or reorder valid targets
export type TargetingCondition =
  | {
      kind: 'Filter'
      target: 'Ally' | 'Enemy'
      by: 'CombatantType' | 'Affliction' | 'Trait'
      value: CombatantType | AfflictionType | Trait
    }
  | {
      kind: 'Prioritize'
      target: 'Ally' | 'Enemy'
      by: 'CombatantType' | 'Stat' | 'Affliction' | 'Trait'
      value: CombatantType | StatKey | AfflictionType | Trait
      order?: 'Asc' | 'Desc' // e.g. lowest HP or highest Attack
    }

// --- Unified Condition Type ---
export type Condition = BooleanCondition | TargetingCondition
