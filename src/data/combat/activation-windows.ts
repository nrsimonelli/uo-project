export const ACTIVATION_WINDOWS = {
  START_OF_BATTLE: {
    id: 'StartOfBattle',
    description: 'Activates at the start of a battle',
    limited: true,
  },
  AFTER_ALLY_ACTIVE_SKILL: {
    id: 'AfterAllyActiveSkill',
    description: 'Activates after an ally uses an active skill',
    limited: false,
  },
  AFTER_USING_ACTIVE_SKILL: {
    id: 'AfterUsingActiveSkill',
    description: 'Activates after using an active skill',
    limited: false,
  },
  AFTER_ALLY_HIT: {
    id: 'AfterAllyHit',
    description: 'Activates after an ally is hit by an attack',
    limited: false,
  },
  AFTER_ALLY_PASSIVE_SKILL: {
    id: 'AfterAllyPassiveSkill',
    description: 'Activates after an ally uses a passive skill',
    limited: false,
  },
  AFTER_ALLY_DEBUFF: {
    id: 'AfterAllyDebuff',
    description: 'Activates after an ally is debuffed',
    limited: false,
  },
  AFTER_ALLY_ATTACKS_ACTIVE: {
    id: 'AfterAllyAttacksActive',
    description: 'Activates after an ally attacks with an active skill',
    limited: false,
  },
  AFTER_ALLY_MAGIC_ATTACKS_ACTIVE: {
    id: 'AfterAllyMagicAttacksActive',
    description: 'Activates after an ally attacks with a magic active skill',
    limited: false,
  },
  AFTER_CAVALRY_ALLY_ATTACKS_ACTIVE: {
    id: 'AfterCavalryAllyAttacksActive',
    description: 'Activates after a cavalry ally attacks with an active skill',
    limited: false,
  },
  AFTER_FLYING_ALLY_ATTACKS_ACTIVE: {
    id: 'AfterFlyingAllyAttacksActive',
    description: 'Activates after a flying ally attacks with an active skill',
    limited: false,
  },
  AFTER_ENEMY_ATTACKS_ACTIVE: {
    id: 'AfterEnemyAttacksActive',
    description: 'Activates after an enemy attacks with an active skill',
    limited: false,
  },
  AFTER_ENEMY_DEBUFF: {
    id: 'AfterEnemyDebuff',
    description: 'Activates after an enemy is debuffed',
    limited: false,
  },
  AFTER_ENEMY_BUFF: {
    id: 'AfterEnemyBuff',
    description: 'Activates after an enemy is buffed',
    limited: false,
  },
  AFTER_BEING_HIT: {
    id: 'AfterBeingHit',
    description: 'Activates after being hit by an attack',
    limited: false,
  },
  AFTER_BEING_HIT_PHYS: {
    id: 'AfterBeingHitPhys',
    description: 'Activates after being hit by a physical attack',
    limited: false,
  },
  AFTER_BEING_ATTACKED: {
    id: 'AfterBeingAttacked',
    description: 'Activates after being attacked',
    limited: false,
  },
  AFTER_ATTACKING: {
    id: 'AfterAttacking',
    description: 'Activates after attacking',
    limited: false,
  },
  AFTER_USER_DEBUFF: {
    id: 'AfterUserDebuff',
    description: 'Activates after the user is debuffed',
    limited: false,
  },
  AFTER_EVADE: {
    id: 'AfterEvade',
    description: 'Activates after the evading an attack',
    limited: false,
  },
  AFTER_HEALED: {
    id: 'AfterHealed',
    description: 'Activates after being healed',
    limited: false,
  },
  AFTER_ALLY_HEALED: {
    id: 'AfterAllyHealed',
    description: 'Activates after an ally is healed',
    limited: false,
  },
  AFTER_ENEMY_HEALS: {
    id: 'AfterEnemyHeals',
    description: 'Activates after an enemy uses healing magic',
    limited: false,
  },
  AFTER_ENEMY_GUARDS: {
    id: 'AfterEnemyGuards',
    description: 'Activates after an enemy guards an attack',
    limited: false,
  },
  BEFORE_ATTACKING_ACTIVE: {
    id: 'BeforeAttackingActive',
    description: 'Activates before attacking with an active skill',
    limited: false,
  },
  BEFORE_ALLY_ATTACKS_ACTIVE: {
    id: 'BeforeAllyAttacksActive',
    description: 'Activates before an ally attacks with an active skill',
    limited: true,
  },
  BEFORE_ALLY_ATTACKS_PHYSICAL_ACTIVE: {
    id: 'BeforeAllyAttacksPhysicalActive',
    description:
      'Activates before an ally attacks with a physical active skill',
    limited: true,
  },
  BEFORE_ATTACKED: {
    id: 'BeforeAttacked',
    description: 'Activates before being attacked',
    limited: false,
  },
  BEFORE_BEING_HIT_PHYS: {
    id: 'BeforeBeingHitPhys',
    description: 'Activates before being hit by a physical attack',
    limited: false,
  },
  BEFORE_BEING_HIT_RANGED: {
    id: 'BeforeBeingHitRanged',
    description: 'Activates before being hit by a ranged attack',
    limited: false,
  },
  BEFORE_BEING_HIT_MELEE: {
    id: 'BeforeBeingHitMelee',
    description: 'Activates before being hit by a melee attack',
    limited: false,
  },
  BEFORE_ALLY_ATTACKED: {
    id: 'BeforeAllyAttacked',
    description: 'Activates before an ally is attacked',
    limited: true,
  },
  BEFORE_ALLY_ATTACKED_RANGED_PHYS: {
    id: 'BeforeAllyAttackedRangedPhys',
    description:
      'Activates before an ally is attacked by a ranged physical attack',
    limited: true,
  },
  BEFORE_ALLY_HIT_RANGED_PHYS: {
    id: 'BeforeAllyHitRangedPhys',
    description: 'Activates before an ally is hit by a ranged physical attack',
    limited: true,
  },
  BEFORE_ALLY_HIT_MAGIC: {
    id: 'BeforeAllyHitMagic',
    description: 'Activates before an ally is hit by a magical attack',
    limited: true,
  },
  BEFORE_ENEMY_ATTACKS: {
    id: 'BeforeEnemyAttacks',
    description: 'Activates before an enemy attacks',
    limited: true,
  },
  END_OF_BATTLE: {
    id: 'EndOfBattle',
    description: 'Activates at the end of a battle',
    limited: false,
  },
} as const

export const ACTIVATION_WINDOW_BY_ID: Record<
  ActivationWindowId,
  ActivationWindowMeta
> = Object.values(ACTIVATION_WINDOWS).reduce((acc, meta) => {
  acc[meta.id] = meta
  return acc
}, {} as Record<ActivationWindowId, ActivationWindowMeta>)

export type ActivationWindowKey = keyof typeof ACTIVATION_WINDOWS
export type ActivationWindowId =
  (typeof ACTIVATION_WINDOWS)[ActivationWindowKey]['id']
export type ActivationWindowMeta =
  (typeof ACTIVATION_WINDOWS)[ActivationWindowKey]
