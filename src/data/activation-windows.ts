export const ACTIVATION_WINDOWS = {
  START_OF_BATTLE: {
    id: 'startOfBattle',
    description: 'Activates at the start of a battle',
    limited: true,
  },
  AFTER_ALLY_ACTIVE_SKILL: {
    id: 'afterAllyActiveSkill',
    description: 'Activates after an ally uses an active skill',
    limited: false,
  },
  AFTER_USING_ACTIVE_SKILL: {
    id: 'afterUsingActiveSkill',
    description: 'Activates after using an active skill',
    limited: false,
  },
  AFTER_ALLY_HIT: {
    id: 'afterAllyHit',
    description: 'Activates after an ally is hit by an attack',
    limited: false,
  },
  AFTER_ALLY_DEFEATED_BY_ATTACK: {
    id: 'afterAllyDefeatedByAttack',
    description: 'Activates after an ally is defeated by an attack',
    limited: false,
  },
  AFTER_ALLY_PASSIVE_SKILL: {
    id: 'afterAllyPassiveSkill',
    description: 'Activates after an ally uses a passive skill',
    limited: false,
  },
  AFTER_ALLY_DEBUFFED: {
    id: 'afterAllyDebuffed',
    description: 'Activates after an ally is debuffed',
    limited: false,
  },
  AFTER_ALLY_ATTACKS_ACTIVE: {
    id: 'afterAllyAttacksActive',
    description: 'Activates after an ally attacks with an active skill',
    limited: false,
  },
  AFTER_ALLY_ATTACKED_ACTIVE: {
    id: 'afterAllyAttackedActive',
    description: 'Activates after an ally is attacked with an active skill',
    limited: false,
  },
  AFTER_ALLY_MAGIC_ATTACKS_ACTIVE: {
    id: 'afterAllyMagicAttacksActive',
    description: 'Activates after an ally attacks with a magic active skill',
    limited: false,
  },
  AFTER_CAVALRY_ALLY_ATTACKS_ACTIVE: {
    id: 'afterCavalryAllyAttacksActive',
    description: 'Activates after a cavalry ally attacks with an active skill',
    limited: false,
  },
  AFTER_FLYING_ALLY_ATTACKS_ACTIVE: {
    id: 'afterFlyingAllyAttacksActive',
    description: 'Activates after a flying ally attacks with an active skill',
    limited: false,
  },
  AFTER_ENEMY_ATTACKS_ACTIVE: {
    id: 'afterEnemyAttacksActive',
    description: 'Activates after an enemy attacks with an active skill',
    limited: false,
  },
  AFTER_ENEMY_DEBUFF: {
    id: 'afterEnemyDebuff',
    description: 'Activates after an enemy is debuffed',
    limited: false,
  },
  AFTER_ENEMY_BUFF: {
    id: 'afterEnemyBuff',
    description: 'Activates after an enemy is buffed',
    limited: false,
  },
  AFTER_BEING_HIT: {
    id: 'afterBeingHit',
    description: 'Activates after being hit by an attack',
    limited: false,
  },
  AFTER_BEING_HIT_PHYS: {
    id: 'afterBeingHitPhys',
    description: 'Activates after being hit by a physical attack',
    limited: false,
  },
  AFTER_BEING_ATTACKED: {
    id: 'afterBeingAttacked',
    description: 'Activates after being attacked',
    limited: false,
  },
  AFTER_ATTACKING: {
    id: 'afterAttacking',
    description: 'Activates after attacking',
    limited: false,
  },
  AFTER_ATTACKING_MAGICAL: {
    id: 'afterAttackingMagical',
    description: 'Activates after using a magical attack',
    limited: false,
  },
  AFTER_USER_DEBUFF: {
    id: 'afterUserDebuff',
    description: 'Activates after the user is debuffed',
    limited: false,
  },
  AFTER_EVADE: {
    id: 'afterEvade',
    description: 'Activates after the evading an attack',
    limited: false,
  },
  AFTER_RECEIVING_ALLY_PASSIVE: {
    id: 'afterReceivingAllyPassive',
    description: "Activates after receiving an ally's passive skill",
    limited: false,
  },
  AFTER_HEALED: {
    id: 'afterHealed',
    description: 'Activates after being healed',
    limited: false,
  },
  AFTER_ALLY_HEALED: {
    id: 'afterAllyHealed',
    description: 'Activates after an ally is healed',
    limited: false,
  },
  AFTER_ENEMY_HEALS: {
    id: 'afterEnemyHeals',
    description: 'Activates after an enemy uses healing magic',
    limited: false,
  },
  AFTER_ENEMY_GUARDS: {
    id: 'afterEnemyGuards',
    description: "Activates after an enemy guards an ally's attack",
    limited: false,
  },
  AFTER_GUARDING: {
    id: 'afterGuarding',
    description: 'Activates after the user guards an attack',
    limited: false,
  },
  BEFORE_ATTACKING_ACTIVE: {
    id: 'beforeAttackingActive',
    description: 'Activates before attacking with an active skill',
    limited: false,
  },
  BEFORE_ALLY_ATTACKS_ACTIVE: {
    id: 'beforeAllyAttacksActive',
    description: 'Activates before an ally attacks with an active skill',
    limited: true,
  },
  BEFORE_ALLY_ATTACKS_PHYSICAL_ACTIVE: {
    id: 'beforeAllyAttacksPhysicalActive',
    description:
      'Activates before an ally attacks with a physical active skill',
    limited: true,
  },
  BEFORE_ALLY_ATTACKS_MAGICAL_ACTIVE: {
    id: 'beforeAllyAttacksMagicalActive',
    description: 'Activates before an ally attacks with a magical active skill',
    limited: true,
  },
  BEFORE_BEING_ATTACKED: {
    id: 'beforeBeingAttacked',
    description: 'Activates before being attacked',
    limited: false,
  },
  BEFORE_BEING_HIT_PHYS: {
    id: 'beforeBeingHitPhys',
    description: 'Activates before being hit by a physical attack',
    limited: false,
  },
  BEFORE_BEING_HIT_RANGED: {
    id: 'beforeBeingHitRanged',
    description: 'Activates before being hit by a ranged attack',
    limited: false,
  },
  BEFORE_BEING_HIT_MELEE: {
    id: 'beforeBeingHitMelee',
    description: 'Activates before being hit by a melee attack',
    limited: false,
  },
  BEFORE_BEING_HIT_MAGIC: {
    id: 'beforeBeingHitMagic',
    description: 'Activates before being hit by a magical attack',
    limited: false,
  },
  BEFORE_ALLY_ATTACKED: {
    id: 'beforeAllyAttacked',
    description: 'Activates before an ally is attacked',
    limited: true,
  },
  BEFORE_ALLY_ATTACKED_RANGED_PHYS: {
    id: 'beforeAllyAttackedRangedPhys',
    description:
      'Activates before an ally is attacked by a ranged physical attack',
    limited: true,
  },
  BEFORE_ALLY_HIT_RANGED_PHYS: {
    id: 'beforeAllyHitRangedPhys',
    description: 'Activates before an ally is hit by a ranged physical attack',
    limited: true,
  },
  BEFORE_ALLY_HIT_MAGIC: {
    id: 'beforeAllyHitMagic',
    description: 'Activates before an ally is hit by a magical attack',
    limited: true,
  },
  BEFORE_ENEMY_ATTACKS: {
    id: 'beforeEnemyAttacks',
    description: 'Activates before an enemy attacks',
    limited: true,
  },
  BEFORE_ENEMY_ATTACKS_MAGIC_ACTIVE: {
    id: 'beforeEnemyAttacksMagic',
    description: 'Activates before an enemy uses an active magic attack',
    limited: true,
  },
  END_OF_BATTLE: {
    id: 'endOfBattle',
    description: 'Activates at the end of a battle',
    limited: false,
  },
} as const

