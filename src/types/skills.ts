import type { SkillCategory, Targeting } from './core'
import type { Effect, Flag } from './effects'
import type { TacticalCondition } from './tactics'

import type { ActivationWindowId } from '@/data/activation-windows'
import type { ActiveSkillsId } from '@/generated/skills-active'
import type { PassiveSkillsId } from '@/generated/skills-passive'

export interface SkillBase {
  id: string
  name: string
  description: string
  targeting: Targeting
  effects: readonly Effect[]
  skillFlags?: readonly Flag[]
  skillCategories: readonly SkillCategory[]
  innateAttackType?: 'Ranged' | 'Magical'
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

interface BaseSkillSlot {
  id: string
  tactics: [TacticalCondition | null, TacticalCondition | null]
  order: number
}

interface ActiveSkillSlot extends BaseSkillSlot {
  skillType: 'active'
  skillId: ActiveSkillsId
}

interface PassiveSkillSlot extends BaseSkillSlot {
  skillType: 'passive'
  skillId: PassiveSkillsId
}

interface EmptySkillSlot extends BaseSkillSlot {
  skillType: null
  skillId: null
}

export type SkillSlot = ActiveSkillSlot | PassiveSkillSlot | EmptySkillSlot

export interface AvailableSkill {
  skill: ActiveSkill | PassiveSkill
  source: 'class' | 'equipment'
  level?: number // For class skills
}
