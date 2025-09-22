import { useEffect, useState } from 'react'

interface UseAnimatedNumberOptions {
  duration?: number
  easing?: (t: number) => number
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export const useAnimatedNumber = (
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
) => {
  const { duration = 800, easing = easeOutCubic } = options
  const [displayValue, setDisplayValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (displayValue === targetValue) return

    setIsAnimating(true)
    const startValue = displayValue
    const difference = targetValue - startValue
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const currentValue = startValue + difference * easedProgress
      setDisplayValue(Math.round(currentValue * 100) / 100)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(targetValue)
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [targetValue, duration, easing, displayValue])

  return { displayValue, isAnimating }
}
