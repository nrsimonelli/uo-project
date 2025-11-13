import {
  validateEquipmentForUnit,
  validateEquipmentReference,
} from './equipment-validation'
import { validateSkillReference } from './skill-validation'
import {
  VALID_COMBAT_STATS,
  VALID_DEW_COUNT,
  VALID_GROWTH_VALUES,
  type ValidDewCount,
} from './validation-constants'

import { getEquipmentById } from '@/core/equipment-lookup'
import { getEquipmentSlots, isValidClass } from '@/core/helpers'
import { GROWTHS } from '@/data/constants'
import type { CombatStat } from '@/hooks/use-chart-data'
import type { GrowthTuple } from '@/types/base-stats'
import type { EquippedItem } from '@/types/equipment'
import type { SkillSlot } from '@/types/skills'
import type { Team, Unit, FormationSlots } from '@/types/team'

/**
 * Creates default teams structure
 */
export function createDefaultTeams(): Record<string, Team> {
  const teams: Record<string, Team> = {}
  for (let i = 1; i <= 6; i++) {
    teams[`team-${i}`] = {
      id: `team-${i}`,
      name: `Team ${i}`,
      formation: Array(6).fill(null),
    }
  }
  return teams
}

/**
 * Repairs a single unit's data
 */
function repairUnit(
  unit: unknown,
  unitPath: string,
  repairs: string[]
): Unit | null {
  if (!unit || typeof unit !== 'object' || Array.isArray(unit)) {
    repairs.push(`${unitPath}: Unit is not a valid object`)
    return null
  }

  const unitObj = unit as Record<string, unknown>

  // Validate and fix required fields
  if (typeof unitObj.id !== 'string' || !unitObj.id) {
    repairs.push(`${unitPath}: Missing or invalid id`)
    return null
  }

  if (typeof unitObj.name !== 'string' || !unitObj.name) {
    repairs.push(`${unitPath}: Missing or invalid name`)
    return null
  }

  // Validate classKey - if invalid, return null to delete unit
  if (typeof unitObj.classKey !== 'string' || !isValidClass(unitObj.classKey)) {
    repairs.push(
      `${unitPath}: Invalid classKey "${unitObj.classKey}", removing unit from team`
    )
    return null
  }
  const classKey = unitObj.classKey

  // Validate and fix level - default to 35 if invalid
  let level = 35
  if (
    typeof unitObj.level !== 'number' ||
    unitObj.level < 1 ||
    unitObj.level > 50 ||
    !Number.isInteger(unitObj.level)
  ) {
    repairs.push(`${unitPath}: Invalid level ${unitObj.level}, setting to 35`)
    level = 35
  } else {
    level = unitObj.level
  }

  // Validate and fix growths - default to All-Rounder if invalid
  let growths: GrowthTuple = ['All-Rounder', 'All-Rounder'] // Default
  if (!Array.isArray(unitObj.growths) || unitObj.growths.length !== 2) {
    repairs.push(
      `${unitPath}: Invalid growths array, using All-Rounder for both`
    )
  } else {
    const growth0 =
      typeof unitObj.growths[0] === 'string' &&
      VALID_GROWTH_VALUES.includes(
        unitObj.growths[0] as (typeof GROWTHS)[keyof typeof GROWTHS]
      )
        ? (unitObj.growths[0] as (typeof GROWTHS)[keyof typeof GROWTHS])
        : 'All-Rounder'
    const growth1 =
      typeof unitObj.growths[1] === 'string' &&
      VALID_GROWTH_VALUES.includes(
        unitObj.growths[1] as (typeof GROWTHS)[keyof typeof GROWTHS]
      )
        ? (unitObj.growths[1] as (typeof GROWTHS)[keyof typeof GROWTHS])
        : 'All-Rounder'

    if (growth0 !== unitObj.growths[0] || growth1 !== unitObj.growths[1]) {
      repairs.push(
        `${unitPath}: Invalid growth values, fixed to [${growth0}, ${growth1}]`
      )
    }

    growths = [growth0, growth1] as GrowthTuple
  }

  // Get expected equipment slots for this class
  const expectedSlots = getEquipmentSlots(classKey)

  // Repair equipment - rebuild to match expected slots
  let equipment: EquippedItem[] = []
  if (Array.isArray(unitObj.equipment)) {
    // Collect all equipment items with their original indices
    // We'll match them to expected slots by slot type, but track duplicates
    const equipmentItems: Array<{
      slot: string
      itemId: string | null
      originalIndex: number
    }> = []
    unitObj.equipment.forEach((item, originalIndex) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const itemObj = item as Record<string, unknown>
        const slot = itemObj.slot
        const itemId = itemObj.itemId

        if (typeof slot === 'string') {
          equipmentItems.push({
            slot,
            itemId: typeof itemId === 'string' ? itemId : null,
            originalIndex,
          })
        }
      }
    })

    // Track used equipment IDs to prevent duplicates
    const usedEquipmentIds = new Set<string>()

    // Build equipment array matching expected slots
    equipment = expectedSlots.map((expectedSlot, index) => {
      // Find the first unused equipment item that matches this slot type
      // and hasn't been used as a duplicate
      let matchingItem: {
        slot: string
        itemId: string | null
        originalIndex: number
      } | null = null

      for (const item of equipmentItems) {
        // Skip if slot type doesn't match
        if (item.slot !== expectedSlot) continue

        // Skip if this itemId is already used (duplicate)
        if (item.itemId && usedEquipmentIds.has(item.itemId)) continue

        // Use this item
        matchingItem = item
        break
      }

      // If we found a matching item, validate it
      if (matchingItem && matchingItem.itemId !== null) {
        const existingItemId = matchingItem.itemId

        // Check for duplicate equipment ID (shouldn't happen due to check above, but double-check)
        if (usedEquipmentIds.has(existingItemId)) {
          repairs.push(
            `${unitPath}.equipment[${index}]: Duplicate equipment "${existingItemId}" in slot "${expectedSlot}", clearing duplicate`
          )
          return { slot: expectedSlot, itemId: null } as EquippedItem
        }

        // Validate itemId exists
        if (!validateEquipmentReference(existingItemId)) {
          repairs.push(
            `${unitPath}.equipment[${index}]: Invalid equipment "${existingItemId}" in slot "${expectedSlot}", clearing`
          )
          return { slot: expectedSlot, itemId: null } as EquippedItem
        }

        // Get equipment to check type matches slot
        const equipmentItem = getEquipmentById(existingItemId)
        if (!equipmentItem) {
          repairs.push(
            `${unitPath}.equipment[${index}]: Equipment "${existingItemId}" not found in slot "${expectedSlot}", clearing`
          )
          return { slot: expectedSlot, itemId: null } as EquippedItem
        }

        // Validate equipment type matches slot type
        if (equipmentItem.type !== expectedSlot) {
          repairs.push(
            `${unitPath}.equipment[${index}]: Equipment "${existingItemId}" type "${equipmentItem.type}" does not match slot "${expectedSlot}", clearing`
          )
          return { slot: expectedSlot, itemId: null } as EquippedItem
        }

        // Validate unit can equip this item (class restrictions)
        if (!validateEquipmentForUnit(existingItemId, classKey)) {
          repairs.push(
            `${unitPath}.equipment[${index}]: Unit class "${classKey}" cannot equip "${existingItemId}" in slot "${expectedSlot}", clearing`
          )
          return { slot: expectedSlot, itemId: null } as EquippedItem
        }

        // Mark this equipment ID as used (prevents duplicates)
        usedEquipmentIds.add(existingItemId)
        return { slot: expectedSlot, itemId: existingItemId } as EquippedItem
      }

      // No matching item found for this slot, create empty slot
      return { slot: expectedSlot, itemId: null } as EquippedItem
    })

    // Check if we had wrong number or types of slots
    const actualSlots = unitObj.equipment.map(
      (item: unknown) =>
        (item as Record<string, unknown> | null)?.slot as string | undefined
    )
    if (actualSlots.length !== expectedSlots.length) {
      repairs.push(
        `${unitPath}: Equipment had ${actualSlots.length} slots, corrected to ${expectedSlots.length} slots for class "${classKey}"`
      )
    }

    // Check if slot types were wrong
    const slotTypesMatch = actualSlots.every(
      (slot, index) => slot === expectedSlots[index]
    )
    if (!slotTypesMatch) {
      repairs.push(
        `${unitPath}: Equipment slot types corrected to match class "${classKey}" requirements: ${expectedSlots.join(', ')}`
      )
    }
  } else {
    repairs.push(
      `${unitPath}: Equipment is not an array, creating correct slots for class "${classKey}"`
    )
    // Create empty equipment slots matching expected slots
    equipment = expectedSlots.map(slot => ({
      slot,
      itemId: null,
    }))
  }

  // Repair skill slots - remove invalid ones and reorder
  let skillSlots: SkillSlot[] = []
  if (Array.isArray(unitObj.skillSlots)) {
    skillSlots = unitObj.skillSlots
      .map((slot, index) => {
        if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
          repairs.push(
            `${unitPath}.skillSlots[${index}]: Invalid slot, removing`
          )
          return null
        }

        const slotObj = slot as Record<string, unknown>

        // Validate required fields
        if (typeof slotObj.id !== 'string') {
          repairs.push(
            `${unitPath}.skillSlots[${index}]: Missing id, removing slot`
          )
          return null
        }

        if (typeof slotObj.order !== 'number') {
          repairs.push(
            `${unitPath}.skillSlots[${index}]: Missing order, removing slot`
          )
          return null
        }

        if (!Array.isArray(slotObj.tactics) || slotObj.tactics.length !== 2) {
          repairs.push(
            `${unitPath}.skillSlots[${index}]: Invalid tactics, removing slot`
          )
          return null
        }

        const skillType = slotObj.skillType
        const skillId = slotObj.skillId

        // Validate skillType and skillId consistency
        if (skillType === null && skillId !== null) {
          repairs.push(
            `${unitPath}.skillSlots[${index}]: skillType is null but skillId is not, removing slot`
          )
          return null
        }

        if (skillType !== null && skillId === null) {
          repairs.push(
            `${unitPath}.skillSlots[${index}]: skillType is not null but skillId is, removing slot`
          )
          return null
        }

        // If skillId exists, validate it exists (but don't check if it's valid for unit)
        // Invalid skills for the unit will be kept - UI handles marking them
        if (skillId !== null && typeof skillId === 'string') {
          if (!validateSkillReference(skillId)) {
            repairs.push(
              `${unitPath}.skillSlots[${index}]: Invalid skill ID "${skillId}", removing slot`
            )
            return null
          }
          // Skill ID is valid - keep it even if it's not valid for this unit
          // The UI will mark it as needing attention
        }

        // If we get here, the slot is valid (skill may be invalid for unit, but that's OK)
        return {
          id: slotObj.id as string,
          order: slotObj.order as number,
          skillType: skillType as SkillSlot['skillType'],
          skillId: skillId as SkillSlot['skillId'],
          tactics: slotObj.tactics as [unknown, unknown],
        } as SkillSlot
      })
      .filter((slot): slot is SkillSlot => slot !== null)

    // Reorder skill slots after removing invalid ones
    skillSlots = skillSlots.map((slot, index) => ({
      ...slot,
      order: index,
    }))

    if (skillSlots.length !== unitObj.skillSlots.length) {
      repairs.push(
        `${unitPath}: Removed ${unitObj.skillSlots.length - skillSlots.length} invalid skill slots and reordered`
      )
    }
  } else {
    repairs.push(`${unitPath}: skillSlots is not an array, using empty array`)
  }

  // Repair dews - fix invalid values to 0
  const dews: Record<CombatStat, ValidDewCount> = {} as Record<
    CombatStat,
    ValidDewCount
  >
  if (
    unitObj.dews &&
    typeof unitObj.dews === 'object' &&
    !Array.isArray(unitObj.dews)
  ) {
    const dewsObj = unitObj.dews as Record<string, unknown>
    let hasInvalidDews = false

    for (const stat of VALID_COMBAT_STATS) {
      const dewValue = dewsObj[stat]
      if (
        typeof dewValue === 'number' &&
        VALID_DEW_COUNT.has(dewValue as ValidDewCount) &&
        Number.isInteger(dewValue)
      ) {
        dews[stat] = dewValue as ValidDewCount
      } else {
        dews[stat] = 0
        if (dewValue !== undefined && dewValue !== 0) {
          hasInvalidDews = true
        }
      }
    }

    if (hasInvalidDews) {
      repairs.push(`${unitPath}: Fixed invalid dew values to 0`)
    }
  } else {
    repairs.push(`${unitPath}: Invalid dews structure, using all zeros`)
    for (const stat of VALID_COMBAT_STATS) {
      dews[stat] = 0
    }
  }

  return {
    id: unitObj.id as string,
    name: unitObj.name as string,
    classKey,
    level,
    growths,
    equipment,
    skillSlots,
    dews,
    position: unitObj.position as Unit['position'],
  }
}

