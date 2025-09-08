import type { Condition } from './conditions'
import type { AttackType, DamageType, Targeting, Trait } from './core'

// --- Base Skill ---
export interface Skill {
  id: string // consider branding this later -> type SkillId = string & { __brand: 'SkillId' }
  name: string
  description: string
  cost: number
  physicalPotency?: number
  magicalPotency?: number
  hitCount?: number
  hitRate?: number | true
  attackType?: AttackType
  damageType?: DamageType
  targeting: Targeting
  traits: Trait[]
  bonusModifiers: BonusModifier[]
}

// --- Active vs Passive ---
type ActivationWindow =
  | 'BeforeAllyAttacks'
  | 'BeforeAllyIsAttacked'
  | 'AfterAllyAttacks'
  | 'AfterAllyDamaged'
  | 'OnAllyUseActiveAbility'
  | 'EndOfRound'
  | 'EndOfBattle'

export interface PassiveSkill extends Skill {
  type: 'passive'
  activationWindow: ActivationWindow
}

export interface ActiveSkill extends Skill {
  type: 'active'
}

// --- Bonus Modifiers ---
export type BonusModifier =
  | {
      type: 'PotencyBoost'
      amount: { physical?: number; magical?: number }
      conditions?: Condition[]
    }
  | {
      type: 'IgnoreDefense'
      fraction: number // e.g. 0.5 = ignore 50%
      conditions?: Condition[]
    }
  | {
      type: 'ExtraHit'
      count: number
      conditions?: Condition[]
    }
  | {
      type: 'GrantTrait'
      trait: Trait
      conditions?: Condition[]
    }
  | {
      type: 'GrantFlag'
      flag: 'TrueStrike' | 'Unblockable' | 'Unguardable'
      conditions?: Condition[]
    }
  | {
      type: 'ResourceGain'
      resource: 'AP' | 'PP'
      amount: number
      conditions?: Condition[]
    }
