import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BattleEvent } from '@/types/battle-engine'

interface CombatHitResultProps {
  hit: {
    hit: boolean
    damage: number
    wasCritical: boolean
    wasGuarded: boolean
    hitChance: number
  }
  hitIndex?: number
}

export function CombatHitResult({ hit, hitIndex }: CombatHitResultProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs',
        !hit.hit && 'opacity-60'
      )}
    >
      {/* Hit index for multi-hit skills */}
      {hitIndex !== undefined && (
        <span className="text-muted-foreground">#{hitIndex + 1}</span>
      )}

      {/* Hit/Miss status */}
      <Badge
        variant="outline"
        className={cn(
          'text-xs px-1.5 py-0.5',
          hit.hit
            ? 'border-foreground text-foreground'
            : 'border-destructive text-destructive'
        )}
      >
        {hit.hit ? 'HIT' : 'MISS'}
      </Badge>

      {hit.hit && (
        <>
          {/* Critical hit */}
          {hit.wasCritical && (
            <Badge
              variant="outline"
              className="text-xs border-warning text-warning"
            >
              CRIT
            </Badge>
          )}

          {/* Guard status */}
          {hit.wasGuarded && (
            <Badge variant="outline" className="text-xs border-info text-info">
              GUARD
            </Badge>
          )}

          {/* Damage amount */}
          {hit.damage > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-mono border-foreground text-foreground"
            >
              {hit.damage} DMG
            </Badge>
          )}
        </>
      )}

      {/* Hit chance (always show for context) */}
      <span className="text-muted-foreground text-xs">
        ({hit.hitChance.toFixed(0)}%)
      </span>
    </div>
  )
}

interface CombatTargetResultProps {
  targetResult: {
    targetId: string
    targetName: string
    hits: Array<{
      hit: boolean
      damage: number
      wasCritical: boolean
      wasGuarded: boolean
      hitChance: number
    }>
    totalDamage: number
  }
}

export function CombatTargetResult({ targetResult }: CombatTargetResultProps) {
  const { targetName, hits, totalDamage } = targetResult
  const isMultiHit = hits.length > 1

  return (
    <div className="space-y-1">
      {/* Target header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          → {targetName}
        </span>
        {totalDamage > 0 && (
          <Badge
            variant="outline"
            className="text-xs font-mono border-foreground text-foreground"
          >
            {totalDamage} total
          </Badge>
        )}
      </div>

      {/* Hit results */}
      <div className="space-y-0.5 ml-2">
        {hits.map((hit, index) => (
          <CombatHitResult
            key={index}
            hit={hit}
            hitIndex={isMultiHit ? index : undefined}
          />
        ))}
      </div>
    </div>
  )
}

interface CombatResultsSummaryProps {
  skillResults: NonNullable<BattleEvent['skillResults']>
}

export function CombatResultsSummary({
  skillResults,
}: CombatResultsSummaryProps) {
  const { targetResults, summary } = skillResults
  const isMultiTarget = targetResults.length > 1

  return (
    <div className="space-y-2">
      {/* Multi-target summary */}
      {isMultiTarget && summary && (
        <div className="flex flex-wrap items-center gap-2 text-xs pb-1 border-b border-border/50">
          <Badge variant="outline" className="text-xs">
            {summary.targetsHit}/{targetResults.length} targets hit
          </Badge>
          {summary.criticalHits > 0 && (
            <Badge
              variant="outline"
              className="text-xs border-warning text-warning"
            >
              {summary.criticalHits} crits
            </Badge>
          )}
          {summary.totalDamage > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-mono border-foreground text-foreground"
            >
              {summary.totalDamage} total DMG
            </Badge>
          )}
        </div>
      )}

      {/* Individual target results */}
      <div className="space-y-2">
        {targetResults.map((targetResult, index) => (
          <CombatTargetResult
            key={`${targetResult.targetId}-${index}`}
            targetResult={targetResult}
          />
        ))}
      </div>
    </div>
  )
}
