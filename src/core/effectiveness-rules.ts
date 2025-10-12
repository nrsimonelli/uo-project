import type { ClassDefinition } from '@/data/units/class-data'
import type { AllClassType } from '@/types/base-stats'

interface EffectivenessMatchCriteria {
  movementType?: ClassDefinition['movementType']
  trait?: ClassDefinition['trait']
  classKey?: AllClassType | AllClassType[]
}

interface EffectivenessRule {
  attacker: EffectivenessMatchCriteria
  target: EffectivenessMatchCriteria
  multiplier: number
  description: string
}

const EFFECTIVENESS_RULES: EffectivenessRule[] = [
  {
    attacker: {
      classKey: [
        'Gryphon Knight',
        'Wyvern Knight',
        'Gryphon Master',
        'Wyvern Master',
      ],
    },
    target: { movementType: 'Cavalry' },
    multiplier: 2.0,
    description: 'Gryphon and Wyvern units are effective against Cavalry',
  },
  {
    attacker: { movementType: 'Cavalry' },
    target: { movementType: 'Infantry' },
    multiplier: 2.0,
    description: 'Cavalry units are effective against Infantry',
  },
  {
    attacker: { trait: 'Archer' },
    target: { movementType: 'Flying' },
    multiplier: 2.0,
    description: 'Archers are effective against Flying units',
  },
]

const matchesCriteria = (
  unitClassKey: AllClassType,
  unitMovementType: ClassDefinition['movementType'],
  unitTrait: ClassDefinition['trait'],
  criteria: EffectivenessMatchCriteria
) => {
  // Check class key match (most specific)
  if (criteria.classKey) {
    const classKeys = Array.isArray(criteria.classKey)
      ? criteria.classKey
      : [criteria.classKey]
    if (!classKeys.includes(unitClassKey)) {
      return false
    }
  }

  // Check movement type match
  if (criteria.movementType && criteria.movementType !== unitMovementType) {
    return false
  }

  // Check trait match
  if (criteria.trait && criteria.trait !== unitTrait) {
    return false
  }

  return true
}

export const findEffectivenessRule = (
  attackerClassKey: AllClassType,
  attackerMovementType: ClassDefinition['movementType'],
  attackerTrait: ClassDefinition['trait'],
  targetClassKey: AllClassType,
  targetMovementType: ClassDefinition['movementType'],
  targetTrait: ClassDefinition['trait']
): EffectivenessRule | null => {
  for (const rule of EFFECTIVENESS_RULES) {
    const attackerMatches = matchesCriteria(
      attackerClassKey,
      attackerMovementType,
      attackerTrait,
      rule.attacker
    )
    const targetMatches = matchesCriteria(
      targetClassKey,
      targetMovementType,
      targetTrait,
      rule.target
    )

    if (attackerMatches && targetMatches) {
      return rule
    }
  }

  return null
}
