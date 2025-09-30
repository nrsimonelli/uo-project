import type { ActivationWindowId } from '../data/activation-windows'
import type { DamageType, Targeting } from './core'
import type { Effect } from './effects'
import type { Tactic } from './tactics'

interface SkillBase {
  id: string
  name: string
  description: string
  targeting: Targeting
  effects: Effect[]
  // attackType removed - will be derived from unit class during battle
  damageType?: DamageType
}

export interface ActiveSkill extends SkillBase {
  type: 'active'
  ap: number
}

export interface PassiveSkill extends SkillBase {
  type: 'passive'
  pp: number
  activationWindow: ActivationWindowId
}

// Class skill learning system types
export interface ClassSkillEntry {
  skillId: string
  level: number
  skillType: 'active' | 'passive'
}

export interface ClassSkills {
  classId: string
  className: string
  weaponType?: string
  skills: ClassSkillEntry[]
}

export interface SkillSlot {
  skillId: string
  tactics: Tactic[]
}
