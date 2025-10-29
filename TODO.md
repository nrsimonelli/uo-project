# ✅ TODO Checklist

## 📂 Phase 1 - Core Framework ✅ COMPLETE

### Data & Types ✅

- [x] Enter **base stats**, **classes**, and **growths** into `data/`
- [x] Define **core types** in `types/` (skills, conditions, equipment, team)
- [x] Create **codegen script** for skills and equipment (`scripts/generate-types.ts`)
- [x] Finalize **activation window** types
- [x] Build out **condition** types and variations
- [x] Complete **equipment system** with all weapon/armor types
- [x] Implement **skill and tactics** type system

### Team Builder ✅

- [x] Define **Team interface** (`types/team.ts`)
- [x] Implement **team management** with multiple team support
- [x] Create **team builder** component with drag & drop positioning
- [x] Add **team import/export** functionality
- [x] Build **unit search modal** with filtering
- [x] Implement **editable team names**
- [x] Add **isometric formation display**

### Unit Builder ✅

- [x] Define **Unit interface** and related types
- [x] Implement **stat growth calculation** (`core/calculations.ts`)
- [x] Create **unit factory** (`core/create-unit.ts`)
- [x] Build **unit customization** interface
- [x] Add **equipment management** with class restrictions
- [x] Implement **skill & tactics system** (10 skills per unit, 2 tactics per skill)
- [x] Create **skill selection modal** with filtering
- [x] Add **real-time stat calculations** with equipment bonuses

### Equipment System ✅

- [x] Complete **equipment data** (swords, axes, lances, bows, staves, shields, accessories)
- [x] Implement **equipment lookup** and filtering
- [x] Add **equipment search modal** with stat filtering
- [x] Create **equipment slot management**
- [x] Build **equipment stat calculations**

### Skills & Tactics ✅

- [x] Finalize **ActiveSkill** and **PassiveSkill** models
- [x] Add support for **hybrid damage** and complex effects
- [x] Implement **skill availability** based on class and level
- [x] Create **tactics system** with modifiers
- [x] Build **skill slot manager** for equipping/unequipping
- [x] Add **skill type filtering** (Active/Passive)
- [ ] Fatal Dive, Life Blow, and Desperation Damage Calculations
- [ ] Scaling for Bastards Cross, WildFang, Berserker, and Werebear scaling skills
- [ ] Custom effect for Discharge
- [ ] Need variable targeting for Row Resistance
- [ ] Need Reflect Magic...
- [ ] Need Mirror Weakness
- [ ] skill effect implementation audit

### Code Quality & Development ✅

- [x] Set up **ESLint** with TypeScript rules
- [x] Configure **Prettier** for code formatting
- [x] Implement **automated import sorting** with logical grouping

---

## 📂 Phase 1.5 - Battle Engine ✅ COMPLETE

### Battle System ✅

- [x] **Complete modular battle architecture** (`src/core/battle/`)
  - [x] `engine/` - State management, turn management, battlefield state
  - [x] `combat/` - Damage calculation, skill execution, effect processing
  - [x] `evaluation/` - Tactical and condition evaluation
  - [x] `targeting/` - Skill and tactical targeting systems
- [x] **Initiative order calculation** with proper tiebreaking
- [x] **Action resolution system** with complete turn management
- [x] **RNG seed utilities** for deterministic outcomes
- [x] **Battle state tracking** with comprehensive battlefield state
- [x] **Damage calculation system** with crits, guard, effectiveness
- [x] **Skill effect processing** with complete condition evaluation
- [x] **Status effects** and condition tracking systems

### Calculation System Refactor ✅

- [x] **Split calculations.ts** into focused modules:
  - [x] `base-stats.ts` - Base stat calculation, growth patterns, AP/PP
  - [x] `equipment-bonuses.ts` - Equipment bonuses with dual equipment support
  - [x] `dual-equipment.ts` - Specialized dual sword/shield calculations
  - [x] `combat-calculations.ts` - Damage, crit, guard mechanics
  - [x] `turn-order.ts` - Initiative-based turn order with tiebreaking

