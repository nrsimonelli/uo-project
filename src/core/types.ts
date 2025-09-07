import {
  ADVANCED_CLASSES,
  AFFLICTIONS,
  BASE_CLASSES,
  GROWTH_RANKS,
  GROWTHS,
  STATS,
} from '../data/constants'

export type GrowthKey = keyof typeof GROWTHS
export type GrowthType = (typeof GROWTHS)[GrowthKey]

export type GrowthRank = keyof typeof GROWTH_RANKS

export type StatKey = keyof typeof STATS
export type StatValue = (typeof STATS)[StatKey]

type BaseClassKey = keyof typeof BASE_CLASSES
export type BaseClassType = (typeof BASE_CLASSES)[BaseClassKey]

type AdvancedClassKey = keyof typeof ADVANCED_CLASSES
export type AdvancedClassType = (typeof ADVANCED_CLASSES)[AdvancedClassKey]

export type ClassType = BaseClassType | AdvancedClassType

export type AfflictionType = (typeof AFFLICTIONS)[number]

type Trait = (typeof Traits)[number]
export const Traits = [
  'Unguardable',
  'Uncoverable',
  'Ranged',
  'Grounded',
  'Charge',
  'Limited',
] as const

// rename to targetting?
type SubTrait = (typeof SubTraits)[number]
export const SubTraits = [
  'Melee',
  'Piercing',
  'Magical',
  'Ally',
  'Enemy',
  'Row',
  'Column',
  'All',
] as const

type Target = 'Self' | 'Ally' | 'Enemy'
type Comparator = '>=' | '<=' | '==' | '!=' | '>' | '<'

interface Condition {
  target: Target
  stat: StatKey | 'AP' | 'PP' | 'MaxHP'
  comparator: Comparator
  value: number
}

interface TraitCondition {
  target: Target
  trait: Trait
  required: boolean // true = must have, false = must not have
}

// Generic condition union
type AnyCondition = Condition | TraitCondition

interface Skill {
  id: string
  name: string
  description: string
  cost: number
  physicalPotency: number
  magicalPotency: number
  hitCount: number
  hitRate: number
  traits: Trait[]
  subTraits: SubTrait[]
  bonusModifiers: BonusModifier[]
}

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

interface BonusModifier {
  condition: Condition
  potencyModifier?: { physical?: number; magical?: number }
  defenseModifier?: { physical?: number; magical?: number } // expressed as fraction ignored
}
interface BonusModifier {
  type: 'PotencyBoost' | 'IgnoreDefense' | 'ExtraHit'
  amount: number
  conditions?: AnyCondition[] // only apply if these evaluate true
}
interface SkillSlot {
  skillId: string
  priority: number // order in the list
  conditions: AnyCondition[] // player-defined usage rules
}
interface UnitLoadout {
  classType: ClassType
  // equipment: Equipment[]
  activeSkills: SkillSlot[]
  passiveSkills: SkillSlot[]
}
