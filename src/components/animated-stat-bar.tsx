import type { ChartDatum } from '@/hooks/use-chart-data'
import { useAnimatedNumber } from '../hooks/use-animated-number'
import { cn } from '@/lib/utils'
import { useStatCalculations } from '@/hooks/use-stat-calculations'
import { STAT_ICONS, RANK_COLORS } from '@/data/stat-display'

export function StatIcon({
  iconKey,
  className,
}: {
  iconKey: string
  className?: string
}) {
  const Icon = STAT_ICONS[iconKey as keyof typeof STAT_ICONS]
  return <Icon className={className} />
}

export function AnimatedStatBar({ data }: { data: ChartDatum }) {
  const { adjustedValue, percentage } = useStatCalculations(data.stat, data.base)
  
  const { displayValue: animatedValue } = useAnimatedNumber(adjustedValue, {
    duration: 600,
  })

  const { displayValue: animatedPercentage } = useAnimatedNumber(percentage, {
    duration: 800,
  })

  return (
    <div className='flex items-center gap-2 py-1 px-2 rounded transition-colors duration-200'>
      <StatIcon iconKey={data.stat} className='h-4 w-4  flex-shrink-0' />

      <div className='w-16 text-xs flex-shrink-0 transition-colors duration-200'>
        {data.stat}
      </div>

      <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden transition-colors duration-200'>
        <div
          className='h-full bg-gradient-to-r from-chart-1 to-chart-2 rounded-full transition-all duration-300 ease-out'
          style={{
            width: `${animatedPercentage}%`,
            transformOrigin: 'left center',
          }}
        />
      </div>

      <div className='w-8 text-xs font-mono font-semibold text-right flex-shrink-0 transition-colors duration-300'>
        {Math.round(animatedValue)}
      </div>

      <div className='w-4 flex-shrink-0 leading-none text-lg'>
        <span
          className={cn(
            'font-bold transition-colors duration-300',
            RANK_COLORS[data.rank]
          )}
        >
          {data.rank}
        </span>
      </div>
    </div>
  )
}
