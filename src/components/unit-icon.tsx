import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CLASS_DATA } from '@/data/units/class-data'
import type { AllClassType } from '@/types/base-stats'
import { getIcon } from '@/utils/get-icon'

interface UnitIconProps {
  classKey: AllClassType
}

export function UnitIcon({ classKey }: UnitIconProps) {
  const classData = CLASS_DATA[classKey]

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        {/* Movement Type - First */}
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center w-6 h-6 rounded bg-muted cursor-help">
            {(() => {
              const MovementIcon = getIcon('movement', classData.movementType)
              return MovementIcon ? <MovementIcon className="w-4 h-4" /> : null
            })()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{classData.movementType}</p>
        </TooltipContent>
      </Tooltip>
      {/* Trait - Second */}
      {classData.trait && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-6 h-6 rounded bg-muted cursor-help">
              {(() => {
                const TraitIcon = getIcon('trait', classData.trait)
                return TraitIcon ? <TraitIcon className="w-4 h-4" /> : null
              })()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{classData.trait}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {/* Race - Third */}
      {classData.race && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-6 h-6 rounded bg-muted cursor-help">
              {(() => {
                const RaceIcon = getIcon('race', classData.race)
                return RaceIcon ? <RaceIcon className="w-4 h-4" /> : null
              })()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{classData.race}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
