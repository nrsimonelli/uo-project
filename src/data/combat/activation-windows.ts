export const ACTIVATION_WINDOWS = {
  startOfBattle: {
    id: 'start_of_battle',
    description: 'Activates at the start of a battle',
    limited: true,
  },
  afterAllyActiveSkill: {
    id: 'after_ally_active_skill',
    description: 'Activates after an ally uses an active skill',
    limited: false,
  },
  afterUsingActiveSkill: {
    id: 'after_using_active_skill',
    description: 'Activates after using an active skill',
    limited: false,
  },
  afterAllyHit: {
    id: 'after_ally_hit',
    description: 'Activates after an ally is hit by an attack',
    limited: false,
  },
  afterAllyPassiveSkill: {
    id: 'after_ally_passive_skill',
    description: 'Activates after an ally uses a passive skill',
    limited: false,
  },
  afterAllyDebuff: {
    id: 'after_ally_debuff',
    description: 'Activates after an ally is debuffed',
    limited: false,
  },
  afterAllyAttacksActive: {
    id: 'after_ally_attacks_active',
    description: 'Activates after an ally attacks with an active skill',
    limited: false,
  },
  afterAllyMagicAttacksActive: {
    id: 'after_ally_magic_attacks_active',
    description: 'Activates after an ally attacks with a magic active skill',
    limited: false,
  },
  afterCavalryAllyAttacksActive: {
    id: 'after_cavalry_ally_attacks_active',
    description: 'Activates after a cavalry ally attacks with an active skill',
    limited: false,
  },
  afterFlyingAllyAttacksActive: {
    id: 'after_flying_ally_attacks_active',
    description: 'Activates after a flying ally attacks with an active skill',
    limited: false,
  },
  afterEnemyAttacksActive: {
    id: 'after_enemy_attacks_active',
    description: 'Activates after an enemy attacks with an active skill',
    limited: false,
  },
  afterEnemyDebuff: {
    id: 'after_enemy_debuff',
    description: 'Activates after an enemy is debuffed',
    limited: false,
  },
  afterEnemyBuff: {
    id: 'after_enemy_buff',
    description: 'Activates after an enemy is buffed',
    limited: false,
  },
  afterBeingHit: {
    id: 'after_being_hit',
    description: 'Activates after being hit by an attack',
    limited: false,
  },
  afterBeingHitPhys: {
    id: 'after_being_hit_phys',
    description: 'Activates after being hit by a physical attack',
    limited: false,
  },
  afterBeingAttacked: {
    id: 'after_being_attacked',
    description: 'Activates after being attacked',
    limited: false,
  },
  afterAttacking: {
    id: 'after_attacking',
    description: 'Activates after attacking',
    limited: false,
  },
  afterUserDebuff: {
    id: 'after_user_debuff',
    description: 'Activates after the user is debuffed',
    limited: false,
  },
  afterEvade: {
    id: 'after_evade',
    description: 'Activates after the evading an attack',
    limited: false,
  },
  afterReceivingAllyPassive: {
    id: 'after_receiving_ally_passive',
    description: "Activates after receiving an ally's passive skill",
    limited: false,
  },
  afterHealed: {
    id: 'after_healed',
    description: 'Activates after being healed',
    limited: false,
  },
  afterAllyHealed: {
    id: 'after_ally_healed',
    description: 'Activates after an ally is healed',
    limited: false,
  },
  afterEnemyHeals: {
    id: 'after_enemy_heals',
    description: 'Activates after an enemy uses healing magic',
    limited: false,
  },
  afterEnemyGuards: {
    id: 'after_enemy_guards',
    description: "Activates after an enemy guards an allly's attack",
    limited: false,
  },
  beforeAttackingActive: {
    id: 'before_attacking_active',
    description: 'Activates before attacking with an active skill',
    limited: false,
  },
  beforeAllyAttacksActive: {
    id: 'before_ally_attacks_active',
    description: 'Activates before an ally attacks with an active skill',
    limited: true,
  },
  beforeAllyAttacksPhysicalActive: {
    id: 'before_ally_attacks_physical_active',
    description:
      'Activates before an ally attacks with a physical active skill',
    limited: true,
  },
  beforeAttacked: {
    id: 'before_attacked',
    description: 'Activates before being attacked',
    limited: false,
  },
  beforeBeingHitPhys: {
    id: 'before_being_hit_phys',
    description: 'Activates before being hit by a physical attack',
    limited: false,
  },
  beforeBeingHitRanged: {
    id: 'before_being_hit_ranged',
    description: 'Activates before being hit by a ranged attack',
    limited: false,
  },
  beforeBeingHitMelee: {
    id: 'before_being_hit_melee',
    description: 'Activates before being hit by a melee attack',
    limited: false,
  },
  beforeAllyAttacked: {
    id: 'before_ally_attacked',
    description: 'Activates before an ally is attacked',
    limited: true,
  },
  beforeAllyAttackedRangedPhys: {
    id: 'before_ally_attacked_ranged_phys',
    description:
      'Activates before an ally is attacked by a ranged physical attack',
    limited: true,
  },
  beforeAllyHitRangedPhys: {
    id: 'before_ally_hit_ranged_phys',
    description: 'Activates before an ally is hit by a ranged physical attack',
    limited: true,
  },
  beforeAllyHitMagic: {
    id: 'before_ally_hit_magic',
    description: 'Activates before an ally is hit by a magical attack',
    limited: true,
  },
  beforeEnemyAttacks: {
    id: 'before_enemy_attacks',
    description: 'Activates before an enemy attacks',
    limited: true,
  },
  beforeEnemyAttacksMagicActive: {
    id: 'before_enemy_attacks_magic',
    description: 'Activates before an enemy uses an active magic attack',
    limited: true,
  },
  endOfBattle: {
    id: 'end_of_battle',
    description: 'Activates at the end of a battle',
    limited: false,
  },
} as const

export const ActivationWindowById: Record<
  ActivationWindowId,
  ActivationWindowMeta
> = Object.values(ACTIVATION_WINDOWS).reduce((accumulator, meta) => {
  accumulator[meta.id] = meta
  return accumulator
}, {} as Record<ActivationWindowId, ActivationWindowMeta>)

export type ActivationWindowKey = keyof typeof ACTIVATION_WINDOWS
export type ActivationWindowId =
  (typeof ACTIVATION_WINDOWS)[ActivationWindowKey]['id']
export type ActivationWindowMeta =
  (typeof ACTIVATION_WINDOWS)[ActivationWindowKey]