/**
 * Attempts to repair corrupted team data
 * Returns repaired data or null if repair is not possible
 */
export function repairTeamData(
  data: unknown
): { repaired: Record<string, Team>; repairs: string[] } | null {
  const repairs: string[] = []
  const repaired: Record<string, Team> = {}

  // If data is not an object, return defaults
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    repairs.push('Data was not a valid object, using default teams')
    return {
      repaired: createDefaultTeams(),
      repairs,
    }
  }

  const teams = data as Record<string, unknown>

  // If teams object is empty, return defaults
  if (Object.keys(teams).length === 0) {
    repairs.push('No teams found, creating default teams')
    return {
      repaired: createDefaultTeams(),
      repairs,
    }
  }

  // Try to repair each team
  for (const [teamId, team] of Object.entries(teams)) {
    if (!team || typeof team !== 'object' || Array.isArray(team)) {
      repairs.push(`Team ${teamId} was invalid, skipping`)
      continue
    }

    const teamObj = team as Record<string, unknown>

    // Ensure team has required fields
    const id = typeof teamObj.id === 'string' ? teamObj.id : teamId
    const name =
      typeof teamObj.name === 'string' ? teamObj.name : `Team ${teamId}`

    if (typeof teamObj.id !== 'string') {
      repairs.push(`Team ${teamId} missing id, using key as id`)
    }
    if (typeof teamObj.name !== 'string') {
      repairs.push(`Team ${teamId} missing name, using default name`)
    }

    // Repair formation
    let formation: FormationSlots
    if (!Array.isArray(teamObj.formation)) {
      repairs.push(
        `Team ${teamId} formation was not an array, creating empty formation`
      )
      formation = Array(6).fill(null)
    } else {
      formation = [...teamObj.formation]

      // Pad or truncate to exactly 6 slots
      if (formation.length < 6) {
        repairs.push(
          `Team ${teamId} formation had ${formation.length} slots, padding to 6`
        )
        while (formation.length < 6) {
          formation.push(null)
        }
      } else if (formation.length > 6) {
        repairs.push(
          `Team ${teamId} formation had ${formation.length} slots, truncating to 6`
        )
        formation = formation.slice(0, 6)
      }

      // Repair each unit in formation
      formation = formation.map((unit, index) => {
        if (unit === null) return null

        const unitPath = `Team ${teamId}.formation[${index}]`
        const repairedUnit = repairUnit(unit, unitPath, repairs)

        if (!repairedUnit) {
          repairs.push(
            `Team ${teamId} formation[${index}] unit could not be repaired, removing`
          )
          return null
        }

        return repairedUnit
      })
    }

    repaired[teamId] = {
      id,
      name,
      formation,
    }
  }

  // If no valid teams were repaired, return defaults
  if (Object.keys(repaired).length === 0) {
    repairs.push('No valid teams could be repaired, using default teams')
    return {
      repaired: createDefaultTeams(),
      repairs,
    }
  }

  // Ensure at least the default 6 teams exist
  for (let i = 1; i <= 6; i++) {
    const teamKey = `team-${i}`
    if (!repaired[teamKey]) {
      repairs.push(`Team ${teamKey} was missing, creating default`)
      repaired[teamKey] = {
        id: teamKey,
        name: `Team ${i}`,
        formation: Array(6).fill(null),
      }
    }
  }

  return {
    repaired,
    repairs,
  }
}

/**
 * Gets a safe default team ID (always 'team-1')
 */
export function getDefaultTeamId(): string {
  return 'team-1'
}
