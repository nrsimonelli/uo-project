import {
  ACTIVATION_WINDOWS,
  ActivationWindowById,
} from '@/data/activation-windows'
import type { ActivationWindowId } from '@/data/activation-windows'
import { PassiveSkills } from '@/generated/skills-passive'
import type { PassiveSkill } from '@/types/skills'

export const getPassiveSkillsForWindow = (
  windowId: ActivationWindowId
): readonly PassiveSkill[] => {
  return PassiveSkills.filter(skill => skill.activationWindow === windowId)
}

// Pre-computed at module load time for efficient lookup
export const WindowToPassiveSkillsMap: ReadonlyMap<
  ActivationWindowId,
  readonly PassiveSkill[]
> = new Map(
  Object.values(ACTIVATION_WINDOWS).map(window => [
    window.id,
    getPassiveSkillsForWindow(window.id),
  ])
)

export const getPassiveSkillsForWindowCached = (
  windowId: ActivationWindowId
): readonly PassiveSkill[] => {
  return WindowToPassiveSkillsMap.get(windowId) ?? []
}

// Lower numbers = higher priority (processed first)
export const WINDOW_PRIORITY_ORDER: readonly ActivationWindowId[] = [
  // Start of battle (highest priority)
  'startOfBattle',

  // Pre-attack windows (before active skill executes)
  'beforeAllyAttacksActive',
  'beforeAllyAttacksPhysicalActive',
  'beforeAttackingActive',
  'beforeEnemyAttacks',
  'beforeEnemyAttacksMagic',
  'beforeAllyAttacked',
  'beforeAllyAttackedRangedPhys',
  'beforeAllyHitRangedPhys',
  'beforeAllyHitMagic',
  'beforeBeingAttacked',
  'beforeBeingHitPhys',
  'beforeBeingHitMelee',
  'beforeBeingHitRanged',

  // Post-attack windows (after active skill executes)
  'afterAllyAttacksActive',
  'afterAllyMagicAttacksActive',
  'afterCavalryAllyAttacksActive',
  'afterFlyingAllyAttacksActive',
  'afterAllyActiveSkill',
  'afterEnemyAttacksActive',
  'afterAllyAttackedActive',
  'afterAttacking',
  'afterAttackingMagical',
  'afterUsingActiveSkill',

  // Hit resolution windows
  'afterBeingHit',
  'afterBeingHitPhys',
  'afterBeingAttacked',
  'afterAllyHit',

  // Special event windows
  'afterAllyHealed',
  'afterHealed',
  'afterAllyDebuffed',
  'afterUserDebuff',
  'afterEnemyDebuff',
  'afterEnemyBuff',
  'afterEvade',
  'afterEnemyGuards',
  'afterEnemyHeals',
  'afterAllyPassiveSkill',
  'afterReceivingAllyPassive',

  // End of battle (lowest priority)
  'endOfBattle',
] as const

export const getWindowPriority = (windowId: ActivationWindowId): number => {
  const index = WINDOW_PRIORITY_ORDER.indexOf(windowId)
  return index === -1 ? Infinity : index
}

export const sortWindowsByPriority = (
  windows: ActivationWindowId[]
): ActivationWindowId[] => {
  return [...windows].sort((a, b) => {
    const priorityA = getWindowPriority(a)
    const priorityB = getWindowPriority(b)
    return priorityA - priorityB
  })
}

// Maps battle event types to activation windows that should fire
export const EVENT_TO_WINDOWS_MAP: ReadonlyMap<
  string,
  readonly ActivationWindowId[]
> = new Map([
  // Battle lifecycle events
  ['battle-start', ['startOfBattle']],
  ['battle-end', ['endOfBattle']],

  // Active skill selection (before execution)
  [
    'skill-selected',
    [
      'beforeAllyAttacksActive',
      'beforeAllyAttacksPhysicalActive',
      'beforeAttackingActive',
      'beforeEnemyAttacks',
      'beforeEnemyAttacksMagic',
    ],
  ],

  // Pre-attack windows (before hit resolution)
  [
    'pre-attack-ally',
    ['beforeAllyAttacksActive', 'beforeAllyAttacksPhysicalActive'],
  ],
  [
    'pre-attack-enemy',
    [
      'beforeEnemyAttacks',
      'beforeEnemyAttacksMagic',
      'beforeAllyAttacked',
      'beforeAllyAttackedRangedPhys',
      'beforeAllyHitRangedPhys',
      'beforeAllyHitMagic',
    ],
  ],
  [
    'pre-attack-target',
    [
      'beforeBeingAttacked',
      'beforeBeingHitPhys',
      'beforeBeingHitMelee',
      'beforeBeingHitRanged',
    ],
  ],

  // Post-attack windows (after skill execution)
  [
    'skill-execution',
    [
      'afterAllyAttacksActive',
      'afterAllyMagicAttacksActive',
      'afterCavalryAllyAttacksActive',
      'afterFlyingAllyAttacksActive',
      'afterAllyActiveSkill',
      'afterEnemyAttacksActive',
      'afterAttacking',
      'afterAttackingMagical',
      'afterUsingActiveSkill',
    ],
  ],

  // Hit resolution events
  [
    'hit',
    [
      'afterBeingHit',
      'afterBeingHitPhys',
      'afterBeingAttacked',
      'afterAllyHit',
    ],
  ],

  // Special events
  ['heal', ['afterAllyHealed', 'afterHealed']],
  [
    'debuff-applied',
    ['afterAllyDebuffed', 'afterUserDebuff', 'afterEnemyDebuff'],
  ],
  ['buff-applied', ['afterEnemyBuff']],
  ['evade', ['afterEvade']],
  ['guard', ['afterEnemyGuards']],
  ['enemy-heal', ['afterEnemyHeals']],
  [
    'passive-skill-used',
    ['afterAllyPassiveSkill', 'afterReceivingAllyPassive'],
  ],
])

export const getWindowsForEvent = (
  eventType: string
): readonly ActivationWindowId[] => {
  return EVENT_TO_WINDOWS_MAP.get(eventType) ?? []
}

export const isWindowLimited = (windowId: ActivationWindowId): boolean => {
  const window = ActivationWindowById[windowId]
  return window?.limited ?? false
}

export const getWindowMetadata = (windowId: ActivationWindowId) => {
  return ActivationWindowById[windowId]
}

export const getAllActivationWindowIds = (): readonly ActivationWindowId[] => {
  return Object.values(ACTIVATION_WINDOWS).map(w => w.id)
}
