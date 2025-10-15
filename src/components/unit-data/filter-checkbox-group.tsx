import { Checkbox } from '@/components/ui/checkbox'

interface FilterCheckboxGroupProps {
  title: string
  items: string[]
  selectedItems: string[]
  onToggle: (item: string) => void
  idPrefix: string
}

export function FilterCheckboxGroup({
  title,
  items,
  selectedItems,
  onToggle,
  idPrefix,
}: FilterCheckboxGroupProps) {
  if (items.length === 0) return null

  return (
    <div className="min-w-fit">
      <h5 className="font-medium mb-2 text-foreground text-sm whitespace-nowrap">
        {title}
      </h5>
      <div className="space-y-1">
        {items.map(item => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`${idPrefix}-${item}`}
              checked={selectedItems.includes(item)}
              onCheckedChange={() => onToggle(item)}
            />
            <label
              htmlFor={`${idPrefix}-${item}`}
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              {item}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
