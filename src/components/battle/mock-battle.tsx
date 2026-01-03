import { AlertTriangle } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

import { BattleEventCard } from '@/components/battle/battle-event-card'
import { BattleRosterDisplay } from '@/components/battle/battle-roster'
import { IsometricFormationDisplay } from '@/components/isometric-formation/isometric-formation-display'
import { PageHeader } from '@/components/page-header'
import { PageLayout } from '@/components/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBattleEngine } from '@/hooks/use-battle-engine'
import { useTeam } from '@/hooks/use-team'
import { cn } from '@/lib/utils'
import type { Team } from '@/types/team'
import { hasInvalidSkills } from '@/utils/team-validation'

export function MockBattle() {
  const { teams } = useTeam()
  const [selectedAllyTeam, setSelectedAllyTeam] = useState<Team | null>(null)
  const [selectedEnemyTeam, setSelectedEnemyTeam] = useState<Team | null>(null)

  const {
    battleEvents,
    resultSummary,
    isExecuting,
    error,
    executeBattle,
    clearResults,
  } = useBattleEngine()

  // Simple animation state - just track if battle is complete
  const [showResults, setShowResults] = useState(false)

  // Filter out empty teams (teams with no units)
  const nonEmptyTeams = Object.values(teams).filter(team =>
    team.formation.some(unit => unit !== null)
  )

  const availableAllyTeams = nonEmptyTeams.filter(
    team => team.id !== selectedEnemyTeam?.id
  )
  const availableEnemyTeams = nonEmptyTeams.filter(
    team => team.id !== selectedAllyTeam?.id
  )

  const handleAllyTeamSelect = (teamId: string | null) => {
    if (!teamId) {
      setSelectedAllyTeam(null)
      return
    }
    const team = teams[teamId]
    if (team && !hasInvalidSkills(team)) {
      setSelectedAllyTeam(team)
    }
    // Don't select teams with invalid skills
  }

  const handleEnemyTeamSelect = (teamId: string | null) => {
    if (!teamId) {
      setSelectedEnemyTeam(null)
      return
    }
    const team = teams[teamId]
    if (team && !hasInvalidSkills(team)) {
      setSelectedEnemyTeam(team)
    }
    // Don't select teams with invalid skills
  }

  const allyTeamHasInvalidSkills = selectedAllyTeam
    ? hasInvalidSkills(selectedAllyTeam)
    : false
  const enemyTeamHasInvalidSkills = selectedEnemyTeam
    ? hasInvalidSkills(selectedEnemyTeam)
    : false

  const canStartBattle =
    selectedAllyTeam &&
    selectedEnemyTeam &&
    !allyTeamHasInvalidSkills &&
    !enemyTeamHasInvalidSkills

  const handleStartBattle = () => {
    if (selectedAllyTeam && selectedEnemyTeam && canStartBattle) {
      // Defending team (left) first, attacking team (right) second
      executeBattle(selectedAllyTeam, selectedEnemyTeam)
    }
  }

  const handleClearResults = () => {
    clearResults()
    setShowResults(false)
  }

  // Show results when battle completes
  useEffect(() => {
    if (resultSummary.winner && !showResults) {
      setShowResults(true)
    }
  }, [resultSummary.winner, showResults])

  // Reset state when battle starts
  useEffect(() => {
    if (isExecuting) {
      setShowResults(false)
    }
  }, [isExecuting])

  // Extract team roster data from battle-end event
  const battleEndEvent = useMemo(
    () => battleEvents.find(event => event.type === 'battle-end'),
    [battleEvents]
  )
  const teamRosters = battleEndEvent?.teamRosters

  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          title="Mock Battle"
          description="Select two teams to begin a mock battle"
        />

        {/* Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Team Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Defending Team Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Defending Team</label>
                  <Select
                    value={selectedAllyTeam?.id}
                    onValueChange={handleAllyTeamSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAllyTeams.map(team => {
                        const hasInvalid = hasInvalidSkills(team)
                        return (
                          <SelectItem
                            key={team.id}
                            value={team.id}
                            disabled={hasInvalid}
                            className={hasInvalid ? 'opacity-50' : ''}
                          >
                            <div className="flex items-center gap-2">
                              {hasInvalid && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span>
                                {team.name} (
                                {team.formation.filter(u => u !== null).length}{' '}
                                units)
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAllyTeam && (
                  <div className="flex justify-center pt-2">
                    <IsometricFormationDisplay
                      formation={selectedAllyTeam.formation}
                      orientation="right-facing"
                      onSelectTeam={() => {}}
                    />
                  </div>
                )}
              </div>

              {/* Attacking Team Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attacking Team</label>
                  <Select
                    value={selectedEnemyTeam?.id}
                    onValueChange={handleEnemyTeamSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEnemyTeams.map(team => {
                        const hasInvalid = hasInvalidSkills(team)
                        return (
                          <SelectItem
                            key={team.id}
                            value={team.id}
                            disabled={hasInvalid}
                            className={hasInvalid ? 'opacity-50' : ''}
                          >
                            <div className="flex items-center gap-2">
                              {hasInvalid && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span>
                                {team.name} (
                                {team.formation.filter(u => u !== null).length}{' '}
                                units)
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEnemyTeam && (
                  <div className="flex justify-center pt-2">
                    <IsometricFormationDisplay
                      formation={selectedEnemyTeam.formation}
                      orientation="left-facing"
                      onSelectTeam={() => {}}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive text-sm">
                <strong>Battle Error:</strong> {error}
              </div>
            )}

            {/* Invalid Skills Warning */}
            {(allyTeamHasInvalidSkills || enemyTeamHasInvalidSkills) && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-sm text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <div>
                    <strong>Invalid Skills Detected:</strong> One or both teams
                    have units with skills that are not valid for their current
                    level or equipment. Please fix these issues in the Team
                    Builder before starting a battle.
                  </div>
                </div>
              </div>
            )}

            {/* Battle Controls */}
            <div className="flex justify-center gap-4 pt-4">
              <Button
                size="lg"
                disabled={!canStartBattle || isExecuting}
                onClick={handleStartBattle}
              >
                {isExecuting ? 'Executing Battle...' : 'Start Battle'}
              </Button>

              {battleEvents.length > 0 && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleClearResults}
                >
                  Clear Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Battle Results and Event Log - Side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Battle Result Summary */}
          {resultSummary.winner && showResults && (
            <Card className="lg:sticky lg:top-6 lg:self-start">
              <CardHeader>
                <CardTitle className="text-center">
                  🏆 {resultSummary.winner} Wins!
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamRosters ? (
                  <BattleRosterDisplay teamRosters={teamRosters} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        Winner: {resultSummary.winner}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {resultSummary.endReason}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        Defending Team HP
                      </div>
                      <div className="text-2xl font-bold text-defending-team">
                        {resultSummary.teamHpPercentages[
                          'defending-team'
                        ]?.toFixed(1) || 0}
                        %
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        Attacking Team HP
                      </div>
                      <div className="text-2xl font-bold text-attacking-team">
                        {resultSummary.teamHpPercentages[
                          'attacking-team'
                        ]?.toFixed(1) || 0}
                        %
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Battle completed in {resultSummary.totalTurns} turns with{' '}
                  {resultSummary.totalEvents} events
                </div>
              </CardContent>
            </Card>
          )}

          {/* Battle Event Log */}
          <Card
            className={cn(
              'min-h-[400px]',
              resultSummary.winner && showResults ? '' : 'lg:col-span-2'
            )}
          >
            <CardHeader>
              <CardTitle>Battle Event Log</CardTitle>
            </CardHeader>
            <CardContent>
              {battleEvents.length > 0 ? (
                <ScrollArea className="h-[500px] w-full">
                  <div className="space-y-3">
                    {battleEvents.map(event => (
                      <BattleEventCard
                        key={event.id}
                        event={event}
                        totalEvents={battleEvents.length}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : canStartBattle ? (
                <div className="text-center space-y-4 py-16">
                  <div className="text-muted-foreground">
                    <div className="text-lg font-medium mb-2">
                      Ready to Battle!
                    </div>
                    <p className="text-sm">
                      {selectedAllyTeam?.name} vs {selectedEnemyTeam?.name}
                    </p>
                    <p className="text-xs mt-4">
                      Click "Start Battle" to begin the simulation
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">
                    Select both defending and attacking teams to start a battle
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
