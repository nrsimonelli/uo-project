import { useMemo } from 'react'

export function useStatCalculations(stat: string, baseValue: number) {
  const adjustedValue = useMemo(() => {
    return stat === 'Accuracy' ? baseValue + 100 : baseValue
  }, [stat, baseValue])

  const percentage = useMemo(() => {
    if (stat === 'HP') {
      return Math.min((adjustedValue / 200) * 100, 100)
    }
    if (stat === 'Accuracy') {
      return Math.min((adjustedValue / 300) * 100, 100)
    }
    return Math.min((adjustedValue / 100) * 100, 100)
  }, [stat, adjustedValue])

  const clampedPercentage = useMemo(() => {
    return Math.max(0, Math.min(100, percentage))
  }, [percentage])

  return {
    adjustedValue,
    percentage: clampedPercentage,
  }
}