---

## 📲 Phase 2 - Tactical System Refinement 🚧 IN PROGRESS

### Tactical Condition Implementation 🚧

- [ ] **Condition Implementation Audit** - Review all 200+ conditions in `COMPLETE_TACTIC_METADATA`
- [ ] **Evaluator Implementation Status** - Map defined conditions to implemented evaluators
- [ ] **Missing Evaluator Implementation** - Implement evaluators for undefined conditions
- [ ] **Condition Logic Validation** - Verify each condition evaluates correctly
- [ ] **Group Context Testing** - Test conditions against correct target groups (allies/enemies/self)

### Tactical Testing Framework 🚧

- [ ] **Individual Tactic Testing** - Systematic testing of each condition type
- [ ] **Filter Evaluator Testing** - Test all filter conditions with edge cases
- [ ] **Sort Evaluator Testing** - Test all sort conditions with tie-breaking
- [ ] **Skip Evaluator Testing** - Test all skip conditions with boundary values
- [ ] **Integration Testing** - Test tactical condition combinations and conflicts

### Target Selection & Edge Cases 🚧

- [ ] **Group Reference Testing** - Verify ally/enemy/self targeting works correctly
- [ ] **Formation Condition Testing** - Test row/column/positioning conditions
- [ ] **Status Effect Integration** - Test status-based tactical conditions
- [ ] **Resource Condition Testing** - Test AP/PP/HP percentage conditions
- [ ] **Complex Scenario Testing** - Multi-tactic combinations and priority resolution

### Battle System Polish 🚧

- [ ] **Tactical Decision Logging** - Enhanced logging for tactical evaluation debugging
- [ ] **Performance Optimization** - Tactical evaluation performance tuning
- [ ] **Battle Analytics Integration** - Connect tactical reasoning to UI display
- [ ] **Edge Case Documentation** - Document known tactical behavior patterns

---

## 📂 Phase 3 - Tournament System

### Tournament Framework

- [ ] Design **tournament bracket** system
- [ ] Implement **asynchronous battle** processing
- [ ] Create **tournament registration** interface
- [ ] Add **bracket visualization**
- [ ] Build **tournament results** display

### Battle Replays

- [ ] Log **actions & outcomes** into structured JSON
- [ ] Add **replay parser** (`utils/replays.ts`)
- [ ] Create **replay viewer** (step through actions)
- [ ] Implement **replay sharing** functionality

---

## 📂 Phase 4+ - Advanced Features

### Custom Content

- [ ] Add **custom class** creation
- [ ] Implement **custom equipment** system
- [ ] Create **mod support** framework

### Game Modes

- [ ] Design **rogue-like** mode
- [ ] Implement **live PvP** system
- [ ] Add **seasonal events**
- [ ] Create **global leaderboards**

---

## 📲 Current Priority

**Focus:** Phase 2.0 Tactical System Refinement

- **Tactical Condition Implementation** - Complete implementation and testing of 200+ tactical conditions
- **Evaluator Framework Validation** - Ensure all condition types (filter/sort/skip) work correctly
- **Target Group Context Testing** - Verify tactical evaluation against proper skill targets (allies/enemies/self)
- **Edge Case Resolution** - Handle complex tactical combinations and priority conflicts
- **Testing Framework Expansion** - Systematic testing of all tactical behaviors

### Recent Achievements ✅

- **Complete Battle System Architecture** - Fully modular, organized battle engine
- **100% Tactical System Implementation** - All tactical conditions implemented
- **Modular Calculations System** - Split monolithic calculations into focused modules
- **Import System Modernization** - All files converted to modern `@/` path aliases
- **TypeScript Configuration Update** - Removed deprecated features, modernized setup
