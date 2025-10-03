import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { SPRITES } from '@/data/sprites'
import { EquipmentSlotIcon } from './equipment-icons'

import type { EquippedByInfo } from '@/hooks/use-equipment-manager'
import type { GeneratedEquipment } from '@/types/generated-equipment'
import type { EquipmentSlotType } from '@/types/equipment'

interface EquipmentItemProps {
  item: GeneratedEquipment
  equippedBy: EquippedByInfo | null
  isCurrentlyEquipped: boolean
  isEquippedByCurrentUnitElsewhere: boolean
  onSelect: (item: GeneratedEquipment) => void
}

export function EquipmentItem({
  item,
  equippedBy,
  isCurrentlyEquipped,
  isEquippedByCurrentUnitElsewhere,
  onSelect,
}: EquipmentItemProps) {
  const isDisabled = isCurrentlyEquipped || isEquippedByCurrentUnitElsewhere

  return (
    <Button
      variant='ghost'
      className='justify-start w-full p-4 h-auto border-b border-border/50 last:border-b-0'
      onClick={() => onSelect(item)}
      disabled={isDisabled}
    >
      <div className='flex items-start gap-3 w-full'>
        <div className='w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0'>
          <EquipmentSlotIcon
            // TODO: revisit later
            slotType={item.type as EquipmentSlotType}
            className='w-6 h-6'
          />
        </div>
        <div className='flex flex-col items-start gap-1 w-full min-w-0'>
          <div className='flex items-center gap-2 w-full'>
            <div className='font-medium truncate'>{item.name}</div>
            <EquipmentStatusBadge
              equippedBy={equippedBy}
              isCurrentlyEquipped={isCurrentlyEquipped}
              isEquippedByCurrentUnitElsewhere={
                isEquippedByCurrentUnitElsewhere
              }
            />
          </div>
          <EquipmentStats stats={item.stats} />
          <EquipmentSkill skillId={item.skillId} />
          <EquipmentRestrictions classRestrictions={item.classRestrictions} />
        </div>
      </div>
    </Button>
  )
}

interface EquipmentStatusBadgeProps {
  equippedBy: EquippedByInfo | null
  isCurrentlyEquipped: boolean
  isEquippedByCurrentUnitElsewhere: boolean
}

function EquipmentStatusBadge({
  equippedBy,
  isCurrentlyEquipped,
  isEquippedByCurrentUnitElsewhere,
}: EquipmentStatusBadgeProps) {
  if (isCurrentlyEquipped || isEquippedByCurrentUnitElsewhere) {
    return (
      <Badge variant='default' className='text-xs flex-shrink-0'>
        Current
      </Badge>
    )
  }

  if (equippedBy) {
    return (
      <Badge
        variant='secondary'
        className='text-xs flex-shrink-0 flex items-center gap-1 px-2 py-1'
      >
        <img
          src={SPRITES[equippedBy.unitClass]}
          alt={equippedBy.unitName}
          className='w-3 h-3 rounded-sm'
        />
        Equipped
      </Badge>
    )
  }

  return null
}

interface EquipmentStatsProps {
  stats: Record<string, unknown>
}

function EquipmentStats({ stats }: EquipmentStatsProps) {
  if (Object.keys(stats).length === 0) return null

  return (
    <div className='text-xs text-muted-foreground flex flex-wrap gap-2'>
      {Object.entries(stats)
        .slice(0, 4)
        .filter(([, value]) => typeof value === 'number')
        .map(([stat, value]) => (
          <span key={stat} className='bg-muted/50 px-1.5 py-0.5 rounded'>
            {stat}: +{String(value)}
          </span>
        ))}
    </div>
  )
}

interface EquipmentSkillProps {
  skillId: string | null
}

function EquipmentSkill({ skillId }: EquipmentSkillProps) {
  if (!skillId) return null

  return <div className='text-xs text-primary'>Skill: {skillId}</div>
}

interface EquipmentRestrictionsProps {
  classRestrictions: readonly string[]
}

function EquipmentRestrictions({
  classRestrictions,
}: EquipmentRestrictionsProps) {
  if (classRestrictions.length === 0) return null

  const displayText =
    classRestrictions.length > 3
      ? `${classRestrictions.slice(0, 3).join(', ')}... (+${
          classRestrictions.length - 3
        } more)`
      : classRestrictions.join(', ')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className='text-xs text-warning cursor-help'>
          Restricted to: {displayText}
        </div>
      </TooltipTrigger>
      <TooltipContent className='max-w-xs'>
        <div className='text-xs'>
          <div className='font-semibold mb-1'>Restricted to:</div>
          {classRestrictions.join(', ')}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
