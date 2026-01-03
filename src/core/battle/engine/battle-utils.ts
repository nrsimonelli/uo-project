import type {
  BattleEvent,
  BattlefieldState,
  BattleContext,
} from '@/types/battle-engine'

export const calculateTeamHpPercentages = (state: BattlefieldState) => {
  const defendingTeamUnits = Object.values(state.units).filter(
    u => u.team === 'defending-team'
  )
  const attackingTeamUnits = Object.values(state.units).filter(
    u => u.team === 'attacking-team'
  )

  const calcPercent = (units: BattleContext[]) => {
    if (units.length === 0) return 0
    const current = units.reduce((sum, u) => sum + u.currentHP, 0)
    const max = units.reduce((sum, u) => sum + u.combatStats.HP, 0)
    return max > 0 ? (current / max) * 100 : 0
  }

  return {
    'defending-team': calcPercent(defendingTeamUnits),
    'attacking-team': calcPercent(attackingTeamUnits),
  }
}

export const determineBattleWinner = (state: BattlefieldState) => {
  // Get all living units for each team
  const defendingTeamUnits = Object.values(state.units).filter(
    unit => unit.team === 'defending-team' && unit.currentHP > 0
  )
  const attackingTeamUnits = Object.values(state.units).filter(
    unit => unit.team === 'attacking-team' && unit.currentHP > 0
  )

  // Case 1: One or both teams eliminated
  if (defendingTeamUnits.length === 0 && attackingTeamUnits.length === 0) {
    console.error(
      'Something went wrong, it should not be possible for both teams to have zero units left standing.'
    )
    return 'Draw' // Both teams eliminated
  }
  if (defendingTeamUnits.length === 0) {
    return 'Attacking Team' // Defending team eliminated
  }
  if (attackingTeamUnits.length === 0) {
    return 'Defending Team' // Attacking team eliminated
  }

  // Case 2: Both teams have living units - compare HP percentages
  const defendingCurrentHp = defendingTeamUnits.reduce(
    (sum, unit) => sum + unit.currentHP,
    0
  )
  const defendingMaxHp = defendingTeamUnits.reduce(
    (sum, unit) => sum + unit.combatStats.HP,
    0
  )
  const defendingHpPercentage =
    defendingMaxHp > 0 ? (defendingCurrentHp / defendingMaxHp) * 100 : 0

  const attackingCurrentHp = attackingTeamUnits.reduce(
    (sum, unit) => sum + unit.currentHP,
    0
  )
  const attackingMaxHp = attackingTeamUnits.reduce(
    (sum, unit) => sum + unit.combatStats.HP,
    0
  )
  const attackingHpPercentage =
    attackingMaxHp > 0 ? (attackingCurrentHp / attackingMaxHp) * 100 : 0

  console.log('Battle end HP comparison:', {
    defendingHpPercentage: defendingHpPercentage.toFixed(1) + '%',
    attackingHpPercentage: attackingHpPercentage.toFixed(1) + '%',
  })

  // Compare HP percentages
  if (defendingHpPercentage > attackingHpPercentage) {
    return 'Defending Team'
  } else if (attackingHpPercentage > defendingHpPercentage) {
    return 'Attacking Team'
  } else {
    return 'Draw' // Same HP percentage
  }
}

export const createBattleStartEvent = (
  defendingTeamName: string,
  attackingTeamName: string
): BattleEvent => ({
  id: `event-battle-start`,
  type: 'battle-start',
  turn: 0,
  description: `Battle begins between ${defendingTeamName} and ${attackingTeamName}`,
})

export const createBattleEndEvent = (
  winner: string | null,
  turn: number,
  finalState: BattlefieldState
): BattleEvent => {
  // Extract roster data from final battlefield state
  const allUnits = Object.values(finalState.units)
  const defendingTeamUnits = allUnits.filter(
    unit => unit.team === 'defending-team'
  )
  const attackingTeamUnits = allUnits.filter(
    unit => unit.team === 'attacking-team'
  )

  const teamRosters = {
    defendingTeam: defendingTeamUnits.map(unit => ({
      unitId: unit.unit.id,
      name: unit.unit.name,
      classKey: unit.unit.classKey,
      currentHP: unit.currentHP,
      maxHP: unit.combatStats.HP,
      position: unit.position,
      afflictions: unit.afflictions,
    })),
    attackingTeam: attackingTeamUnits.map(unit => ({
      unitId: unit.unit.id,
      name: unit.unit.name,
      classKey: unit.unit.classKey,
      currentHP: unit.currentHP,
      maxHP: unit.combatStats.HP,
      position: unit.position,
      afflictions: unit.afflictions,
    })),
  }

  return {
    id: `event-battle-end`,
    type: 'battle-end',
    turn,
    description: `Battle ends! Winner: ${winner || 'Draw'}`,
    teamRosters,
  }
}
