export interface AchievementDefinitionSeed {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  rewardXP: number;
  rewardCoins: number;
}

export const initialAchievementDefinitions: AchievementDefinitionSeed[] = [
  {
    id: 'a1',
    title: 'First Step',
    description: 'Complete your first habit.',
    icon: '🚀',
    target: 1,
    rewardXP: 100,
    rewardCoins: 50
  },
  {
    id: 'a2',
    title: 'Super Coder',
    description: 'Complete the Code Daily Routine for 10 days in a row.',
    icon: '⚡',
    target: 10,
    rewardXP: 250,
    rewardCoins: 100
  },
  {
    id: 'a3',
    title: 'Hydro Homie',
    description: 'Meet your 3L water hydration target 15 times.',
    icon: '🔱',
    target: 15,
    rewardXP: 150,
    rewardCoins: 75
  },
  {
    id: 'a4',
    title: 'Perfect Week',
    description: 'Complete all habits in a single week.',
    icon: '👑',
    target: 7,
    rewardXP: 500,
    rewardCoins: 250
  },
  {
    id: 'a5',
    title: 'Habit Overlord',
    description: 'Unlock a lifetime streak of 30 days on any habit.',
    icon: '🪐',
    target: 30,
    rewardXP: 1000,
    rewardCoins: 500
  },
  {
    id: 'a6',
    title: 'Mindfulness Master',
    description: 'Log 10 journal reflections.',
    icon: '🧘‍♂️',
    target: 10,
    rewardXP: 200,
    rewardCoins: 100
  }
];
