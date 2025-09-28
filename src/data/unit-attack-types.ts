// Unit class to attack type mapping
export const UNIT_ATTACK_TYPE_MAP = {
  // Flying units always use Ranged attacks
  'Wyvern Knight': 'Ranged',
  'Wyvern Master': 'Ranged',
  'Gryphon Knight': 'Ranged',
  'Gryphon Master': 'Ranged',
  'Featherbow': 'Ranged',
  'Featherstaff': 'Ranged',
  'Feathersword': 'Ranged',
  'Feathershield': 'Ranged',
  'Wereowl': 'Ranged',
  
  // Cavalry units use Melee attacks
  'Cavalry Knight': 'Melee',
  'Cavalry Master': 'Melee',
  
  // Infantry/Ground units use Melee attacks
  'Soldier': 'Melee',
  'Sergeant': 'Melee',
  'Knight': 'Melee',
  'Paladin': 'Melee',
  
  // Caster units use Ranged attacks
  'Wizard': 'Ranged',
  'Warlock': 'Ranged',
  'Witch': 'Ranged',
  'Sorceress': 'Ranged',
  'Cleric': 'Ranged',
  'Bishop': 'Ranged',
  'Priestess': 'Ranged',
  'High Priestess': 'Ranged',
  
  // Add more unit classes as needed...
} as const

export type UnitClass = keyof typeof UNIT_ATTACK_TYPE_MAP
export type AttackType = typeof UNIT_ATTACK_TYPE_MAP[UnitClass]

// Helper function to get attack type for a unit class
export function getAttackTypeForUnit(unitClass: string): 'Melee' | 'Ranged' {
  return UNIT_ATTACK_TYPE_MAP[unitClass as UnitClass] || 'Melee' // Default to Melee
}