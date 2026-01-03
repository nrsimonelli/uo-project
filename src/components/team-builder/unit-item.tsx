import { Button } from '@/components/ui/button'
import { SPRITES } from '@/data/sprites'

interface UnitItemProps {
  unitName: string
  onSelect: (unitName: string) => void
}

export function UnitItem({ unitName, onSelect }: UnitItemProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto p-3 text-left"
      onClick={() => onSelect(unitName)}
    >
      <div className="flex items-center gap-3 w-full">
        <img
          src={SPRITES[unitName as keyof typeof SPRITES]}
          height={32}
          width={32}
          alt={unitName}
        />
        <div className="font-medium">{unitName}</div>
      </div>
    </Button>
  )
}
