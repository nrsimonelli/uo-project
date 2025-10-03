// Type to handle the readonly arrays from generated equipment files
export interface GeneratedEquipment {
  id: string
  name: string
  type: string
  stats: Record<string, unknown> // Use unknown to handle complex stat structures
  skillId: string | null
  nullifications: readonly string[]
  classRestrictions: readonly string[]
}
