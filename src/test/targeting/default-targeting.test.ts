import { describe, it, expect } from 'vitest'

import { getDefaultTargets } from '@/core/skill-targeting'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'
import type { SkillCategory } from '@/types/core'
import type { ActiveSkill } from '@/types/skills'

// Helper to create a mock battle context
const createMockBattleContext = (
  id: string,
  name: string,
  team: 'home-team' | 'away-team',
  position: { row: number; col: number },
  currentHP: number = 100
): BattleContext => ({
  unit: {
    id,
    name,
    classKey: 'Fighter',
    level: 1,
    growths: ['Hardy', 'All-Rounder'],
    equipment: [],
    skillSlots: [],
  },
  team,
  position,
  currentHP,
  currentAP: 2,
  currentPP: 2,
  combatantTypes: ['Armored'],
  combatStats: {
    HP: 100,
    PATK: 50,
    PDEF: 30,
    MATK: 20,
    MDEF: 25,
    ACC: 80,
    EVA: 10,
    CRT: 15,
    GRD: 20,
    INIT: 25,
    GuardEff: 0,
  },
  afflictions: [],
  buffs: [],
  debuffs: [],
  flags: [],
  lastPassiveResponse: 0,
  isPassiveResponsive: true,
  immunities: [],
  hasActedThisRound: false,
})

// Helper to create a mock battlefield state
const createMockBattlefieldState = (
  units: BattleContext[]
): BattlefieldState => ({
  units: Object.fromEntries(
    units.map(unit => [
      `${unit.team === 'home-team' ? 'home' : 'away'}-${unit.unit.id}`,
      unit,
    ])
  ),
  activeUnitId: '',
  formations: {
    allies: [
      [null, null, null],
      [null, null, null],
    ],
    enemies: [
      [null, null, null],
      [null, null, null],
    ],
  },
  activeSkillQueue: [],
  passiveSkillQueue: [],
  battlePhase: 'active',
  isNight: false,
  turnCount: 1,
  actionHistory: [],
  rng: { random: () => 0.5, seed: ['test'] },
  currentRound: 1,
  actionCounter: 0,
  passiveResponseTracking: {},
  inactivityCounter: 0,
  lastActionRound: 0,
  lastActiveSkillRound: 1,
  consecutiveStandbyRounds: 0,
})

// Helper to create mock skills with different targeting
const createMockSkill = (
  id: string,
  name: string,
  group: 'Ally' | 'Enemy',
  pattern: 'Self' | 'Single' | 'All' | 'Row' | 'Column' | 'Two' | 'Three',
  innateAttackType?: 'Ranged' | 'Magical',
  skillCategories: SkillCategory[] = ['Damage']
): ActiveSkill => ({
  id,
  type: 'active',
  name,
  description: `Test skill with ${group}/${pattern} targeting`,
  ap: 1,
  targeting: { group, pattern },
  skillCategories,
  effects: [],
  innateAttackType,
})

