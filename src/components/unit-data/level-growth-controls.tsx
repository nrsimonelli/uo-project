import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GROWTHS } from '@/data/constants'
import type { GrowthKey } from '@/types/base-stats'

interface LevelGrowthControlsProps {
  selectedLevel: number
  growthA: GrowthKey
  growthB: GrowthKey
  onLevelChange: (level: number) => void
  onGrowthAChange: (growth: GrowthKey) => void
  onGrowthBChange: (growth: GrowthKey) => void
}

export function LevelGrowthControls({
  selectedLevel,
  growthA,
  growthB,
  onLevelChange,
  onGrowthAChange,
  onGrowthBChange,
}: LevelGrowthControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <Label
          htmlFor="level-select"
          className="block text-xs font-medium mb-1"
        >
          Level
        </Label>
        <Select
          value={selectedLevel.toString()}
          onValueChange={value => onLevelChange(parseInt(value))}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 50 }, (_, i) => i + 1).map(level => (
              <SelectItem key={level} value={level.toString()}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="growth-a-select"
          className="block text-xs font-medium mb-1"
        >
          Growth A
        </Label>
        <Select
          value={growthA}
          onValueChange={value => onGrowthAChange(value as GrowthKey)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GROWTHS).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="growth-b-select"
          className="block text-xs font-medium mb-1"
        >
          Growth B
        </Label>
        <Select
          value={growthB}
          onValueChange={value => onGrowthBChange(value as GrowthKey)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GROWTHS).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
