import type { StatKey } from './base-stats'
import type {
  AttackType,
  Condition,
  DamageType,
  TargetGroup,
  Targeting,
  Trait,
} from './core'

// Passive Skills
type ActivationWindow =
  | 'BeforeAllyAttacks'
  | 'BeforeAllyIsAttacked'
  | 'AfterAllyAttacks'
  | 'AfterAllyDamaged'
  | 'OnAllyUseActiveAbility'
  | 'EndOfRound'
  | 'EndOfBattle'

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
  effects: SkillEffect[]
  bonusModifiers: BonusModifier[]
  attackTypes?: AttackType[]
  damageType?: DamageType
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
  | { kind: 'Cover'; target: TargetGroup } // TODO: how will cover/guard skills work?
  | { kind: 'Defend'; damageType?: DamageType; amount?: number } // TODO: how will cover/guard skills work?

export interface ActiveSkill extends SkillBase {
  type: 'active'
  apCost: number
}

export interface PassiveSkill extends SkillBase {
  type: 'passive'
  ppCost: number
  activationWindow: ActivationWindow
}
