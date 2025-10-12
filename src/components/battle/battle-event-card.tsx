import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SPRITES } from '@/data/sprites'
import { cn } from '@/lib/utils'
import type { AllClassType } from '@/types/base-stats'
import type { BattleEvent } from '@/types/battle-engine'

import { ActiveSkillsMap } from '@/generated/skills-active'
import type { DamageEffect } from '@/types/effects'

interface BattleEventCardProps {
  event: BattleEvent
}

export function BattleEventCard({ event }: BattleEventCardProps) {
  // Get unit info from the actingUnit object
  const actingUnit = event.actingUnit
  const team = actingUnit?.team
  const unitClass = actingUnit?.classKey as AllClassType
  const unitSprite = unitClass ? SPRITES[unitClass] : null

  // Look up skill data if skillId is provided
  const skill = event.skillId ? ActiveSkillsMap[event.skillId as keyof typeof ActiveSkillsMap] : null
  
  // Extract damage potency from skill effects
  const skillPotency = skill?.effects
    .filter(effect => effect.kind === 'Damage')
    .reduce((acc, effect) => {
      const damageEffect = effect as DamageEffect
      return {
        physical: (acc.physical || 0) + (damageEffect.potency?.physical || 0),
        magical: (acc.magical || 0) + (damageEffect.potency?.magical || 0)
      }
    }, { physical: 0, magical: 0 })

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
                
                {/* Skill details */}
                {skill ? (
                  <div className="space-y-1">
                    {/* Potency and skill categories on same line */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Physical and Magical Potency */}
                      {skillPotency && skillPotency.physical > 0 && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                          {skillPotency.physical}% Physical
                        </Badge>
                      )}
                      {skillPotency && skillPotency.magical > 0 && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          {skillPotency.magical}% Magical
                        </Badge>
                      )}
                      
                      {/* Skill Categories */}
                      {skill.skillCategories?.map(category => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Targets */}
                    {event.targets && event.targets.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Targets:</span> {event.targets.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback for events without skill data */
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
                )}
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
