import { habitRepository } from '../repositories/habit.repository';
import { userRepository } from '../repositories/user.repository';
import type { ServiceResponse } from '../types';

export const coachQuery = {
  // Compiles all profile details & active habits to pass as clean context for AI prompts
  async getCoachContext(uid: string): Promise<ServiceResponse<{
    userName: string;
    level: number;
    coins: number;
    stats: {
      currentStreak: number;
      longestStreak: number;
      focusHours: number;
      completionRate: number;
    };
    habits: {
      title: string;
      category: string;
      difficulty: string;
      streak: number;
      longestStreak: number;
    }[];
  }>> {
    try {
      const profile = await userRepository.getUserProfile(uid);
      if (!profile) return { success: false, error: 'User profile not found.' };

      const habits = await habitRepository.getHabits(uid);
      const activeHabits = habits.filter(h => !h.archived);

      const habitContext = activeHabits.map(h => ({
        title: h.title,
        category: h.category,
        difficulty: h.difficulty,
        streak: h.streak,
        longestStreak: h.longestStreak
      }));

      return {
        success: true,
        data: {
          userName: profile.name,
          level: profile.level,
          coins: profile.coins,
          stats: {
            currentStreak: profile.stats.currentStreak,
            longestStreak: profile.stats.longestStreak,
            focusHours: profile.stats.focusHours,
            completionRate: profile.stats.completionRate
          },
          habits: habitContext
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to assemble AI coach context.' };
    }
  }
};
export default coachQuery;