describe('Default Targeting System', () => {
  describe('Self Targeting', () => {
    it('should target self regardless of group setting', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )
      const ally = createMockBattleContext('ally', 'Ally', 'home-team', {
        row: 0,
        col: 1,
      })
      const enemy = createMockBattleContext('enemy', 'Enemy', 'away-team', {
        row: 1,
        col: 2,
      })

      const battlefield = createMockBattlefieldState([attacker, ally, enemy])

      const selfSkill = createMockSkill(
        'self-heal',
        'Self Heal',
        'Ally',
        'Self'
      )
      const targets = getDefaultTargets(selfSkill, attacker, battlefield)

      expect(targets).toHaveLength(1)
      expect(targets[0]).toBe(attacker)
    })
  })

  describe('Enemy Single Targeting', () => {
    it('should target closest enemy, prioritizing front row', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )

      // Create enemies: one in back row closer, one in front row farther
      const backRowEnemy = createMockBattleContext(
        'back',
        'Back Enemy',
        'away-team',
        { row: 0, col: 1 }
      ) // Same column, back row
      const frontRowEnemy = createMockBattleContext(
        'front',
        'Front Enemy',
        'away-team',
        { row: 1, col: 2 }
      ) // Front row, farther

      const battlefield = createMockBattlefieldState([
        attacker,
        backRowEnemy,
        frontRowEnemy,
      ])

      const singleEnemySkill = createMockSkill(
        'attack',
        'Attack',
        'Enemy',
        'Single'
      )
      const targets = getDefaultTargets(singleEnemySkill, attacker, battlefield)

      expect(targets).toHaveLength(1)
      expect(targets[0]).toBe(frontRowEnemy) // Should prioritize front row despite being farther
    })

    it('should target closest enemy in back row when front row is empty', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )

      const closeBackEnemy = createMockBattleContext(
        'close',
        'Close Enemy',
        'away-team',
        { row: 0, col: 1 }
      ) // Same column
      const farBackEnemy = createMockBattleContext(
        'far',
        'Far Enemy',
        'away-team',
        { row: 0, col: 2 }
      ) // Farther column

      const battlefield = createMockBattlefieldState([
        attacker,
        closeBackEnemy,
        farBackEnemy,
      ])

      const singleEnemySkill = createMockSkill(
        'attack',
        'Attack',
        'Enemy',
        'Single'
      )
      const targets = getDefaultTargets(singleEnemySkill, attacker, battlefield)

      expect(targets).toHaveLength(1)
      expect(targets[0]).toBe(closeBackEnemy) // Should pick closest in back row
    })

    it('should return empty array when no living enemies exist', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )
      const deadEnemy = createMockBattleContext(
        'dead',
        'Dead Enemy',
        'away-team',
        { row: 1, col: 2 },
        0
      ) // HP = 0

      const battlefield = createMockBattlefieldState([attacker, deadEnemy])

      const singleEnemySkill = createMockSkill(
        'attack',
        'Attack',
        'Enemy',
        'Single'
      )
      const targets = getDefaultTargets(singleEnemySkill, attacker, battlefield)

      expect(targets).toHaveLength(0)
    })
  })

  describe('Ally Single Targeting', () => {
    it('should target closest ally (excluding self)', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )
      const closeAlly = createMockBattleContext(
        'close',
        'Close Ally',
        'home-team',
        { row: 1, col: 0 }
      )
      const farAlly = createMockBattleContext('far', 'Far Ally', 'home-team', {
        row: 0,
        col: 2,
      })

      const battlefield = createMockBattlefieldState([
        attacker,
        closeAlly,
        farAlly,
      ])

      const healSkill = createMockSkill('heal', 'Heal', 'Ally', 'Single')
      const targets = getDefaultTargets(healSkill, attacker, battlefield)

      expect(targets).toHaveLength(1)
      // Should include attacker itself as a valid ally target for single targeting
      expect([attacker, closeAlly, farAlly]).toContain(targets[0])
    })
  })

  describe('Enemy All Targeting', () => {
    it('should target all living enemies', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )
      const enemy1 = createMockBattleContext('enemy1', 'Enemy 1', 'away-team', {
        row: 0,
        col: 0,
      })
      const enemy2 = createMockBattleContext('enemy2', 'Enemy 2', 'away-team', {
        row: 1,
        col: 2,
      })
      const deadEnemy = createMockBattleContext(
        'dead',
        'Dead Enemy',
        'away-team',
        { row: 0, col: 1 },
        0
      )

      const battlefield = createMockBattlefieldState([
        attacker,
        enemy1,
        enemy2,
        deadEnemy,
      ])

      const aoeSkill = createMockSkill(
        'thunderball',
        'Thunderball',
        'Enemy',
        'All',
        'Magical'
      )
      const targets = getDefaultTargets(aoeSkill, attacker, battlefield)

      expect(targets).toHaveLength(2)
      expect(targets).toContain(enemy1)
      expect(targets).toContain(enemy2)
      expect(targets).not.toContain(deadEnemy)
    })
  })

  describe('Row Targeting', () => {
    it('should target all enemies in the same row as the closest enemy', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )

      // Front row enemies (row 1)
      const frontEnemy1 = createMockBattleContext(
        'front1',
        'Front Enemy 1',
        'away-team',
        { row: 1, col: 0 }
      )
      const frontEnemy2 = createMockBattleContext(
        'front2',
        'Front Enemy 2',
        'away-team',
        { row: 1, col: 2 }
      )

      // Back row enemy (row 0) - closer but in back row
      const backEnemy = createMockBattleContext(
        'back',
        'Back Enemy',
        'away-team',
        { row: 0, col: 1 }
      )

      const battlefield = createMockBattlefieldState([
        attacker,
        frontEnemy1,
        frontEnemy2,
        backEnemy,
      ])

      const rowSkill = createMockSkill('cleave', 'Cleave', 'Enemy', 'Row')
      const targets = getDefaultTargets(rowSkill, attacker, battlefield)

      expect(targets).toHaveLength(2)
      expect(targets).toContain(frontEnemy1)
      expect(targets).toContain(frontEnemy2)
      expect(targets).not.toContain(backEnemy)
    })
  })

  describe('Column Targeting', () => {
    it('should target all enemies in the same column as the closest enemy', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )

      // Column 2 enemies - farther column
      const col2Front = createMockBattleContext(
        'col2f',
        'Col2 Front',
        'away-team',
        { row: 1, col: 2 }
      )
      const col2Back = createMockBattleContext(
        'col2b',
        'Col2 Back',
        'away-team',
        { row: 0, col: 2 }
      )

      // Column 0 enemy - different column
      const col0Enemy = createMockBattleContext(
        'col0',
        'Col0 Enemy',
        'away-team',
        { row: 1, col: 0 }
      )

      const battlefield = createMockBattlefieldState([
        attacker,
        col2Front,
        col2Back,
        col0Enemy,
      ])

      const columnSkill = createMockSkill(
        'pierce',
        'Pierce',
        'Enemy',
        'Column',
        'Ranged'
      )
      const targets = getDefaultTargets(columnSkill, attacker, battlefield)

      expect(targets).toHaveLength(2)
      expect(targets).toContain(col2Front)
      expect(targets).toContain(col2Back)
      expect(targets).not.toContain(col0Enemy)
    })
  })

  describe('Distance Calculation', () => {
    it('should correctly calculate Manhattan distance for targeting priority', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )

      // Create enemies at different distances
      const distance1Enemy = createMockBattleContext(
        'dist1',
        'Distance 1',
        'away-team',
        { row: 1, col: 2 }
      ) // Distance: 1
      const distance2Enemy = createMockBattleContext(
        'dist2',
        'Distance 2',
        'away-team',
        { row: 1, col: 0 }
      ) // Distance: 1 (same distance)
      const distance3Enemy = createMockBattleContext(
        'dist3',
        'Distance 3',
        'away-team',
        { row: 0, col: 0 }
      ) // Distance: 2

      const battlefield = createMockBattlefieldState([
        attacker,
        distance3Enemy,
        distance1Enemy,
        distance2Enemy,
      ])

      const singleSkill = createMockSkill('attack', 'Attack', 'Enemy', 'Single')
      const targets = getDefaultTargets(singleSkill, attacker, battlefield)

      expect(targets).toHaveLength(1)
      // Should target one of the closest enemies (distance 1)
      expect([distance1Enemy, distance2Enemy]).toContain(targets[0])
      expect(targets[0]).not.toBe(distance3Enemy)
    })
  })

  describe('Attack Type Targeting', () => {
    describe('Melee Attacks (Respect Front Row)', () => {
      it('should target front row enemy even if back row is closer (melee Fighter)', () => {
        // Fighter is melee by default
        const meleeAttacker = createMockBattleContext(
          'melee',
          'Melee Fighter',
          'home-team',
          { row: 1, col: 1 }
        )

        // Back row enemy is closer (same column)
        const closeBackEnemy = createMockBattleContext(
          'back',
          'Back Enemy',
          'away-team',
          { row: 0, col: 1 }
        )
        // Front row enemy is farther
        const farFrontEnemy = createMockBattleContext(
          'front',
          'Front Enemy',
          'away-team',
          { row: 1, col: 2 }
        )

        const battlefield = createMockBattlefieldState([
          meleeAttacker,
          closeBackEnemy,
          farFrontEnemy,
        ])

        const meleeSkill = createMockSkill(
          'sword-attack',
          'Sword Attack',
          'Enemy',
          'Single'
        ) // No innate type = melee
        const targets = getDefaultTargets(
          meleeSkill,
          meleeAttacker,
          battlefield
        )

        expect(targets).toHaveLength(1)
        expect(targets[0]).toBe(farFrontEnemy) // Should prioritize front row despite distance
      })
    })

    describe('Ranged Attacks (Ignore Front Row)', () => {
      it('should target closest enemy regardless of row (Archer class)', () => {
        // Archer class has Archer trait, making attacks Ranged
        const archer = createMockBattleContext(
          'archer',
          'Archer',
          'home-team',
          { row: 1, col: 1 }
        )
        archer.unit.classKey = 'Hunter' // Hunter has Archer trait

        // Back row enemy is closer (same column)
        const closeBackEnemy = createMockBattleContext(
          'back',
          'Back Enemy',
          'away-team',
          { row: 0, col: 1 }
        )
        // Front row enemy is farther
        const farFrontEnemy = createMockBattleContext(
          'front',
          'Front Enemy',
          'away-team',
          { row: 1, col: 2 }
        )

        const battlefield = createMockBattlefieldState([
          archer,
          closeBackEnemy,
          farFrontEnemy,
        ])

        const bowSkill = createMockSkill(
          'bow-shot',
          'Bow Shot',
          'Enemy',
          'Single'
        ) // Archer class makes it ranged
        const targets = getDefaultTargets(bowSkill, archer, battlefield)

        expect(targets).toHaveLength(1)
        expect(targets[0]).toBe(closeBackEnemy) // Should target closest regardless of row
      })

      it('should target closest enemy regardless of row (Flying class)', () => {
        // Flying units make ranged attacks
        const flyingUnit = createMockBattleContext(
          'flyer',
          'Flying Unit',
          'home-team',
          { row: 1, col: 1 }
        )
        flyingUnit.unit.classKey = 'Gryphon Knight' // Flying movement type

        // Back row enemy is closer (same column)
        const closeBackEnemy = createMockBattleContext(
          'back',
          'Back Enemy',
          'away-team',
          { row: 0, col: 1 }
        )
        // Front row enemy is farther
        const farFrontEnemy = createMockBattleContext(
          'front',
          'Front Enemy',
          'away-team',
          { row: 1, col: 2 }
        )

        const battlefield = createMockBattlefieldState([
          flyingUnit,
          closeBackEnemy,
          farFrontEnemy,
        ])

        const diveSkill = createMockSkill(
          'dive-attack',
          'Dive Attack',
          'Enemy',
          'Single'
        ) // Flying class makes it ranged
        const targets = getDefaultTargets(diveSkill, flyingUnit, battlefield)

        expect(targets).toHaveLength(1)
        expect(targets[0]).toBe(closeBackEnemy) // Should target closest regardless of row
      })

      it('should target closest enemy regardless of row (innateAttackType: Ranged)', () => {
        const meleeUnit = createMockBattleContext(
          'melee',
          'Melee Unit',
          'home-team',
          { row: 1, col: 1 }
        )

        // Back row enemy is closer (same column)
        const closeBackEnemy = createMockBattleContext(
          'back',
          'Back Enemy',
          'away-team',
          { row: 0, col: 1 }
        )
        // Front row enemy is farther
        const farFrontEnemy = createMockBattleContext(
          'front',
          'Front Enemy',
          'away-team',
          { row: 1, col: 2 }
        )

        const battlefield = createMockBattlefieldState([
          meleeUnit,
          closeBackEnemy,
          farFrontEnemy,
        ])

        // Skill has innate ranged attack type
        const rangedSkill = createMockSkill(
          'javelin',
          'Javelin Throw',
          'Enemy',
          'Single',
          'Ranged'
        )
        const targets = getDefaultTargets(rangedSkill, meleeUnit, battlefield)

        expect(targets).toHaveLength(1)
        expect(targets[0]).toBe(closeBackEnemy) // Should target closest regardless of row
      })
    })

    describe('Magical Attacks (Ignore Front Row)', () => {
      it('should target closest enemy regardless of row (innateAttackType: Magical)', () => {
        const caster = createMockBattleContext(
          'caster',
          'Caster',
          'home-team',
          { row: 1, col: 1 }
        )

        // Back row enemy is closer (same column)
        const closeBackEnemy = createMockBattleContext(
          'back',
          'Back Enemy',
          'away-team',
          { row: 0, col: 1 }
        )
        // Front row enemy is farther
        const farFrontEnemy = createMockBattleContext(
          'front',
          'Front Enemy',
          'away-team',
          { row: 1, col: 2 }
        )

        const battlefield = createMockBattlefieldState([
          caster,
          closeBackEnemy,
          farFrontEnemy,
        ])

        // Skill has innate magical attack type
        const magicSkill = createMockSkill(
          'fireball',
          'Fireball',
          'Enemy',
          'Single',
          'Magical'
        )
        const targets = getDefaultTargets(magicSkill, caster, battlefield)

        expect(targets).toHaveLength(1)
        expect(targets[0]).toBe(closeBackEnemy) // Should target closest regardless of row
      })
    })

    describe('Non-Damage Skills (Ignore Front Row)', () => {
      it('should target closest ally regardless of row for healing skills', () => {
        const healer = createMockBattleContext(
          'healer',
          'Healer',
          'home-team',
          { row: 1, col: 1 }
        )

        // Back row ally is closer
        const closeBackAlly = createMockBattleContext(
          'back',
          'Back Ally',
          'home-team',
          { row: 0, col: 1 }
        )
        // Front row ally is farther
        const farFrontAlly = createMockBattleContext(
          'front',
          'Front Ally',
          'home-team',
          { row: 1, col: 2 }
        )

        const battlefield = createMockBattlefieldState([
          healer,
          closeBackAlly,
          farFrontAlly,
        ])

        // Non-damage skill should ignore front row rules
        const healSkill = createMockSkill(
          'heal',
          'Heal',
          'Ally',
          'Single',
          undefined,
          ['Heal']
        )
        const targets = getDefaultTargets(healSkill, healer, battlefield)

        expect(targets).toHaveLength(1)
        // Should target closest ally (could be self, closeBackAlly, or farFrontAlly)
        const distances = [
          { unit: healer, distance: 0 },
          { unit: closeBackAlly, distance: 1 },
          { unit: farFrontAlly, distance: 1 },
        ]
        const expectedTargets = distances
          .filter(
            d => d.distance === Math.min(...distances.map(d => d.distance))
          )
          .map(d => d.unit)
        expect(expectedTargets).toContain(targets[0])
      })
    })
  })

  describe('Multi-Target Patterns (Two/Three)', () => {
    describe('Two Pattern', () => {
      it('should target exactly two closest enemies with no overlap', () => {
        const attacker = createMockBattleContext(
          'attacker',
          'Attacker',
          'home-team',
          { row: 1, col: 1 }
        )

        const closeEnemy = createMockBattleContext(
          'close',
          'Close Enemy',
          'away-team',
          { row: 1, col: 2 }
        ) // Distance: 1
        const mediumEnemy = createMockBattleContext(
          'medium',
          'Medium Enemy',
          'away-team',
          { row: 0, col: 2 }
        ) // Distance: 2
        const farEnemy = createMockBattleContext(
          'far',
          'Far Enemy',
          'away-team',
          { row: 0, col: 0 }
        ) // Distance: 3

        const battlefield = createMockBattlefieldState([
          attacker,
          closeEnemy,
          mediumEnemy,
          farEnemy,
        ])

        const dualShotSkill = createMockSkill(
          'dual-shot',
          'Dual Shot',
          'Enemy',
          'Two',
          'Ranged'
        )
        const targets = getDefaultTargets(dualShotSkill, attacker, battlefield)

        expect(targets).toHaveLength(2)
        expect(targets).toContain(closeEnemy) // Should include closest
        expect(targets).toContain(mediumEnemy) // Should include second closest
        expect(targets).not.toContain(farEnemy) // Should not include farthest

        // Verify no duplicates
        const uniqueTargets = new Set(targets)
        expect(uniqueTargets.size).toBe(2)
      })

      it('should target only one enemy when only one is available', () => {
        const attacker = createMockBattleContext(
          'attacker',
          'Attacker',
          'home-team',
          { row: 1, col: 1 }
        )
        const singleEnemy = createMockBattleContext(
          'single',
          'Single Enemy',
          'away-team',
          { row: 1, col: 2 }
        )

        const battlefield = createMockBattlefieldState([attacker, singleEnemy])

        const dualShotSkill = createMockSkill(
          'dual-shot',
          'Dual Shot',
          'Enemy',
          'Two',
          'Ranged'
        )
        const targets = getDefaultTargets(dualShotSkill, attacker, battlefield)

        expect(targets).toHaveLength(1)
        expect(targets[0]).toBe(singleEnemy)
      })

      it('should return empty array when no enemies are available', () => {
        const attacker = createMockBattleContext(
          'attacker',
          'Attacker',
          'home-team',
          { row: 1, col: 1 }
        )
        const ally = createMockBattleContext('ally', 'Ally', 'home-team', {
          row: 0,
          col: 1,
        })

        const battlefield = createMockBattlefieldState([attacker, ally])

        const dualShotSkill = createMockSkill(
          'dual-shot',
          'Dual Shot',
          'Enemy',
          'Two',
          'Ranged'
        )
        const targets = getDefaultTargets(dualShotSkill, attacker, battlefield)

        expect(targets).toHaveLength(0)
      })

      it('should respect front row blocking for melee attacks', () => {
        const attacker = createMockBattleContext(
          'attacker',
          'Attacker',
          'home-team',
          { row: 1, col: 1 }
        )

        const frontEnemy1 = createMockBattleContext(
          'front1',
          'Front Enemy 1',
          'away-team',
          { row: 1, col: 2 }
        )
        const frontEnemy2 = createMockBattleContext(
          'front2',
          'Front Enemy 2',
          'away-team',
          { row: 1, col: 0 }
        )
        const backEnemy = createMockBattleContext(
          'back',
          'Back Enemy',
          'away-team',
          { row: 0, col: 1 }
        ) // This should be blocked by front row

        const battlefield = createMockBattlefieldState([
          attacker,
          frontEnemy1,
          frontEnemy2,
          backEnemy,
        ])

        // Melee attack should only target front row
        const meleeTwoSkill = createMockSkill(
          'melee-double',
          'Melee Double Attack',
          'Enemy',
          'Two'
        )
        const targets = getDefaultTargets(meleeTwoSkill, attacker, battlefield)

        expect(targets).toHaveLength(2)
        expect(targets).toContain(frontEnemy1)
        expect(targets).toContain(frontEnemy2)
        expect(targets).not.toContain(backEnemy) // Should be blocked by front row
      })
    })

    describe('Three Pattern', () => {
      it('should target exactly three closest enemies with no overlap', () => {
        const attacker = createMockBattleContext(
          'attacker',
          'Attacker',
          'home-team',
          { row: 1, col: 1 }
        )

        const closeEnemy = createMockBattleContext(
          'close',
          'Close Enemy',
          'away-team',
          { row: 1, col: 2 }
        ) // Distance: 1
        const mediumEnemy = createMockBattleContext(
          'medium',
          'Medium Enemy',
          'away-team',
          { row: 0, col: 2 }
        ) // Distance: 2
        const farEnemy = createMockBattleContext(
          'far',
          'Far Enemy',
          'away-team',
          { row: 0, col: 0 }
        ) // Distance: 3
        const veryFarEnemy = createMockBattleContext(
          'very-far',
          'Very Far Enemy',
          'away-team',
          { row: 0, col: 3 }
        ) // Distance: 4

        const battlefield = createMockBattlefieldState([
          attacker,
          closeEnemy,
          mediumEnemy,
          farEnemy,
          veryFarEnemy,
        ])

        const multiArrowSkill = createMockSkill(
          'multi-arrow',
          'Multi Arrow',
          'Enemy',
          'Three',
          'Ranged'
        )
        const targets = getDefaultTargets(
          multiArrowSkill,
          attacker,
          battlefield
        )

        expect(targets).toHaveLength(3)
        expect(targets).toContain(closeEnemy) // Should include closest
        expect(targets).toContain(mediumEnemy) // Should include second closest
        expect(targets).toContain(farEnemy) // Should include third closest
        expect(targets).not.toContain(veryFarEnemy) // Should not include farthest

        // Verify no duplicates
        const uniqueTargets = new Set(targets)
        expect(uniqueTargets.size).toBe(3)
      })

      it('should target fewer than three when insufficient enemies available', () => {
        const attacker = createMockBattleContext(
          'attacker',
          'Attacker',
          'home-team',
          { row: 1, col: 1 }
        )
        const enemy1 = createMockBattleContext(
          'enemy1',
          'Enemy 1',
          'away-team',
          { row: 1, col: 2 }
        )
        const enemy2 = createMockBattleContext(
          'enemy2',
          'Enemy 2',
          'away-team',
          { row: 0, col: 2 }
        )

        const battlefield = createMockBattlefieldState([
          attacker,
          enemy1,
          enemy2,
        ])

        const multiArrow2Skill = createMockSkill(
          'multi-arrow-2',
          'Multi Arrow 2',
          'Enemy',
          'Three',
          'Ranged'
        )
        const targets = getDefaultTargets(
          multiArrow2Skill,
          attacker,
          battlefield
        )

        expect(targets).toHaveLength(2) // Should only get 2 since only 2 available
        expect(targets).toContain(enemy1)
        expect(targets).toContain(enemy2)

        // Verify no duplicates
        const uniqueTargets = new Set(targets)
        expect(uniqueTargets.size).toBe(2)
      })

      it('should return empty array when no enemies are available', () => {
        const attacker = createMockBattleContext(
          'attacker',
          'Attacker',
          'home-team',
          { row: 1, col: 1 }
        )
        const ally = createMockBattleContext('ally', 'Ally', 'home-team', {
          row: 0,
          col: 1,
        })

        const battlefield = createMockBattlefieldState([attacker, ally])

        const multiArrow3Skill = createMockSkill(
          'multi-arrow-3',
          'Multi Arrow 3',
          'Enemy',
          'Three',
          'Ranged'
        )
        const targets = getDefaultTargets(
          multiArrow3Skill,
          attacker,
          battlefield
        )

        expect(targets).toHaveLength(0)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty battlefield gracefully', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )
      const battlefield = createMockBattlefieldState([attacker])

      const enemySkill = createMockSkill('attack', 'Attack', 'Enemy', 'Single')
      const targets = getDefaultTargets(enemySkill, attacker, battlefield)

      expect(targets).toHaveLength(0)
    })

    it('should handle unknown targeting group gracefully', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )
      const battlefield = createMockBattlefieldState([attacker])

      // Create skill with unknown targeting group for edge case testing
      const unknownSkill = {
        id: 'unknown',
        type: 'active',
        name: 'Unknown Skill',
        description: 'Test skill with unknown targeting',
        ap: 1,
        targeting: { group: 'Unknown', pattern: 'Single' },
        skillCategories: ['Damage'],
        effects: [],
      } as unknown as ActiveSkill

      const targets = getDefaultTargets(unknownSkill, attacker, battlefield)

      expect(targets).toHaveLength(0)
    })

    it('should handle unknown targeting pattern gracefully', () => {
      const attacker = createMockBattleContext(
        'attacker',
        'Attacker',
        'home-team',
        { row: 1, col: 1 }
      )
      const enemy = createMockBattleContext('enemy', 'Enemy', 'away-team', {
        row: 1,
        col: 2,
      })
      const battlefield = createMockBattlefieldState([attacker, enemy])

      // Create skill with unknown targeting pattern for edge case testing
      const unknownPatternSkill = {
        id: 'unknown-pattern',
        type: 'active',
        name: 'Unknown Pattern Skill',
        description: 'Test skill with unknown pattern',
        ap: 1,
        targeting: { group: 'Enemy', pattern: 'Unknown' },
        skillCategories: ['Damage'],
        effects: [],
      } as unknown as ActiveSkill

      const targets = getDefaultTargets(
        unknownPatternSkill,
        attacker,
        battlefield
      )

      // Should fallback to Single targeting
      expect(targets).toHaveLength(1)
      expect(targets[0]).toBe(enemy)
    })
  })
})
