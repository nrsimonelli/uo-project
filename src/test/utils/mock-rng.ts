import type { RandomNumberGeneratorType } from '@/core/random'

/**
 * Simple mock RNG that returns predetermined values
 */
export function mockRng(value: number): RandomNumberGeneratorType {
  return {
    seed: ['test'],
    random: () => value,
  }
}

/**
 * Common RNG presets for testing
 */
export const mockRngPresets = {
  alwaysHit: () => mockRng(0.1),
  alwaysMiss: () => mockRng(0.9),
  alwaysCrit: () => mockRng(0.05),
  neverCrit: () => mockRng(0.5),
}
