import { validateEquipmentReference } from './equipment-validation'
import {
  findDuplicateEquipmentIds,
  validateEquipmentForSlot,
} from './equipment-validation-utils'
import { isSkillValidForUnit } from './skill-availability'
import { validateSkillReference } from './skill-validation'

import { getEquipmentSlots, isValidClass } from '@/core/helpers'
import { COMBAT_STATS } from '@/hooks/use-chart-data'
import type { CombatStat } from '@/hooks/use-chart-data'
import { GROWTH_VALUES } from '@/types/base-stats'
import type { AllClassType, GrowthType } from '@/types/base-stats'
import type { EquipmentSlotType } from '@/types/equipment'
import { ALL_EQUIPMENT_SLOTS } from '@/types/equipment'
import { VALID_DEW_COUNTS, type ValidDewCount } from '@/types/team'
import type { Team, Unit } from '@/types/team'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export function validateTeamData(
  data: unknown
): ValidationResult & { data?: Record<string, Team> } {
  const errors: ValidationError[] = []

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: [
        {
          path: 'root',
          message: 'Team data must be an object (Record<string, Team>)',
        },
      ],
    }
  }

  const teams = data as Record<string, unknown>

  for (const [teamId, team] of Object.entries(teams)) {
    const teamPath = `teams.${teamId}`

    if (!team || typeof team !== 'object' || Array.isArray(team)) {
      errors.push({
        path: teamPath,
        message: 'Team must be an object',
      })
    } else {
      const teamObj = team as Record<string, unknown>

      if (typeof teamObj.id !== 'string') {
        errors.push({
          path: `${teamPath}.id`,
          message: 'Team id must be a string',
        })
      }

      if (typeof teamObj.name !== 'string') {
        errors.push({
          path: `${teamPath}.name`,
          message: 'Team name must be a string',
        })
      }

      if (!Array.isArray(teamObj.formation)) {
        errors.push({
          path: `${teamPath}.formation`,
          message: 'Team formation must be an array',
        })
      } else {
        const formation = teamObj.formation as unknown[]
        if (formation.length !== 6) {
          errors.push({
            path: `${teamPath}.formation`,
            message: `Team formation must have exactly 6 slots, found ${formation.length}`,
          })
        }

        formation.forEach((unit, index) => {
          if (unit === null) return

          const unitPath = `${teamPath}.formation[${index}]`
          const unitErrors = validateUnit(unit, unitPath)
          errors.push(...unitErrors)
        })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as Record<string, Team>) : undefined,
  }
}

// Wraps validateTeamData to work with a single Team object
export function validateSingleTeam(
  team: unknown
): ValidationResult & { data?: Team } {
  if (!team || typeof team !== 'object' || Array.isArray(team)) {
    return {
      isValid: false,
      errors: [
        {
          path: 'root',
          message: 'Team must be an object',
        },
      ],
    }
  }

  // Wrap single team in a Record format for validateTeamData
  const teamObj = team as Record<string, unknown>
  const wrappedData = {
    imported: teamObj,
  }

  const result = validateTeamData(wrappedData)

  // Extract the single team from the result
  if (result.isValid && result.data) {
    return {
      isValid: true,
      errors: [],
      data: result.data.imported,
    }
  }

  // Map error paths from teams.imported.* to just the field path
  const mappedErrors = result.errors.map(error => ({
    ...error,
    path: error.path.replace(/^teams\.imported\./, ''),
  }))

  return {
    isValid: false,
    errors: mappedErrors,
  }
}

export function hasInvalidSkills(team: Team) {
  for (const unit of team.formation) {
    if (unit) {
      for (const skillSlot of unit.skillSlots) {
        if (skillSlot.skillId && !isSkillValidForUnit(unit, skillSlot)) {
          return true
        }
      }
    }
  }
  return false
}

