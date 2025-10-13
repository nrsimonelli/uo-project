# Tactical System Implementation TODO

This document tracks the implementation status of all tactical conditions in the battle system.

## ✅ Completed Implementations

### Basic Filters (Working)

- [x] HP Percentage filters (`hp-percent`)
- [x] AP/PP filters (`ap`, `pp`)
- [x] Combatant Type filters (`combatant-type`)
- [x] Status filters (`status`)
- [x] Basic Formation filters (`front-row`, `back-row`, `daytime`, `nighttime`)
- [x] Full Column formation filter (`full-column`)
- [x] Row-based formation filters (`min-combatants`, `most-combatants`, `least-combatants`)

### Basic Sorts (Working)

- [x] HP Percentage sorts (`hp-percent`)
- [x] AP/PP sorts (`ap`, `pp`)
- [x] Combatant Type sorts (`combatant-type`)
- [x] Status sorts (`status`)
- [x] Formation sorts (`formation`)
- [x] Stats sorts (`stat-high`, `stat-low`)

## ❌ Missing/Incomplete Implementations

### 1. Average HP Filters (`hp-average`) - **HIGH PRIORITY**

**Status**: Not implemented
**Affects**: 8 tactics

- [ ] "Average HP is >25%"
- [ ] "Average HP is >50%"
- [ ] "Average HP is >75%"
- [ ] "Average HP is >100%"
- [ ] "Average HP is <25%"
- [ ] "Average HP is <50%"
- [ ] "Average HP is <75%"
- [ ] "Average HP is <100%"

**Implementation needed**: `filterHpAverage` function that calculates average HP of the target pool and filters based on that average.

### 2. Own HP/AP/PP Skip Conditions - **HIGH PRIORITY**

**Status**: Skip evaluators missing
**Affects**: 24 tactics

- [ ] "Own HP is <25%" through "Own HP is >100%" (8 tactics)
- [ ] "Own AP is 0" through "Own AP is 4 or More" (8 tactics)
- [ ] "Own PP is 0" through "Own PP is 4 or More" (8 tactics)

**Implementation needed**: These should be **skip conditions** that prevent the skill from being used if the user's own stats don't meet the criteria.

### 3. Enemy Presence Filters (`enemy-presence`) - **HIGH PRIORITY**

**Status**: Not implemented  
**Affects**: 20 tactics

- [ ] "No Infantry Enemies" through "No Angel Enemies" (10 tactics)
- [ ] "Infantry Enemies Present" through "Angel Enemies Present" (10 tactics)

**Implementation needed**: `filterEnemyPresence` function that checks if specific enemy types exist on the battlefield.

### 4. Attack History Filters (`attack-history`) - **MEDIUM PRIORITY**

**Status**: Partially implemented (placeholder logic)
**Affects**: 15 tactics

- [ ] "Physically Attacked"
- [ ] "Magically Attacked"
- [ ] "Row is Attacked"
- [ ] "Column is Attacked"
- [ ] "All Allies are Attacked"
- [ ] "Attacked by Infantry" through "Attacked by Angel" (10 tactics)

**Implementation needed**: Complete battle history tracking and proper attack history evaluation.

### 5. Unit Count Filters (`unit-count`) - **MEDIUM PRIORITY**

**Status**: Not implemented
**Affects**: 16 tactics

- [ ] "2 or More Enemies" through "5 or More Enemies" (4 tactics)
- [ ] "1 or Fewer Enemies" through "4 or Fewer Enemies" (4 tactics)
- [ ] "2 or More Allies" through "5 or More Allies" (4 tactics)
- [ ] "1 or Fewer Allies" through "4 or Fewer Allies" (4 tactics)

**Implementation needed**: `filterUnitCount` function that checks total count of allies/enemies on the battlefield.

### 6. User Condition Filters (`user-condition`) - **LOW PRIORITY**

**Status**: Partially implemented
**Affects**: 7 tactics

- [ ] "User" (self-targeting)
- [ ] "Other Combatants"
- [ ] "User is Buffed"
- [ ] "User is Debuffed"
- [ ] "First Action" through "Fifth Action" (5 tactics via `action-number`)

**Implementation needed**: Complete user condition evaluation, especially action number tracking.

### 7. Skip Evaluators - **CRITICAL**

**Status**: Several missing from registry
**Missing**:

- [ ] `skipFormation` - for formation-based skip conditions
- [ ] Proper own-stat skip evaluators
- [ ] Action number skip logic

