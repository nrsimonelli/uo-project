// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: passive.json

export const PassiveSkills = [
  {
    "id": "first_aid",
    "name": "First Aid",
    "description": "At the end of battle, restore 25% HP to an ally.",
    "activationWindow": "end_of_battle",
    "targeting": {
      "type": "Ally",
      "includeSelf": false
    },
    "cost": 1,
    "effects": [
      {
        "type": "HealPercent",
        "value": 25
      }
    ]
  },
  {
    "id": "keen_call",
    "name": "Keen Call",
    "description": "Before an ally attacks, grant 100% critical rate for their next attack.",
    "activationWindow": "before_ally_attacks_active",
    "targeting": {
      "type": "Ally",
      "includeSelf": false
    },
    "cost": 1,
    "effects": [
      {
        "type": "CritBoost",
        "value": 100,
        "duration": "NextAction"
      }
    ]
  },
  {
    "id": "heavy_cover",
    "name": "Heavy Cover",
    "description": "Before an ally is attacked, cover an ally with a heavy guard.",
    "activationWindow": "before_ally_attacked",
    "targeting": {
      "type": "Ally",
      "includeSelf": false
    },
    "cost": 1,
    "limited": true,
    "effects": [
      {
        "type": "Cover",
        "style": "HeavyGuard"
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
