import { Card } from '../ui/card'

import { RadarGraph } from '../radar-graph'
import type { Unit } from '@/types/team'
import { useCurrentTeam, useTeam } from '@/hooks/use-team'
import { SPRITES } from '@/data/sprites'
import { useChartData } from '@/hooks/use-chart-data'
import { AnimatedStatBar } from '../animated-stat-bar'
import { ClassSelect, GrowthSelect, LevelSelect } from './unit-select'
// import { UnitNameEditor } from './unit-name-editor'
import type { AllClassType } from '@/types/base-stats'
import { ALL_CLASSES } from '@/data/class-types'

const UnitImage = ({
  imagePath,
  label,
}: {
  imagePath: string
  label: string
}) => {
  return (
    <img
      src={imagePath}
      height={80}
      width={80}
      alt={label}
      className='mx-auto'
    />
  )
}

export const UnitBuilder = ({ unit }: { unit: Unit }) => {
  const [growthA, growthB] = unit.growths
  const { updateUnit } = useTeam()
  const currentTeam = useCurrentTeam()
  const { chartData } = useChartData(unit)

  if (!chartData) return null

  const handleUpdateUnit = (cls: AllClassType) => {
    if (Object.values(ALL_CLASSES).some((x) => x === unit.name)) {
      updateUnit(unit.id, { name: cls, class: cls })
    } else {
      updateUnit(unit.id, { class: cls })
    }
  }

  return (
    <Card className='p-4 flex-row flex-wrap gap-6'>
      <div className='flex-col flex-1 space-y-6 basis-xs'>
        <div className='flex w-auto justify-start items-start gap-3 flex-col'>
          {/* <UnitNameEditor
            name={unit.name}
            className={unit.class}
            onChange={(name) => updateUnit(unit.id, { name })}
          /> */}

          <p className='text-lg font-medium'>{unit.name}</p>
          <UnitImage imagePath={SPRITES[unit.class]} label={unit.class} />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          {/* <ClassSelect
            unitId={unit.id}
            classType={unit.class}
            onChange={(cls) => handleUpdateUnit(cls)}
            team={currentTeam}
          /> */}
          <LevelSelect
            level={unit.level}
            onChange={(level) => updateUnit(unit.id, { level })}
          />
          <GrowthSelect
            label='Growth A'
            growth={growthA}
            onChange={(growth) =>
              updateUnit(unit.id, { growths: [growth, growthB] })
            }
          />
          <GrowthSelect
            label='Growth B'
            growth={growthB}
            onChange={(growth) =>
              updateUnit(unit.id, { growths: [growthA, growth] })
            }
          />
        </div>
        <div>
          <p>Equipment</p>
          <div>{/* <EquipmentSelect /> */}</div>
        </div>
      </div>
      {/* column 2 */}
      <div className='flex-col flex-1 basis-xs space-y-3'>
        <RadarGraph chartData={chartData} />
        {/* Stat List */}
        <div className='flex flex-col space-y-3'>
          <p className='text-lg'>Stats</p>
          <div className='space-y-1'>
            {chartData.map((stat) => (
              <AnimatedStatBar key={stat.stat} data={stat} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
