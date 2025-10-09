
import type { Targeting } from './core'
import type { Effect, Flag } from './effects'
import type { Tactic } from './tactics'

import type { ActivationWindowId } from '@/data/activation-windows'

interface SkillBase {
  id: string
  name: string
  description: string
  targeting: Targeting
  effects: Effect[]
  flags?: Flag[] // Skill-level flags that apply to all effects
  // damageType removed - will be derived from potency during battle
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
  id: string
  skillId: string | null
  skillType: 'active' | 'passive' | null
  tactics: [Tactic | null, Tactic | null] // Two tactic slots
  order: number
}

export interface AvailableSkill {
  skill: ActiveSkill | PassiveSkill
  source: 'class' | 'equipment'
  level?: number // For class skills
}
