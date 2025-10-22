import { getStateIdForContext } from '@/core/battle/engine/utils/state-ids'
import type { BattleContext, BattlefieldState } from '@/types/battle-engine'

export function applyCoverRedirection(
  state: BattlefieldState,
  targets: BattleContext[]
): BattleContext[] {
  const list: BattleContext[] = []
  for (let i = 0; i < targets.length; i += 1) {
    const t = targets[i]
    const stateId = getStateIdForContext(t)
    const live = state.units[stateId]
    if (live && live.cover && live.defenseActionId === state.currentActionId) {
      // find coverer by unit id on same team
      const unitEntries = Object.entries(state.units)
      let coverer: BattleContext | null = null
      for (let k = 0; k < unitEntries.length; k += 1) {
        const u = unitEntries[k][1]
        if (u.unit.id === live.cover.covererId && u.team === live.team) {
          coverer = u
          k = unitEntries.length
        }
      }
      list.push(coverer || t)
    } else {
      list.push(t)
    }
  }
  return list
}

export function clearDefenseForAction(
  state: BattlefieldState,
  actionId: number
): BattlefieldState {
  let changed = false
  const newUnits: BattlefieldState['units'] = { ...state.units }
  const unitEntries = Object.entries(state.units)
  for (let i = 0; i < unitEntries.length; i += 1) {
    const sid = unitEntries[i][0]
    const u = unitEntries[i][1]
    if (u.defenseActionId === actionId) {
      newUnits[sid] = {
        ...u,
        incomingGuard: undefined,
        incomingParry: undefined,
        cover: undefined,
        defenseActionId: undefined,
      }
      changed = true
    }
  }
  if (!changed) return state
  return { ...state, units: newUnits }
}
