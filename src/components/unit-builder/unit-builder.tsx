import { AnimatedStatBar } from '../animated-stat-bar'
import { EquipmentSearchModal } from '../equipment-builder/equipment-search-modal'
import { RadarGraph } from '../radar-graph'
import { Card } from '../ui/card'

import { SkillTacticsSection } from './skill-tactics-section'
import { GrowthSelect, LevelSelect } from './unit-select'

import { getEquipmentSlots } from '@/core/helpers'
import { SPRITES } from '@/data/sprites'
import { useChartData } from '@/hooks/use-chart-data'
import { useTeam } from '@/hooks/use-team'
import type { Unit } from '@/types/team'

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
      className="mx-auto"
    />
  )
}

export function UnitBuilder({ unit }: { unit: Unit }) {
  const { updateUnit } = useTeam()
  const { chartData } = useChartData(unit)

  const [growthA, growthB] = unit.growths

  const unitEquipmentSlotTypes = getEquipmentSlots(unit.class)

  if (!chartData) {
    return null
  }

  return (
    <Card className="p-4 flex-row flex-wrap gap-6">
      <div className="flex-col flex-1 space-y-6 basis-xs">
        <div className="flex w-auto justify-start items-start gap-3 flex-col">
          <p className="text-lg font-medium">{unit.name}</p>
          <UnitImage imagePath={SPRITES[unit.class]} label={unit.class} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <LevelSelect
            level={unit.level}
            onChange={level => updateUnit(unit.id, { level })}
          />
          <GrowthSelect
            label="Growth A"
            growth={growthA}
            onChange={growth =>
              updateUnit(unit.id, { growths: [growth, growthB] })
            }
          />
          <GrowthSelect
            label="Growth B"
            growth={growthB}
            onChange={growth =>
              updateUnit(unit.id, { growths: [growthA, growth] })
            }
          />
        </div>
        <div>
          <p className="text-lg font-medium mb-3">Equipment</p>
          <div className="grid grid-cols-1 gap-2">
            {unitEquipmentSlotTypes.map((slot, index) => (
              <EquipmentSearchModal
                key={`${slot}-${index}`}
                slotType={slot}
                itemId={unit.equipment?.[index]?.itemId ?? null}
                idx={index}
                unitClass={unit.class}
                unitId={unit.id}
              />
            ))}
          </div>
        </div>
        <SkillTacticsSection
          unit={unit}
          onUpdateUnit={updates => updateUnit(unit.id, updates)}
        />
      </div>
      {/* column 2 */}
      <div className="flex-col flex-1 basis-xs space-y-3">
        <RadarGraph chartData={chartData} />
        {/* Stat List */}
        <div className="flex flex-col space-y-3">
          <p className="text-lg">Stats</p>
          <div className="space-y-1">
            {chartData.map(stat => (
              <AnimatedStatBar key={stat.stat} data={stat} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