export const ACTIVATION_WINDOW_CATEGORIES: Record<
  string,
  ActivationWindowId[]
> = {
  // No active skill root trigger
  // --------------------------------
  START: ['startOfBattle'],
  END: ['endOfBattle'],
  // --------------------------------

  // Active skill root
  // 1.0 skill is selected
  // 1.1 Ally team pre-attack window
  // -- Ally Window (Limited)
  PRE_ATTACK_ALLY: [
    'beforeAllyAttacksActive',
    'beforeAllyAttacksPhysicalActive',
  ],
  // -- Self Window
  PRE_ATTACK_USER: ['beforeAttackingActive'],

  // 1.2 Enemy team pre-attack window
  // -- Enemy Window (Limited)
  PRE_ATTACK_ENEMY: [
    'beforeEnemyAttacks',
    'beforeEnemyAttacksMagic',
    'beforeAllyAttacked',
    'beforeAllyAttackedRangedPhys',
    'beforeAllyHitMagic',
    'beforeAllyHitRangedPhys',
  ],
  // -- Target Window
  PRE_ATTACK_TARGET: [
    'beforeBeingHitPhys',
    'beforeBeingHitMelee',
    'beforeBeingHitRanged',
    'beforeBeingAttacked',
  ],
  // 1.3 Post-attack
  // -- Ally Window
  POST_ATTACK_ALLY: [
    'afterAllyAttacksActive',
    'afterAllyMagicAttacksActive',
    'afterCavalryAllyAttacksActive',
    'afterFlyingAllyAttacksActive',
    'afterAllyActiveSkill',
    'afterEnemyDebuff',
    'afterEnemyBuff',
    'afterEnemyAttacksActive',
  ],

  POST_ATTACK_ENEMY: [
    'afterAllyAttackedActive',
    'afterBeingAttacked',
    'afterAllyHit',
  ],
  POST_ATTACK_USER: ['afterAttacking', 'afterUsingActiveSkill'],
  POST_ATTACK_TARGET: [
    'afterBeingHitPhys',
    'afterBeingHit',
    'afterBeingAttacked',
  ],
  // target instant
  // user instant
  // ally pursuit

  // Instant use windows?
  // todo: needs testing for determining distinct windows
  TEST_INSTANT_USE: [
    'afterAllyHealed',
    'afterReceivingAllyPassive',
    'afterAllyPassiveSkill',
    'afterAllyDebuffed',
    'afterUserDebuff',
    'afterEvade',
    'afterEnemyGuards',
    'afterEnemyHeals',
  ],

  // enemy counter
}

export const ActivationWindowById: Record<
  ActivationWindowId,
  ActivationWindowMeta
> = Object.values(ACTIVATION_WINDOWS).reduce(
  (accumulator, meta) => {
    accumulator[meta.id] = meta
    return accumulator
  },
  {} as Record<ActivationWindowId, ActivationWindowMeta>
)

export type ActivationWindowKey = keyof typeof ACTIVATION_WINDOWS
export type ActivationWindowId =
  (typeof ACTIVATION_WINDOWS)[ActivationWindowKey]['id']
export type ActivationWindowMeta =
  (typeof ACTIVATION_WINDOWS)[ActivationWindowKey]
