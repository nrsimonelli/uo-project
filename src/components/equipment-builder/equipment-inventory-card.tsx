import { getEquipmentIcon } from './equipment-icons'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { STATS } from '@/data/constants'
import { ActiveSkills } from '@/generated/skills-active'
import { PassiveSkills } from '@/generated/skills-passive'
import { cn } from '@/lib/utils'
import type { StatKey } from '@/types/base-stats'
import type { EquipmentSlotType, EquipmentStatKey } from '@/types/equipment'
import type { GeneratedEquipment } from '@/types/generated-equipment'

interface EquipmentInventoryCardProps {
  item: GeneratedEquipment
  primaryStats: [EquipmentStatKey, EquipmentStatKey]
}

export function EquipmentInventoryCard({
  item,
  primaryStats,
}: EquipmentInventoryCardProps) {
  const Icon = getEquipmentIcon(item.type as EquipmentSlotType)
  const [primaryA, primaryB] = primaryStats

  // Helper to get primary value (first value if array)
  const getPrimaryValue = (statValue: unknown): number => {
    if (Array.isArray(statValue)) {
      return (statValue[0] as number) ?? 0
    }
    return (statValue as number | undefined) ?? 0
  }

  // Helper to get secondary value (second value if array, null otherwise)
  const getSecondaryValue = (
    statKey: string,
    statValue: unknown
  ): { key: string; value: number } | null => {
    if (Array.isArray(statValue) && statValue.length > 1) {
      return { key: statKey, value: statValue[1] as number }
    }
    return null
  }

  const primaryAValue = getPrimaryValue(item.stats[primaryA])
  const primaryBValue = getPrimaryValue(item.stats[primaryB])
  const primaryASecondary = getSecondaryValue(primaryA, item.stats[primaryA])
  const primaryBSecondary = getSecondaryValue(primaryB, item.stats[primaryB])

  // Filter out primary stats and collect secondary values as badges
  const itemStats = Object.entries(item.stats)
    .filter(([key]) => key !== primaryA && key !== primaryB)
    .map(([key, value]) => {
      // For array values, only use the first value in badges
      const displayValue = Array.isArray(value) ? value[0] : value
      return [key, displayValue] as [string, unknown]
    })

  // Add secondary primary stat values to badges
  const secondaryStats: Array<[string, number]> = []
  if (primaryASecondary) {
    secondaryStats.push([primaryASecondary.key, primaryASecondary.value])
  }
  if (primaryBSecondary) {
    secondaryStats.push([primaryBSecondary.key, primaryBSecondary.value])
  }

  const skill = item.skillId
    ? [...ActiveSkills, ...PassiveSkills].find(s => s.id === item.skillId)
    : null

  const getStatLabel = (statKey: string): string => {
    if (statKey in STATS) {
      return STATS[statKey as StatKey]
    }
    return statKey
  }

  const formatStatValue = (value: number, statKey: string): string => {
    const prefix = value > 0 ? '+' : ''
    const suffix =
      statKey.includes('GRD') ||
      statKey.includes('CRT') ||
      statKey.includes('CritDmg') ||
      statKey.includes('Eff') ||
      statKey.includes('Percent')
        ? '%'
        : ''
    return `${prefix}${value}${suffix}`
  }

  return (
    <div className="flex items-center gap-4 border rounded-lg p-3 hover:bg-accent/50 transition-colors">
      {/* Left: Icon */}
      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>

      {/* Center: Name and Primary Stats */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="font-medium">{item.name}</div>
        <div className="flex gap-3 text-sm">
          <div className="flex gap-1.5">
            <span className="font-light">{getStatLabel(primaryA)}</span>
            <span
              className={cn(
                'text-primary font-medium',
                primaryAValue === 0 && 'text-muted-foreground'
              )}
            >
              {primaryAValue}
            </span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-light">{getStatLabel(primaryB)}</span>
            <span
              className={cn(
                'text-primary font-medium',
                primaryBValue === 0 && 'text-muted-foreground'
              )}
            >
              {`${primaryBValue}${primaryB === 'GRD' ? '%' : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Skill and Other Stats */}
      <div className="flex flex-col gap-1 items-end text-sm">
        {skill && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-primary font-medium cursor-help">
                  {skill.name}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-sm">{skill.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {(itemStats.length > 0 || secondaryStats.length > 0) && (
          <div className="flex flex-wrap gap-1 justify-end">
            {secondaryStats.map(([statKey, statValue]) => (
              <Badge
                key={`secondary-${statKey}`}
                variant="secondary"
                className="text-xs"
              >
                {getStatLabel(statKey)} {formatStatValue(statValue, statKey)}
              </Badge>
            ))}
            {itemStats.map(([statKey, statValue]) => (
              <Badge key={statKey} variant="secondary" className="text-xs">
                {getStatLabel(statKey)}{' '}
                {formatStatValue(Number(statValue), statKey)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
