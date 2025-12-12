// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: active.json
import type { ActiveSkill } from '@/types/skills'

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
    id: 'cavalrySlayer',
    type: 'active',
    name: 'Cavalry Slayer',
    description:
      'Attack a single enemy. Inflicts -1 AP, -1 PP, and Guard Seal if the target is Cavalry.',
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
      {
        kind: 'Affliction',
        affliction: 'GuardSeal',
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
    id: 'spinningEdge',
    type: 'active',
    name: 'Spinning Edge',
    description:
      "Attack a row of enemies. Ignores 50% of the target's Defenes. Grants the user +1 PP if a target is defeated.",
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
          physical: 60,
        },
        hitRate: 100,
        hitCount: 2,
      },
      {
        kind: 'IgnoreDefense',
        fraction: 0.5,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
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
    skillFlags: ['Piercing'],
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
    skillFlags: ['Piercing'],
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
        hitRate: 'True',
        hitCount: 1,
      },
    ],
  },
  {
    id: 'passiveShatterSpear',
    type: 'active',
    name: 'Passive Shatter (Spear)',
    description: 'Attack a column of enemies. Inflicts -1 PP.',
    ap: 1,
    skillCategories: ['Damage'],
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
        hitRate: 'True',
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
      'Attack a column of enemies with a piercing strike. Inflicts Poison. Inflicts Deathblow vs poisoned foes.',
    ap: 3,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['Piercing'],
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
      'Attack a single enemy. +50 potency vs flying targets. Inflicts burn.',
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
    skillFlags: ['Piercing'],
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
    id: 'freezingThrust',
    type: 'active',
    name: 'Freezing Thrust',
    description:
      'Attack a single enemy. Inflicts Freeze. +25 potency if the user has summoned faeries.',
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
        affliction: 'Freeze',
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
            combatantType: 'Flying',
            comparator: 'NotEqualTo',
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
    skillFlags: ['Piercing'],
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
      'Attack a row of enemies. Inflicts Phys. Defense -30%. +50 potency vs debuffed targets.',
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
        applyTo: 'User',
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
      'Attack a single enemy. Ignores 100% Defense vs armored targets.',
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
    id: 'rowSmash',
    type: 'active',
    name: 'Row Smash',
    description:
      'Attack a row of enemies. Ignores 100% Defense vs armored targets.',
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
    id: 'wildRush',
    type: 'active',
    name: 'Wild Rush',
    description:
      'Attack a column of enemies with a piercing strike. Inflicts Stun.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['Piercing'],
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
      'Consumes 30% of own HP to attack a row of enemies. +50 potency vs debuffed targets. Inflicts Burn.',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Ranged',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Ranged',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Ranged',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Ranged',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    innateAttackType: 'Magical',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Magical',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    innateAttackType: 'Magical',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Two',
    },
    innateAttackType: 'Magical',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
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
    id: 'divingThrust',
    type: 'active',
    name: 'Diving Thrust',
    description:
      'Attack a single enemy. Cavalry targets cannot guard against this attack. +50 potency vs Cavalry targets.',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Ranged',
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
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    innateAttackType: 'Ranged',
    skillFlags: ['Piercing'],
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
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    innateAttackType: 'Ranged',
    skillFlags: ['Unguardable', 'Piercing', 'NoCrit'],
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
        amount: 50,
      },
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
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
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
  {
    id: 'lightningBlade',
    type: 'active',
    name: 'Lightning Blade',
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
          physical: 75,
          magical: 75,
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
    id: 'naturesWrath',
    type: 'active',
    name: "Nature's Wrath",
    description:
      'Attack a column of enemies with piercing Magic. Inflicts -1 PP to Cavalry targets.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    innateAttackType: 'Magical',
    skillFlags: ['GroundBased'],
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
    id: 'mirageStab',
    type: 'active',
    name: 'Mirage Stab',
    description:
      'Attack a row of enemies. Grants the user the ability to Evade one attack.',
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
          physical: 75,
          magical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Evade',
        evadeType: 'entireAttack',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'windArrow',
    type: 'active',
    name: 'Wind Arrow',
    description: 'Attack a single enemy. Inflicts Evasion -50.',
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
          physical: 75,
          magical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'EVA',
        value: -50,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'mysticConferral',
    type: 'active',
    name: 'Mystic Conferral',
    description: "Add Magic damage (50 potency) to an ally's attacks.",
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Conferral',
        potency: 50,
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'icicleArrow',
    type: 'active',
    name: 'Icicle Arrow',
    description: 'Attack two enemies. Inflicts Freeze.',
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
          physical: 75,
          magical: 75,
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
    id: 'finishingStab',
    type: 'active',
    name: 'Finishing Stab',
    description:
      'Attack a single enemy. Grants the user +50% Phys. Attack if the target is defeated.',
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
        stat: 'PATK',
        value: 50,
        scaling: 'percent',
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
    id: 'decimate',
    type: 'active',
    name: 'Decimate',
    description:
      'Attack a single enemy. Potency increases the fewer enemies there are. (Maximum increase +100.)',
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
        kind: 'PotencyBoost',
        amount: {
          physical: 25,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Enemy',
            comparator: 'LessOrEqual',
            value: 4,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 25,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Enemy',
            comparator: 'LessOrEqual',
            value: 3,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 25,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Enemy',
            comparator: 'LessOrEqual',
            value: 2,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 25,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Enemy',
            comparator: 'EqualTo',
            value: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'wildFang',
    type: 'active',
    name: 'Wild Fang',
    description:
      'Attack a row of enemies. Potency increases the less HP a target has. (Maximum increase +50.)',
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
          physical: 20,
        },
        hitRate: 100,
        hitCount: 3,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [],
      },
    ],
  },
  {
    id: 'piercingLance',
    type: 'active',
    name: 'Piercing Lance',
    description: 'Attack a single of enemy. Inflicts Guard Seal.',
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
        kind: 'Affliction',
        affliction: 'GuardSeal',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'passiveHold',
    type: 'active',
    name: 'Passive Hold',
    description: 'Attack a single of enemy. Inflicts Passive Seal.',
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
        kind: 'Affliction',
        affliction: 'PassiveSeal',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'venomThrust',
    type: 'active',
    name: 'Venom Thrust',
    description:
      'Attack a column of enemies with a piercing strike. Inflicts Poison and debuffs target HP recovery by -50%. +50 potency vs Poisoned targets.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['Piercing'],
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
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'Affliction',
            target: 'Enemy',
            affliction: 'Poison',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'Debuff',
        stat: 'HPRecovery',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'bearCrush',
    type: 'active',
    name: 'Bear Crush',
    description: 'Attack a single enemy. Inflicts Stun.',
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
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'roundSwing',
    type: 'active',
    name: 'Round Swing',
    description:
      'Attack a row enemies. Damage increases the more HP the user has (Maximum increase +50.)',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    skillFlags: ['Unguardable'],
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 25,
        },
        hitRate: 75,
        hitCount: 3,
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
            comparator: 'GreaterThan',
            value: 80,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'earthshaker',
    type: 'active',
    name: 'Earthshaker',
    description:
      'Attack all enemies. Damage increases the less HP the user has (Maximum increase +75.)',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Ranged',
    skillFlags: ['Unguardable', 'GroundBased'],
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
        kind: 'PotencyBoost',
        amount: {
          physical: 75,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'HP',
            comparator: 'LessThan',
            value: 20,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'auroraVeil',
    type: 'active',
    name: 'Aurora Veil',
    description:
      'Grants HP regeneration to a row of allies. Grants targets +50% Mag. Defense.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'MDEF',
        value: 50,
        scaling: 'percent',
        applyTo: 'Target',
      },
      {
        kind: 'Buff',
        stat: 'OnActiveHealPercent',
        value: 25,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'nightVision',
    type: 'active',
    name: 'Night Vision',
    description:
      "Grants a row of allies +50 Accuracy. At Night, makes the targets' next attack a Truestrike.",
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'ACC',
        value: 50,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Buff',
        stat: 'TrueStrike',
        value: 1,
        scaling: 'flat',
        duration: 'UntilNextAttack',
        applyTo: 'Target',
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
    id: 'extraHeal',
    type: 'active',
    name: 'Extra heal',
    description:
      'Restore moderate HP to an ally. Grants HP regeneration and +30 Initiative.',
    ap: 2,
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
      {
        kind: 'Buff',
        stat: 'INIT',
        value: 30,
        scaling: 'flat',
        applyTo: 'Target',
      },
      {
        kind: 'Buff',
        stat: 'OnActiveHealPercent',
        value: 25,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'spiralSword',
    type: 'active',
    name: 'Spiral Sword',
    description:
      'Attack a single enemy. Inflicts Evasion -20. Graths the user +20 Evasion.',
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
        kind: 'Buff',
        stat: 'EVA',
        value: 20,
        scaling: 'flat',
        applyTo: 'User',
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
    id: 'shieldSmite',
    type: 'active',
    name: 'Shield Smite',
    description:
      'Attack a single enemy. Inflicts Defense -20%. Graths the user +20% Defense.',
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
        kind: 'Buff',
        stat: 'Defense',
        value: 20,
        scaling: 'percent',
        applyTo: 'User',
      },
      {
        kind: 'Debuff',
        stat: 'Defense',
        value: -20,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'honedSlash',
    type: 'active',
    name: 'Honed Slash',
    description:
      'Attack a single enemy. Becomes a truestrike if the user is buffed.',
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
          physical: 70,
        },
        hitRate: 100,
        hitCount: 3,
      },
      {
        kind: 'GrantFlag',
        flag: 'TrueStrike',
        conditions: [
          {
            kind: 'AnyBuff',
            target: 'Self',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'delayingShot',
    type: 'active',
    name: 'Delaying Shot',
    description: 'Attack a single enemy. Inflicts Initiative -20.',
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
        hitCount: 4,
      },
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
    id: 'saintsShot',
    type: 'active',
    name: "Saint's Shot",
    description:
      'Attack a single enemy. Inflicts -1 PP. Additional -1 PP to ground-based targets.',
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
        kind: 'Debuff',
        stat: 'PP',
        value: -1,
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
            combatantType: 'Flying',
            comparator: 'NotEqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'photonArrow',
    type: 'active',
    name: 'Photon Arrow',
    description:
      'Attack two enemies. Inflicts Physical Defense -50%. Inflicts Guard Seal during the Day.',
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
          physical: 80,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'PDEF',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
      {
        kind: 'Affliction',
        affliction: 'GuardSeal',
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
    id: 'overheal',
    type: 'active',
    name: 'Overheal',
    description: 'Restore minor HP to a row of allies above their limits.',
    ap: 1,
    skillCategories: ['Heal'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    skillFlags: ['Overheal'],
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
    id: 'honedHealing',
    type: 'active',
    name: 'Honed Healing',
    description:
      'Grants a row of allies a buff that doubles HP restored when healing.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'HPRecovery',
        value: 100,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'holyCradle',
    type: 'active',
    name: 'Holy Cradle',
    description:
      'Grants a row of allies the ability to withstand one lethal blow.',
    ap: 2,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'SurviveLethal',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'impulse',
    type: 'active',
    name: 'Impulse',
    description:
      'Attack a single enemy. Inflicts Mag. Defense -50% to ground-based targets.',
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
        kind: 'Debuff',
        stat: 'MDEF',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Flying',
            comparator: 'NotEqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'rowResistance',
    type: 'active',
    name: 'Row Resistance',
    description:
      "Grants allies in the user's row +50% Mag. Defense. Extends to all allies during the day.",
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Self',
      pattern: 'Row',
      conditionalPattern: {
        pattern: 'All',
        conditions: [
          {
            kind: 'IsNightCycle',
            comparator: 'NotEqualTo',
            value: true,
          },
        ],
      },
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'MDEF',
        value: 50,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'mysticShield',
    type: 'active',
    name: 'Mystic Shield',
    description: 'Grants the user +50% Mag. Defense and +2 PP.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'MDEF',
        value: 50,
        scaling: 'percent',
        applyTo: 'User',
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
    id: 'slice',
    type: 'active',
    name: 'Slice',
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
    id: 'divineCross',
    type: 'active',
    name: 'Divine Cross',
    description:
      'Attack a single enemy and remove all buffs. Grants the user +1 PP if the target is defeated.',
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
          magical: 50,
        },
        hitRate: 'True',
        hitCount: 2,
      },
      {
        kind: 'Cleanse',
        target: 'Buffs',
        applyTo: 'Target',
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
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
    id: 'banishingStab',
    type: 'active',
    name: 'Banishing Stab',
    description: "Attack a single enemy. Remove all of the target's buffs.",
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
        kind: 'Cleanse',
        target: 'Buffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'defensiveOrder',
    type: 'active',
    name: 'Defensive Order',
    description: 'Grants all allies +20% Defense.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
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
    id: 'offensiveOrder',
    type: 'active',
    name: 'Offensive Order',
    description: 'Grants all allies +20% Attack.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'Attack',
        value: 20,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'assassinsNail',
    type: 'active',
    name: "Assassin's Nail",
    description:
      'Attack a single enemy. Inflicts Blindness. +50 potency and critical hit at Night.',
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
          physical: 100,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Blind',
        applyTo: 'Target',
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'IsNightCycle',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
      {
        kind: 'GrantFlag',
        flag: 'TrueCritical',
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
    id: 'doubleBlast',
    type: 'active',
    name: 'Double Blast',
    description: 'Attack two enemies. +80 potency vs flying targets.',
    ap: 2,
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
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 80,
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
    id: 'grislyFire',
    type: 'active',
    name: 'Grisly Fire',
    description:
      'Attack a single enemy. Inflicts Burn. +50 potency and critical hit vs burning targets.',
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
          physical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'Affliction',
            target: 'Enemy',
            affliction: 'Burn',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'GrantFlag',
        flag: 'TrueCritical',
        conditions: [
          {
            kind: 'Affliction',
            target: 'Enemy',
            affliction: 'Burn',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'grislyPoison',
    type: 'active',
    name: 'Grisly Poison',
    description:
      'Attack a single enemy. Inflicts Poison. +50 potency and critical hit vs poisoned targets.',
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
          physical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'Poison',
        applyTo: 'Target',
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 50,
        },
        conditions: [
          {
            kind: 'Affliction',
            target: 'Enemy',
            affliction: 'Poison',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'GrantFlag',
        flag: 'TrueCritical',
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
    id: 'activeShatter',
    type: 'active',
    name: 'Active Shatter',
    description: 'Attack a single enemy. Inflicts -1 AP.',
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
    ],
  },
  {
    id: 'sonicBlast',
    type: 'active',
    name: 'Sonic Blast',
    description: 'Attack a single enemy. +80 potency vs flying targets.',
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
          physical: 70,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 80,
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
    id: 'fireSlash',
    type: 'active',
    name: 'Fire Slash',
    description: 'Attack a single enemy. Inflicts Burn.',
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
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'poisonSlash',
    type: 'active',
    name: 'Poison Slash',
    description: 'Attack a single enemy. Inflicts Poison.',
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
          physical: 100,
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
    id: 'provokingSlash',
    type: 'active',
    name: 'Provoking Slash',
    description:
      'Attack a single enemy. Forces the target to focus attacks on the user.',
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
        kind: 'Debuff',
        stat: 'Taunt',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'leapingSlash',
    type: 'active',
    name: 'Leaping Slash',
    description:
      'Attack a single enemy. Grants the user +1 AP if the attack is critical. Grants the user -30% Critical Rate. (Effect stacks)',
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
        applyTo: 'User',
        conditions: [
          {
            kind: 'WasCritical',
            comparator: 'EqualTo',
            value: true,
          },
        ],
      },
      {
        kind: 'Debuff',
        stat: 'CRT',
        value: -30,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'beastslayer',
    type: 'active',
    name: 'Beastslayer',
    description:
      'Attack a row of enemies. Inflicts -1 AP, -1 PP and -50% Defense to Bestral targets.',
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
        stat: 'AP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'CombatantType',
            target: 'Enemy',
            combatantType: 'Bestral',
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
            combatantType: 'Bestral',
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
            combatantType: 'Bestral',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'banishingSmite',
    type: 'active',
    name: 'Banishing Smite',
    description: "Attack a row of enemies. Remove all of the target's buffs.",
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
        kind: 'Cleanse',
        target: 'Buffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'painfulSmash',
    type: 'active',
    name: 'Painful Smash',
    description:
      "Attack a single enemy. Deals 25% of target's HP in additional damage.",
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
          physical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'TargetHPBasedDamage',
        type: 'percentCurrent',
        amount: 25,
      },
    ],
  },
  {
    id: 'heavySmash',
    type: 'active',
    name: 'Heavy Smash',
    description: 'Attack a row enemies. Inflicts Stun.',
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
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'powerfulImpact',
    type: 'active',
    name: 'Powerful Impact',
    description: 'Attack a single enemy.',
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
          physical: 200,
        },
        hitRate: 25,
        hitCount: 1,
      },
    ],
  },
  {
    id: 'icyCrush',
    type: 'active',
    name: 'Icy Crush',
    description:
      'Attack a single enemy. Inflicts Freeze. +100 potency vs frozen targets.',
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
            kind: 'Affliction',
            affliction: 'Freeze',
            target: 'Enemy',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'desperation',
    type: 'active',
    name: 'Desperation',
    description:
      "Attack a single enemy. Deals damage based on user's missing HP.",
    ap: 2,
    skillCategories: ['Damage'],
    skillFlags: ['Unguardable', 'NoCrit'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Damage',
        potency: {},
        hitRate: 'True',
        hitCount: 1,
      },
      {
        kind: 'OwnHPBasedDamage',
        type: 'percentMissing',
        amount: 100,
      },
    ],
  },
  {
    id: 'groundStrike',
    type: 'active',
    name: 'Ground Strike',
    description:
      'Attack a single enemy. Ignores 100% Defense vs Cavalry targets.',
    ap: 2,
    skillCategories: ['Damage'],
    skillFlags: ['Unguardable', 'GroundBased'],
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
            combatantType: 'Cavalry',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'execution',
    type: 'active',
    name: 'Execution',
    description:
      'Attack a single enemy. Inflicts Passive Seal. Inflicts Deathblow if target is at 25% HP or less.',
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
        hitRate: 75,
        hitCount: 1,
      },
      {
        kind: 'Affliction',
        affliction: 'PassiveSeal',
        applyTo: 'Target',
      },
      {
        kind: 'Affliction',
        affliction: 'Deathblow',
        applyTo: 'Target',
        conditions: [
          {
            kind: 'Stat',
            target: 'Enemy',
            stat: 'HP',
            comparator: 'LessOrEqual',
            value: 25,
            percent: true,
          },
        ],
      },
    ],
  },
  {
    id: 'icyBlow',
    type: 'active',
    name: 'Icy Blow',
    description: 'Attack a single enemy. Inflicts Freeze.',
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
        kind: 'Affliction',
        affliction: 'Freeze',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'spikedBlow',
    type: 'active',
    name: 'Spiked Blow',
    description: 'Attack a single enemy.',
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
        hitCount: 3,
      },
    ],
  },
  {
    id: 'crush',
    type: 'active',
    name: 'Crush',
    description: 'Attack a single enemy. Inflicts Stun.',
    ap: 1,
    skillCategories: ['Damage'],
    skillFlags: ['Unguardable'],
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
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'penetrate',
    type: 'active',
    name: 'Penetrate',
    description:
      'Attack a column of enemies with a piercing strike. Inflicts Phys. Defense -30%.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['Unguardable', 'Piercing'],
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
    ],
  },
  {
    id: 'spikedBolt',
    type: 'active',
    name: 'Spiked Bolt',
    description: 'Attack a single enemy with multiple hits.',
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
          physical: 50,
        },
        hitRate: 100,
        hitCount: 4,
      },
    ],
  },
  {
    id: 'harpoonBolt',
    type: 'active',
    name: 'Harpoon Bolt',
    description: 'Attack a column of enemies with a piercing strike.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['Unguardable'],
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
    id: 'checkmate',
    type: 'active',
    name: 'Checkmate',
    description:
      "Attack a single enemy. Inflicts Passive Seal. +100 potency if the target's HP is 50% or less.",
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Single',
    },
    skillFlags: ['Unguardable'],
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
        kind: 'Affliction',
        affliction: 'PassiveSeal',
        applyTo: 'Target',
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 100,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Enemy',
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
    id: 'arrowRain',
    type: 'active',
    name: 'Arrow Rain',
    description:
      'Attack all enemies. (User cannot evade or use passive skills while charging.)',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    skillFlags: ['Charge'],
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 60,
        },
        hitRate: 80,
        hitCount: 3,
      },
    ],
  },
  {
    id: 'tripleShatter',
    type: 'active',
    name: 'Triple Shatter',
    description:
      'Attack three enemies. Inflicts Phys. Attack -50% and Mag. Attack -50%.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Three',
    },
    innateAttackType: 'Ranged',
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
        stat: 'PATK',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
      {
        kind: 'Debuff',
        stat: 'MATK',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'magicShatter',
    type: 'active',
    name: 'Magic Shatter',
    description: 'Attack a row of enemies. Inflicts Mag. Attack -50%.',
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
          physical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'MATK',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'armorShatterII',
    type: 'active',
    name: 'Armor Shatter II',
    description: 'Attack a single enemy. Inflicts Phys. Defense -50%.',
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
          physical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'PDEF',
        value: -50,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'strengthShatterII',
    type: 'active',
    name: 'Strength Shatter II',
    description: 'Attack a single enemy. Inflicts Phys. Attack -75%.',
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
          physical: 150,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Debuff',
        stat: 'PATK',
        value: -75,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'flameArrow',
    type: 'active',
    name: 'Flame Arrow',
    description: 'Attack a single enemy. Inflicts Burn.',
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
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'poisonArrow',
    type: 'active',
    name: 'Poison Arrow',
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
          physical: 100,
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
    id: 'passiveShatter',
    type: 'active',
    name: 'Passive Shatter',
    description: 'Attack a single enemy. Inflicts -1 PP.',
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
        kind: 'Debuff',
        stat: 'PP',
        value: -1,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'armorShatter',
    type: 'active',
    name: 'Armor Shatter',
    description: 'Attack a single enemy. Inflicts Phys. Defense -30%.',
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
        value: -30,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'strengthShatter',
    type: 'active',
    name: 'Strength Shatter',
    description: 'Attack a single enemy. Inflicts Phys. Attack -40%.',
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
        stat: 'PATK',
        value: -40,
        scaling: 'percent',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'reincarnation',
    type: 'active',
    name: 'Reincarnation',
    description:
      'Revive one ally, restoring them to 1 HP. Grants target immunity to damage for one attack.',
    ap: 3,
    skillCategories: ['Heal'],
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
      {
        kind: 'DamageImmunity',
        immunityType: 'entireAttack',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'radiantHeal',
    type: 'active',
    name: 'Radiant Heal',
    description:
      'Restore major HP to all allies. Grants the ability to survive one lethal blow. (User cannot evade or use passive skills while charging.)',
    ap: 3,
    skillCategories: ['Heal'],
    skillFlags: ['Charge'],
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 150,
        },
        hitCount: 1,
      },
      {
        kind: 'Buff',
        stat: 'SurviveLethal',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'sandstorm',
    type: 'active',
    name: 'Sandstorm',
    description: 'Inflicts Blindness on all enemies.',
    ap: 3,
    skillCategories: ['Sabotage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
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
    id: 'trinityRain',
    type: 'active',
    name: 'Trinity Rain',
    description:
      'Attack all enemies with Magic. (User cannot evade or use passive skills while charging.)',
    ap: 3,
    skillCategories: ['Damage'],
    skillFlags: ['Charge'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Magical',
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 100,
        },
        hitRate: 100,
        hitCount: 3,
      },
    ],
  },
  {
    id: 'earthquake',
    type: 'active',
    name: 'Earthquake',
    description: 'Attack all enemies with Magic. Inflicts Stun.',
    ap: 3,
    skillCategories: ['Damage'],
    skillFlags: ['GroundBased'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
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
      {
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'phantomVeil',
    type: 'active',
    name: 'Phantom Veil',
    description: 'Grants a row of allies the ability to evade a single attack.',
    ap: 2,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
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
    id: 'resurrection',
    type: 'active',
    name: 'Resurrection',
    description: 'Revive one ally, restoring them to 1 HP.',
    ap: 2,
    skillCategories: ['Heal'],
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
    id: 'limitedHeal',
    type: 'active',
    name: 'Limited Heal',
    description:
      'Restore minor HP to all allies above their limits. Potency increases with fewer allies. (Max: +200) (Can heal up to 150% above maximum HP.)',
    ap: 2,
    skillCategories: ['Heal'],
    skillFlags: ['Overheal'],
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
        kind: 'PotencyBoost',
        amount: {
          magical: 50,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Ally',
            comparator: 'LessOrEqual',
            value: 4,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 50,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Ally',
            comparator: 'LessOrEqual',
            value: 3,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 50,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Ally',
            comparator: 'LessOrEqual',
            value: 2,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 50,
        },
        conditions: [
          {
            kind: 'UnitSize',
            target: 'Ally',
            comparator: 'EqualTo',
            value: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'activeHeal',
    type: 'active',
    name: 'Active Heal',
    description:
      'Restore moderate HP to one ally. Grants the target +1 AP. Cannot target self.',
    ap: 2,
    skillCategories: ['Heal'],
    skillFlags: ['ExcludeSelf'],
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
      {
        kind: 'ResourceGain',
        resource: 'AP',
        amount: 1,
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'circleHeal',
    type: 'active',
    name: 'Circle Heal',
    description:
      "Restore major HP to all allies. Removes all of target's debuffs. (User cannot evade or use passive skills while charging.)",
    ap: 2,
    skillCategories: ['Heal'],
    skillFlags: ['Charge'],
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 150,
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
    id: 'dispelAll',
    type: 'active',
    name: 'Dispel All',
    description: 'Remove all buffs from all enemies.',
    ap: 2,
    skillCategories: ['Sabotage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
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
    id: 'holySmite',
    type: 'active',
    name: 'Holy Smite',
    description: "Attack a single enemy. Removes all of the target's buffs.",
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
          magical: 200,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Cleanse',
        target: 'Buffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'cursedStrike',
    type: 'active',
    name: 'Cursed Strike',
    description:
      'Attack a single enemy. Ignores 50% Defense and +100 potency vs debuffed targets.',
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
            kind: 'AnyDebuff',
            target: 'Enemy',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 100,
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
    id: 'gravity',
    type: 'active',
    name: 'Gravity',
    description:
      "Attack all enemies. Deals damage equal to 50% of each target's HP.",
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Magical',
    skillFlags: ['Charge', 'NoCrit'],
    effects: [
      {
        kind: 'Damage',
        potency: {},
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'TargetHPBasedDamage',
        type: 'percentCurrent',
        amount: 50,
      },
    ],
  },
  {
    id: 'blizzard',
    type: 'active',
    name: 'Blizzard',
    description: 'Attack all enemies with magic. Inflicts Freeze.',
    ap: 2,
    skillCategories: ['Damage'],
    skillFlags: ['Charge'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Magical',
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 50,
        },
        hitRate: 100,
        hitCount: 3,
      },
      {
        kind: 'Affliction',
        affliction: 'Freeze',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'skywardThrust',
    type: 'active',
    name: 'Skyward Thrust',
    description:
      'Attack three enemies with magic. +50 potency vs flying targets.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Three',
    },
    innateAttackType: 'Magical',
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 50,
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
    id: 'sanguineDarts',
    type: 'active',
    name: 'Sanguine Darts',
    description:
      'Attack a column of enemies with piercing magic. Recover HP equal to 50% of damage dealt.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
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
      {
        kind: 'LifeSteal',
        percentage: 50,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'doubleHeal',
    type: 'active',
    name: 'Double Heal',
    description: 'Restore minor HP to two allies.',
    ap: 1,
    skillCategories: ['Heal'],
    targeting: {
      group: 'Ally',
      pattern: 'Two',
    },
    effects: [
      {
        kind: 'Heal',
        potency: {
          magical: 60,
        },
        hitCount: 1,
      },
    ],
  },
  {
    id: 'fireCurse',
    type: 'active',
    name: 'Fire Curse',
    description: 'Inflicts Burn on a row of enemies.',
    ap: 1,
    skillCategories: ['Sabotage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'poisonCurse',
    type: 'active',
    name: 'Poison Curse',
    description: 'Inflicts Poison on a row of enemies.',
    ap: 1,
    skillCategories: ['Sabotage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Affliction',
        affliction: 'Poison',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'magicWall',
    type: 'active',
    name: 'Magic Wall',
    description:
      'Grants the user a buff that negates one magic attack or one affliction.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'NegateMagicDamage',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
      {
        kind: 'Buff',
        stat: 'AfflictionImmunity',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'wall',
    type: 'active',
    name: 'Wall',
    description: 'Grants the user a buff that negates one physical attack.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'NegatePhysicalDamage',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'bulwark',
    type: 'active',
    name: 'Bulwark',
    description:
      'Grants a row of allies a buff that negates one physical attack.',
    ap: 2,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'NegatePhysicalDamage',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        duration: 'UntilAttacked',
      },
    ],
  },
  {
    id: 'holyLight',
    type: 'active',
    name: 'Holy Light',
    description:
      "Attack a single enemy with magic. Removes all of target's buffs.",
    ap: 1,
    skillCategories: ['Damage'],
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
      {
        kind: 'Cleanse',
        target: 'Buffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'curingCall',
    type: 'active',
    name: 'Curing Call',
    description:
      "Restore minor HP to row of allies. Removes all of target's debuffs.",
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
    id: 'innocentRay',
    type: 'active',
    name: 'Innocent Ray',
    description:
      "Attack a row of enemies with magic. Removes all of target's buffs.",
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
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
      {
        kind: 'Cleanse',
        target: 'Buffs',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'primusEdge',
    type: 'active',
    name: 'Primus Edge',
    description:
      'Attack a single enemy. If the user is at 100% HP, grants the user +1 PP and +1 summoned faeries.',
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
          magical: 100,
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
        kind: 'Buff',
        stat: 'Faeries',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
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
    id: 'sylphicWind',
    type: 'active',
    name: 'Sylphic Wind',
    description:
      'Attack a row of enemies with magic. +20 potency vs flying targets. Grants the user +1 summoned faeries.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
    },
    innateAttackType: 'Magical',
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
        kind: 'PotencyBoost',
        amount: {
          magical: 20,
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
        kind: 'Buff',
        stat: 'Faeries',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'elementalRoar',
    type: 'active',
    name: 'Elemental Roar',
    description:
      'Attack all enemies. Potency increases with faerie count (+30 per faerie). This dismisses all summoned faeries.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 70,
          physical: 70,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'Cleanse',
        target: 'Faeries',
        applyTo: 'User',
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 30,
          physical: 30,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'Faeries',
            comparator: 'GreaterOrEqual',
            value: 1,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 30,
          physical: 30,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'Faeries',
            comparator: 'GreaterOrEqual',
            value: 2,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 30,
          physical: 30,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'Faeries',
            comparator: 'GreaterOrEqual',
            value: 3,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 30,
          physical: 30,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'Faeries',
            comparator: 'GreaterOrEqual',
            value: 4,
          },
        ],
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 30,
          physical: 30,
        },
        conditions: [
          {
            kind: 'Stat',
            target: 'Self',
            stat: 'Faeries',
            comparator: 'GreaterOrEqual',
            value: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'faerieHeal',
    type: 'active',
    name: 'Faerie Heal',
    description:
      'Restore moderate HP to a row of allies. Grants targets immunity to damage for one attack. Grants the user +1 summoned faeries.',
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
        kind: 'DamageImmunity',
        immunityType: 'entireAttack',
        applyTo: 'Target',
        duration: 'UntilAttacked',
      },
      {
        kind: 'Buff',
        stat: 'Faeries',
        value: 1,
        scaling: 'flat',
        applyTo: 'User',
        stacks: true,
      },
    ],
  },
  {
    id: 'mysticArrow',
    type: 'active',
    name: 'Mystic Arrow',
    description:
      'Attack a single enemy. Deals additional magic attack of 100 potency to armored targets.',
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
        kind: 'Damage',
        potency: {
          magical: 100,
        },
        hitRate: 100,
        hitCount: 1,
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
    id: 'sonicShaft',
    type: 'active',
    name: 'Sonic Shaft',
    description:
      "Attack a single enemy. Deals 100% of target's Initiative in additional damage.",
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
        kind: 'TargetStatBasedDamage',
        stat: 'INIT',
        amount: 100,
      },
    ],
  },
  {
    id: 'glacialRain',
    type: 'active',
    name: 'Glacial Rain',
    description: 'Attack all enemies. Inflicts Freeze.',
    ap: 2,
    skillCategories: ['Damage'],
    skillFlags: ['Charge'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Ranged',
    effects: [
      {
        kind: 'Damage',
        potency: {
          physical: 60,
        },
        hitRate: 80,
        hitCount: 3,
      },
      {
        kind: 'Affliction',
        affliction: 'Freeze',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'omegaShatter',
    type: 'active',
    name: 'Omega Shatter',
    description: 'Attack a single enemy.',
    ap: 2,
    skillCategories: ['Damage'],
    skillFlags: ['Unguardable'],
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
        hitCount: 2,
      },
    ],
  },
  {
    id: 'burningEdge',
    type: 'active',
    name: 'Burning Edge',
    description:
      'Attack a single enemy. Inflicts Burn. Grants the user +1 PP if the target is already burning.',
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
        hitCount: 2,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'Affliction',
            target: 'Enemy',
            affliction: 'Burn',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'deathSpin',
    type: 'active',
    name: 'Death Spin',
    description:
      'Attack a row of enemies. Inflicts Stun. +75 potency vs afflicted targets.',
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
          physical: 75,
        },
        hitRate: 100,
        hitCount: 1,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          physical: 75,
        },
        conditions: [
          {
            kind: 'AnyAffliction',
            target: 'Enemy',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'inferno',
    type: 'active',
    name: 'Inferno',
    description:
      'Attack a row of enemies. Ignores 50% Defense and Inflicts Burn. Grants the user +1 PP.',
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
      {
        kind: 'IgnoreDefense',
        fraction: 0.5,
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
      },
    ],
  },
  {
    id: 'carnage',
    type: 'active',
    name: 'Carnage',
    description: 'Attack a single enemy. Inflicts -1 AP.',
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
    ],
  },
  {
    id: 'viciousTorment',
    type: 'active',
    name: 'Vicious Torment',
    description:
      'Attack a single enemy. +75 potency vs afflicted targets. Grants the user +1 PP if the target is afflicted.',
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
        kind: 'PotencyBoost',
        amount: {
          physical: 75,
        },
        conditions: [
          {
            kind: 'AnyAffliction',
            target: 'Enemy',
            comparator: 'EqualTo',
          },
        ],
      },
      {
        kind: 'ResourceGain',
        resource: 'PP',
        amount: 1,
        applyTo: 'User',
        conditions: [
          {
            kind: 'AnyAffliction',
            target: 'Enemy',
            comparator: 'EqualTo',
          },
        ],
      },
    ],
  },
  {
    id: 'flameThrust',
    type: 'active',
    name: 'Flame Thrust',
    description:
      'Attack a column of enemies with a piercing strike. Inflicts burn.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Column',
    },
    skillFlags: ['Piercing'],
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
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'deadlyRush',
    type: 'active',
    name: 'Deadly Rush',
    description: 'Attack a single enemy. Inflicts Stun and Burn.',
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
          physical: 40,
        },
        hitRate: 100,
        hitCount: 4,
      },
      {
        kind: 'Affliction',
        affliction: 'Stun',
        applyTo: 'Target',
      },
      {
        kind: 'Affliction',
        affliction: 'Burn',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'darkMist',
    type: 'active',
    name: 'Dark Mist',
    description: 'Grants the user +50 Evasion and +2 PP.',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Self',
      pattern: 'Single',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'EVA',
        value: 50,
        scaling: 'flat',
        applyTo: 'User',
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
    id: 'aquaVenom',
    type: 'active',
    name: 'Aqua Venom',
    description: 'Attack a row of enemies with magic. Inflicts Poison.',
    ap: 1,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'Row',
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
      {
        kind: 'Affliction',
        affliction: 'Poison',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'maelstrom',
    type: 'active',
    name: 'Maelstrom',
    description:
      'Attack all enemies with magic. +25 potency vs poisoned targets.',
    ap: 2,
    skillCategories: ['Damage'],
    targeting: {
      group: 'Enemy',
      pattern: 'All',
    },
    innateAttackType: 'Magical',
    effects: [
      {
        kind: 'Damage',
        potency: {
          magical: 25,
        },
        hitRate: 100,
        hitCount: 3,
      },
      {
        kind: 'PotencyBoost',
        amount: {
          magical: 25,
        },
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
    id: 'healingWind',
    type: 'active',
    name: 'Healing Wind',
    description:
      "Resotre HP to a row of allies. Healing equal to the user's HP.",
    ap: 2,
    skillCategories: ['Heal'],
    targeting: {
      group: 'Ally',
      pattern: 'Row',
    },
    effects: [
      {
        kind: 'OwnHPBasedHeal',
        type: 'current',
        applyTo: 'Target',
      },
    ],
  },
  {
    id: 'sorcerousBlow',
    type: 'active',
    name: 'Sorcerous Blow',
    description: 'Attack a single. Inflicts Stun.',
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
          physical: 150,
          magical: 150,
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
    id: 'glowingLight',
    type: 'active',
    name: 'Glowing Light',
    description:
      'Grants all allies +30 Accuracy and immunity to Blindness. (This buff cannot be removed.)',
    ap: 1,
    skillCategories: ['Utility'],
    targeting: {
      group: 'Ally',
      pattern: 'All',
    },
    effects: [
      {
        kind: 'Buff',
        stat: 'ACC',
        value: 30,
        scaling: 'flat',
        applyTo: 'Target',
        permanent: true,
      },
      {
        kind: 'Buff',
        stat: 'GlowingLight',
        value: 1,
        scaling: 'flat',
        applyTo: 'Target',
        permanent: true,
      },
    ],
  },
] as const satisfies readonly ActiveSkill[]

export type ActiveSkillsId = (typeof ActiveSkills)[number]['id']

export type ActiveSkillsBase = (typeof ActiveSkills)[number]

// Shared optional structure to allow property access on partial fields
type ActiveSkillsShared = Partial<ActiveSkill>

export type ActiveSkillsMap = {
  [K in ActiveSkillsId]: Extract<ActiveSkillsBase, { id: K }> &
    ActiveSkillsShared
}

export const ActiveSkillsMap: ActiveSkillsMap = Object.fromEntries(
  ActiveSkills.map(item => [item.id, item])
) as ActiveSkillsMap
