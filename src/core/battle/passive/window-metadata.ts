import {
  ACTIVATION_WINDOWS,
  ActivationWindowById,
} from '@/data/activation-windows'
import type { ActivationWindowId } from '@/data/activation-windows'
import { PassiveSkillsMap } from '@/generated/skills-passive'
import {
  getPassiveSkillIdsForWindow,
  WindowToPassiveSkillIds,
} from '@/generated/window-to-passive-skills'
import type { PassiveSkill } from '@/types/skills'

// Lookup full skill objects from generated skill IDs
export const getPassiveSkillsForWindow = (
  windowId: ActivationWindowId
): readonly PassiveSkill[] => {
  const skillIds = getPassiveSkillIdsForWindow(windowId)
  const skills: PassiveSkill[] = []
  for (const id of skillIds) {
    const skill = PassiveSkillsMap[id as keyof typeof PassiveSkillsMap]
    if (skill) {
      skills.push(skill as PassiveSkill)
    }
  }
  return skills
}

// Pre-computed at module load time for efficient lookup
export const WindowToPassiveSkillsMap: ReadonlyMap<
  ActivationWindowId,
  readonly PassiveSkill[]
> = new Map(
  Object.keys(WindowToPassiveSkillIds).map(windowId => [
    windowId as ActivationWindowId,
    getPassiveSkillsForWindow(windowId as ActivationWindowId),
  ])
)

export const getPassiveSkillsForWindowCached = (
  windowId: ActivationWindowId
): readonly PassiveSkill[] => {
  return WindowToPassiveSkillsMap.get(windowId) ?? []
}

// Lower numbers = higher priority (processed first)
// NOTE: Window priority will need specific rules later (e.g., counter, pursuit, impetus, limited v non-limited,
// team-based ordering, etc.), but for now this is a simple sort
export const WINDOW_PRIORITY_ORDER: readonly ActivationWindowId[] = [
  // Start of battle (highest priority)
  'startOfBattle',

  // Pre-attack windows (before active skill executes)
  'beforeAllyAttacksActive',
  'beforeAllyAttacksPhysicalActive',
  'beforeAllyAttacksMagicalActive',
  'beforeAttackingActive',
  'beforeEnemyAttacks',
  'beforeEnemyAttacksMagic',
  'beforeAllyAttacked',
  'beforeAllyHitRangedPhys',
  'beforeAllyHitMagic',
  'beforeBeingAttacked',
  'beforeBeingHitPhys',
  'beforeBeingHitMelee',
  'beforeBeingHitRanged',
  'beforeBeingHitMagic',

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
  'afterAllyDefeatedByAttack',

  // Special event windows
  'afterAllyHealed',
  'afterHealed',
  'afterAllyDebuffed',
  'afterUserDebuff',
  'afterEnemyDebuff',
  'afterEnemyBuff',
  'afterEvade',
  'afterEnemyGuards',
  'afterGuarding',
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
      'beforeAllyAttacksMagicalActive',
      'beforeAttackingActive',
      'beforeEnemyAttacks',
      'beforeEnemyAttacksMagic',
    ],
  ],

  // Pre-attack windows (before hit resolution)
  [
    'pre-attack-ally',
    [
      'beforeAllyAttacksActive',
      'beforeAllyAttacksPhysicalActive',
      'beforeAllyAttacksMagicalActive',
    ],
  ],
  [
    'pre-attack-enemy',
    [
      'beforeEnemyAttacks',
      'beforeEnemyAttacksMagic',
      'beforeAllyAttacked',
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
      'beforeBeingHitMagic',
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
  ['ally-defeated', ['afterAllyDefeatedByAttack']],

  // Special events
  ['heal', ['afterAllyHealed', 'afterHealed']],
  [
    'debuff-applied',
    ['afterAllyDebuffed', 'afterUserDebuff', 'afterEnemyDebuff'],
  ],
  ['buff-applied', ['afterEnemyBuff']],
  ['evade', ['afterEvade']],
  ['guard', ['afterEnemyGuards', 'afterGuarding']],
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
