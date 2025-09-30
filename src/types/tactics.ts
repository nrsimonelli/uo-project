import type { Condition } from './conditions'

export type Tactic = {
  kind: string
  conditions?: Condition
}
