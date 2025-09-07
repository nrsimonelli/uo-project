export const mockSkillList = [
  {
    skillId: 'iron_crusher',
    conditions: [
      { type: 'TargetHasTrait', trait: 'Armored' },
      { type: 'TargetStat', stat: 'HP', comparator: 'highest' },
    ],
  },
  {
    skillId: 'iron_rusher',
    conditions: [
      { type: 'SelfResource', resource: 'AP', comparator: '>=', value: 2 },
      { type: 'TargetStat', stat: 'PDEF', comparator: 'lowest' },
    ],
  },
  {
    skillId: 'iron_usher',
    conditions: [{ type: 'TargetStat', stat: 'HP', comparator: 'lowest' }],
  },
]
