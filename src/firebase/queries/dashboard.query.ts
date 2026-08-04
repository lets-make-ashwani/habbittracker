import { habitRepository } from '../repositories/habit.repository';
import { userRepository } from '../repositories/user.repository';
import type { ServiceResponse } from '../types';

export const dashboardQuery = {
  // Assembles aggregates for the dashboard view to avoid doing calculations on the UI thread
  async getDashboardSummary(uid: string): Promise<ServiceResponse<{
    name: string;
    level: number;
    xp: number;
    coins: number;
    currentStreak: number;
    longestStreak: number;
    theme: string;
    completionPercentage: number;
    activeHabitsCount: number;
  }>> {
    try {
      // 1. Get profile data
      const profile = await userRepository.getUserProfile(uid);
      if (!profile) return { success: false, error: 'User profile not found.' };

      // 2. Fetch habits
      const habits = await habitRepository.getHabits(uid);
      const activeHabits = habits.filter(h => !h.archived);

      // 3. Fetch logs for today (YYYY-MM-DD)
      const logs = await habitRepository.getHabitLogs(uid);
      const todayStr = new Date().toISOString().substring(0, 10);
      const todayLogs = logs.filter(l => {
        const logDate = typeof l.completedAt === 'string'
          ? l.completedAt.substring(0, 10)
          : new Date((l.completedAt as any).seconds * 1000).toISOString().substring(0, 10);
        return logDate === todayStr;
      });

      // 4. Calculate daily completion percentage
      const total = activeHabits.length;
      const completed = todayLogs.length;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        success: true,
        data: {
          name: profile.name,
          level: profile.level,
          xp: profile.xp,
          coins: profile.coins,
          currentStreak: profile.stats.currentStreak,
          longestStreak: profile.stats.longestStreak,
          theme: profile.preferences.theme,
          completionPercentage,
          activeHabitsCount: total
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to assemble dashboard summary.' };
    }
  }
};
export default dashboardQuery;
