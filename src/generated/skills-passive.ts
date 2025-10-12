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
      'Activates at the start of a battle. Force a row of enemies to focus attacks on the user.',
    pp: 1,
    skillCategories: ['Sabotage'],
    activationWindow: 'startOfBattle',
    attackType: 'Ranged',
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
] as const

export type PassiveSkillsId = (typeof PassiveSkills)[number]['id']

export type PassiveSkillsMap = {
  [K in PassiveSkillsId]: Extract<(typeof PassiveSkills)[number], { id: K }>
}

export const PassiveSkillsMap: PassiveSkillsMap = Object.fromEntries(
  PassiveSkills.map(item => [item.id, item])
) as PassiveSkillsMap
