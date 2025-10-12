import { useState, useEffect, useRef, useMemo } from 'react'

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

  // Ref for scroll area
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

  const handleAllyTeamSelect = (teamId: string) => {
    const team = teams[teamId]
    if (team) {
      setSelectedAllyTeam(team)
    }
  }

  const handleEnemyTeamSelect = (teamId: string) => {
    const team = teams[teamId]
    if (team) {
      setSelectedEnemyTeam(team)
    }
  }

  const canStartBattle = selectedAllyTeam && selectedEnemyTeam

  const handleStartBattle = () => {
    if (selectedAllyTeam && selectedEnemyTeam) {
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
              {/* Ally Team Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Home Team</label>
                  <Select onValueChange={handleAllyTeamSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAllyTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} (
                          {team.formation.filter(u => u !== null).length} units)
                        </SelectItem>
                      ))}
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

              {/* Enemy Team Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Away Team</label>
                  <Select onValueChange={handleEnemyTeamSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEnemyTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} (
                          {team.formation.filter(u => u !== null).length} units)
                        </SelectItem>
                      ))}
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
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                <strong>Battle Error:</strong> {error}
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
                      <div className="text-lg font-semibold">Home Team HP</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {resultSummary.teamHpPercentages['home-team']?.toFixed(
                          1
                        ) || 0}
                        %
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">Away Team HP</div>
                      <div className="text-2xl font-bold text-red-600">
                        {resultSummary.teamHpPercentages['away-team']?.toFixed(
                          1
                        ) || 0}
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
                <ScrollArea className="h-[500px] w-full" ref={scrollAreaRef}>
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
                    Select both home and away teams to start a battle
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
