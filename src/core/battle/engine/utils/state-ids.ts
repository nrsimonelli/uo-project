import type { BattleContext } from '@/types/battle-engine'

export function getStateIdFor(
  team: BattleContext['team'],
  unitId: string
): string {
  return `${team === 'home-team' ? 'home' : 'away'}-${unitId}`
}

export function getStateIdForContext(ctx: BattleContext): string {
  return getStateIdFor(ctx.team, ctx.unit.id)
}
