import type { RandomNumberGeneratorType } from '@/core/random'

export function mockRng(value: number): RandomNumberGeneratorType {
  return {
    seed: ['test'],
    random: () => value,
  }
}

export const mockRngPresets = {
  alwaysHit: () => mockRng(0.01),
  alwaysMiss: () => mockRng(0.99),
  alwaysCrit: () => mockRng(0.01),
  neverCrit: () => mockRng(0.99),
}
