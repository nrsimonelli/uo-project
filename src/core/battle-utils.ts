import type {
  BattlefieldState,
  BattleContext,
  BattleEvent,
} from '@/types/battle-engine'

/**
 * Calculate team HP percentages for results
 */
export const calculateTeamHpPercentages = (state: BattlefieldState) => {
  const homeUnits = Object.values(state.units).filter(
    u => u.team === 'home-team'
  )
  const awayUnits = Object.values(state.units).filter(
    u => u.team === 'away-team'
  )

  const calcPercent = (units: BattleContext[]) => {
    if (units.length === 0) return 0
    const current = units.reduce((sum, u) => sum + u.currentHP, 0)
    const max = units.reduce((sum, u) => sum + u.combatStats.HP, 0)
    return max > 0 ? (current / max) * 100 : 0
  }

  return {
    'home-team': calcPercent(homeUnits),
    'away-team': calcPercent(awayUnits),
  }
}

/**
 * ✅ Determine who won the battle
 * @param state Final battlefield state
 * @returns Winner team name or null for draw
 */
export const determineBattleWinner = (
  state: BattlefieldState
): string | null => {
  // Get all living units for each team
  const homeTeamUnits = Object.values(state.units).filter(
    unit => unit.team === 'home-team' && unit.currentHP > 0
  )
  const awayTeamUnits = Object.values(state.units).filter(
    unit => unit.team === 'away-team' && unit.currentHP > 0
  )

  // Case 1: One or both teams eliminated
  if (homeTeamUnits.length === 0 && awayTeamUnits.length === 0) {
    console.error(
      'Something went wrong, it should not be possible for both teams to have zero units left standing.'
    )
    return 'Draw' // Both teams eliminated
  }
  if (homeTeamUnits.length === 0) {
    return 'Away Team' // Home team eliminated
  }
  if (awayTeamUnits.length === 0) {
    return 'Home Team' // Away team eliminated
  }

  // Case 2: Both teams have living units - compare HP percentages
  // Calculate current HP percentage for home team
  const homeCurrentHp = homeTeamUnits.reduce(
    (sum, unit) => sum + unit.currentHP,
    0
  )
  const homeMaxHp = homeTeamUnits.reduce(
    (sum, unit) => sum + unit.combatStats.HP,
    0
  )
  const homeHpPercentage = homeMaxHp > 0 ? (homeCurrentHp / homeMaxHp) * 100 : 0

  // Calculate current HP percentage for away team
  const awayCurrentHp = awayTeamUnits.reduce(
    (sum, unit) => sum + unit.currentHP,
    0
  )
  const awayMaxHp = awayTeamUnits.reduce(
    (sum, unit) => sum + unit.combatStats.HP,
    0
  )
  const awayHpPercentage = awayMaxHp > 0 ? (awayCurrentHp / awayMaxHp) * 100 : 0

  console.log('Battle end HP comparison:', {
    homeHpPercentage: homeHpPercentage.toFixed(1) + '%',
    awayHpPercentage: awayHpPercentage.toFixed(1) + '%',
  })

  // Compare HP percentages
  if (homeHpPercentage > awayHpPercentage) {
    return 'Home Team'
  } else if (awayHpPercentage > homeHpPercentage) {
    return 'Away Team'
  } else {
    return 'Draw' // Same HP percentage
  }
}

/**
 * Create a battle start event
 */
export const createBattleStartEvent = (
  homeTeamName: string,
  awayTeamName: string
): BattleEvent => ({
  id: `event-battle-start`,
  type: 'battle-start',
  turn: 0,
  description: `Battle begins between ${homeTeamName} and ${awayTeamName}`,
})

/**
 * Create a battle end event
 */
export const createBattleEndEvent = (
  winner: string | null,
  turn: number
): BattleEvent => ({
  id: `event-battle-end`,
  type: 'battle-end',
  turn,
  description: `Battle ends! Winner: ${winner || 'Draw'}`,
})