function validateUnit(unit: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!unit || typeof unit !== 'object' || Array.isArray(unit)) {
    return [
      {
        path,
        message: 'Unit must be an object or null',
      },
    ]
  }

  const unitObj = unit as Record<string, unknown>

  const stringFields: Array<keyof Unit> = ['id', 'name']
  for (const field of stringFields) {
    if (typeof unitObj[field] !== 'string') {
      errors.push({
        path: `${path}.${field}`,
        message: `Unit ${field} must be a string`,
      })
    }
  }

  if (typeof unitObj.classKey !== 'string') {
    errors.push({
      path: `${path}.classKey`,
      message: 'Unit classKey must be a string',
    })
  } else if (!isValidClass(unitObj.classKey)) {
    errors.push({
      path: `${path}.classKey`,
      message: `Unit classKey "${unitObj.classKey}" is not a valid class type`,
    })
  }

  if (
    typeof unitObj.level !== 'number' ||
    unitObj.level < 1 ||
    unitObj.level > 50 ||
    !Number.isInteger(unitObj.level)
  ) {
    errors.push({
      path: `${path}.level`,
      message: 'Unit level must be an integer between 1 and 50',
    })
  }

  if (!Array.isArray(unitObj.growths) || unitObj.growths.length !== 2) {
    errors.push({
      path: `${path}.growths`,
      message: 'Unit growths must be an array of exactly 2 elements',
    })
  } else {
    unitObj.growths.forEach((growth, index) => {
      if (
        typeof growth !== 'string' ||
        !GROWTH_VALUES.includes(growth as GrowthType)
      ) {
        errors.push({
          path: `${path}.growths[${index}]`,
          message: `Growth[${index}] must be a valid GrowthType (one of: ${GROWTH_VALUES.join(', ')})`,
        })
      }
    })
  }

  if (!Array.isArray(unitObj.equipment)) {
    errors.push({
      path: `${path}.equipment`,
      message: 'Unit equipment must be an array',
    })
  } else {
    if (isValidClass(unitObj.classKey as string)) {
      const expectedSlots = getEquipmentSlots(unitObj.classKey as AllClassType)
      const actualSlots = unitObj.equipment.map(
        (item: unknown) =>
          (item as Record<string, unknown> | null)?.slot as string | undefined
      )

      if (actualSlots.length !== expectedSlots.length) {
        errors.push({
          path: `${path}.equipment`,
          message: `Unit class "${unitObj.classKey}" requires exactly ${expectedSlots.length} equipment slots, but found ${actualSlots.length}. Expected slots: ${expectedSlots.join(', ')}`,
        })
      }

      for (
        let i = 0;
        i < Math.min(actualSlots.length, expectedSlots.length);
        i++
      ) {
        if (actualSlots[i] !== expectedSlots[i]) {
          errors.push({
            path: `${path}.equipment[${i}]`,
            message: `Equipment slot[${i}] should be "${expectedSlots[i]}" but found "${actualSlots[i] || 'undefined'}"`,
          })
        }
      }
    }

    const duplicates = findDuplicateEquipmentIds(unitObj.equipment)
    for (const [itemId, indices] of Object.entries(duplicates)) {
      errors.push({
        path: `${path}.equipment`,
        message: `Duplicate equipment "${itemId}" found at slots ${indices.join(', ')}. Each unit can only equip one of each item.`,
      })
    }

    unitObj.equipment.forEach((item, index) => {
      const itemPath = `${path}.equipment[${index}]`
      const itemErrors = validateEquippedItem(
        item,
        itemPath,
        unitObj.classKey as AllClassType | undefined
      )
      errors.push(...itemErrors)
    })
  }

  if (!Array.isArray(unitObj.skillSlots)) {
    errors.push({
      path: `${path}.skillSlots`,
      message: 'Unit skillSlots must be an array',
    })
  } else {
    unitObj.skillSlots.forEach((slot, index) => {
      const slotPath = `${path}.skillSlots[${index}]`
      const slotErrors = validateSkillSlot(slot, slotPath)
      errors.push(...slotErrors)
    })
  }

  if (
    !unitObj.dews ||
    typeof unitObj.dews !== 'object' ||
    Array.isArray(unitObj.dews)
  ) {
    errors.push({
      path: `${path}.dews`,
      message: 'Unit dews must be an object',
    })
  } else {
    const dewsObj = unitObj.dews as Record<string, unknown>
    for (const stat of COMBAT_STATS) {
      const dewValue = dewsObj[stat]
      if (
        typeof dewValue !== 'number' ||
        !VALID_DEW_COUNTS.includes(dewValue as ValidDewCount)
      ) {
        errors.push({
          path: `${path}.dews.${stat}`,
          message: `Dew value for ${stat} must be a number between 0 and 5`,
        })
      }
    }
    for (const key of Object.keys(dewsObj)) {
      if (!COMBAT_STATS.includes(key as CombatStat)) {
        errors.push({
          path: `${path}.dews.${key}`,
          message: `Invalid dew key "${key}". Must be one of: ${COMBAT_STATS.join(', ')}`,
        })
      }
    }
  }

  return errors
}

