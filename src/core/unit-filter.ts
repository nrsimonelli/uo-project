import { UNIQUE_CLASSES, ALL_CLASSES, EXCLUSIVE_GROUPS } from '@/data/constants'
import type { Team } from '@/types/team'

const CRITERIA_UNIQUES = [
  'Lord',
  'High Lord',
  'Priestess',
  'High Priestess',
  'Crusader',
  'Valkyria',
]

const UNIQUE_ONE_OFS = Object.values(UNIQUE_CLASSES).filter(
  x => !CRITERIA_UNIQUES.includes(x)
) as readonly string[]

const CRUSADER_VALKYRIA_LIMITS = {
  Crusader: 1,
  Valkyria: 2,
}

export const filterUnits = (team: Team, searchTerm = ''): string[] => {
  const allUnits = Object.values(ALL_CLASSES).sort()
  const teamClasses = team.formation
    .filter(u => u !== null)
    .map(u => u.classKey)

  return allUnits.filter(unit => {
    if (!unit.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    for (const group of EXCLUSIVE_GROUPS) {
      if (group.includes(unit)) {
        if (teamClasses.some(c => group.includes(c))) {
          return false
        }
      }
    }

    if (unit in CRUSADER_VALKYRIA_LIMITS) {
      const count = teamClasses.filter(c => c === unit).length
      if (
        count >=
        CRUSADER_VALKYRIA_LIMITS[unit as keyof typeof CRUSADER_VALKYRIA_LIMITS]
      ) {
        return false
      }

      if (unit === 'Valkyria') {
        const crusaderCount = teamClasses.filter(c => c === 'Crusader').length
        if (crusaderCount > 0 && count >= 1) return false
      }
    }

    if (UNIQUE_ONE_OFS.includes(unit) && teamClasses.includes(unit)) {
      return false
    }

    return true
  })
}
