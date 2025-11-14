# Code Style Guide

This document outlines the coding standards and patterns used in this project. Reference this guide when starting new tasks to maintain consistency and avoid common pitfalls.

## Table of Contents

1. [Comments](#comments)
2. [Naming Conventions](#naming-conventions)
3. [File Organization](#file-organization)
4. [Functional Programming](#functional-programming)
5. [TypeScript Patterns](#typescript-patterns)
6. [React Patterns](#react-patterns)
7. [Testing Standards](#testing-standards)
8. [Code Reuse](#code-reuse)
9. [Control Flow](#control-flow)
10. [Styling](#styling)
11. [Examples](#examples)

---

## Comments

### ✅ DO: Explain "Why"

Comments should explain **why** something is the way it is, not **what** it does. The code itself should be self-explanatory.

**Good:**

```typescript
// Null itemId is valid (empty slot)
if (itemId === null) {
  return { isValid: true }
}

// If no class restrictions, anyone can equip it
if (equipment.classRestrictions.length === 0) return true
```

**Bad:**

```typescript
// Check if itemId is null
if (itemId === null) {
  return { isValid: true }
}

// Validate equipment
const validation = validateEquipment(item)
```

### ❌ NEVER: JSDoc that restates function names

**Bad:**

```typescript
/**
 * Validates a single unit object
 */
function validateUnit(unit: unknown) { ... }
```

**Good:**

```typescript
function validateUnit(unit: unknown) { ... }
```

Only add JSDoc when it provides meaningful context that isn't obvious:

- Complex business logic
- Non-obvious behavior (e.g., "consumes the buff if present")
- Important constraints or edge cases

---

## Naming Conventions

### Clear, Descriptive Names

Names should clearly communicate intent. Prefer longer, descriptive names over short, cryptic ones.

**Good:**

```typescript
const hasInvalidSkills = (team: Team) => { ... }
const calculateOnActiveHealAmount = (unit: BattleContext) => { ... }
const getEquipmentSlots = (classKey: AllClassType) => { ... }
```

**Bad:**

```typescript
const check = (t: Team) => { ... }
const calc = (u: BattleContext) => { ... }
const get = (c: AllClassType) => { ... }
```

### Function Names

- Use verbs for functions: `validate`, `calculate`, `get`, `apply`, `remove`
- Use nouns for values: `equipment`, `skillSlots`, `combatStats`
- Boolean functions/values: prefix with `is`, `has`, `can` (e.g., `isValid`, `hasAffliction`, `canGuard`)

---

## File Organization

### ❌ NO Re-exports / Index Files / Barrel Files

**Never create:**

- `index.ts` files that re-export from other files
- Barrel files that aggregate exports
- Re-exports of types or constants

**Why:** Re-exports create confusion about the source of truth and make refactoring harder.

**Instead:** Import directly from the source file:

```typescript
// ✅ Good
import { VALID_DEW_COUNTS } from '@/types/team'
import { GROWTH_VALUES } from '@/types/base-stats'

// ❌ Bad
import { VALID_DEW_COUNTS, GROWTH_VALUES } from '@/utils/validation-constants'
```

### Folder Structure

```text
src/
├── components/          # React components
│   ├── ui/             # Reusable UI primitives (shadcn/ui)
│   └── [feature]/      # Feature-specific components
├── core/               # Core business logic
│   ├── battle/         # Battle system logic
│   └── calculations/   # Stat/calculation utilities
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Pure utility functions
└── data/               # Static data files (JSON, constants)
```

### File Naming

- Components: `kebab-case.tsx` (e.g., `team-builder.tsx`, `mock-battle.tsx`)
- Utilities/Hooks: `kebab-case.ts` (e.g., `team-validation.ts`, `use-local-storage.ts`)
- Types: `kebab-case.ts` (e.g., `base-stats.ts`, `battle-engine.ts`)

---

## Functional Programming

### Pure Functions

Prefer pure functions that:

- Take inputs and return outputs
- Don't mutate external state
- Are predictable and testable

**Good Example:** `src/utils/team-validation.ts`

```typescript
export function validateTeamData(
  data: unknown
): ValidationResult & { data?: Record<string, Team> } {
  const errors: ValidationError[] = []
  // ... validation logic
  return { isValid: errors.length === 0, errors, data }
}
```

### Early Returns

Prefer early returns over deep nesting to reduce cognitive load. Use guard clauses to handle invalid cases first, then proceed with the main logic.

**Good Example:** `src/utils/team-repair.ts`

```typescript
function repairUnit(
  unit: unknown,
  unitPath: string,
  repairs: string[]
): Unit | null {
  if (!unit || typeof unit !== 'object' || Array.isArray(unit)) {
    repairs.push(`${unitPath}: Unit is not a valid object`)
    return null
  }

  const unitObj = unit as Record<string, unknown>

  if (typeof unitObj.id !== 'string' || !unitObj.id) {
    repairs.push(`${unitPath}: Missing or invalid id`)
    return null
  }

  if (typeof unitObj.name !== 'string' || !unitObj.name) {
    repairs.push(`${unitPath}: Missing or invalid name`)
    return null
  }

  if (typeof unitObj.classKey !== 'string' || !isValidClass(unitObj.classKey)) {
    repairs.push(`${unitPath}: Invalid classKey, removing unit from team`)
    return null
  }

  // Main logic continues here after all validation checks
  const classKey = unitObj.classKey
  // ...
}
```

**Bad:**

```typescript
function repairUnit(unit: unknown, unitPath: string, repairs: string[]) {
  if (unit && typeof unit === 'object' && !Array.isArray(unit)) {
    const unitObj = unit as Record<string, unknown>
    if (typeof unitObj.id === 'string' && unitObj.id) {
      if (typeof unitObj.name === 'string' && unitObj.name) {
        if (
          typeof unitObj.classKey === 'string' &&
          isValidClass(unitObj.classKey)
        ) {
          // Main logic buried deep inside nested conditions
          const classKey = unitObj.classKey
          // ...
        } else {
          repairs.push('Invalid classKey')
        }
      } else {
        repairs.push('Invalid name')
      }
    } else {
      repairs.push('Invalid id')
    }
  } else {
    repairs.push('Invalid unit')
  }
}
```

### Avoid Deep Nesting

Keep nesting levels to a minimum. Use early returns and guard clauses.

**Target:** Maximum 3-4 levels of nesting. If deeper, extract to a function.

---

## TypeScript Patterns

### Types, Constants, and Single Source of Truth

**Constants** should be grouped categorically in the `data/` or `types/` layer:

- Type-related constants → `src/types/` (e.g., `GROWTH_VALUES` in `base-stats.ts` with `GrowthType`)
- Data constants → `src/data/` (e.g., `ALL_CLASSES` in `constants.ts`)
- Domain-specific constants → `src/types/` (e.g., `VALID_DEW_COUNTS` in `team.ts` with `ValidDewCount`)

**Relocation Rule:** If a constant is imported in more than one file, it should be moved to the appropriate `data/` or `types/` file, not kept where it was first created.

**Why:** Categorical grouping makes constants discoverable and maintains a single source of truth. If the underlying type changes, the constant is in the same file.

**Good Example:** `src/types/team.ts`

```typescript
export type ValidDewCount = 0 | 1 | 2 | 3 | 4 | 5
export const VALID_DEW_COUNTS: readonly ValidDewCount[] = [
  0, 1, 2, 3, 4, 5,
] as const
```

**Good Example:** `src/types/base-stats.ts`

```typescript
export type GrowthType = 'All-Rounder' | 'Offensive' | 'Defensive' | ...
export const GROWTH_VALUES: readonly GrowthType[] = Object.values(GROWTHS) as GrowthType[]
```

### Type Definitions

- Define types close to where they're used
- Use `readonly` for arrays/objects that shouldn't be mutated
- Use `as const` for literal type inference

**Good:**

```typescript
export const OPERATORS = {
  gt: (value: number, threshold: number) => value > threshold,
  lt: (value: number, threshold: number) => value < threshold,
} as const
```

### Return Types

**Avoid explicit return types** unless there's a specific reason. Let TypeScript infer return types for straightforward functions.

**When to add return types:**

- Complex union types that benefit from explicit documentation
- Public API functions where the return type is part of the contract
- Functions where inference might be ambiguous or incorrect

**Good (inference):**

```typescript
export function validateTeamData(data: unknown) {
  const errors: ValidationError[] = []
  // ... logic
  return { isValid: errors.length === 0, errors }
}

export const getEquipmentSlots = (classKey: AllClassType) => {
  return CLASS_DATA[classKey].allowedSlots
}
```

**Good (explicit when needed):**

```typescript
export function validateTeamData(
  data: unknown
): ValidationResult & { data?: Record<string, Team> } {
  // Complex return type that benefits from being explicit
  // ...
}
```

**Bad (unnecessary explicit):**

```typescript
export function getEquipmentSlots(classKey: AllClassType): string[] {
  return CLASS_DATA[classKey].allowedSlots
}
```

### Prefer `const` over `let`

Use `const` by default. Only use `let` when reassignment is necessary.

**Good:**

```typescript
const expectedSlots = getEquipmentSlots(classKey)
const equipment: EquippedItem[] = []
```

**Bad:**

```typescript
let expectedSlots = getEquipmentSlots(classKey)
let equipment: EquippedItem[] = []
```

---

## React Patterns

### Functional Components Only

**❌ NO class components.** Use functional components with hooks.

**Good:**

```typescript
export const TeamBuilder = () => {
  const { teams, currentTeamId } = useTeam()
  // ...
}
```

### Custom Hooks

Extract reusable logic into custom hooks. Name them with `use` prefix.

**Good Example:** `src/hooks/use-local-storage.ts`

```typescript
export const useLocalStorage = <T>(
  key: LocalKey,
  initialValue: T,
  validator?: (data: unknown) => ValidationResult & { data?: T }
): [T, (value: T | ((val: T) => T)) => void, ValidationResult | null] => {
  // ...
}
```

**Good Example:** `src/hooks/use-modal-state.ts`

```typescript
export const useModalState = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen)
  const [searchTerm, setSearchTerm] = useState('')

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => {
    setOpen(false)
    setSearchTerm('')
  }, [])

  return { open, searchTerm, openModal, closeModal, updateSearchTerm, setOpen }
}
```

### Component Structure

1. Imports (external, then internal)
2. Types/interfaces
3. Component definition
4. Exports

---

## Testing Standards

### Use Real Data

**✅ DO:** Test with real skill/class/unit data from the codebase.

**Good:**

```typescript
import { ActiveSkillsMap } from '@/generated/skills-active'
import { CLASS_DATA } from '@/data/units/class-data'

const testUnit = {
  classKey: 'Knight' as AllClassType,
  level: 35,
  // ... real unit structure
}
```

**❌ DON'T:** Use mock/fake data that doesn't match real structures.

### Be Explicit

Test names and assertions should clearly state what is being tested.

**Good:**

```typescript
test('should apply burn damage at turn start based on burn level', () => {
  // ...
})
```

**Bad:**

```typescript
test('burn works', () => {
  // ...
})
```

---

## Code Reuse

### Leverage Existing Utilities

Before writing new code, check if similar functionality exists:

- `src/core/helpers.ts` - Common utilities (`isValidClass`, `getEquipmentSlots`)
- `src/utils/` - Validation, repair, and data processing utilities
- `src/hooks/` - Reusable React hooks

**Example:** Instead of writing custom validation, use:

```typescript
import { validateTeamData } from '@/utils/team-validation'
import { repairTeamData } from '@/utils/team-repair'
```

### Avoid Duplication

If you find yourself copying code blocks:

1. Extract to a shared utility function
2. Create a reusable hook if it involves React state
3. Move to a common location if it's used across features

### File Size

Keep files focused and reasonably sized. If a file exceeds ~400-500 lines:

- Extract related functions to separate files
- Group by feature/concern
- Consider splitting large components into smaller sub-components

**Good Example:** Validation logic split into:

- `team-validation.ts` - Team-level validation
- `equipment-validation-utils.ts` - Equipment-specific validation
- `skill-validation.ts` - Skill validation

---

## Control Flow

### ❌ Anti Patterns

**NEVER use:**

- `continue` - Use if-else blocks instead
- `switch` - Use lookup tables/objects instead
- `new Map()` - Use plain objects (`Record<string, T>`) instead
- `new Set()` - Use arrays with `includes()` checks instead
- Class components - Use functional components

---

## Styling

### Semantic Token Usage

Use semantic design tokens from your theme system. Don't hardcode colors or spacing values.

### Tailwind + `cn()` Utility

Always use the `cn()` utility from `src/lib/utils.ts` for className composition.

### ❌ NO Inline Styles

Never use inline `style` props. Use Tailwind classes or semantic tokens instead.

**Good:**

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'text-destructive p-4',
  condition && 'conditional-classes',
  anotherCondition && 'more-classes'
)}>
```

---

## Examples

Patterns to reference within the project

### 1. Validation Pattern

**File:** `src/utils/team-validation.ts`

- Clean, pure functions
- Early returns
- Clear error messages
- No unnecessary comments

### 2. Custom Hook Pattern

**File:** `src/hooks/use-local-storage.ts`

- Well-typed generic hook
- Handles edge cases (SSR, errors)
- Returns tuple for clean API
- Includes validation support

### 3. Utility Function Pattern

**File:** `src/core/tactical-utils.ts`

- Lookup tables instead of switch statements
- Pure functions
- Clear, descriptive names

### 4. Repair/Data Processing Pattern

**File:** `src/utils/team-repair.ts`

- Early returns
- No `continue` statements
- Clear error logging
- Handles edge cases gracefully

### 5. Component Pattern

**File:** `src/hooks/use-modal-state.ts`

- Simple, focused hook
- Uses `useCallback` appropriately
- Returns clean interface
- No unnecessary complexity

---

## Quick Checklist

Before submitting code, verify:

- [ ] No `continue`, `switch`, `new Map()`, `new Set()`, or class components
- [ ] Comments explain "why", not "what"
- [ ] No re-exports or barrel files
- [ ] Constants/types have single source of truth
- [ ] Used `const` instead of `let` where possible
- [ ] Early returns instead of deep nesting
- [ ] Leveraged existing utilities instead of duplicating
- [ ] Used `cn()` for className composition
- [ ] No inline styles
- [ ] Clear, descriptive names
- [ ] Tests use real data and are explicit

---

## Questions?

When in doubt:

1. Check existing similar code in the codebase
2. Reference the examples listed above
3. Prefer simplicity and clarity over cleverness
4. Ask for review if unsure about patterns
