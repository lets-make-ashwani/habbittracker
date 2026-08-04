import { XP_PER_LEVEL } from '../constants/levels';
import type { UserStats } from '../types';

export const statsService = {
  // Calculates levels and leftover XP
  addXpAndLevel(currentXp: number, currentLevel: number, xpToAdd: number): { xp: number; level: number; levelUp: boolean } {
    let totalXp = currentXp + xpToAdd;
    let level = currentLevel;
    let levelUp = false;

    while (totalXp >= XP_PER_LEVEL) {
      level += 1;
      totalXp -= XP_PER_LEVEL;
      levelUp = true;
    }

    return {
      xp: totalXp,
      level,
      levelUp
    };
  },

  // Calculate new streak values for habit completions
  calculateStreakOnComplete(currentStreak: number, longestStreak: number): { streak: number; longestStreak: number } {
    const nextStreak = currentStreak + 1;
    return {
      streak: nextStreak,
      longestStreak: nextStreak > longestStreak ? nextStreak : longestStreak
    };
  },

  // Calculate new streak values when removing a completion
  calculateStreakOnUndo(currentStreak: number): { streak: number } {
    return {
      streak: Math.max(0, currentStreak - 1)
    };
  },

  // Recalculates user dashboard statistics
  calculateStatsDelta(
    currentStats: UserStats,
    delta: Partial<UserStats>
  ): UserStats {
    return {
      totalHabits: Math.max(0, currentStats.totalHabits + (delta.totalHabits ?? 0)),
      completedHabits: Math.max(0, currentStats.completedHabits + (delta.completedHabits ?? 0)),
      currentStreak: Math.max(0, currentStats.currentStreak + (delta.currentStreak ?? 0)),
      longestStreak: Math.max(currentStats.longestStreak, delta.longestStreak ?? 0),
      focusHours: parseFloat(Math.max(0, currentStats.focusHours + (delta.focusHours ?? 0)).toFixed(2)),
      waterToday: Math.max(0, currentStats.waterToday + (delta.waterToday ?? 0)),
      sleepAverage: parseFloat(Math.max(0, (currentStats.sleepAverage + (delta.sleepAverage ?? 0)) / (delta.sleepAverage ? 2 : 1)).toFixed(2)),
      completionRate: Math.round(
        Math.max(0, currentStats.totalHabits + (delta.totalHabits ?? 0)) > 0
          ? ((currentStats.completedHabits + (delta.completedHabits ?? 0)) / (currentStats.totalHabits + (delta.totalHabits ?? 0))) * 100
          : 0
      )
    };
  }
};
export default statsService;
