import { Button } from '../ui/button'

interface UnitItemProps {
  unitName: string
  onSelect: (unitName: string) => void
}

export function UnitItem({ unitName, onSelect }: UnitItemProps) {
  return (
    <Button
      variant='ghost'
      className='inline-flex justify-start w-full py-8'
      onClick={() => onSelect(unitName)}
    >
      <img
        src={`src/assets/sprites/${unitName}.png`}
        height={32}
        width={32}
        alt={unitName}
      />
      <div>{unitName}</div>
    </Button>
  )
}