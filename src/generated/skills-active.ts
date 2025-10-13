// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: active.json

export const ActiveSkills = [
  {
    id: 'ironCrusher',
    type: 'active',
    name: 'Iron Crusher',
    description:
      'Attack a single enemy. Ignores 50% defense vs armored targets. Grants +50 potency vs armored targets.',
    ap: 1,
    skillCategories: ['Damage'],
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
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Armored',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
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
    id: 'heavySlash',
    type: 'active',
    name: 'Heavy Slash',
    description: 'Attack a single enemy with high potency.',
    ap: 1,
    skillCategories: ['Damage'],
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
    ],
  },
  {
    id: 'leanEdge',
    type: 'active',
    name: 'Lean Edge',
    description:
      'Attack a single enemy. Recover 25% HP if attack hits and another 25% HP if target is defeated.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'HealPercent',
        value: 25,
        applyTo: 'User',
        conditions: [
          {
            kind: 'HitCheck',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
      {
        kind: 'HealPercent',
        value: 25,
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
    id: 'verticalEdge',
    type: 'active',
    name: 'Vertical Edge',
    description:
      'Attack a single enemy. Against flying targets, becomes Truestrike, +50 Potency and ignores 50% of Defense.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'GrantFlag',
        flag: 'TrueStrike',
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Flying',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
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
      {
        kind: 'IgnoreDefense',
        fraction: 0.5,
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
    id: 'longThrust',
    type: 'active',
    name: 'Long Thrust',
    description:
      'Attack a column of enemies with a piercing strike. Cavalry targets cannot guard against this attack. Grants +50 potency vs cavalry targets.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
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
        kind: 'GrantFlag',
        flag: 'Unguardable',
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Cavalry',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
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
    id: 'javelin',
    type: 'active',
    name: 'Javelin',
    description: 'Attack a single enemy. +50 potency vs flying targets.',
    ap: 1,
    skillCategories: ['Damage'],
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
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
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
    id: 'brandish',
    type: 'active',
    name: 'Brandish',
    description:
      "Attack a single enemy. Ignores 50% of the target's defense. Grants the user +1 PP if the attack hits.",
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    skillFlags: ['Unguardable'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 50,
        },
        hitRate: 100,
        hitCount: 3,
      },
      {
        kind: 'IgnoreDefense',
        fraction: 0.5,
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
    id: 'sanguineAttack',
    type: 'active',
    name: 'Sanguine Attack',
    description:
      'Attack a single enemy. Recover HP equal to 50% of damage dealt.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'LifeSteal',
        percentage: 50,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'shadowThrust',
    type: 'active',
    name: 'Shadow Thrust',
    description: 'Attack a column of enemies. Inflicts blindness.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 80,
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
    id: 'magicAttack',
    type: 'active',
    name: 'Magic Attack',
    description: 'Attack a single enemy with magical damage.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
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
    id: 'trueThrust',
    type: 'active',
    name: 'True Thrust',
    description: 'Attack a column of enemies. This attack always hits.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['TrueStrike'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 80,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'passiveShatter',
    type: 'active',
    name: 'Passive Shatter',
    description: 'Attack a column of enemies. Inflicts -1 PP.',
    ap: 1,
    skillCategories: ['Damage'],
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
      {
        kind: 'Debuff',
        stat: 'PP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'phantomAttack',
    type: 'active',
    name: 'Phantom Attack',
    description: 'Attack a single enemy with magical damage. Inflicts -1 PP.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 120,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'PP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'lightningShaker',
    type: 'active',
    name: 'Lightning Shaker',
    description: 'Attack a row of enemies. Inflicts stun.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
          magical: 100,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'icicleDart',
    type: 'active',
    name: 'Icicle Dart',
    description: 'Attack a single enemy. Inflicts freeze.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    skillFlags: ['TrueStrike'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
          magical: 50,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Freeze',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'rampage',
    type: 'active',
    name: 'Rampage',
    description:
      'Attack a single enemy. Inflicts -1 AP on target and grants user -50% Defense.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'AP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Debuff',
        stat: 'Defense',
        value: -50,
        scaling: 'percent',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'lethalVenom',
    type: 'active',
    name: 'Lethal Venom',
    description:
      'Attack a column of enemies with a piercing strike. Inflicts Poison. Inflicts Deathblow vs. poisoned foes.',
    ap: 3,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
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
      {
        kind: 'Affliction',
        affliction: 'Poison',
        applyTo: 'Target',
      },
      {
        kind: 'Affliction',
        affliction: 'Deathblow',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'Affliction',
            target: 'Enemy',
            affliction: 'Poison',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'flameJavelin',
    type: 'active',
    name: 'Flame Javelin',
    description:
      'Attack a single enemy. +50 potency vs. flying targets. Inflicts burn.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Ranged',
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
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
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
      {
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'elfslayer',
    type: 'active',
    name: 'Elfslayer',
    description:
      'Attack a column of enemies. Inflicts -1 AP, -1 PP and -50% Defense to Elven targets.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
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
        kind: 'Debuff',
        stat: 'AP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Elven',
            comparator: 'EqualTo',
          },
        ],
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
            combatantType: 'Elven',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'Debuff',
        stat: 'Defense',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Elven',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'thunderousThrust',
    type: 'active',
    name: 'Thunderous Thrust',
    description:
      'Attack a single enemy with hybrid damage. Inflicts stun. +25 potency if user has Faeries.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
          magical: 100,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 25,
          magical: 25,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'Faeries',
            comparator: 'GreaterThan',
            value: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'dragoonDive',
    type: 'active',
    name: 'Dragoon Dive',
    description:
      'Attack all enemies. Requires charging. +50 potency vs ground targets.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Ranged',
    skillFlags: ['Charge'],
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
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Infantry',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
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
    id: 'wardingSlash',
    type: 'active',
    name: 'Warding Slash',
    description: 'Attack a single enemy. Grants the user +20% Phys. Defense.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Buff',
        stat: 'PDEF',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'shieldBash',
    type: 'active',
    name: 'Shield Bash',
    description: 'Attack a single enemy. Inflicts Stun.',
    ap: 1,
    skillCategories: ['Damage'],
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
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'defender',
    type: 'active',
    name: 'Defender',
    description:
      'Attack a single enemy. Grants the user +50% Phys. Defense. Grants the user +1 PP if this attack hits.',
    ap: 2,
    skillCategories: ['Damage'],
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
        hitCount: 2,
      },
      {
        kind: 'Buff',
        stat: 'PDEF',
        value: 50,
        scaling: 'percent',
        applyTo: 'User',
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
    id: 'honedSpear',
    type: 'active',
    name: 'Honed Spear',
    description:
      'Attack a column of enemies with a piercing strike. +50 potency if the user is buffed. Cavalry targets cannot guard against this attack.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 130,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'AnyBuff',
            target: 'Self',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'GrantFlag',
        flag: 'Unguardable',
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
    id: 'smash',
    type: 'active',
    name: 'Smash',
    description: 'Attack a single enemy. Inflicts Phys. Defense -20%.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'PDEF',
        value: -20,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'rollingAxe',
    type: 'active',
    name: 'Rolling Axe',
    description:
      'Attack a row of enemies with multiple hits. Inflicts Phys. Defense -15%.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 40,
        },
        hitRate: 75,
        hitCount: 3,
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
    id: 'wideBreaker',
    type: 'active',
    name: 'Wide Breaker',
    description:
      'Attack a row of enemies. Inflicts Phys. Defense -30%. +50 potency v. debuffed targets.',
    ap: 2,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'PDEF',
        value: -30,
        scaling: 'percent',
        applyTo: 'Target',
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'AnyDebuff',
            target: 'Enemy',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'keenEdge',
    type: 'active',
    name: 'Keen Edge',
    description:
      'Attack a single enemy with a critical strike. (Critical rate+50%.)',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    skillFlags: ['TrueStrike'],
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
        kind: 'Buff',
        stat: 'CRT',
        value: 50,
        scaling: 'percent',
        applyTo: 'User',
        duration: 'NextAction',
      },
    ],
  },
  {
    id: 'impale',
    type: 'active',
    name: 'Impale',
    description:
      'Attack a single enemy. Grants the user +1 PP if the target is defeated.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
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
    id: 'meteorSlash',
    type: 'active',
    name: 'Meteor Slash',
    description:
      'Attack a single enemy with a critical flurry. (Critical rate +30%.)',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 20,
        },
        hitRate: 100,
        hitCount: 9,
      },
      {
        kind: 'Buff',
        stat: 'CRT',
        value: 30,
        scaling: 'percent',
        applyTo: 'User',
        duration: 'NextAction',
      },
    ],
  },
  {
    id: 'killingChain',
    type: 'active',
    name: 'Killing Chain',
    description:
      'Attack a single enemy. Grants the user +1 AP if the target is defeated.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
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
    id: 'bastardsCross',
    type: 'active',
    name: "Bastard's Cross",
    description:
      "Attack a single enemy. Potency increases based on the target's HP. (Maximum increase: +60.)",
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 70,
        },
        hitRate: 100,
        hitCount: 2,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 60,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Enemy',
            stat: 'HP',
            comparator: 'GreaterThan',
            value: 80,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'sting',
    type: 'active',
    name: 'Sting',
    description:
      'Attack a single enemy. +50 potency if the user is below 50% HP.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
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
    id: 'rowProtection',
    type: 'active',
    name: 'Row Protection',
    description: "Grants allies in the user's row +50% Phys. Defense.",
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'PDEF',
        value: 50,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'greatshield',
    type: 'active',
    name: 'Greatshield',
    description: 'Grants the user +50% Phys. Defense and +2 PP.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'PDEF',
        value: 50,
        scaling: 'percent',
        applyTo: 'User',
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 2,
      },
    ],
  },
  {
    id: 'wideSmash',
    type: 'active',
    name: 'Wide Smash',
    description:
      'Attack a row of enemies. +50 potency if the user is at 100% HP.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 150,
        },
        hitRate: 80,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'HP',
            comparator: 'EqualTo',
            value: 100,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'mountingCharge',
    type: 'active',
    name: 'Mounting Charge',
    description:
      'Restore 30% HP to the user. Grants the user +30% Phys. Attack.',
    ap: 1,
    skillCategories: ['Utility'],
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
        kind: 'Buff',
        stat: 'PATK',
        value: 30,
        scaling: 'percent',
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'grandSmash',
    type: 'active',
    name: 'Grand Smash',
    description: 'Attack all enemies. +50 potency if the user is at 100% HP.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Ranged',
    skillFlags: ['GroundBased'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 100,
        },
        hitRate: 80,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'HP',
            comparator: 'EqualTo',
            value: 100,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'heavySmash',
    type: 'active',
    name: 'Heavy Smash',
    description:
      'Attack a single enemy. Ignores 100% Defense v. armored targets.',
    ap: 1,
    skillCategories: ['Damage'],
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
    id: 'assaultingBlow',
    type: 'active',
    name: 'Assaulting Blow',
    description:
      'Attack a single enemy. Grants the user +1 AP if the target is defeated.',
    ap: 1,
    skillCategories: ['Damage'],
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
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
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
    id: 'rowSmash',
    type: 'active',
    name: 'Row Smash',
    description:
      'Attack a row of enemies. Ignores 100% Defense v. armored targets.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    skillFlags: ['Unguardable', 'Uncoverable'],
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
    id: 'singleShot',
    type: 'active',
    name: 'Single Shot',
    description: 'Attack a single enemy.',
    ap: 1,
    skillCategories: ['Damage'],
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
    id: 'dualShot',
    type: 'active',
    name: 'Dual Shot',
    description: 'Attack two enemies.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Two',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 70,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'rowShot',
    type: 'active',
    name: 'Row Shot',
    description: 'Attack a row of enemies.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
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
    id: 'powerBolt',
    type: 'active',
    name: 'Power Bolt',
    description: 'Attack a single enemy with a powerful ranged strike.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 120,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'toxicBolt',
    type: 'active',
    name: 'Toxic Bolt',
    description: 'Attack a single enemy with a poisoned bolt. Inflicts poison.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 80,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Poison',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'heavyBolt',
    type: 'active',
    name: 'Heavy Bolt',
    description:
      'Attack a single enemy with a heavy crossbow bolt. +100 potency if user is in the front row.',
    ap: 2,
    skillCategories: ['Damage'],
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
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 100,
        },
        conditions: [
          {
            kind: 'Position',
            target: 'Self',
            row: 1,
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
] as const

export type ActiveSkillsId = (typeof ActiveSkills)[number]['id']

export type ActiveSkillsMap = {
  [K in ActiveSkillsId]: Extract<(typeof ActiveSkills)[number], { id: K }>
}

export const ActiveSkillsMap: ActiveSkillsMap = Object.fromEntries(
  ActiveSkills.map(item => [item.id, item])
) as ActiveSkillsMap
