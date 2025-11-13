import { validateEquipmentForSlot } from './equipment-validation-utils'
import { validateSkillReference } from './skill-validation'

import { getEquipmentSlots, isValidClass } from '@/core/helpers'
import { COMBAT_STATS } from '@/hooks/use-chart-data'
import type { CombatStat } from '@/hooks/use-chart-data'
import { GROWTH_VALUES } from '@/types/base-stats'
import type { GrowthTuple, GrowthType } from '@/types/base-stats'
import type { EquippedItem } from '@/types/equipment'
import type { SkillSlot } from '@/types/skills'
import { VALID_DEW_COUNTS, type ValidDewCount } from '@/types/team'
import type { Team, Unit, FormationSlots } from '@/types/team'

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

  if (typeof unitObj.id !== 'string' || !unitObj.id) {
    repairs.push(`${unitPath}: Missing or invalid id`)
    return null
  }

  if (typeof unitObj.name !== 'string' || !unitObj.name) {
    repairs.push(`${unitPath}: Missing or invalid name`)
    return null
  }

  if (typeof unitObj.classKey !== 'string' || !isValidClass(unitObj.classKey)) {
    repairs.push(
      `${unitPath}: Invalid classKey "${unitObj.classKey}", removing unit from team`
    )
    return null
  }
  const classKey = unitObj.classKey

  let level = 35
  if (
    typeof unitObj.level === 'number' &&
    unitObj.level >= 1 &&
    unitObj.level <= 50 &&
    Number.isInteger(unitObj.level)
  ) {
    level = unitObj.level
  } else {
    repairs.push(`${unitPath}: Invalid level ${unitObj.level}, setting to 35`)
  }

  let growths: GrowthTuple = ['All-Rounder', 'All-Rounder']
  if (Array.isArray(unitObj.growths) && unitObj.growths.length === 2) {
    const growth0 =
      typeof unitObj.growths[0] === 'string' &&
      GROWTH_VALUES.includes(unitObj.growths[0] as GrowthType)
        ? (unitObj.growths[0] as GrowthType)
        : 'All-Rounder'
    const growth1 =
      typeof unitObj.growths[1] === 'string' &&
      GROWTH_VALUES.includes(unitObj.growths[1] as GrowthType)
        ? (unitObj.growths[1] as GrowthType)
        : 'All-Rounder'

    if (growth0 !== unitObj.growths[0] || growth1 !== unitObj.growths[1]) {
      repairs.push(
        `${unitPath}: Invalid growth values, fixed to [${growth0}, ${growth1}]`
      )
    }

    growths = [growth0, growth1] as GrowthTuple
  } else {
    repairs.push(
      `${unitPath}: Invalid growths array, using All-Rounder for both`
    )
  }

  const expectedSlots = getEquipmentSlots(classKey)

  let equipment: EquippedItem[] = []
  if (!Array.isArray(unitObj.equipment)) {
    repairs.push(
      `${unitPath}: Equipment is not an array, creating correct slots for class "${classKey}"`
    )
    equipment = expectedSlots.map(slot => ({ slot, itemId: null }))
  } else {
    const equipmentItems: Array<{
      slot: string
      itemId: string | null
    }> = []

    for (const item of unitObj.equipment) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue

      const itemObj = item as Record<string, unknown>
      const slot = itemObj.slot
      if (typeof slot !== 'string') continue

      equipmentItems.push({
        slot,
        itemId: typeof itemObj.itemId === 'string' ? itemObj.itemId : null,
      })
    }

    const usedEquipmentIds: string[] = []

    equipment = expectedSlots.map((expectedSlot, index) => {
      for (const item of equipmentItems) {
        if (item.slot !== expectedSlot) continue
        if (!item.itemId) continue
        if (usedEquipmentIds.includes(item.itemId)) continue

        const validation = validateEquipmentForSlot(
          item.itemId,
          expectedSlot,
          classKey
        )

        if (!validation.isValid) {
          repairs.push(
            `${unitPath}.equipment[${index}]: ${validation.reason || 'Invalid equipment'} in slot "${expectedSlot}", clearing`
          )
          return { slot: expectedSlot, itemId: null }
        }

        usedEquipmentIds.push(item.itemId)
        return { slot: expectedSlot, itemId: item.itemId }
      }

      return { slot: expectedSlot, itemId: null }
    })

    const actualSlots = unitObj.equipment.map(
      (item: unknown) =>
        (item as Record<string, unknown> | null)?.slot as string | undefined
    )

    if (actualSlots.length !== expectedSlots.length) {
      repairs.push(
        `${unitPath}: Equipment had ${actualSlots.length} slots, corrected to ${expectedSlots.length} slots for class "${classKey}"`
      )
    }

    const slotTypesMatch = actualSlots.every(
      (slot, index) => slot === expectedSlots[index]
    )
    if (!slotTypesMatch) {
      repairs.push(
        `${unitPath}: Equipment slot types corrected to match class "${classKey}" requirements: ${expectedSlots.join(', ')}`
      )
    }
  }

  let skillSlots: SkillSlot[] = []
  if (!Array.isArray(unitObj.skillSlots)) {
    repairs.push(`${unitPath}: skillSlots is not an array, using empty array`)
  } else {
    const originalLength = unitObj.skillSlots.length

    skillSlots = unitObj.skillSlots
      .map((slot, index) => {
        if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
          repairs.push(
            `${unitPath}.skillSlots[${index}]: Invalid slot, removing`
          )
          return null
        }

        const slotObj = slot as Record<string, unknown>

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

        if (skillId !== null && typeof skillId === 'string') {
          if (!validateSkillReference(skillId)) {
            repairs.push(
              `${unitPath}.skillSlots[${index}]: Invalid skill ID "${skillId}", removing slot`
            )
            return null
          }
        }

        return {
          id: slotObj.id as string,
          order: slotObj.order as number,
          skillType: skillType as SkillSlot['skillType'],
          skillId: skillId as SkillSlot['skillId'],
          tactics: slotObj.tactics as [unknown, unknown],
        } as SkillSlot
      })
      .filter((slot): slot is SkillSlot => slot !== null)
      .map((slot, index) => ({
        ...slot,
        order: index,
      }))

    if (skillSlots.length !== originalLength) {
      repairs.push(
        `${unitPath}: Removed ${originalLength - skillSlots.length} invalid skill slots and reordered`
      )
    }
  }

  const dews: Record<CombatStat, ValidDewCount> = {} as Record<
    CombatStat,
    ValidDewCount
  >

  if (
    !unitObj.dews ||
    typeof unitObj.dews !== 'object' ||
    Array.isArray(unitObj.dews)
  ) {
    repairs.push(`${unitPath}: Invalid dews structure, using all zeros`)
    for (const stat of COMBAT_STATS) {
      dews[stat] = 0
    }
  } else {
    const dewsObj = unitObj.dews as Record<string, unknown>
    let hasInvalidDews = false

    for (const stat of COMBAT_STATS) {
      const dewValue = dewsObj[stat]
      if (
        typeof dewValue === 'number' &&
        VALID_DEW_COUNTS.includes(dewValue as ValidDewCount) &&
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

export function repairTeamData(
  data: unknown
): { repaired: Record<string, Team>; repairs: string[] } | null {
  const repairs: string[] = []
  const repaired: Record<string, Team> = {}

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    repairs.push('Data was not a valid object, using default teams')
    return {
      repaired: createDefaultTeams(),
      repairs,
    }
  }

  const teams = data as Record<string, unknown>

  if (Object.keys(teams).length === 0) {
    repairs.push('No teams found, creating default teams')
    return {
      repaired: createDefaultTeams(),
      repairs,
    }
  }

  for (const [teamId, team] of Object.entries(teams)) {
    if (team && typeof team === 'object' && !Array.isArray(team)) {
      const teamObj = team as Record<string, unknown>

      const id = typeof teamObj.id === 'string' ? teamObj.id : teamId
      const name =
        typeof teamObj.name === 'string' ? teamObj.name : `Team ${teamId}`

      if (typeof teamObj.id !== 'string') {
        repairs.push(`Team ${teamId} missing id, using key as id`)
      }
      if (typeof teamObj.name !== 'string') {
        repairs.push(`Team ${teamId} missing name, using default name`)
      }

      let formation: FormationSlots
      if (!Array.isArray(teamObj.formation)) {
        repairs.push(
          `Team ${teamId} formation was not an array, creating empty formation`
        )
        formation = Array(6).fill(null)
      } else {
        formation = [...teamObj.formation]

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
    } else {
      repairs.push(`Team ${teamId} was invalid, skipping`)
    }
  }

  if (Object.keys(repaired).length === 0) {
    repairs.push('No valid teams could be repaired, using default teams')
    return {
      repaired: createDefaultTeams(),
      repairs,
    }
  }

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

export function getDefaultTeamId(): string {
  return 'team-1'
}
