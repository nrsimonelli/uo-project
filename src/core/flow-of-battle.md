# Battle Resolution Specification

This document outlines the order of operations and interaction rules for combat resolution.

---

## 1. Team Structure

- Battles involve two teams of **1–6 units** arranged in 2×3 grids:
  - **Front row:** 3 tiles
  - **Back row:** 3 tiles
- Teams are stored as an array of units, representing their formation on the board.
- Units will not change position during combat.

---

## 2. Unit Structure

Each unit contains:

- Static attributes: `class`, `level`, `growthType`, `equipment`
- Derived attributes: `baseStats` (from class + level + growth), `totalStats` (base + equipment + buffs/debuffs)
- Dynamic attributes:
  - **Buffs** (temporary positive modifiers)
  - **Debuffs** (temporary negative modifiers)
  - **Afflictions** (special debuffs with unique rules, e.g., Burn, Poison)

---

## 3. Afflictions

- **Stun:** Unit is forced to use a hidden 0 AP “Clear Stun” action instead of their turn. Unit may not act, guard, evade, or use skills until this resolves.
- **Poison:** Unit takes 30% of max HP as damage on each active skill use.
- **Burn:** Unit takes flat 20 damage on each active skill use. Burn stacks with itself.
- **Freeze:** Unit may not act, guard, evade, or use skills until damaged by an attack. Frozen units remain valid targets for both allies and enemies.
- **Blind:** Unit’s next active or passive attack skill will automatically miss. Cleared after that attack attempt, even if it is True Strike.
- **Guard Seal:** Unit may not guard attacks or use guard skills.
- **Passive Seal:** Unit may not use passive skills.
- **Crit Seal:** Unit may not crit.
- **Deathblow:** HP is instantly set to 0.

**Notes:**

- All afflictions are debuffs, but not all debuffs are afflictions.
- Best practice: separate categories for **afflictions**, **debuffs**, and **buffs**.

---

## 4. Combat Rounds

- Combat progresses in **rounds**.
- Each round:
  - Units act in order of **initiative** (highest → lowest).
  - Initiative is **dynamic** and may change during combat.
- Each unit performs **one active skill** on its turn (if able).
- When every unit has acted, the next round begins using initiative order.
- Rounds continue until all units are out of **Action Points (AP)** or have been defeated.

---

## 5. Resources

- **Action Points (AP):** Determines how many active abilities a unit may use per round.
  - Base classes start with 1 AP.
  - Promoted classes start with 2 AP.
  - Equipment may increase or decrease AP.
- **Passive Points (PP):** Determines how many passive abilities a unit may activate per round.
  - Base classes start with 1 PP.
  - Promoted classes start with 2 PP.
  - Equipment may increase or decrease PP.

---

## 6. Ability Types

- **Active Abilities:** Selected by units on their turn, targeting enemies/allies according to ability definition, targeting rules, and player set tactics.
- **Passive Abilities:** Trigger on specific **activation windows**.
  - Most windows are **limited** (only one skill may trigger for that window).
  - Some are **unlimited** (all units with valid skills will resolve in initiative order).

---

## 7. Passive Ability Resolution

- For **limited windows**:
  - Only **one passive skill** may trigger.
  - If multiple units qualify, the **highest initiative unit** acts.
  - Each unit can only activate **one passive ability per active ability instance**.
- For **unlimited windows**:
  - All units with valid triggers act in initiative order.
  - Units may still only activate **one passive ability per active ability instance**.

---

## 8. Example Combat Flow

0. Per turn status effects are applied (e.g., Poison, Burn).
   - Burn/Poison resolve once per skill use, not per hit.
   - Stun resolves by replacing the turn with a hidden 0 AP “Clear Stun” action.
1. The fastest unit selects its **active ability** and target.
2. **Passive windows** before attack:
   - Allies checked for “Before an ally attacks” triggers.
   - Enemies checked for “Before an enemy attacks” triggers.
   - Enemies checked for “Before an ally is attacked” triggers.
   - Resolve according to initiative and window type.
3. **Hit resolution** for the active ability:
   - Roll for hit chance (modified by Blind, True Strike, etc.).
   - Roll for crit chance (unless negated).
   - Roll for guard (if valid and not negated).
   - Compute damage:  
     `(Attack – Defense) * (Potency/100) * Crit * Guard * Effectiveness`
   - Apply minimum damage = 1.
   - Apply rounding at final step.
4. Apply/resolve status effects (buffs, debuffs, afflictions).
5. **Post-hit windows:**
   - “After an enemy attacks”
   - “After an ally is damaged”
   - Additional passive triggers as defined.
6. Next unit in initiative order acts.
7. Continue until all units in round have acted.

---

## 9. Special Rules

- **Multiple Hits:** Each hit calculates crit, guard, and hit chance independently.
- **Defense/Attack Modifiers:** Traits like “Ignore 50% defense” are applied during `(Total Attack – Total Defense)`.  
  Potency modifiers apply during potency step.  
  Damage-received modifiers apply **after all multipliers** (crit, guard, effectiveness).
- **Affliction Damage:** Burn/Poison apply once per **active skill use**, not per hit.
- **End of Combat:** All buffs, debuffs, and statuses are cleared.

---

## 10. RNG Integration

- Combat uses a **seeded global RNG stream** for determinism.
- Rolls include but not limited to:
  - Hit chance
  - Crit chance
  - Guard chance
- Some traits or statuses may **skip rolls** entirely (e.g., Unguardable, True Strike, Guard Seal, Blind, Stun, Crit Seal).

---
