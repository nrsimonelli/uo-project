// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: passive.json

export const PassiveSkills = [
  {
    "id": "firstAid",
    "type": "passive",
    "name": "First Aid",
    "description": "At the end of battle, restore 25% HP to an ally.",
    "pp": 1,
    "activationWindow": "endOfBattle",
    "targeting": {
      "group": "Ally",
      "pattern": "Single"
    },
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
    "pp": 1,
    "activationWindow": "beforeAllyAttacksActive",
    "targeting": {
      "group": "Ally",
      "pattern": "Single"
    },
    "effects": [
      {
        "kind": "GrantFlag",
        "flag": "TrueCritical",
        "duration": "NextAction"
      }
    ]
  },
  {
    "id": "luminousCover",
    "type": "passive",
    "name": "Luminous Cover",
    "description": "Cover an ally with medium Guard, grants ally 20% Defense.",
    "pp": 1,
    "activationWindow": "beforeAllyAttacked",
    "targeting": {
      "group": "Ally",
      "pattern": "Single"
    },
    "effects": [
      {
        "kind": "Cover",
        "guard": "medium"
      },
      {
        "kind": "Buff",
        "stat": "Defense",
        "value": 20,
        "scaling": "percent",
        "applyTo": "Target"
      }
    ]
  },
  {
    "id": "rapidOrder",
    "type": "passive",
    "name": "Rapid Order",
    "description": "Grant +20 Initiative to all allies.",
    "pp": 1,
    "activationWindow": "startOfBattle",
    "targeting": {
      "group": "Ally",
      "pattern": "All"
    },
    "effects": [
      {
        "kind": "Buff",
        "stat": "INIT",
        "value": 20,
        "scaling": "flat",
        "applyTo": "Target"
      }
    ]
  },
  {
    "id": "nobleGuard",
    "type": "passive",
    "name": "Noble Guard",
    "description": "Block enemy attack with medium guard, grants 20% Defense and grants +1 PP if you have 50% Health or less.",
    "pp": 1,
    "activationWindow": "beforeBeingHitPhys",
    "targeting": {
      "group": "Self",
      "pattern": "Single"
    },
    "effects": [
      {
        "kind": "Guard",
        "guard": "medium",
        "applyTo": "User"
      },
      {
        "kind": "Buff",
        "stat": "Defense",
        "value": 20,
        "scaling": "percent",
        "applyTo": "User"
      },
      {
        "kind": "ResourceGain",
        "resource": "PP",
        "amount": 1,
        "conditions": [
          {
            "kind": "Stat",
            "target": "Self",
            "stat": "HP",
            "comparator": "LessOrEqual",
            "value": 50,
            "percent": true
          }
        ]
      }
    ]
  }
] as const;

export type PassiveSkillsId = (typeof PassiveSkills)[number]["id"];

export type PassiveSkillsMap = {
  [K in PassiveSkillsId]: Extract<(typeof PassiveSkills)[number], { id: K }>;
};

export const PassiveSkillsMap: PassiveSkillsMap = Object.fromEntries(
  PassiveSkills.map(item => [item.id, item])
) as PassiveSkillsMap;
