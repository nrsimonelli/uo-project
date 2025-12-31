import { CostSymbols } from '@/components/cost-symbols'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-2">
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
              <p className="text-sm text-muted-foreground text-left whitespace-normal wrap-break-word">
                {skill.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CostSymbols
                  cost={skill.type === 'active' ? skill.ap : skill.pp}
                  type={skill.type}
                  symbolClassName="w-1.5 h-1.5"
                />
                <span>{skill.type === 'active' ? 'AP' : 'PP'}</span>
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
