import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface NightBoostToggleProps {
  isNighttime: boolean
  onToggle: (isNighttime: boolean) => void
}

export function NightBoostToggle({
  isNighttime,
  onToggle,
}: NightBoostToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="nighttime-switch"
        checked={isNighttime}
        onCheckedChange={onToggle}
      />
      <Label
        htmlFor="nighttime-switch"
        className={cn(
          'text-sm cursor-pointer whitespace-nowrap transition-colors duration-200',
          isNighttime ? 'text-foreground font-medium' : 'text-muted-foreground'
        )}
      >
        Night Boost
      </Label>
    </div>
  )
}
