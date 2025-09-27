import type { ActivationWindowId } from '../data/activation-windows'
import type { StatKey } from './base-stats'
import type {
  AttackType,
  Condition,
  DamageType,
  Targeting,
  Trait,
} from './core'

interface SkillBase {
  id: string
  name: string
  description: string
  targeting: Targeting
  traits: Trait[]
  effects: Effect[]
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

export type Effect =
  | {
      kind: 'Damage'
      potency: { physical?: number; magical?: number }
      hitRate: number
      hitCount: number
      conditions?: Condition[]
    }
  | {
      kind: 'Heal'
      potency: number
      scaling: 'physical' | 'magical' | 'maxHP'
      conditions?: Condition[]
    }
  | { kind: 'HealPercent'; value: number; conditions?: Condition[] }
  | {
      kind: 'Buff'
      stat: StatKey
      amount: number
      duration?: number
      conditions?: Condition[]
    }
  | {
      kind: 'Debuff'
      stat: StatKey
      amount: number
      duration?: number
      conditions?: Condition[]
    }
  | {
      kind: 'GrantTrait'
      trait: Trait
      duration?: number
      conditions?: Condition[]
    }
  | {
      kind: 'GrantFlag'
      flag: 'TrueStrike' | 'Unblockable' | 'Unguardable'
      conditions?: Condition[]
    }
  | {
      kind: 'ResourceGain'
      resource: 'AP' | 'PP'
      amount: number
      conditions?: Condition[]
    }
  | {
      kind: 'PotencyBoost'
      amount: { physical?: number; magical?: number }
      conditions?: Condition[]
    }
  | { kind: 'IgnoreDefense'; fraction: number; conditions?: Condition[] }
  | { kind: 'ExtraHit'; count: number; conditions?: Condition[] }
  | {
      kind: 'CritBoost'
      value: number
      duration: 'NextAction' | number
      conditions?: Condition[]
    }
  | {
      kind: 'Cover'
      style: 'heavyGuard' | 'mediumGuard'
      conditions?: Condition[]
    }
  | {
      kind: 'Defend'
      damageType?: DamageType
      amount?: number
      conditions?: Condition[]
    }
