# ✅ TODO Checklist

## 📂 Data & Types

- [x] Enter **base stats**, **classes**, and **growths** into `data/`
- [x] Define **core types** in `types/` (skills, conditions, combat flow)
- [x] Create **codegen script** for skills (`scripts/generate-typess.ts`)

---

## 📂 Skills

- [ ] Finalize **ActiveSkill** and **PassiveSkill** models in `types/skills.ts`
- [ ] Add support for **hybrid damage** (physical + magical) in `skills.ts`
- [ ] Expand **conditions.ts** with new categories (combatant type, prioritize rules)
- [ ] Write sample **skills.json** entries (attack, heal, buff, conditional effect)
- [ ] Validate generated `skills.ts` against schema

---

## 📂 Units

- [ ] Define **Unit interface** (`types/unit.ts`)
- [ ] Implement **stat growth calculation** (`utils/stats.ts`)
- [ ] Create `unitFactory.ts` for generating units from base data
- [ ] Add equipment hooks (empty placeholder for now)

---

## 📂 Battle Engine

- [ ] Implement **initiative order** (`engine/initiative.ts`)
- [ ] Implement **action resolution** (`engine/actions.ts`)
- [ ] Add **RNG seed utilities** for deterministic outcomes
- [ ] Hook up **condition evaluation** (`engine/conditions.ts`)
- [ ] Create **battle log format** (`types/log.ts`)
- [ ] Write minimal **simulateBattle.ts** (team vs. team, returns log)

---

## 📂 Viewer & Teams

- [ ] Define **Team interface** (`types/team.ts`)
- [ ] Implement `teamFactory.ts` (build team from JSON/config)
- [ ] Basic **unit viewer** component (stats + skills)
- [ ] Basic **team builder** component (add/remove/edit units)

---

## 📂 Replays

- [ ] Log **actions & outcomes** into structured JSON
- [ ] Add **replay parser** (`utils/replays.ts`)
- [ ] Simple **replay viewer** (step through actions)

---

## 📂 Phase 1 Completion Criteria

- [ ] User can create/edit two teams
- [ ] Run `simulateBattle(teamA, teamB)` with deterministic results
- [ ] Output replay log for match
- [ ] Replay log can be replayed step-by-step
