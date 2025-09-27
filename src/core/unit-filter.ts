import type { Team } from '@/components/team-builder/team-context'
import {
  UNIQUE_CLASSES,
  EXCLUSIVE_GROUPS,
  ALL_CLASSES,
} from '@/data/class-types'

const CRITERIA_UNIQUES = [
  'Lord',
  'High Lord',
  'Priestess',
  'High Priestess',
  'Crusader',
  'Valkyria',
]

const UNIQUE_ONE_OFS = Object.values(UNIQUE_CLASSES).filter(
  (x) => !CRITERIA_UNIQUES.includes(x)
) as readonly string[]

const CRUSADER_VALKYRIA_LIMITS = {
  Crusader: 1,
  Valkyria: 2,
}

export function filterUnits(team: Team, searchTerm = ''): string[] {
  const allUnits = Object.values(ALL_CLASSES)
  const teamClasses = team.formation
    .filter((u) => u !== null)
    .map((u) => u.class)

  return allUnits.filter((unit) => {
    if (!unit.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    for (const group of EXCLUSIVE_GROUPS) {
      if (group.includes(unit)) {
        if (teamClasses.some((c) => group.includes(c))) {
          return false
        }
      }
    }

    if (unit in CRUSADER_VALKYRIA_LIMITS) {
      const count = teamClasses.filter((c) => c === unit).length
      if (
        count >=
        CRUSADER_VALKYRIA_LIMITS[unit as keyof typeof CRUSADER_VALKYRIA_LIMITS]
      ) {
        return false
      }

      if (unit === 'Valkyria') {
        const crusaderCount = teamClasses.filter((c) => c === 'Crusader').length
        if (crusaderCount > 0 && count >= 1) return false
      }
    }

    if (UNIQUE_ONE_OFS.includes(unit) && teamClasses.includes(unit)) {
      return false
    }

    return true
  })
}
