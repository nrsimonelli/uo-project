import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { STATS } from '@/data/constants'
import type { StatKey } from '@/types/base-stats'

const chartConfig = {
  growth: {
    label: 'Rating',
    color: 'var(--chart-4)',
  },
  total: {
    label: 'Total value',
    color: 'var(--chart-5)',
  },
  base: {
    label: 'Base value',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

interface RadarGraphProps {
  chartData: {
    stat: string
    growth: number
    total: number
    base: number
  }[]
}

export function RadarGraph({ chartData }: RadarGraphProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={label => STATS[label as StatKey] || label}
            />
          }
        />
        <PolarAngleAxis dataKey="stat" />
        <PolarRadiusAxis domain={[0, 200]} stroke="rgba(0,0,0,0)" />
        <PolarGrid />
        <Radar dataKey="growth" fill="var(--color-growth)" fillOpacity={0.6} />
        <Radar dataKey="total" fill="var(--color-total)" fillOpacity={1} />
      </RadarChart>
    </ChartContainer>
  )
}
