# Combat Calculations System (High-Level Draft)

## 1. Overview

Damage in combat is determined by the following formula:

`Damage = (Total Attack – Total Defense) × (Potency / 100) × Critical Multiplier × Guard Multiplier × Effectiveness`

- Minimum damage is always **1**.
- All randomness is resolved via a **global seeded RNG stream** for determinism and reproducibility (e.g., replays).
- Rounding occurs **after effectiveness**, rounding to the nearest whole number (never below 1).

---

## 2. Attack Calculation

### 2.1 Total Attack

- **Formula:**  
  `Base Attack + Equipment Bonuses + Enhancements + Buffs – Debuffs`
- **Variants:**
  - Physical Attack → use Physical Attack stat.
  - Magical Attack → use Magical Attack stat.
- **Hybrid Skills:**  
  If an ability deals both physical and magical damage, calculate separately for each type and sum the results.

---

## 3. Defense Calculation

### 3.1 Total Defense

- **Formula:**  
  `Base Defense + Equipment + Enhancements + Buffs & Debuffs`
- **Variants:**
  - Physical Defense → reduces physical damage.
  - Magical Defense → reduces magical damage.
- **Rules:**
  - Static contributions (base + equipment) never change during combat.
  - Buffs/debuffs can apply dynamically, often for one action but sometimes continuously.
  - Damage floor → final result cannot drop below **1 damage** after all modifiers.

---

## 4. Potency

### 4.1 Base Potency

- Defined by the skill/ability being used.
- Usually 100 and is specific to either physical or magical.
- Skills can have separate potency values for each.

### 4.2 Modifiers

- Buffs/debuffs can increase or decrease potency.
- Some skills conditionally raise potency based on target state (e.g., poisoned, stunned).

---

## 5. Critical Hits

### 5.1 Chance

- Determined by attacker’s **Crit stat** plus any active buffs/debuffs.
- RNG roll against Crit Chance decides outcome.
- Max chance effectively capped at 100% (no multiple crits per attack).

### 5.2 Multiplier

- Base Critical Multiplier = **1.5×**.
- Items and abilities can increase/decrease this value.
- Modifiers stack **additively** (e.g., 1.5 + 0.5 = 2.0).

---

## 6. Guard

### 6.1 Triggering Guard

- Guard is possible only against **physical attacks**.
- Determined by defender’s **Guard Rate** (base + equipment + modifiers).
- RNG roll decides whether a guard occurs.
- Replays must log which guard type occurred for determinism.

### 6.2 Guard Levels

- **Light Guard** → 25% damage reduction (unshielded).
- **Medium Guard** → 50% reduction (shielded).
- **Heavy Guard** → 75% reduction (great shielded).

---

## 7. Effectiveness

### 7.1 Conditions

- Based on class or skill traits.
- Current matchups:
  - Archer > Flying
  - Flying (Gryphon & Wyvern) > Cavalry
  - Cavalry > Infantry

### 7.2 Multiplier

- Always **×2** when effective.
- There are no overlapping effectiveness multipliers.

---

## 8. Order of Operations

1. **Attack – Defense**
2. Multiply by **Potency / 100**
3. Multiply by **Critical Multiplier**
4. Multiply by **Guard Multiplier**
5. Multiply by **Effectiveness**
6. Round to nearest whole number (minimum 1 damage).

---

## 9. RNG & Determinism

- All RNG pulls (crit, guard, hit/miss, status, ability procs) come from a **global seeded RNG stream**.
- Ensures identical results across replays.
- Each random event must log its outcome for replay validation.
