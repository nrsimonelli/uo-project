import { useMemo } from 'react'

export const useStatCalculations = (stat: string, baseValue: number) => {
  const adjustedValue = useMemo(() => {
    return stat === 'ACC' ? baseValue + 100 : baseValue
  }, [stat, baseValue])

  const percentage = useMemo(() => {
    if (stat === 'HP') {
      return Math.min((adjustedValue / 200) * 100, 100)
    }
    if (stat === 'ACC') {
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
