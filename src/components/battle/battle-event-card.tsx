import { CombatResultsSummary } from './combat-results'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SPRITES } from '@/data/sprites'
import { ActiveSkillsMap } from '@/generated/skills-active'
import { cn } from '@/lib/utils'
import type { AllClassType } from '@/types/base-stats'
import type { BattleEvent } from '@/types/battle-engine'
import type { DamageEffect } from '@/types/effects'
interface BattleEventCardProps {
  event: BattleEvent
  totalEvents?: number
}

export function BattleEventCard({ event, totalEvents }: BattleEventCardProps) {
  // Get common variables needed by all event types
  const actingUnit = event.actingUnit
  const team = actingUnit?.team

  // Team-based card styling with enhanced differentiation
  const teamCardStyles = {
    'home-team':
      'border-home/30 bg-home/10 dark:border-home/60 dark:bg-home/15 border-l-4 border-l-home',
    'away-team':
      'border-away/30 bg-away/10 dark:border-away/60 dark:bg-away/15 border-r-4 border-r-away',
  }
  const currentCardStyle = team ? teamCardStyles[team] : ''

  // Special handling for battle start events
  if (event.type === 'battle-start') {
    // TODO: improve this by passing team names directly in event
    // Extract team names from description: "Battle begins between Team1 and Team2"
    const descMatch = event.description.match(
      /Battle begins between (.+) and (.+)/
    )
    const homeTeam = descMatch?.[1] || 'Home Team'
    const awayTeam = descMatch?.[2] || 'Away Team'

    return (
      <Card className="w-full ">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-lg font-bold text-primary">Battle Begins</div>
            <div className="text-xl font-semibold">
              {homeTeam} <span className="text-muted-foreground">vs</span>{' '}
              {awayTeam}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Special handling for battle end events
  if (event.type === 'battle-end') {
    // TODO: improve this by passing winner and rounds directly in event
    // Extract winner from description: "Battle ends! Winner: Team Name"
    const winnerMatch = event.description.match(/Winner: (.+)/)
    const winner = winnerMatch?.[1] || 'Unknown'

    const rounds = event.turn
    const events = totalEvents || 0

    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="text-lg font-bold text-primary">Battle Ends</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Events</div>
                <div className="font-semibold">{events}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Rounds</div>
                <div className="font-semibold">{rounds}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Result</div>
                <div className="font-semibold">
                  {winner === 'Draw' ? (
                    <Badge variant="outline">Draw</Badge>
                  ) : winner === 'Home Team' ? (
                    <Badge
                      variant="default"
                      className="bg-home text-home-foreground"
                    >
                      {winner} Wins
                    </Badge>
                  ) : (
                    <Badge
                      variant="default"
                      className="bg-away text-away-foreground"
                    >
                      {winner} Wins
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Regular event handling
  // Get unit info from the actingUnit object (already declared above)
  const unitClass = actingUnit?.classKey as AllClassType
  const unitSprite = unitClass ? SPRITES[unitClass] : null

  // Look up skill data if skillId is provided
  const skill = event.skillId
    ? ActiveSkillsMap[event.skillId as keyof typeof ActiveSkillsMap]
    : null

  // Extract damage potency from skill effects
  const skillPotency = skill?.effects
    .filter(effect => effect.kind === 'Damage')
    .reduce(
      (acc, effect) => {
        const damageEffect = effect as DamageEffect
        return {
          physical: (acc.physical || 0) + (damageEffect.potency?.physical || 0),
          magical: (acc.magical || 0) + (damageEffect.potency?.magical || 0),
        }
      },
      { physical: 0, magical: 0 }
    )

  return (
    <Card className={cn('w-full', currentCardStyle)}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Left side - Turn badge and unit sprite */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant={
                team === 'home-team'
                  ? 'home-team'
                  : team === 'away-team'
                    ? 'away-team'
                    : 'outline'
              }
              className="text-xs"
            >
              Turn {event.turn + 1}
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

                {/* Affliction details */}
                {event.afflictionData && (
                  <div className="mb-2 pb-2 border-b border-border/30">
                    <div className="flex items-center gap-2 text-xs">
                      {/* Affliction type with icon */}
                      <div className="flex items-center gap-1">
                        <span className="text-sm">
                          {event.afflictionData.afflictionType === 'Burn'
                            ? '🔥'
                            : event.afflictionData.afflictionType === 'Poison'
                              ? '☠️'
                              : event.afflictionData.afflictionType === 'Stun'
                                ? '😵'
                                : event.afflictionData.afflictionType ===
                                    'Freeze'
                                  ? '🧊'
                                  : event.afflictionData.afflictionType ===
                                      'Blind'
                                    ? '👁️'
                                    : event.afflictionData.afflictionType ===
                                        'Guard Seal'
                                      ? '🛡️'
                                      : event.afflictionData.afflictionType ===
                                          'Passive Seal'
                                        ? '🚫'
                                        : event.afflictionData
                                              .afflictionType === 'Crit Seal'
                                          ? '⚡'
                                          : event.afflictionData
                                                .afflictionType === 'Deathblow'
                                            ? '💀'
                                            : '⚠️'}
                        </span>
                        <Badge
                          variant={
                            event.type === 'affliction-damage' ||
                            event.type === 'stun-clear'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {event.afflictionData.afflictionType}
                          {event.afflictionData.level &&
                            event.afflictionData.level > 1 &&
                            ` (${event.afflictionData.level})`}
                        </Badge>
                      </div>

                      {/* Damage or effect indicator */}
                      {event.afflictionData.damage && (
                        <Badge variant="destructive" className="text-xs">
                          -{event.afflictionData.damage} HP
                        </Badge>
                      )}

                      {(event.type === 'stun-clear' ||
                        (event.afflictionData?.afflictionType === 'Stun' &&
                          !event.afflictionData?.applied)) && (
                        <Badge
                          variant="outline"
                          className="text-xs text-yellow-600"
                        >
                          Turn Consumed
                        </Badge>
                      )}

                      {event.type === 'affliction-apply' &&
                        event.afflictionData.applied && (
                          <Badge
                            variant="outline"
                            className="text-xs text-green-600"
                          >
                            Applied
                          </Badge>
                        )}

                      {event.type === 'affliction-remove' &&
                        !event.afflictionData.applied && (
                          <Badge variant="outline" className="text-blue-600">
                            Removed
                          </Badge>
                        )}
                    </div>
                  </div>
                )}

                {/* Skill details */}
                {skill ? (
                  <div className="space-y-1">
                    {/* Potency and skill categories on same line */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Physical and Magical Potency */}
                      {skillPotency && skillPotency.physical > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-physical text-physical"
                        >
                          Phys. {skillPotency.physical}
                        </Badge>
                      )}
                      {skillPotency && skillPotency.magical > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs border-magical text-magical"
                        >
                          Mag. {skillPotency.magical}
                        </Badge>
                      )}

                      {/* Skill Categories */}
                      {skill.skillCategories?.map(category => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>

                    {/* Targets - only show if no combat results available */}
                    {!event.skillResults &&
                      event.targets &&
                      event.targets.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Targets:</span>{' '}
                          {event.targets.join(', ')}
                        </div>
                      )}
                  </div>
                ) : (
                  /* Fallback for events without skill data */
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.type.replace('_', ' ')}
                    </Badge>
                    {event.targets && event.targets.length > 0 && (
                      <span>→ {event.targets.join(', ')}</span>
                    )}
                  </div>
                )}

                {/* Combat Results */}
                {event.skillResults && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <CombatResultsSummary skillResults={event.skillResults} />
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
