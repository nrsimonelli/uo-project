import type { ActivationWindowId } from '../data/combat/activation-windows'
import type { StatKey } from './base-stats'
import type {
  AttackType,
  Condition,
  DamageType,
  Targeting,
  Trait,
} from './core'

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

interface SkillBase {
  id: string
  name: string
  description: string
  targeting: Targeting
  traits: Trait[]
  effects: SkillEffect[] // unified system, both actives and passives use this
  bonusModifiers: BonusModifier[]
  attackTypes?: AttackType[]
  damageType?: DamageType
}

export interface ActiveSkill extends SkillBase {
  type: 'active'
  apCost: number
}

export interface PassiveSkill extends SkillBase {
  type: 'passive'
  ppCost: number
  activationWindow: ActivationWindowId
}

export type SkillEffect =
  | {
      kind: 'Damage'
      potency: { physical?: number; magical?: number }
      hitRate: number
      hitCount: number
    }
  | { kind: 'Heal'; potency: number; scaling: 'physical' | 'magical' | 'maxHP' }
  | { kind: 'Buff'; stat: StatKey; amount: number; duration?: number }
  | { kind: 'Debuff'; stat: StatKey; amount: number; duration?: number }
  | { kind: 'GrantTrait'; trait: Trait; duration?: number }
  | { kind: 'ResourceGain'; resource: 'AP' | 'PP'; amount: number }
  | { kind: 'HealPercent'; value: number }
  | { kind: 'CritBoost'; value: number; duration: 'NextAction' | number }
  | { kind: 'Cover'; style: 'heavyGuard' | 'mediumGuard' } // TODO: how will cover/guard skills work?
