import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SPRITES } from '@/data/sprites'
import { cn } from '@/lib/utils'
import type { AllClassType } from '@/types/base-stats'
import type { BattleEvent } from '@/types/battle-engine'

interface BattleEventCardProps {
  event: BattleEvent
}

export function BattleEventCard({ event }: BattleEventCardProps) {
  // Get unit info from the actingUnit object
  const actingUnit = event.actingUnit
  const team = actingUnit?.team
  const unitClass = actingUnit?.classKey as AllClassType
  const unitSprite = unitClass ? SPRITES[unitClass] : null

  // Team-based styling
  const teamStyles = {
    'home-team': {
      cardClass: 'border-blue-200 bg-blue-50/50 dark:border-blue-700/50 dark:bg-blue-950/30',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700/50'
    },
    'away-team': {
      cardClass: 'border-red-200 bg-red-50/50 dark:border-red-700/50 dark:bg-red-950/30', 
      badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/50'
    }
  }

  const currentTeamStyles = team
    ? teamStyles[team]
    : { cardClass: '', badgeClass: '' }

  return (
    <Card className={cn('w-full', currentTeamStyles.cardClass)}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Left side - Turn badge and unit sprite */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge 
              variant="outline" 
              className={cn('text-xs', currentTeamStyles.badgeClass)}
            >
              Turn {event.turn}
            </Badge>
            {unitSprite && (
              <img
                src={unitSprite}
                width={32}
                height={32}
                alt={actingUnit?.name || 'Unit'}
                className="rounded-sm"
              />
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* Event description and details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  {event.description}
                </p>
                
                {/* Event type and targets */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {event.type.replace('_', ' ')}
                  </Badge>
                  {event.targets && event.targets.length > 0 && (
                    <span>
                      → {event.targets.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Unit name */}
              {actingUnit && (
                <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                  {actingUnit.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
