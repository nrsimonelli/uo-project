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

### Code Quality & Development ✅

- [x] Set up **ESLint** with TypeScript rules
- [x] Configure **Prettier** for code formatting
- [x] Implement **automated import sorting** with logical grouping
- [x] Add **VS Code integration** for format-on-save
- [x] Update **README** with development workflow
- [x] Create **comprehensive project documentation**

---

## 📂 Phase 1.5 - Battle Engine (IN PROGRESS)

### Battle System 🚧

- [x] Start **battle engine** implementation (`core/battle-engine.ts`)
- [ ] Complete **initiative order** calculation
- [ ] Implement **action resolution** system
- [ ] Add **RNG seed utilities** for deterministic outcomes
- [ ] Hook up **condition evaluation** for skills/tactics
- [ ] Create **battle log format** (`types/battle-log.ts`)
- [ ] Write **battle simulation** function (team vs. team)
- [ ] Add **damage calculation** with equipment/skills
- [ ] Implement **status effects** and **condition tracking**

### Battle UI 🚧

- [ ] Create **battle viewer** component
- [ ] Add **battle controls** (start, pause, step-through)
- [ ] Implement **battle log display**
- [ ] Create **unit health/status** indicators
- [ ] Add **formation visualization** during battle

---

## 📂 Phase 2 - Tournament System

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

## 📂 Phase 3+ - Advanced Features

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

## 📂 Current Priority

**Focus:** Complete Phase 1.5 Battle Engine

- Finish battle simulation system
- Add battle UI components
- Test deterministic battle outcomes
- Prepare for Phase 2 tournament system
