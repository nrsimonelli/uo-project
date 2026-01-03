import type { ActivationWindowId } from '@/data/activation-windows'
import type {
  WindowInstanceContext,
  ActivationWindowQueueItem,
} from '@/types/battle-engine'

export const createWindowInstance = (
  activeSkillId: string
): WindowInstanceContext => {
  return {
    activeSkillId,
    usedWindows: {},
    windowQueue: [],
  }
}

// Enforces one passive per unit per window per active skill instance
export const canUnitUseWindow = (
  context: WindowInstanceContext,
  unitId: string,
  windowId: ActivationWindowId
): boolean => {
  const usedUnits = context.usedWindows[windowId]
  if (!usedUnits) {
    return true
  }
  return !usedUnits.includes(unitId)
}

export const markWindowUsed = (
  context: WindowInstanceContext,
  unitId: string,
  windowId: ActivationWindowId
): void => {
  const usedUnits = context.usedWindows[windowId]
  if (!usedUnits) {
    context.usedWindows[windowId] = [unitId]
  } else if (!usedUnits.includes(unitId)) {
    usedUnits.push(unitId)
  }
}

export const hasWindowBeenUsed = (
  context: WindowInstanceContext,
  windowId: ActivationWindowId
): boolean => {
  const usedUnits = context.usedWindows[windowId]
  return usedUnits !== undefined && usedUnits.length > 0
}

export const getUnitsThatUsedWindow = (
  context: WindowInstanceContext,
  windowId: ActivationWindowId
): readonly string[] => {
  return context.usedWindows[windowId] ?? []
}

export const addWindowToQueue = (
  context: WindowInstanceContext,
  queueItem: ActivationWindowQueueItem
): void => {
  context.windowQueue.push(queueItem)
}

// Lower priority number = higher priority (processed first)
export const getNextWindowFromQueue = (
  context: WindowInstanceContext
): ActivationWindowQueueItem | null => {
  if (context.windowQueue.length === 0) {
    return null
  }

  context.windowQueue.sort((a, b) => a.priority - b.priority)
  return context.windowQueue.shift() ?? null
}

export const peekWindowQueue = (
  context: WindowInstanceContext
): readonly ActivationWindowQueueItem[] => {
  return [...context.windowQueue].sort((a, b) => a.priority - b.priority)
}

export const clearWindowQueue = (context: WindowInstanceContext): void => {
  context.windowQueue = []
}

// Called after an active skill is fully resolved
// Note: activeSkillId is kept as it represents the instance identity
export const resetWindowInstance = (context: WindowInstanceContext): void => {
  context.usedWindows = {}
  context.windowQueue = []
}

export const getWindowUsageSummary = (context: WindowInstanceContext) => {
  return {
    activeSkillId: context.activeSkillId,
    windowsUsed: { ...context.usedWindows },
    queueLength: context.windowQueue.length,
  }
}
