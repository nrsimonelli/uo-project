import type { GROWTH_RANKS, GROWTHS, STATS } from '../data/constants'
import { ADVANCED_CLASSES, BASE_CLASSES } from '../data/class-types'

export type GrowthKey = keyof typeof GROWTHS
export type GrowthType = (typeof GROWTHS)[GrowthKey]
export type GrowthTuple = [GrowthType, GrowthType]

export type GrowthRank = keyof typeof GROWTH_RANKS

export type StatKey = keyof typeof STATS
export type StatValue = (typeof STATS)[StatKey]

type BaseClassKey = keyof typeof BASE_CLASSES
export type BaseClassType = (typeof BASE_CLASSES)[BaseClassKey]

type AdvancedClassKey = keyof typeof ADVANCED_CLASSES
export type AdvancedClassType = (typeof ADVANCED_CLASSES)[AdvancedClassKey]

export type AllClassType = BaseClassType | AdvancedClassType
