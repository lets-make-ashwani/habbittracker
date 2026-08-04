import { habitRepository } from '../repositories/habit.repository';
import { healthRepository } from '../repositories/health.repository';
import type { ServiceResponse } from '../types';
import dayjs from 'dayjs';

export const analyticsQuery = {
  // Assembles complex stats including completions, category distribution, and mood correlation
  async getAnalyticsData(uid: string, timeframeDays = 30): Promise<ServiceResponse<{
    trendData: { date: string; Rate: number }[];
    categorySummary: { subject: string; Score: number; fullMark: number }[];
    moodCorrelation: {
      avgMoodHabitDone: number;
      avgMoodHabitMissed: number;
    };
  }>> {
    try {
      const habits = await habitRepository.getHabits(uid);
      const logs = await habitRepository.getHabitLogs(uid);
      const moodLogs = await healthRepository.getMoodLogs(uid);

      // 1. Completion trend line data
      const trendData = Array.from({ length: timeframeDays }, (_, idx) => {
        const d = dayjs().subtract(timeframeDays - 1 - idx, 'day');
        const dStr = d.format('YYYY-MM-DD');
        const dayLogs = logs.filter(l => {
          const lDate = typeof l.completedAt === 'string'
            ? l.completedAt.substring(0, 10)
            : new Date((l.completedAt as any).seconds * 1000).toISOString().substring(0, 10);
          return lDate === dStr;
        });
        
        const activeHabitsOnDate = habits.filter(h => {
          return !h.archived && dayjs(h.createdAt as string).isBefore(d.add(1, 'day'));
        });

        const rate = activeHabitsOnDate.length > 0 
          ? Math.round((dayLogs.length / activeHabitsOnDate.length) * 100)
          : 0;

        return {
          date: d.format('MMM DD'),
          Rate: rate
        };
      });

      // 2. Category performance (completions by category)
      const categories = ['Gym', 'Development', 'Health', 'Sleep', 'Mindfulness'];
      const categorySummary = categories.map(cat => {
        const catHabits = habits.filter(h => h.category === cat && !h.archived);
        const catHabitIds = catHabits.map(h => h.id);

        const catLogs = logs.filter(l => catHabitIds.includes(l.habitId));
        // Simple rating: percentage of category habits completed overall
        const totalPossibleCompletions = catHabits.length * timeframeDays;
        const actualCompletions = catLogs.length;
        const score = totalPossibleCompletions > 0 
          ? Math.round((actualCompletions / totalPossibleCompletions) * 100)
          : 0;

        return {
          subject: cat,
          Score: score,
          fullMark: 100
        };
      });

      // 3. Mood-to-Habit Correlation
      // Collect dates when gym workout was completed vs missed (h1 or any Gym category habit)
      const gymHabits = habits.filter(h => h.category === 'Gym');
      const gymHabitIds = gymHabits.map(h => h.id);

      const completedGymDates = logs
        .filter(l => gymHabitIds.includes(l.habitId))
        .map(l => typeof l.completedAt === 'string' 
          ? l.completedAt.substring(0, 10) 
          : new Date((l.completedAt as any).seconds * 1000).toISOString().substring(0, 10));

      const moodsOnCompletedDays = moodLogs.filter(m => completedGymDates.includes(m.date));
      const moodsOnMissedDays = moodLogs.filter(m => !completedGymDates.includes(m.date));

      const avgMoodHabitDone = moodsOnCompletedDays.length > 0
        ? parseFloat((moodsOnCompletedDays.reduce((acc, curr) => acc + curr.mood, 0) / moodsOnCompletedDays.length).toFixed(1))
        : 4.0;

      const avgMoodHabitMissed = moodsOnMissedDays.length > 0
        ? parseFloat((moodsOnMissedDays.reduce((acc, curr) => acc + curr.mood, 0) / moodsOnMissedDays.length).toFixed(1))
        : 3.2;

      return {
        success: true,
        data: {
          trendData,
          categorySummary,
          moodCorrelation: {
            avgMoodHabitDone,
            avgMoodHabitMissed
          }
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to fetch analytics.' };
    }
  }
};
export default analyticsQuery;
