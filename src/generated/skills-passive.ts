// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: passive.json

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
        kind: 'GrantFlag',
        flag: 'TrueCritical',
        duration: 'NextAction',
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
        applyTo: 'User',
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
        applyTo: 'User',
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
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
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
        scaling: 'percent',
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
        kind: 'GrantFlag',
        flag: 'Unguardable',
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
        applyTo: 'User',
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
    skillCategories: ['Guard'],
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
        scaling: 'percent',
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
    skillCategories: ['Utility'],
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
      },
      {
        kind: 'GrantFlag',
        flag: 'SurviveLethal',
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
        duration: 'NextAction',
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
      'Activates after an enemy attacks with an active skill. Counterattack a single enemy. Ignores 100% Defense v. armored targets.',
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
        duration: 'NextAction',
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
        hitRate: 90,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'aerialSnipe',
    type: 'passive',
    name: 'Aerial Snipe',
    description:
      'Activates after an ally is hit by an attack. Counterattack a single enemy. +100 potency v. flying targets.',
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
    pp: 2,
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
    pp: 2,
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
    skillCategories: ['Guard'],
    activationWindow: 'beforeBeingHit',
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Guard',
        guard: 'full',
        applyTo: 'User',
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
    innateAttackType: 'Ranged',
    skillFlags: ['Uncoverable', 'Unguardable'],
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
      group: 'Ally',
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
        kind: 'GrantFlag',
        flag: 'NegateMagicDamage',
        applyTo: 'Target',
        duration: 'NextAttack',
      },
      {
        kind: 'GrantFlag',
        flag: 'AfflictionImmunity',
        applyTo: 'Target',
        duration: 'NextAttack',
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
        applyTo: 'User',
      },
      {
        kind: 'GrantFlag',
        flag: 'DebuffImmunity',
        applyTo: 'User',
        duration: 'NextAttack',
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
        kind: 'GrantFlag',
        flag: 'NegateMagicDamage',
        applyTo: 'Target',
        duration: 'NextAttack',
      },
      {
        kind: 'GrantFlag',
        flag: 'AfflictionImmunity',
        applyTo: 'Target',
        duration: 'NextAttack',
      },
    ],
  },
] as const

export type PassiveSkillsId = (typeof PassiveSkills)[number]['id']

export type PassiveSkillsMap = {
  [K in PassiveSkillsId]: Extract<(typeof PassiveSkills)[number], { id: K }>
}

export const PassiveSkillsMap: PassiveSkillsMap = Object.fromEntries(
  PassiveSkills.map(item => [item.id, item])
) as PassiveSkillsMap
