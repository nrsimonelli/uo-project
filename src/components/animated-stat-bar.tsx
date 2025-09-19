import type { ChartDatum } from '@/hooks/use-chart-data'
import { useAnimatedNumber } from '../hooks/use-animated-number'
import {
  Sword,
  Shield,
  Zap,
  Target,
  Eye,
  Shield as ShieldIcon,
  Star,
  Heart,
} from 'lucide-react'
import { STATS } from '@/data/units/constants'
import { cn } from '@/lib/utils'

const STAT_ICONS = {
  [STATS.HP]: Heart,
  [STATS.PATK]: Sword,
  [STATS.PDEF]: Shield,
  [STATS.MATK]: Zap,
  [STATS.MDEF]: ShieldIcon,
  [STATS.ACC]: Target,
  [STATS.EVA]: Eye,
  [STATS.CRT]: Star,
  [STATS.GRD]: Shield,
  [STATS.INIT]: Zap,
} as const

const rankColors: Record<string, string> = {
  S: 'text-blue-500',
  A: 'text-blue-500',
  B: 'text-gray-500',
  C: 'text-gray-500',
  D: 'text-gray-500',
  E: 'text-red-500',
  F: 'text-red-500',
}

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

export const AnimatedStatBar = ({ data }: { data: ChartDatum }) => {
  const { displayValue: animatedValue } = useAnimatedNumber(data.base, {
    duration: 600,
  })
  const percentage = Math.min((data.growth / 200) * 100, 100)
  const { displayValue: animatedPercentage } = useAnimatedNumber(percentage, {
    duration: 800,
  })

  return (
    <div className='flex items-center gap-2 py-1 px-2 rounded bg-gray-50 transition-colors duration-200'>
      <StatIcon
        iconKey={data.stat}
        className='h-4 w-4  flex-shrink-0 transition-colors duration-200'
      />

      <div className='w-16 text-xs font-medium flex-shrink-0 transition-colors duration-200'>
        {data.stat}
      </div>

      <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden transition-colors duration-200'>
        <div
          className='h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out'
          style={{
            width: `${Math.max(0, Math.min(100, animatedPercentage))}%`,
            transformOrigin: 'left center',
          }}
        />
      </div>

      <div className='w-8 text-xs font-mono font-semibold text-gray-700 text-right flex-shrink-0 transition-colors duration-200'>
        {Math.round(animatedValue)}
      </div>

      <div className='w-4 flex-shrink-0'>
        <span
          className={cn(
            `text-sm font-bold transition-colors duration-300`,
            rankColors[data.rank]
          )}
        >
          {data.rank}
        </span>
      </div>
    </div>
  )
}
