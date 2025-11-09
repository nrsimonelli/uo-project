import type { ExtraStats } from './equipment'

import type { RandomNumberGeneratorType } from '@/core/random'
import type { ActivationWindowId } from '@/data/activation-windows'
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
  skillId?: string // Just store the skill ID, look up details in component
  // Combat results for displaying detailed hit/crit/guard/damage info
  skillResults?: {
    targetResults: Array<{
      targetId: string
      targetName: string
      hits: Array<{
        hit: boolean
        damage: number
        wasCritical: boolean
        wasGuarded: boolean
        hitChance: number
      }>
      totalDamage: number
    }>
    summary?: {
      totalDamage: number
      targetsHit: number
      criticalHits: number
    }
  }
  // Affliction-related event data
  afflictionData?: {
    afflictionType: AfflictionType
    damage?: number // For burn/poison damage
    level?: number // For burn stacking
    applied?: boolean // Whether affliction was applied or removed
  }
  // Team roster data for battle-end events
  teamRosters?: {
    homeTeam: Array<{
      unitId: string
      name: string
      classKey: string
      currentHP: number
      maxHP: number
      position: {
        row: number
        col: number
      }
      afflictions: Affliction[]
    }>
    awayTeam: Array<{
      unitId: string
      name: string
      classKey: string
      currentHP: number
      maxHP: number
      position: {
        row: number
        col: number
      }
      afflictions: Affliction[]
    }>
  }
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
  stat: StatKey | ExtraStats
  value: number
  duration:
    | 'Indefinite'
    | 'UntilNextAttack'
    | 'UntilAttacked'
    | 'UntilDebuffed'
    | 'UntilNextAction'
  scaling: 'flat' | 'percent'
  source: string
  skillId: string
  /**
   * Optional condition that must be met on the target for this buff to apply.
   * If specified, the buff only applies when the attacker is targeting a unit
   * that matches the condition (e.g., only when attacking Cavalry units).
   */
  conditionalOnTarget?: {
    combatantType?: CombatantType
  }
}

/**
 * Debuff status effect (indefinite or next attack duration)
 */
export interface Debuff {
  name: string
  stat: StatKey | ExtraStats
  value: number
  duration:
    | 'Indefinite'
    | 'UntilNextAttack'
    | 'UntilNextAction'
    | 'UntilAttacked'
    | 'UntilDebuffed'
  scaling: 'flat' | 'percent'
  source: string
  skillId: string
}

/**
 * Conferral status effect (temporary magical damage boost)
 */
export interface ConferralStatus {
  skillId: string
  potency: number
  casterMATK: number
  duration: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
}

/**
 * Evade status effect (temporary damage avoidance protection)
 */
export interface EvadeStatus {
  skillId: string
  evadeType: 'entireAttack' | 'singleHit' | 'twoHits'
  duration: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
  source: string // unit ID that applied this
  // For twoHits: tracks remaining uses (only used internally, not stored)
  _remainingUses?: number
}

/**
 * Damage immunity status effect (temporary damage blocking protection)
 */
export interface DamageImmunityStatus {
  skillId: string
  immunityType: 'entireAttack' | 'singleHit' | 'multipleHits'
  hitCount?: number // For multipleHits: number of hits to block
  duration: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
  source: string // unit ID that applied this
  // For multipleHits: tracks remaining hits that this immunity will block
  remainingImmunityHits?: number
}

/**
 * Debuff amplification status effect (increases effectiveness of debuffs)
 */
export interface DebuffAmplificationStatus {
  skillId: string
  multiplier: number // 1.5 for 150% effectiveness
  duration: 'UntilNextAction' | 'UntilNextAttack' | 'UntilAttacked'
  source: string // unit ID that applied this
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
  conferrals: ConferralStatus[]
  evades: EvadeStatus[]
  damageImmunities: DamageImmunityStatus[]
  debuffAmplifications: DebuffAmplificationStatus[]

  // Stat foundation (base + equipment) - stored once for efficient recalculation
  statFoundation: {
    HP: number
    PATK: number
    PDEF: number
    MATK: number
    MDEF: number
    ACC: number
    EVA: number
    CRT: number
    GRD: number
    INIT: number
    GuardEff: number
    DmgReductionPercent: number
  }

  // Final combat stats (foundation + buffs/debuffs) - dynamically calculated
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
    DmgReductionPercent: number // Damage reduction percentage from equipment and buffs
  }

  // Battle-specific tracking
  flags: string[] // Flag names as strings for simplicity
  lastPassiveResponse: number // activeSkillTurn when last passive was used
  isPassiveResponsive: boolean // false when defeated (currentHP -> 0), frozen, stunned, passive sealed or has already used a passive skill during this active skill turn.
  immunities: (AfflictionType | 'Affliction' | 'Debuff')[] // Permanent immunities/skill nullifications. Specific Afflictions, all afflictions, all debuffs (everything, afflicitons are also debuffs but not all debuffs are afflictions)
  hasActedThisRound: boolean // Whether this unit has used an active skill this round

  // Defensive states (apply to next incoming active attack instance)
  incomingGuard?: 'light' | 'medium' | 'heavy' | 'full'
  incomingParry?: boolean
  incomingEvade?: boolean // Makes next incoming hit miss (only triggers if attack would hit, bypassed by TrueStrike)
  cover?: { covererId: string; guard: 'light' | 'medium' | 'heavy' | 'full' }
  defenseActionId?: number
}

/**
 * Action record for battle history tracking
 * All other properties can be derived from skillId lookup
 */
export interface ActionRecord {
  unitId: string
  targetIds: string[]
  skillId: string
  turn: number
}

/**
 * Passive action queued/executed during activation windows
 */
export interface PassiveAction {
  id: string
  windowId: ActivationWindowId
  groupId: string
  unitId: string
  team: 'home-team' | 'away-team'
  skillId: string
  createdAtActionId: number
  createdAtRound: number
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
  passiveSkillQueue: PassiveAction[] // Modified frequently during active turns

  battlePhase: string // I think this will need rework
  isNight: boolean
  turnCount: number
  actionHistory: ActionRecord[]

  // Battle engine specific data
  rng: RandomNumberGeneratorType
  currentRound: number
  actionCounter: number
  currentActionId: number
  passiveResponseTracking: Record<string, number> // unitId -> active action id
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
