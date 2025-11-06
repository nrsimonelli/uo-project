// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: passive.json
import type { PassiveSkill } from '@/types/skills'

export const PassiveSkills = [
  {
    id: 'firstAid',
    type: 'passive',
    name: 'First Aid',
    description: 'At the end of battle, restore 25% HP to an ally.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'endOfBattle',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'HealPercent',
        value: 25,
      },
    ],
  },
  {
    id: 'keenCall',
    type: 'passive',
    name: 'Keen Call',
    description:
      'Before an ally attacks, grant 100% critical rate for their next attack.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyAttacksActive',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'TrueCritical',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilNextAttack',
      },
    ],
  },
  {
    id: 'luminousCover',
    type: 'passive',
    name: 'Luminous Cover',
    description: 'Cover an ally with medium Guard, grants ally 20% Defense.',
    pp: 1,
    skillCategories: ['Cover'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Cover',
        guard: 'medium',
      },
      {
        kind: 'Buff',
        stat: 'Defense',
        value: 20,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'rapidOrder',
    type: 'passive',
    name: 'Rapid Order',
    description: 'Grant +20 Initiative to all allies.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 20,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'nobleGuard',
    type: 'passive',
    name: 'Noble Guard',
    description:
      'Block enemy attack with medium guard, grants 20% Defense and grants +1 PP if you have 50% Health or less.',
    pp: 1,
    skillCategories: ['Guard'],
    activationWindow: 'beforeBeingHitPhys',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Guard',
        guard: 'medium',
      },
      {
        kind: 'Buff',
        stat: 'Defense',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'HP',
            comparator: 'LessOrEqual',
            value: 50,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'arrowCover',
    type: 'passive',
    name: 'Arrow Cover',
    description:
      'Activates before an ally is hit by a ranged phys. attack. Cover an ally and nullify all damage.',
    pp: 1,
    skillCategories: ['Cover'],
    activationWindow: 'beforeAllyHitRangedPhys',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Cover',
        guard: 'full',
      },
    ],
  },
  {
    id: 'quickGuard',
    type: 'passive',
    name: 'Quick Guard',
    description:
      'Activates before being hit by a physical attack. Block an enemy attack with a medium guard.',
    pp: 1,
    skillCategories: ['Guard'],
    activationWindow: 'beforeBeingHitPhys',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Guard',
        guard: 'medium',
      },
    ],
  },
  {
    id: 'provoke',
    type: 'passive',
    name: 'Provoke',
    description:
      'Activates at the start of a battle. Force a row of enemies to focus attacks on the user. Grants the user +50% Guard Rate.',
    pp: 1,
    skillCategories: ['Sabotage'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Debuff',
        stat: 'Taunt',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Buff',
        stat: 'GRD',
        value: 50,
        scaling: 'flat',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'activeGift',
    type: 'passive',
    name: 'Active Gift',
    description:
      'Activates after an ally uses an active skill. Grants an ally +1 AP.',
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'afterAllyActiveSkill',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'partingBlow',
    type: 'passive',
    name: 'Parting Blow',
    description: 'Activates at the end of a battle. Attacks a single enemy.',
    pp: 1,
    skillCategories: ['Damage'],
    activationWindow: 'endOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'frenziedStrike',
    type: 'passive',
    name: 'Frenzied Strike',
    description:
      'Activates after an ally is hit by an attack. Counterattack a single enemy. Inflicts Phys. Defense -15%.',
    pp: 1,
    skillCategories: ['Damage', 'Counter'],
    activationWindow: 'afterAllyHit',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 50,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'PDEF',
        value: -15,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'warHorn',
    type: 'passive',
    name: 'War Horn',
    description:
      'Activates at the start of a battle. Make all allies attack skills unguardable.',
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'Unguardable',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'hastenedStrike',
    type: 'passive',
    name: 'Hastened Strike',
    description:
      'Activates at the start of a battle. Attack a single enemy with a first strike.',
    pp: 1,
    skillCategories: ['Damage'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 150,
        },
        hitRate: 'True',
        hitCount: 1,
      },
    ],
  },
  {
    id: 'parry',
    type: 'passive',
    name: 'Parry',
    description:
      'Activates before being hit by a melee attack. Negate melee damage for a single hit. Grants the user +1 AP.',
    pp: 1,
    skillCategories: ['Parry'],
    activationWindow: 'beforeBeingHitMelee',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Parry',
        applyTo: 'User',
      },
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'chargedImpetus',
    type: 'passive',
    name: 'Charged Impetus',
    description:
      'Activates after using an active skill. Grants the user +1 AP and +50% Critical damage.',
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'afterUsingActiveSkill',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
      {
        kind: 'Buff',
        stat: 'CritDmg',
        value: 50,
        scaling: 'percent',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'followingSlash',
    type: 'passive',
    name: 'Following Slash',
    description:
      'Activates after an ally is hit by an attack. Counterattack a single enemy. Grants the user +1 PP if the attack hits.',
    pp: 1,
    skillCategories: ['Damage', 'Counter'],
    activationWindow: 'afterAllyHit',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 75,
        },
        hitRate: 90,
        hitCount: 1,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'HitCheck',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
    ],
  },
  {
    id: 'vengefulGuard',
    type: 'passive',
    name: 'Vengeful Guard',
    description:
      'Activates before being hit by a physical attack. Blocks an enemy attack with a medium guard. Grants the user +20% Phys. Attack. (Effect stacks.)',
    pp: 1,
    skillCategories: ['Guard'],
    activationWindow: 'beforeBeingHitPhys',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Guard',
        guard: 'medium',
      },
      {
        kind: 'Buff',
        stat: 'PATK',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'bullForce',
    type: 'passive',
    name: 'Bull Force',
    description:
      'Activates after using an active skill. Grants the user +1 AP, +20% Phys. Attack, and +20 Initiative.',
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'afterUsingActiveSkill',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
      {
        kind: 'Buff',
        stat: 'PATK',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
      },
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 20,
        scaling: 'flat',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'heavyCover',
    type: 'passive',
    name: 'Heavy Cover',
    description:
      'Activates before an ally is attacked. Cover an ally with a heavy guard.',
    pp: 1,
    skillCategories: ['Cover'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Cover',
        guard: 'heavy',
      },
    ],
  },
  {
    id: 'guardian',
    type: 'passive',
    name: 'Guardian',
    description:
      'Activates after being hit by a physical attack. Grants the user +20% Phys. Defense and +20% Guard Rate. (Effect stacks.)',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterBeingHitPhys',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'PDEF',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
        stacks: true,
      },
      {
        kind: 'Buff',
        stat: 'GRD',
        value: 20,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'rowCover',
    type: 'passive',
    name: 'Row Cover',
    description:
      'Activates before an ally is attacked. Cover a row of allies with a medium guard.',
    pp: 2,
    skillCategories: ['Cover'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Cover',
        guard: 'medium',
      },
    ],
  },
  {
    id: 'bulkUp',
    type: 'passive',
    name: 'Bulk Up',
    description: 'Activates after being hit by an attack. Recover 40% HP.',
    pp: 1,
    skillCategories: ['Utility', 'Heal'],
    activationWindow: 'afterBeingHit',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'HealPercent',
        value: 40,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'wideCounter',
    type: 'passive',
    name: 'Wide Counter',
    description:
      'Activates after an enemy attacks with an active skill. Counterattack a row of enemies.',
    pp: 1,
    skillCategories: ['Damage', 'Counter'],
    activationWindow: 'afterEnemyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
        },
        hitRate: 75,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'berserk',
    type: 'passive',
    name: 'Berserk',
    description:
      'Activates before attacking with an active skill. Consume all PP to grant the user +1 AP. The user will survive one lethal blow.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
      {
        kind: 'Buff',
        stat: 'SurviveLethal',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'bindingGuard',
    type: 'passive',
    name: 'Binding Guard',
    description:
      "Activates before attacking with an active skill. User's next attack will inflict Guard Seal.",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'GrantFlag',
        flag: 'InflictGuardSeal',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'enrage',
    type: 'passive',
    name: 'Enrage',
    description:
      'Activates after an ally is hit by an attack. Grants the user +20% Attack and +20% Accuracy. (Effect stacks.)',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterAllyHit',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'Attack',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
        stacks: true,
      },
      {
        kind: 'Buff',
        stat: 'ACC',
        value: 20,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'heavyCounter',
    type: 'passive',
    name: 'Heavy Counter',
    description:
      'Activates after an enemy attacks with an active skill. Counterattack a single enemy. Ignores 100% Defense vs armored targets.',
    pp: 1,
    skillCategories: ['Damage', 'Counter'],
    activationWindow: 'afterEnemyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'IgnoreDefense',
        fraction: 1,
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Armored',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'eagleEye',
    type: 'passive',
    name: 'Eagle Eye',
    description:
      "Activates before attacking with an active skill. Makes the user's next attack a truestrike.",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'GrantFlag',
        flag: 'TrueStrike',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'pursuit',
    type: 'passive',
    name: 'Pursuit',
    description:
      'Activates after an ally attacks (Active). Follow-up attack a single enemy.',
    pp: 1,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterAllyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'aerialSnipe',
    type: 'passive',
    name: 'Aerial Snipe',
    description:
      'Activates after an ally is hit by an attack. Counterattack a single enemy. +100 potency vs flying targets.',
    pp: 1,
    skillCategories: ['Damage', 'Counter'],
    activationWindow: 'afterAllyHit',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 50,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 100,
        },
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Flying',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'medicalAid',
    type: 'passive',
    name: 'Medical Aid',
    description:
      'At the end of battle, heal a row of allies for 15% HP. Double heal if ally is below 50% HP.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'endOfBattle',
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'HealPercent',
        value: 15,
      },
      {
        kind: 'HealPercent',
        value: 15,
        conditions: [
          {
            kind: 'Stat',
            target: 'Ally',
            stat: 'HP',
            comparator: 'LessThan',
            value: 50,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'quickReload',
    type: 'passive',
    name: 'Quick Reload',
    description:
      'Activates after using an active skill. Follow-up attack a single enemy.',
    pp: 1,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterUsingActiveSkill',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 50,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'aidCover',
    type: 'passive',
    name: 'Aid Cover',
    description:
      'Activates before an ally is attacked. Cover an ally with medium guard and restore 25% HP to that ally.',
    pp: 1,
    skillCategories: ['Cover', 'Heal'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Cover',
        guard: 'medium',
      },
      {
        kind: 'HealPercent',
        value: 25,
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'evade',
    type: 'passive',
    name: 'Evade',
    description: 'Activates before being attacked. Evade a single hit.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeBeingAttacked',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Evade',
        evadeType: 'singleHit',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'sneakingEdge',
    type: 'passive',
    name: 'Sneaking Edge',
    description:
      'Activates at the start of a battle. Attack a single enemy with a first strike. Inflicts Guard Seal and Passive Seal.',
    pp: 1,
    skillCategories: ['Damage'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Ranged',
    skillFlags: ['Uncoverable', 'Unguardable'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 50,
        },
        hitRate: 100,
        hitCount: 2,
      },
      {
        kind: 'Affliction',
        affliction: 'GuardSeal',
        applyTo: 'Target',
      },
      {
        kind: 'Affliction',
        affliction: 'PassiveSeal',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'cavalierCall',
    type: 'passive',
    name: 'Cavalier Call',
    description:
      "Activates before attacking with an active skill. Grants cavalry allies in the user's row +20% Attack. (Effect stacks.)",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'Attack',
        value: 20,
        scaling: 'percent',
        applyTo: 'Target',
        stacks: true,
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Ally',
            combatantType: 'Cavalry',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'knightsPursuit',
    type: 'passive',
    name: "Knight's Pursuit",
    description:
      'Activates after a cavalry-based ally attacks (Active). Follow-up attack a column of enemies with a piercing strike.',
    pp: 1,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterCavalryAllyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['Piercing'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 50,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'magicBarrier',
    type: 'passive',
    name: 'Magic Barrier',
    description:
      'Activates before an ally is hit by a magic attack. Negate the next magic damage dealt to an ally. Also negates afflictions.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyHitMagic',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'NegateMagicDamage',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
      {
        kind: 'Buff',
        stat: 'AfflictionImmunity',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'holyGuard',
    type: 'passive',
    name: 'Holy Guard',
    description:
      'Activates before being hit by a physical attack. Block an enemy attack with a medium guard. Prevents debuffs.',
    pp: 1,
    skillCategories: ['Guard'],
    activationWindow: 'beforeBeingHitPhys',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Guard',
        guard: 'medium',
      },
      {
        kind: 'Buff',
        stat: 'DebuffImmunity',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'rowBarrier',
    type: 'passive',
    name: 'Row Barrier',
    description:
      'Activates before an ally is hit by a magic attack. Negate the next magic damage dealt to a row of allies. Also negates afflictions.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyHitMagic',
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'NegateMagicDamage',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
      {
        kind: 'Buff',
        stat: 'AfflictionImmunity',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'vengeance',
    type: 'passive',
    name: 'Vengeance',
    description:
      'Activates after being attacked. Grants the user +20% Attack and +20% Defense. (Effect stacks.) Grants the user +1 PP if the user is at 50% HP or less.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterBeingHit',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'Attack',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
        stacks: true,
      },
      {
        kind: 'Buff',
        stat: 'Defense',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
        stacks: true,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'HP',
            comparator: 'LessOrEqual',
            value: 50,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'sanguineArts',
    type: 'passive',
    name: 'Sanguine Arts',
    description:
      'Activates before attacking with an active skill. User will recover HP equal to +50% of damage dealt on next attack.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'LifeSteal',
        percentage: 50,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'demonicPact',
    type: 'passive',
    name: 'Demonic Pact',
    description:
      'Activates after using an active skill. Sacrifice 25% HP to grant user +1 AP.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterUsingActiveSkill',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Sacrifice',
        resource: 'HP',
        amount: 25,
        scaling: 'percent',
        applyTo: 'User',
      },
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'quickHeal',
    type: 'passive',
    name: 'Quick Heal',
    description:
      'Activates after an ally is hit by an attack. Restore minor HP to an ally.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'afterAllyHit',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 50,
        },
        hitCount: 1,
      },
    ],
  },
  {
    id: 'refresh',
    type: 'passive',
    name: 'Refresh',
    description:
      'Activates after an ally is debuffed. Remove all debuffs from a row of allies.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterAllyDebuffed',
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Cleanse',
        target: 'Debuffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'lifesaver',
    type: 'passive',
    name: 'Lifesaver',
    description:
      'Activates before being attacked. Heal self for minor HP recovery. Grants user a buff to endure one lethal blow.',
    pp: 1,
    skillCategories: ['Utility', 'Heal'],
    activationWindow: 'beforeBeingAttacked',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 50,
        },
        hitCount: 1,
      },
      {
        kind: 'Buff',
        stat: 'SurviveLethal',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'partingResurrection',
    type: 'passive',
    name: 'Parting Resurrection',
    description:
      'Activates at the end of battle. Revive one ally, restoring them to 1 HP.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'endOfBattle',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Resurrect',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'Stat',
            target: 'Ally',
            stat: 'HP',
            comparator: 'EqualTo',
            value: 0,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'quickCurse',
    type: 'passive',
    name: 'Quick Curse',
    description:
      "Activates before an enemy uses an attack skill. Inflicts -20% Attack for a single enemy's Next Attack. Inflicts Critical Seal.",
    pp: 1,
    skillCategories: ['Sabotage'],
    activationWindow: 'beforeEnemyAttacks',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Debuff',
        stat: 'Attack',
        value: -20,
        scaling: 'percent',
        applyTo: 'Target',
      },
      {
        kind: 'Affliction',
        affliction: 'CritSeal',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'cursedSwamp',
    type: 'passive',
    name: 'Cursed Swamp',
    description:
      'Activates at the start of a battle. Inflicts -10 Initiative and -30 Evasion on all enemies. Inflicts -1 PP to Cavalry targets',
    pp: 2,
    skillCategories: ['Sabotage'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Debuff',
        stat: 'INIT',
        value: -10,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Debuff',
        stat: 'EVA',
        value: -30,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Debuff',
        stat: 'PP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Cavalry',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'magicCounter',
    type: 'passive',
    name: 'Magic Counter',
    description:
      'Activates after an enemy attacks with an active skill. Counterattack a single enemy with Magic.',
    pp: 1,
    skillCategories: ['Damage', 'Counter'],
    activationWindow: 'afterEnemyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Magical',
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'magicPursuit',
    type: 'passive',
    name: 'Magic Pursuit',
    description:
      'Activates after an ally uses a magic attack (Active). Follow-up attack a single enemy with Magic.',
    pp: 1,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterAllyMagicAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Magical',
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 100,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'concentrate',
    type: 'passive',
    name: 'Concentrate',
    description: 'Grants the user +1 AP and +40 Accuracy.',
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'afterUsingActiveSkill',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'ACC',
        value: 40,
        scaling: 'flat',
        applyTo: 'User',
      },
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'magicConferral',
    type: 'passive',
    name: 'Magic Conferral',
    description:
      "Activates before an ally attacks with a Physical Active skill. Add Magic damage to an ally's next attack. (50 potency)",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyAttacksPhysicalActive',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Conferral',
        potency: 50,
        applyTo: 'Target',
        duration: 'UntilNextAttack',
      },
    ],
  },
  {
    id: 'focusSight',
    type: 'passive',
    name: 'Focus Sight',
    description:
      "Activates before an ally attacks with an Active skill. Make an ally's next attack Truestrike.",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyAttacksActive',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'TrueStrike',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilNextAttack',
      },
    ],
  },
  {
    id: 'quickCast',
    type: 'passive',
    name: 'Quick Cast',
    description:
      'Activates at the start of a battle. Grants the user max initiative for their next action and -50% Critical Rate',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 999,
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilNextAction',
      },
      {
        kind: 'Debuff',
        stat: 'CRT',
        value: -50,
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilNextAction',
      },
    ],
  },
  {
    id: 'groundCounter',
    type: 'passive',
    name: 'Ground Counter',
    description:
      'Activates after an enemy attacks with an active skill. Counterattack a single enemy. +100 potency vs Cavalry targets.',
    pp: 1,
    skillCategories: ['Damage', 'Counter'],
    activationWindow: 'afterEnemyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 50,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 100,
        },
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Cavalry',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'deflect',
    type: 'passive',
    name: 'Deflect',
    description:
      'Activates before being hit by a melee attack. Negate melee damage for a single hit. Grants the user +20 Evasion. (Effect stacks.)',
    pp: 1,
    skillCategories: ['Parry'],
    activationWindow: 'beforeBeingHitMelee',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Parry',
        applyTo: 'User',
      },
      {
        kind: 'Buff',
        stat: 'EVA',
        value: 20,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'dragonsRoar',
    type: 'passive',
    name: "Dragon's Roar",
    description:
      'Activates at the start of a battle. Inflicts Initiative -20 on all enemies.',
    pp: 2,
    skillCategories: ['Sabotage'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Debuff',
        stat: 'INIT',
        value: -20,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'wingRest',
    type: 'passive',
    name: 'Wing Rest',
    description:
      'Activates at the end of a battle. Recover 25% HP. Recovered HP doubles if Afflicted.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'endOfBattle',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'HealPercent',
        value: 25,
      },
      {
        kind: 'HealPercent',
        value: 25,
        conditions: [
          {
            kind: 'AnyAffliction',
            target: 'Self',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'feathering',
    type: 'passive',
    name: 'Feathering',
    description:
      "Activates before attacking with an active skill. Grants allies in the user's row +15 initiative.",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 15,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'gryphonGlide',
    type: 'passive',
    name: 'Gryphon Glide',
    description:
      'Activates before being hit by a ranged attack. Evade a single hit of a ranged attack. Grants the user +1 AP.',
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'beforeBeingHitRanged',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Evade',
        evadeType: 'singleHit',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'sylphicBarrier',
    type: 'passive',
    name: 'Sylphic Barrier',
    description:
      'Activates before an ally is hit by a ranged phys. attack. Allow an ally to Evade one attack.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyHitRangedPhys',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Evade',
        evadeType: 'entireAttack',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'removeWeakness',
    type: 'passive',
    name: 'Remove Weakness',
    description:
      "Activates after the user is debuffed. Remove the user's debuffs. Grants the user a buff to Evade one attack.",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterUserDebuff',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Evade',
        evadeType: 'entireAttack',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
      {
        kind: 'Cleanse',
        target: 'Debuffs',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'evasiveImpetus',
    type: 'passive',
    name: 'Evasive Impetus',
    description: 'Activates after evading an attack. Grants the user +1 AP.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterEvade',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'quickCure',
    type: 'passive',
    name: 'Quick Cure',
    description:
      'Activates after an ally is debuffed. Remove all debuffs from an ally. Grants the target immunity to one debuff.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterAllyDebuffed',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Cleanse',
        target: 'Debuffs',
        applyTo: 'Target',
      },
      {
        kind: 'Buff',
        stat: 'DebuffImmunity',
        value: 1,
        applyTo: 'Target',
        scaling: 'flat',
        duration: 'UntilDebuffed',
      },
    ],
  },
  {
    id: 'selflessHeal',
    type: 'passive',
    name: 'Selfless Heal',
    description:
      'Activates after being healed. Restore minor HP to all allies. Removes all debuffs.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'afterHealed',
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 50,
        },
        hitCount: 1,
      },
      {
        kind: 'Cleanse',
        target: 'Debuffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'pureField',
    type: 'passive',
    name: 'Pure Field',
    description:
      'Activates at the start of a battle. Grants all allies a buff that negates a single debuff.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'DebuffImmunity',
        value: 1,
        applyTo: 'Target',
        scaling: 'flat',
        duration: 'UntilDebuffed',
      },
    ],
  },
  {
    id: 'nocturnalStrike',
    type: 'passive',
    name: 'Nocturnal Strike',
    description:
      'Activates at the start of a battle. Attack a single enemy with a first strike. Grants the user +1 PP at Night.',
    pp: 1,
    skillCategories: ['Damage'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'IsNightCycle',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
    ],
  },
  {
    id: 'bestralHowl',
    type: 'passive',
    name: 'Bestral Howl',
    description:
      "Activates before attacking with an active skill. Grants allies in the user's row +15% Phys. Attack.",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'PATK',
        value: 15,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'killingPursuit',
    type: 'passive',
    name: 'Killing Pursuit',
    description:
      'Activates after an ally attacks (Active). Follow-up attack a single enemy. Grants +1 AP if the target is defeated.',
    pp: 1,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterAllyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'TargetDefeated',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
    ],
  },
  {
    id: 'nocturnalEvade',
    type: 'passive',
    name: 'Nocturnal Evade',
    description:
      'Activates before being attacked. Evade a single hit. Grants the user +1 PP at Night.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeBeingAttacked',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Evade',
        evadeType: 'singleHit',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'IsNightCycle',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
    ],
  },
  {
    id: 'shadowPursuit',
    type: 'passive',
    name: 'Shadow Pursuit',
    description:
      'Activates after an ally attacks (Active). Follow-up attack a single enemy. Inflicts Blindness.',
    pp: 1,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterAllyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Blind',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'weaknessHunter',
    type: 'passive',
    name: 'Weakness Hunter',
    description:
      "Activates after an enemy is debuffed. Attack a single enemy. Ignores 50% of the target's Defense.",
    pp: 2,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterEnemyDebuff',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    skillFlags: ['Unguardable'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'IgnoreDefense',
        fraction: 0.5,
      },
    ],
  },
  {
    id: 'heavyGuard',
    type: 'passive',
    name: 'Heavy Guard',
    description:
      'Activates before being hit by a physical attack. Block an enemy attack with a heavy guard.',
    pp: 1,
    skillCategories: ['Guard'],
    activationWindow: 'beforeBeingHitPhys',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Guard',
        guard: 'heavy',
      },
    ],
  },
  {
    id: 'nocturnalRest',
    type: 'passive',
    name: 'Nocturnal Rest',
    description:
      'Activates after attacking. Recover 30% HP. Recovered HP doubles at Night.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'afterAttacking',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'HealPercent',
        value: 30,
        applyTo: 'User',
      },
      {
        kind: 'HealPercent',
        value: 30,
        applyTo: 'User',
        conditions: [
          {
            kind: 'IsNightCycle',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
    ],
  },
  {
    id: 'lifeBlow',
    type: 'passive',
    name: 'Life Blow',
    description:
      "Activates at the end of a battle. Attacks a single enemy. Deals damage equal to 80% of the users's HP. (This attack cannot be a critical)",
    pp: 1,
    skillCategories: ['Damage'],
    activationWindow: 'endOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    skillFlags: ['Unguardable', 'NoCrit'],
    effects: [
      {
        kind: 'Damage',
        potency: {},
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'OwnHPBasedDamage',
        type: 'percentRemaining',
        amount: 80,
      },
    ],
  },
  {
    id: 'restore',
    type: 'passive',
    name: 'Restore',
    description:
      'Activates after an ally uses a passive skill. Grants an ally +1 PP.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterAllyPassiveSkill',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'quickDispel',
    type: 'passive',
    name: 'Quick Dispel',
    description:
      'Activates after an enemy is buffed. Remove all buffs from a single enemy.',
    pp: 1,
    skillCategories: ['Sabotage'],
    activationWindow: 'afterEnemyBuff',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Cleanse',
        target: 'Buffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'circleBarrier',
    type: 'passive',
    name: 'Circle Barrier',
    description:
      'Activates before an ally is attacked. Reduce damage taken by all allies by 25% for one attack.',
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'DmgReductionPercent',
        value: 25,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'accelerate',
    type: 'passive',
    name: 'Accelerate',
    description:
      'Activates after an enemy attacks with an active skill. Grants the user +20 Initiative and +30 Accuracy. (Effect stacks.)',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterEnemyAttacksActive',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 20,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
      {
        kind: 'Buff',
        stat: 'ACC',
        value: 30,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'diurnalGuard',
    type: 'passive',
    name: 'Diurnal Guard',
    description:
      'Activates before being hit by a physical attack. Block enemy attack with medium guard. Grants the user +1 PP during the day.',
    pp: 1,
    skillCategories: ['Guard'],
    activationWindow: 'beforeBeingHitPhys',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Guard',
        guard: 'medium',
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'IsNightCycle',
            comparator: 'EqualTo',
            value: false,
          },
        ],
      },
    ],
  },
  {
    id: 'discharge',
    type: 'passive',
    name: 'Discharge',
    description:
      "Activates before attacking with an active skill. Consume all of the user's buffs and increase attack power for one attack. (Number of consumed buffs x 25%)",
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAttackingActive',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [],
  },
  {
    id: 'aerialPursuit',
    type: 'passive',
    name: 'Aerial Pursuit',
    description:
      'Activates after a flying ally attacks (Active). Follow-up attack a single enemy.',
    pp: 1,
    skillCategories: ['Damage', 'Pursuit'],
    activationWindow: 'afterFlyingAllyAttacksActive',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'tailwind',
    type: 'passive',
    name: 'Tailwind',
    description:
      'Activates after using an active skill. Grants a row of allies +10 Initiative. Effect is doubled for flying targets.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'afterUsingActiveSkill',
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 10,
        scaling: 'flat',
        applyTo: 'Target',
        stacks: true,
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Ally',
            combatantType: 'Flying',
            comparator: 'NotEqualTo',
          },
        ],
      },
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 20,
        scaling: 'flat',
        applyTo: 'Target',
        stacks: true,
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Ally',
            combatantType: 'Flying',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'shiningLight',
    type: 'passive',
    name: 'Shining Light',
    description:
      'Activates before an enemy uses an attack skill. Inflicts Blindness on a row of enemies.',
    pp: 2,
    skillCategories: ['Sabotage'],
    activationWindow: 'beforeEnemyAttacks',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Affliction',
        affliction: 'Blind',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'hastenedHeal',
    type: 'passive',
    name: 'Hastened Heal',
    description:
      'Activates at the start of a battle. Restore minor HP to all allies. Grants HP regeneration during the day.',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 50,
        },
        hitCount: 1,
      },
      {
        kind: 'Buff',
        stat: 'OnActiveHealPercent',
        value: 25,
        scaling: 'percent',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'IsNightCycle',
            comparator: 'EqualTo',
            value: false,
          },
        ],
      },
    ],
  },
  {
    id: 'preemptiveHeal',
    type: 'passive',
    name: 'Preemptive Heal',
    description:
      'Activates before an ally is attacked. Restore moderate HP to an ally.',
    pp: 2,
    skillCategories: ['Heal'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 100,
        },
        hitCount: 1,
      },
    ],
  },
  {
    id: 'holyBreath',
    type: 'passive',
    name: 'Holy Breath',
    description:
      'Activates before an ally attacks with an Active skill. Restore minor HP to an ally. If target is Afflicted, remove the Affliction and grant the user +1 PP',
    pp: 1,
    skillCategories: ['Heal'],
    activationWindow: 'beforeAllyAttacksActive',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 50,
        },
        hitCount: 1,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'AnyAffliction',
            target: 'Ally',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'Cleanse',
        target: 'Afflictions',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'AnyAffliction',
            target: 'Ally',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'sacrifice',
    type: 'passive',
    name: 'Sacrifice',
    description:
      "Activates before an ally is attacked. Risk one's life to cover an ally. Grants the user +2 PP",
    pp: 1,
    skillCategories: ['Cover'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Cover',
        guard: 'none',
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 2,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'holyBarrier',
    type: 'passive',
    name: 'Holy Barrier',
    description:
      'Activates before an ally is attacked. Reduce the damage taken by an ally by 50% for one attack. Also prevents them from being afflicted.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'DmgReductionPercent',
        value: 50,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
      {
        kind: 'Buff',
        stat: 'AfflictionImmunity',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'guardOrder',
    type: 'passive',
    name: 'Guard Order',
    description:
      'Activates before an ally is attacked. Grants a row of allies +100% Guard Rate for one attack.',
    pp: 1,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyAttacked',
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'GRD',
        value: 100,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'snipingOrder',
    type: 'passive',
    name: 'Sniping Order',
    description:
      "Activates before an ally attacks with an active skill. Make a row of allies' next attack a truestrike.",
    pp: 2,
    skillCategories: ['Utility'],
    activationWindow: 'beforeAllyAttacksActive',
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'TrueStrike',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        duration: 'UntilNextAttack',
      },
    ],
  },
  {
    id: 'artenieStrike',
    type: 'passive',
    name: 'Artenie Strike',
    description:
      'Activates at the start of a battle. Attack a single enemy with a first strike. Grants the user +2 PP if the target is defeated.',
    pp: 1,
    skillCategories: ['Damage'],
    activationWindow: 'startOfBattle',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
        },
        hitRate: 'True',
        hitCount: 1,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 2,
        applyTo: 'User',
        conditions: [
          {
            kind: 'TargetDefeated',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
    ],
  },
] as const satisfies readonly PassiveSkill[]

export type PassiveSkillsId = (typeof PassiveSkills)[number]['id']

export type PassiveSkillsBase = (typeof PassiveSkills)[number]

// Shared optional structure to allow property access on partial fields
type PassiveSkillsShared = Partial<PassiveSkill>

export type PassiveSkillsMap = {
  [K in PassiveSkillsId]: Extract<PassiveSkillsBase, { id: K }> &
    PassiveSkillsShared
}

export const PassiveSkillsMap: PassiveSkillsMap = Object.fromEntries(
  PassiveSkills.map(item => [item.id, item])
) as PassiveSkillsMap
