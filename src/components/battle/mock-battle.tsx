import { useState } from 'react'

import { BattleEventCard } from '@/components/battle/battle-event-card'
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
import type { Team } from '@/types/team'

export function MockBattle() {
  const { teams } = useTeam()
  const [selectedAllyTeam, setSelectedAllyTeam] = useState<Team | null>(null)
  const [selectedEnemyTeam, setSelectedEnemyTeam] = useState<Team | null>(null)

  const { battleEvents, isExecuting, error, executeBattle, clearResults } =
    useBattleEngine()

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
  }

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

        {/* Battle Event Log */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle>Battle Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            {battleEvents.length > 0 ? (
              <ScrollArea className="h-[350px] w-full">
                <div className="space-y-3">
                  {battleEvents.map(event => (
                    <BattleEventCard key={event.id} event={event} />
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
    </PageLayout>
  )
}
