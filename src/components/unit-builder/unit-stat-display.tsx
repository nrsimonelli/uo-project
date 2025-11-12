import { AnimatedStatBar } from '../animated-stat-bar'
import { RadarGraph } from '../radar-graph'

import { useChartData } from '@/hooks/use-chart-data'
import type { Unit } from '@/types/team'

export const UnitStatDisplay = ({ unit }: { unit: Unit }) => {
  const { chartData } = useChartData(unit)
  // TODO: Dew UI needed, WIP logic below
  // const { updateUnit } = useTeam()

  // const incrementDewValue = (stat: CombatStat) => {
  //   updateUnit(unit.id, { dews: { ...unit.dews, [stat]: unit.dews[stat] + 1 } })
  // }

  // const decrementDewValue = (stat: CombatStat) => {
  //   updateUnit(unit.id, { dews: { ...unit.dews, [stat]: unit.dews[stat] - 1 } })
  // }

  if (!chartData) {
    return null
  }

  return (
    <div className="flex-col flex-1 basis-xs space-y-3">
      <RadarGraph chartData={chartData} />
      <div className="flex flex-col space-y-3">
        {/* dew of illusion by stat header? */}
        <p className="text-lg font-medium">Stats</p>
        <div className="space-y-1">
          {chartData.map(stat => (
            <AnimatedStatBar key={`${unit.id}-${stat.stat}`} data={stat} />
          ))}
        </div>
      </div>
    </div>
  )
}
