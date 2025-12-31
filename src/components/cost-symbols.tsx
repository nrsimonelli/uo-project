import { cn } from '@/lib/utils'

interface CostSymbolsProps {
  cost: number
  type: 'active' | 'passive'
  className?: string
  symbolClassName?: string
}

export function CostSymbols({
  cost,
  type,
  className,
  symbolClassName,
}: CostSymbolsProps) {
  const isActive = type === 'active'

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: cost }, (_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block w-2 h-2 rounded-full',
            isActive ? 'bg-ap' : 'bg-pp',
            symbolClassName
          )}
        />
      ))}
    </div>
  )
}
