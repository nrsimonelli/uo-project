import { Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GROWTHS } from '@/data/constants'
import type { GrowthTuple, GrowthType } from '@/types/base-stats'

interface SettingsPopoverProps {
  selectedLevel: number
  growthA: GrowthType
  growthB: GrowthType
  onLevelChange: (level: number) => void
  onGrowthTypeChange: (growthType: GrowthTuple) => void
}

export function SettingsPopover({
  selectedLevel,
  growthA,
  growthB,
  onLevelChange,
  onGrowthTypeChange,
}: SettingsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="space-y-4">
          <div className="text-sm font-medium">Table Configuration</div>

          <div className="grid grid-cols-3 gap-3">
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
                onValueChange={value =>
                  onGrowthTypeChange([value as GrowthType, growthB])
                }
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GROWTHS).map(([key, name]) => (
                    <SelectItem key={key} value={name}>
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
                onValueChange={value =>
                  onGrowthTypeChange([growthA, value as GrowthType])
                }
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GROWTHS).map(([key, name]) => (
                    <SelectItem key={key} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-2">
            Configure level and growth patterns to calculate base stats
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
