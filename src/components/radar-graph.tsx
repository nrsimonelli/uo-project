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
} from './ui/chart'

const chartConfig = {
  growth: {
    label: 'Rating',
    color: 'var(--chart-1)',
  },
  total: {
    label: 'Total value',
    color: 'var(--chart-2)',
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

export const RadarGraph = ({ chartData }: RadarGraphProps) => {
  return (
    <ChartContainer
      config={chartConfig}
      className='mx-auto aspect-square max-h-[250px]'
    >
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator='line' />}
        />
        <PolarAngleAxis dataKey='stat' />
        <PolarRadiusAxis domain={[0, 200]} stroke='rgba(0,0,0,0)' />
        <PolarGrid />
        <Radar dataKey='growth' fill='var(--color-growth)' fillOpacity={0.6} />
        <Radar dataKey='total' fill='var(--color-total)' fillOpacity={1} />
      </RadarChart>
    </ChartContainer>
  )
}
