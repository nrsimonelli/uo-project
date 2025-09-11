// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: passive.json

export const PassiveSkills = [
  {
    "id": "firstAid",
    "type": "passive",
    "name": "First Aid",
    "description": "At the end of battle, restore 25% HP to an ally.",
    "ppCost": 1,
    "activationWindow": "EndOfBattle",
    "targeting": {
      "group": "Ally",
      "pattern": "Single"
    },
    "traits": [],
    "effects": [
      {
        "kind": "HealPercent",
        "value": 25
      }
    ]
  },
  {
    "id": "keenCall",
    "type": "passive",
    "name": "Keen Call",
    "description": "Before an ally attacks, grant 100% critical rate for their next attack.",
    "ppCost": 1,
    "activationWindow": "BeforeAllyAttacksActive",
    "targeting": {
      "group": "Ally",
      "pattern": "Single"
    },
    "traits": [],
    "effects": [
      {
        "kind": "CritBoost",
        "value": 100,
        "duration": "NextAction"
      }
    ]
  },
  {
    "id": "heavyCover",
    "type": "passive",
    "name": "Heavy Cover",
    "description": "Before an ally is attacked, cover them with a heavy guard.",
    "ppCost": 1,
    "activationWindow": "BeforeAllyAttacked",
    "targeting": {
      "group": "Ally",
      "pattern": "Single"
    },
    "traits": [],
    "effects": [
      {
        "kind": "Cover",
        "style": "heavyGuard"
      }
    ]
  }
] as const;

export type PassiveSkillsId = (typeof PassiveSkills)[number]["id"];

export type PassiveSkillsMap = {
  [K in PassiveSkillsId]: Extract<(typeof PassiveSkills)[number], { id: K }>;
};

export const PassiveSkillsMap: PassiveSkillsMap = Object.fromEntries(
  PassiveSkills.map(skill => [skill.id, skill])
) as PassiveSkillsMap;
