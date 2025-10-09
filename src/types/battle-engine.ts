import type { RandomNumberGeneratorType } from '@/core/random'
import type { StatKey } from '@/types/base-stats'
import type { AfflictionType } from '@/types/conditions'
import type { CombatantType } from '@/types/core'
import type { Unit } from '@/types/team'

/**
 * Battle event type for hook interface
 */
export interface BattleEvent {
  id: string
  type: string
  turn: number
  description: string
  actingUnit?: {
    id: string
    name: string
    classKey: string
    team: 'home-team' | 'away-team'
  }
  targets?: string[]
}

/**
 * Battle result summary for hook interface
 */
export interface BattleResultSummary {
  winner: string | null
  endReason: string | null
  totalTurns: number
  totalEvents: number
  teamHpPercentages: { [teamId: string]: number }
}

/**
 * Affliction status effect (no set duration - cleared by specific conditions)
 */
export interface Affliction {
  type: AfflictionType
  name: string
  level?: number // for burn only, damage per active turn would be 20 * level
  source: string // unit ID that applied this
}

/**
 * Buff status effect (indefinite or next attack duration)
 */
export interface Buff {
  name: string
  stat: StatKey
  value: number
  duration: 'indefinite' | 'next-attack' | 'next-debuff'
  scaling: 'flat' | 'percent'
  source: string
}

/**
 * Debuff status effect (indefinite or next attack duration)
 */
export interface Debuff {
  name: string
  stat: StatKey
  value: number
  duration: 'indefinite' | 'next-attack'
  scaling: 'flat' | 'percent'
  source: string
}

/**
 * Battle context for a unit with all tracking data
 */
export interface BattleContext {
  unit: Unit
  currentHP: number
  currentAP: number
  currentPP: number
  team: 'home-team' | 'away-team' // switch to home v away
  combatantTypes: CombatantType[] // Support multiple combatant types
  position: {
    row: number
    col: number
  }

  // Enhanced status tracking
  afflictions: Affliction[]
  buffs: Buff[]
  debuffs: Debuff[]

  // Cached combat stats for performance
  combatStats: {
    HP: number // maxHP
    PATK: number
    PDEF: number
    MATK: number
    MDEF: number
    ACC: number
    EVA: number
    CRT: number
    GRD: number
    INIT: number
    GuardEff: number // Guard effectiveness from equipment
  }

  // Battle-specific tracking
  flags: string[] // Flag names as strings for simplicity
  lastPassiveResponse: number // activeSkillTurn when last passive was used
  isPassiveResponsive: boolean // false when defeated (currentHP -> 0), frozen, stunned, passive sealed or has already used a passive skill during this active skill turn.
  immunities: (Affliction | 'Affliction' | 'Debuff')[] // Permanent immunities/skill nullifications. Specific Afflictions, all afflictions, all debuffs (everything, afflicitons are also debuffs but not all debuffs are afflictions)
  hasActedThisRound: boolean // Whether this unit has used an active skill this round
}

/**
 * Action record for battle history tracking
 */
export interface ActionRecord {
  unitId: string // don't ever use the term actor
  targetIds: string[]
  skillId: string
  skillType: 'active' | 'passive'
  attackType: 'Physical' | 'Magical' | 'Hybrid' | 'Heal' | 'None' // Derived from skill.damageType during battle
  turn: number
}

/**
 * Complete battlefield state
 */
export interface BattlefieldState {
  units: Record<string, BattleContext>
  activeUnitId: string
  formations: {
    allies: (string | null)[][]
    enemies: (string | null)[][]
  }

  // Turn order management
  activeSkillQueue: string[] // Only modified between active skill turns
  passiveSkillQueue: string[] // Modified frequently during active turns

  battlePhase: string // I think this will need rework
  isNight: boolean
  turnCount: number
  actionHistory: ActionRecord[]

  // Battle engine specific data
  rng: RandomNumberGeneratorType
  currentRound: number
  actionCounter: number
  passiveResponseTracking: Record<string, number> // unitId -> activeSkillTurn
  inactivityCounter: number
  lastActionRound: number
  lastActiveSkillRound: number // Track when last non-standby skill was used
  consecutiveStandbyRounds: number // Count rounds with only standby actions
}

/**
 * Validation result for input checking
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}