## 🔧 Implementation Priority

### Critical (Blocking Core Gameplay)

1. **Own HP/AP/PP Skip Conditions** - Units should skip skills based on their own resource states
2. **Enemy Presence Filters** - Essential for tactical decision making

### High Priority (Common Use Cases)

3. **Average HP Filters** - Used for healing/support decisions
4. **Unit Count Filters** - Used for AoE skill decisions

### Medium Priority (Tactical Depth)

5. **Attack History Filters** - Adds reactive tactical behavior
6. **Complete Formation Logic** - Edge cases and advanced formations

### Low Priority (Polish)

7. **User Condition Edge Cases** - Refinements to user condition logic
8. **Action Number Tracking** - Turn-based tactical conditions

## 🚧 Implementation Notes

### Data Requirements

- **Battle History**: Need to track attack types, sources, and targets
- **Action Counting**: Need to track which action number this is for each unit
- **Formation Analysis**: Need efficient column/row analysis utilities

### Architecture Considerations

- All skip conditions should be evaluated before target filtering
- Battle history requires persistent state tracking
- Unit counting needs real-time battlefield analysis

### Testing Strategy

- Create test units with each tactical condition
- Verify skills are used/skipped appropriately
- Test edge cases (empty battlefields, single units, etc.)

## 🎯 Skill Effect Implementation TODO

### Critical Effect Systems - **HIGH PRIORITY**

#### 1. Stackable Buffs System

**Status**: Partially implemented (types updated, logic missing)
**Affects**: Cavalier Call, Enrage, Vengeful Guard, Vengeance

- [ ] Update effect processor to handle `stacks: true` buffs
- [ ] Modify battle state to track stacked buff instances
- [ ] Update condition evaluator to work with stacked values
- [ ] Consider maximum stack limits
- [ ] Update UI display for stacked buff values

#### 2. Dynamic Damage Scaling

**Status**: Partially implemented (skill structure ready)
**Affects**: Vengeful Axe, potentially Bastard's Cross and others

- [x] Add PotencyBoost structure to Vengeful Axe with HP condition
- [x] Update code comments referencing both Bastard's Cross and Vengeful Axe
- [ ] Implement proportional HP-based scaling logic (currently binary condition)
- [ ] Create dynamic potency calculation based on missing HP percentage
- [ ] Replace simple threshold with scaling formula (0% HP = +100 potency, 100% HP = +0 potency)
- [ ] Consider stat-based scaling for future skills

#### 3. HP Consumption Effects

**Status**: Partially implemented (types and skill data updated)
**Affects**: Dark Flame (30% HP cost), Demonic Pact (25% HP sacrifice)

- [x] Create new SacrificeEffect type for HP consumption
- [x] Add SacrificeEffect to Dark Flame and Demonic Pact skills
- [ ] Implement SacrificeEffect processing in effect processor
- [ ] Ensure units don't die from self-inflicted damage unless intended
- [ ] Add validation for sufficient HP before skill use
- [ ] Handle timing: Dark Flame (pre-attack), Demonic Pact (post-skill)

### Medium Priority Effect Systems

#### 4. Advanced Condition Types

**Status**: Missing condition evaluators
**Affects**: Dark Flame and other conditional skills

- [ ] **HasDebuff condition** - Check if target has any active debuffs
- [ ] **FirstHitGuarded condition** - Already added to types, verify evaluator
- [ ] Expand condition system for complex skill interactions

#### 5. Life Steal Effects

**Status**: Types exist, implementation uncertain
**Affects**: Sanguine Arts (50% life steal on next attack)

- [ ] Verify LifeSteal effect implementation in effect processor
- [ ] Ensure healing scales with actual damage dealt
- [ ] Test with multi-hit attacks and critical strikes
- [ ] Handle life steal with damage-over-time effects

### Implementation Notes

- **Stackable Buffs**: Most critical as multiple skills already use this mechanic
- **HP Scaling**: Complex but essential for damage variety
- **HP Consumption**: Needs careful balance to avoid accidental unit death
- **Condition Types**: Foundation for many future skill mechanics

## 📊 Statistics

- **Total Tactics**: 146
- **Implemented**: 47 (32%)
- **Missing/Incomplete**: 99 (68%)
- **Critical Missing**: 32 (22%)
- **High Priority Missing**: 44 (30%)
- **Skill Effects Missing**: 5 major systems
