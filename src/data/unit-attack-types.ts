export const UNIT_ATTACK_TYPE_MAP = {
  'Wyvern Knight': 'Ranged',
  'Wyvern Master': 'Ranged',
  'Gryphon Knight': 'Ranged',
  'Gryphon Master': 'Ranged',
  Featherbow: 'Ranged',
  Featherstaff: 'Ranged',
  Feathersword: 'Ranged',
  Feathershield: 'Ranged',
  Wereowl: 'Ranged',
  'Cavalry Knight': 'Melee',
  'Cavalry Master': 'Melee',
  Soldier: 'Melee',
  Sergeant: 'Melee',
  Knight: 'Melee',
  Paladin: 'Melee',
  Wizard: 'Ranged',
  Warlock: 'Ranged',
  Witch: 'Ranged',
  Sorceress: 'Ranged',
  Cleric: 'Ranged',
  Bishop: 'Ranged',
  Priestess: 'Ranged',
  'High Priestess': 'Ranged',
} as const

export type UnitClass = keyof typeof UNIT_ATTACK_TYPE_MAP
export type AttackType = (typeof UNIT_ATTACK_TYPE_MAP)[UnitClass]

export const getAttackTypeForUnit = (unitClass: string): 'Melee' | 'Ranged' => {
  return UNIT_ATTACK_TYPE_MAP[unitClass as UnitClass] || 'Melee'
}
