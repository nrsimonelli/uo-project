# UO Project

UO Project is a web-based **auto-battler tournament system** inspired by _Unicorn Overlord_.  
It combines tactical depth, automated battles, and community-driven events into one platform.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd uo-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Generate types from data files**

   ```bash
   npm run gen:types
   ```

   This generates TypeScript types from JSON data files for skills, equipment, and other game content.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically (including import ordering)
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run gen:types` - Generate TypeScript types from JSON data

### Tech Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (built on Radix UI primitives)
- **Build Tool:** Vite
- **State Management:** React hooks + Context
- **Code Quality:** ESLint + Prettier with automated import sorting
- **Data:** JSON files with generated TypeScript types

---

## 🌟 What It Is

- A place to **build and customize teams** of units with unique classes, skills, and formations.
- A system for **automated battles** where strategy and preparation matter more than quick reflexes.
- A platform for **competitive and experimental play**, supporting both structured tournaments and casual mock battles.

---

## 🎯 Why It Exists

- To create a foundation for new players and experienced _Unicorn Overlord_ fans alike to share, enjoy, and build upon.

---

## 🧩 Core Concepts

- **Units** — The characters that make up a team. Each unit has stats, classes, levels, growth patterns, and equipment slots.
- **Teams** — Squads of up to 6 units arranged in a 2x3 grid formation with strategic positioning.
- **Skills** — Active and passive abilities that units can equip. Active skills cost AP, passive skills cost PP and trigger based on conditions.
- **Tactics** — Modifiers that influence skill behavior, targeting, and activation conditions. Each skill can have up to 2 tactics equipped.
- **Equipment** — Weapons, armor, and accessories that modify unit stats and may provide additional skills.
- **Battles** — Fully automated combat resolved by initiative order, skills, tactics, and deterministic RNG.
- **Formations** — Strategic unit positioning that affects combat flow and skill targeting.

---

## 📁 Project Structure

```
src/
├── assets/          # Static resources (sprites, images)
├── components/      # React components
│   ├── ui/         # shadcn/ui components (Radix UI primitives)
│   ├── team-builder/ # Team building interface
│   ├── unit-builder/ # Unit customization interface
│   └── battle/     # Battle UI components
├── core/           # Game logic and engine code
│   ├── battle/     # Complete battle engine system
│   │   ├── engine/ # State management, turn management
│   │   ├── combat/ # Damage calculation, skill execution
│   │   ├── evaluation/ # Tactics, condition evaluation
│   │   └── targeting/  # Skill and tactical targeting
│   └── calculations/ # Modular stat calculation system
│       ├── base-stats.ts      # Base stats, growth, AP/PP
│       ├── equipment-bonuses.ts # Equipment bonuses
│       ├── dual-equipment.ts   # Specialized dual equipment
│       ├── combat-calculations.ts # Damage, crit, guard
│       └── turn-order.ts      # Initiative and turn order
├── data/           # Static game data (JSON files)
├── generated/      # Auto-generated TypeScript from JSON data
├── hooks/          # Custom React hooks
├── scripts/        # Build and maintenance scripts
├── test/           # Test files and utilities
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

---

## ✨ Current Features

### Team Builder

- **Unit Management** — Add, remove, and position units in a 2x3 formation
- **Multiple Teams** — Manage up to 6 different team configurations
- **Import/Export** — Share team configurations via JSON

### Unit Customization

- **Level & Growth** — Adjust unit levels and growth patterns
- **Equipment System** — Equip weapons, armor, and accessories with class restrictions
- **Skill & Tactics** — Configure up to 10 skills per unit with tactical modifiers
- **Real-time Stats** — View calculated stats with equipment and level bonuses

### Skills & Tactics System

- **Active Skills** — Combat abilities that consume AP
- **Passive Skills** — Reactive abilities that trigger based on conditions
- **Tactical Modifiers** — Enhance skills with targeting, condition, and effect modifiers

### Battle System

