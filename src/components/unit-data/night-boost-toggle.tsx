import { Moon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface NightBoostToggleProps {
  isNighttime: boolean
  onToggle: (isNighttime: boolean) => void
}

export function NightBoostToggle({
  isNighttime,
  onToggle,
}: NightBoostToggleProps) {
  return (
    <Button
      variant={isNighttime ? 'default' : 'outline'}
      onClick={() => onToggle(!isNighttime)}
      className="whitespace-nowrap"
    >
      <Moon /> Night Boost
    </Button>
  )
}
