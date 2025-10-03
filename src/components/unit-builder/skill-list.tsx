import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AvailableSkill } from '@/utils/skill-availability'

interface SkillListProps {
  skills: AvailableSkill[]
  onSkillSelect: (skill: AvailableSkill) => void
}

export function SkillList({ skills, onSkillSelect }: SkillListProps) {
  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center space-y-2">
        <p className="font-medium">No skills available</p>
        <p className="text-sm">
          This unit may need a higher level to unlock class skills, or try
          equipping items that provide skills.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] w-full">
      <div className="space-y-2 p-1">
        {skills.map((availableSkill, index) => {
          const { skill, source, level } = availableSkill

          return (
            <Button
              key={`${skill.id}-${source}-${index}`}
              variant="outline"
              className="w-full justify-start h-auto p-3 text-left"
              onClick={() => onSkillSelect(availableSkill)}
            >
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    {level && (
                      <Badge variant="secondary" className="text-xs">
                        Lv {level}
                      </Badge>
                    )}
                    <Badge
                      variant={source === 'class' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {source === 'class' ? 'Class' : 'Equipment'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {skill.type === 'active' ? 'Active' : 'Passive'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  {skill.description}
                </p>
                {skill.type === 'active' && (
                  <div className="text-xs text-muted-foreground">
                    AP Cost: {skill.ap}
                  </div>
                )}
                {skill.type === 'passive' && (
                  <div className="text-xs text-muted-foreground">
                    PP Cost: {skill.pp}
                  </div>
                )}
              </div>
            </Button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