function validateEquippedItem(
  item: unknown,
  path: string,
  unitClassKey?: AllClassType
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return [
      {
        path,
        message: 'Equipment item must be an object',
      },
    ]
  }

  const itemObj = item as Record<string, unknown>

  if (typeof itemObj.slot !== 'string') {
    errors.push({
      path: `${path}.slot`,
      message: 'Equipment slot must be a string',
    })
  } else if (!ALL_EQUIPMENT_SLOTS.includes(itemObj.slot as EquipmentSlotType)) {
    errors.push({
      path: `${path}.slot`,
      message: `Invalid equipment slot "${itemObj.slot}". Must be one of: ${ALL_EQUIPMENT_SLOTS.join(', ')}`,
    })
  }

  if (itemObj.itemId !== null && typeof itemObj.itemId !== 'string') {
    errors.push({
      path: `${path}.itemId`,
      message: 'Equipment itemId must be a string or null',
    })
  } else if (typeof itemObj.itemId === 'string' && itemObj.itemId) {
    if (unitClassKey) {
      const validation = validateEquipmentForSlot(
        itemObj.itemId,
        itemObj.slot as string,
        unitClassKey
      )
      if (!validation.isValid) {
        errors.push({
          path: `${path}.itemId`,
          message: validation.reason || 'Invalid equipment',
        })
      }
    } else {
      if (!validateEquipmentReference(itemObj.itemId)) {
        errors.push({
          path: `${path}.itemId`,
          message: `Equipment item "${itemObj.itemId}" does not exist`,
        })
      }
    }
  }

  return errors
}

function validateSkillSlot(slot: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
    return [
      {
        path,
        message: 'Skill slot must be an object',
      },
    ]
  }

  const slotObj = slot as Record<string, unknown>

  if (typeof slotObj.id !== 'string') {
    errors.push({
      path: `${path}.id`,
      message: 'Skill slot id must be a string',
    })
  }

  if (typeof slotObj.order !== 'number' || !Number.isInteger(slotObj.order)) {
    errors.push({
      path: `${path}.order`,
      message: 'Skill slot order must be an integer',
    })
  }

  if (!Array.isArray(slotObj.tactics) || slotObj.tactics.length !== 2) {
    errors.push({
      path: `${path}.tactics`,
      message: 'Skill slot tactics must be an array of exactly 2 elements',
    })
  }

  const skillType = slotObj.skillType
  const skillId = slotObj.skillId

  if (skillType === null && skillId !== null) {
    errors.push({
      path: `${path}.skillType`,
      message: 'Skill slot skillType cannot be null when skillId is not null',
    })
  }

  if (skillType === 'active' && typeof skillId === 'string') {
    if (!validateSkillReference(skillId)) {
      errors.push({
        path: `${path}.skillId`,
        message: `Active skill "${skillId}" does not exist`,
      })
    }
  } else if (skillType === 'passive' && typeof skillId === 'string') {
    if (!validateSkillReference(skillId)) {
      errors.push({
        path: `${path}.skillId`,
        message: `Passive skill "${skillId}" does not exist`,
      })
    }
  } else if (skillType !== null && skillId === null) {
    errors.push({
      path: `${path}.skillId`,
      message: 'Skill slot skillId cannot be null when skillType is not null',
    })
  }

  return errors
}