- **Complete Battle Loop** — Fully functional end-to-end battle execution
- **Tactical System** — Registry-based system with 200+ tactical conditions
- **Skill Selection & Execution** — Priority-based skill selection with tactical targeting
- **Modular Architecture** — Organized battle system with specialized subsystems
- **Deterministic Combat** — Repeatable battles with seeded RNG

---

## 🛣️ Roadmap

### Phase 0.5 — Core Framework ✅

- View a unit’s stats, classes, and abilities.
- Modify levels, growths, and equipment.

---

### Phase 1 — Auto-Battler Framework ✅

- Core battle engine with deterministic outcomes and repeatable simulations.
- Unit viewer and team builder for creating, editing, and experimenting with squads.
- Comprehensive skill and tactics system allowing units to equip active/passive skills with tactical modifiers.
- Equipment system with class restrictions and stat modifications.
- Team formation builder with drag-and-drop unit positioning.
- Team import/export functionality for sharing configurations.

**Phase 1 Status:** ✅ Complete

---

### Phase 1.5 — Battle Engine & Tactics ✅

- **Complete Battle System Architecture** — Modular engine with specialized subsystems
- **Initiative & Turn Management** — Proper turn order with tiebreaking
- **Skill Effect System** — Complete condition evaluation and effect processing
- **Damage Calculation** — Full damage system with crits, guard, effectiveness
- **Modular Calculations** — Split calculations into focused, maintainable modules
- **Import Modernization** — All files converted to modern `@/` path aliases

**Phase 1.5 Status:** ✅ Complete

---

### Phase 2 — Tactical System Refinement & Testing 🚧

- **Tactical Condition Implementation** — Complete implementation of 200+ tactical conditions
- **Tactical Testing Framework** — Systematic testing of filter, sort, and skip evaluators
- **Target Selection Validation** — Test tactical targeting against skill groups (allies/enemies/self)
- **Edge Case Resolution** — Handle complex tactical scenarios and condition combinations
- **Battle Analytics Integration** — Connect tactical decision logging to UI

**Phase 2 Status:** 🚧 In Progress - Battle loop functional, refining tactical conditions

---

### Phase 3 — Automated Tournaments

- Players submit teams to asynchronous tournaments.
- Brackets resolve automatically, with results viewable live or through a replay/log format.
- Designed for fully automated events that anyone can enter or spectate.

---

### Phase 4+ — New Game Modes and Custom Content

- Custom classes and equipment allowing for more customized gameplay.
- Rogue-like game mode that challenges team building, strategy, and realtime descision making skills.
- Live PvP mode combining progressive team building through multiple rounds of comabat.
- Global Leaderboards, achievements, and seasonal events.

---

## 🔧 Development

### Code Quality & Formatting

This project uses ESLint and Prettier to maintain consistent code quality and formatting:

- **Modern Import System:** All imports use `@/` path aliases instead of relative paths
- **Import Organization:** Imports are automatically sorted into logical groups:
  - External packages (React, Lucide, etc.)
  - UI components (`../ui/*`)
  - Local components (`./component-name`)
  - Core utilities (`@/core/*`)
  - Hooks (`@/hooks/*`)
  - Types (`@/types/*`)
- **TypeScript Configuration:** Modernized without deprecated features

- **Automatic Formatting:** Code is formatted on save with Prettier
- **Lint Rules:** ESLint enforces code quality and catches common issues

### VS Code Setup

For the best development experience, the project includes VS Code settings that:

- Format code automatically on save
- Fix ESLint issues (including import ordering) on save
- Use Prettier as the default formatter

### Workflow Commands

```bash
# Check for issues
npm run lint

# Fix issues automatically
npm run lint:fix

# Format all code
npm run format

# Verify everything is clean
npm run lint && npm run format:check
```

---

## 🤝 Contributing

This project is in active development, with Phase 1 as the current focus.  
Contributions are welcome — whether that’s coding, new ideas, or feature suggestions.

---

## 📜 License

MIT License — open for community contributions.
