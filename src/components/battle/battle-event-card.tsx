import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SPRITES } from '@/data/sprites'
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
      cardClass: 'border-blue-200 bg-blue-50/50',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    'away-team': {
      cardClass: 'border-red-200 bg-red-50/50',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
    },
  }

  const currentTeamStyles = team
    ? teamStyles[team]
    : { cardClass: '', badgeClass: '' }

  return (
    <Card className={`w-full ${currentTeamStyles.cardClass}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left side - Turn, sprite, and event type */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${currentTeamStyles.badgeClass}`}
              >
                Turn {event.turn}
              </Badge>
              {unitSprite && (
                <img
                  src={unitSprite}
                  width={20}
                  height={20}
                  alt={actingUnit?.name || 'Unit'}
                  className="rounded-sm"
                />
              )}
              <Badge variant="secondary" className="text-xs capitalize">
                {event.type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Main event description */}
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>

          {/* Right side - Unit and skill info */}
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground min-w-0">
            {actingUnit && (
              <div className="font-medium text-foreground">
                {actingUnit.name}
              </div>
            )}

            {event.targets && event.targets.length > 0 && (
              <div className="text-right">
                <span className="text-muted-foreground">→ </span>
                {event.targets.join(', ')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
