import type { SkillCategory, Targeting } from './core'
import type { Effect, Flag } from './effects'
import type { Tactic } from './tactics'

import type { ActivationWindowId } from '@/data/activation-windows'

interface SkillBase {
  id: string
  name: string
  description: string
  targeting: Targeting
  effects: Effect[] | readonly Effect[]
  skillFlags?: Flag[] | readonly Flag[] // Skill-level flags that apply to all effects
  skillCategories: SkillCategory[] | readonly SkillCategory[] // New field for skill classification
  innateAttackType?: 'Ranged' | 'Magical' // Innate attack type (renamed from attackType)
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
