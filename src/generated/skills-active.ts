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
    skillFlags: ['Piercing'],
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
    skillFlags: ['Piercing'],
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
    skillFlags: ['TrueStrike', 'Piercing'],
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
    skillFlags: ['Piercing'],
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
    skillFlags: ['Piercing'],
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
    skillFlags: ['Piercing'],
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
    skillFlags: ['Piercing'],
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
      'Attack a single enemy with a critical strike. (Critical rate +50%)',
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
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilNextAttack',
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
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilNextAttack',
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
  {
    id: 'passiveSteal',
    type: 'active',
    name: 'Passive Steal',
    description:
      "Attack a single enemy. Steal all of the enemy's PP. (Does not apply if they guard the first hit.)",
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
        hitCount: 2,
      },
      {
        kind: 'ResourceSteal',
        resource: 'PP',
        amount: 'All',
        applyTo: 'User',
        conditions: [
          {
            kind: 'FirstHitGuarded',
            comparator: 'EqualTo',
            value: false,
          },
        ],
      },
    ],
  },
  {
    id: 'toxicThrow',
    type: 'active',
    name: 'Toxic Throw',
    description: 'Attack a single enemy. Inflicts Poison.',
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
          physical: 25,
        },
        hitRate: 100,
        hitCount: 2,
      },
      {
        kind: 'Affliction',
        affliction: 'Poison',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'shadowbite',
    type: 'active',
    name: 'Shadowbite',
    description:
      'Attack a row of enemies. Inflicts Blindness. Inflicts Initiative -20 and Evasion -20.',
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
          physical: 15,
        },
        hitRate: 100,
        hitCount: 2,
      },
      {
        kind: 'Affliction',
        affliction: 'Blind',
        applyTo: 'Target',
      },
      {
        kind: 'Debuff',
        stat: 'INIT',
        value: -20,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Debuff',
        stat: 'EVA',
        value: -20,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'activeSteal',
    type: 'active',
    name: 'Active Steal',
    description:
      "Attack a single enemy. Steal 1 of the enemy's AP. (Does not apply if they guard the first hit.)",
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
          physical: 25,
        },
        hitRate: 100,
        hitCount: 4,
      },
      {
        kind: 'ResourceSteal',
        resource: 'AP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'FirstHitGuarded',
            comparator: 'EqualTo',
            value: false,
          },
        ],
      },
    ],
  },
  {
    id: 'assaultingLance',
    type: 'active',
    name: 'Assaulting Lance',
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
    id: 'wildRush',
    type: 'active',
    name: 'Wild Rush',
    description:
      'Attack a column of enemies with a piercing strike. Inflicts Stun.',
    ap: 1,
    skillCategories: ['Damage'],
    skillFlags: ['Piercing'],
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
        affliction: 'Stun',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'pileThrust',
    type: 'active',
    name: 'Pile Thrust',
    description:
      'Attack a single target with multiple hits. Grants the user +1 AP if the target is defeated.',
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
          physical: 50,
        },
        hitRate: 100,
        hitCount: 3,
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
    id: 'hache',
    type: 'active',
    name: 'Hache',
    description:
      'Attack a single enemy. Grants the user +1 PP if this attack hits.',
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
            kind: 'HitCheck',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
    ],
  },
  {
    id: 'rowHeal',
    type: 'active',
    name: 'Row Heal',
    description: 'Restore moderate HP to a row of allies.',
    ap: 1,
    skillCategories: ['Heal'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 100,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'saintsBlade',
    type: 'active',
    name: "Saint's Blade",
    description:
      'Attack a single enemy. +25 potency if the user is at 100% HP. Grants the user +1 PP if this attack hits.',
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
        hitCount: 2,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 25,
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
    id: 'vengefulAxe',
    type: 'active',
    name: 'Vengeful Axe',
    description:
      'Attacks a single enemy. Damage increases the less HP the user has. (Maximum increase: +100.)',
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
        kind: 'PotencyBoost',
        amount: {
          physical: 100,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
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
    id: 'venomAxe',
    type: 'active',
    name: 'Venom Axe',
    description: 'Attack a single enemy. Inflicts Poison.',
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
          physical: 75,
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
    id: 'darkFlame',
    type: 'active',
    name: 'Dark Flame',
    description:
      'Consumes 30% of own HP to attack a row of enemies. +50 potency v. debuffed targets. Inflicts Burn.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Sacrifice',
        resource: 'HP',
        amount: 30,
        scaling: 'percent',
        applyTo: 'User',
      },
      {
        kind: 'Damage',
        potency: {
          physical: 50,
          magical: 50,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
          magical: 50,
        },
        conditions: [
          {
            kind: 'AnyDebuff',
            target: 'Enemy',
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
    id: 'heal',
    type: 'active',
    name: 'Heal',
    description: 'Restore moderate HP to an ally.',
    ap: 1,
    skillCategories: ['Heal'],
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
    id: 'sacredHeal',
    type: 'active',
    name: 'Sacred Heal',
    description:
      "Restore moderate HP to a row of allies. Removes all of target's debuffs.",
    ap: 2,
    skillCategories: ['Heal'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 100,
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
    id: 'passiveCurse',
    type: 'active',
    name: 'Passive Curse',
    description: 'Inflicts -1 PP and -10 Initiative on a row of enemies.',
    ap: 1,
    skillCategories: ['Sabotage'],
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Debuff',
        stat: 'PP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Debuff',
        stat: 'INIT',
        value: -10,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'offensiveCurse',
    type: 'active',
    name: 'Offensive Curse',
    description:
      'Inflicts -50% Phys. Attack and -50% Mag. Attack on a row of enemies.',
    ap: 1,
    skillCategories: ['Sabotage'],
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Debuff',
        stat: 'Attack',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'defensiveCurse',
    type: 'active',
    name: 'Defensive Curse',
    description:
      'Inflicts -50% Phys. Defense, -50% Mag. Defense, and Guard Seal on a row of enemies.',
    ap: 1,
    skillCategories: ['Sabotage'],
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Debuff',
        stat: 'Defense',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
      {
        kind: 'Affliction',
        affliction: 'GuardSeal',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'compoundingCurse',
    type: 'active',
    name: 'Compounding Curse',
    description: 'Makes Debuffs 1.5x more effective for a row of enemies.',
    ap: 1,
    skillCategories: ['Sabotage'],
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'DebuffAmplification',
        multiplier: 1.5,
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'fireball',
    type: 'active',
    name: 'Fireball',
    description: 'Attack a single enemy with Magic. Inflicts Burn',
    ap: 1,
    skillCategories: ['Damage'],
    innateAttackType: 'Magical',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 40,
        },
        hitRate: 100,
        hitCount: 3,
      },
      {
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'thunderousStrike',
    type: 'active',
    name: 'Thunderous Strike',
    description: 'Attack a row of enemies with Magic. Inflicts Stun.',
    ap: 2,
    skillCategories: ['Damage'],
    innateAttackType: 'Magical',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 100,
        },
        hitRate: 90,
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
    id: 'volcano',
    type: 'active',
    name: 'Volcano',
    description: 'Attack a column of enemies with Magic. Inflicts Burn.',
    ap: 2,
    skillCategories: ['Damage'],
    innateAttackType: 'Magical',
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 150,
        },
        hitRate: 90,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'icebolt',
    type: 'active',
    name: 'Icebolt',
    description: 'Attack a single enemy with Magic. Inflicts Freeze.',
    ap: 1,
    skillCategories: ['Damage'],
    innateAttackType: 'Magical',
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 100,
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
    id: 'magicMissile',
    type: 'active',
    name: 'Magic Missile',
    description: 'Attack two enemies with Magic.',
    ap: 1,
    skillCategories: ['Damage'],
    innateAttackType: 'Magical',
    targeting: {
      group: 'Enemy',
      pattern: 'Two',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 70,
        },
        hitRate: 100,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'iceCoffin',
    type: 'active',
    name: 'Ice Coffin',
    description: 'Attack a row of enemies with Magic. Inflicts Freeze.',
    ap: 2,
    skillCategories: ['Damage'],
    innateAttackType: 'Magical',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
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
    id: 'divingThrust',
    type: 'active',
    name: 'Diving Thrust',
    description:
      'Attack a single enemy. Cavalry targets cannot guard against this attack. +50 potency vs Cavalry targets.',
    ap: 1,
    skillCategories: ['Damage'],
    innateAttackType: 'Ranged',
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
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Cavalry',
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
    id: 'fireBreath',
    type: 'active',
    name: 'Fire Breath',
    description: 'Attack a row of enemies. Inflicts Burn.',
    ap: 2,
    skillCategories: ['Damage'],
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
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
    id: 'tempestDive',
    type: 'active',
    name: 'Tempest Dive',
    description:
      'Attack a column of enemies with a piercing strike. Cavalry targets cannot guard against this attack. Becomes a truestrike and critical if user is below 50% HP.',
    ap: 2,
    skillCategories: ['Damage'],
    skillFlags: ['Piercing'],
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
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
        kind: 'GrantFlag',
        flag: 'TrueStrike',
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
      {
        kind: 'GrantFlag',
        flag: 'TrueCritical',
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
    id: 'highSwing',
    type: 'active',
    name: 'High Swing',
    description:
      'Attack a row of enemies. Cavalry targets cannot guard against this attack. +50 potency vs Cavalry targets.',
    ap: 1,
    skillCategories: ['Damage'],
    innateAttackType: 'Ranged',
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
    id: 'fatalDive',
    type: 'active',
    name: 'Fatal Dive',
    description:
      "Attack a column of enemies with a piercing strike. Deals damage equal to 50% of the user's HP. This attack cannot be a critical.",
    ap: 2,
    skillCategories: ['Damage'],
    skillFlags: ['Unguardable', 'Piercing'],
    innateAttackType: 'Ranged',
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {},
        hitRate: 100,
        hitCount: 1,
      },
      {},
    ],
  },
  {
    id: 'aerialSmite',
    type: 'active',
    name: 'Aerial Smite',
    description:
      'Attack a row of enemies. Cavalry targets cannot guard against this attack. -1 AP to targets at 100% HP.',
    ap: 2,
    skillCategories: ['Damage'],
    innateAttackType: 'Ranged',
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
        kind: 'Debuff',
        stat: 'AP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
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
] as const

export type ActiveSkillsId = (typeof ActiveSkills)[number]['id']

export type ActiveSkillsMap = {
  [K in ActiveSkillsId]: Extract<(typeof ActiveSkills)[number], { id: K }>
}

export const ActiveSkillsMap: ActiveSkillsMap = Object.fromEntries(
  ActiveSkills.map(item => [item.id, item])
) as ActiveSkillsMap
