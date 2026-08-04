import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firestore';
import { habitRepository } from '../repositories/habit.repository';
import { userRepository } from '../repositories/user.repository';
import { statsService } from './stats.service';
import type { Habit, HabitLog, ServiceResponse } from '../types';

export const habitService = {
  async getHabits(uid: string): Promise<ServiceResponse<Habit[]>> {
    try {
      const habits = await habitRepository.getHabits(uid);
      return { success: true, data: habits };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to fetch habits.' };
    }
  },

  async addHabit(
    uid: string, 
    habitData: {
      title: string;
      description: string;
      emoji: string;
      color: string;
      category: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      targetTime: number;
    }
  ): Promise<ServiceResponse<Habit>> {
    try {
      const xpReward = habitData.difficulty === 'Easy' ? 10 : habitData.difficulty === 'Medium' ? 20 : 30;
      const coinReward = Math.floor(xpReward / 2);

      const newHabit: Habit = {
        id: `habit_${Date.now()}`,
        title: habitData.title,
        titleLowercase: habitData.title.toLowerCase(),
        description: habitData.description,
        emoji: habitData.emoji,
        color: habitData.color,
        category: habitData.category,
        difficulty: habitData.difficulty,
        xpReward,
        coinReward,
        targetTime: habitData.targetTime,
        streak: 0,
        longestStreak: 0,
        archived: false,
        version: 1,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date().toISOString(), // In real build we use serverTimestamp() or ISO
        updatedAt: new Date().toISOString()
      };

      await habitRepository.createHabit(uid, newHabit);
      
      // Update userStats totalHabits count
      const user = await userRepository.getUserProfile(uid);
      if (user) {
        const statsDelta = statsService.calculateStatsDelta(user.stats, { totalHabits: 1 });
        await userRepository.updateUserProfile(uid, { stats: statsDelta });
      }

      return { success: true, data: newHabit };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to add habit.' };
    }
  },

  async editHabit(uid: string, habitId: string, data: Partial<Habit>): Promise<ServiceResponse<void>> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      if (data.title) {
        updateData.titleLowercase = data.title.toLowerCase();
      }
      await habitRepository.updateHabit(uid, habitId, updateData);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to edit habit.' };
    }
  },

  // Atomic toggle: completing or undoing completion based on presence of log for dateStr
  async toggleHabitLog(uid: string, habitId: string, dateStr: string, noteText = ''): Promise<ServiceResponse<void>> {
    try {
      const habit = await habitRepository.getHabit(uid, habitId);
      if (!habit) return { success: false, error: 'Habit not found.' };

      // Query if log already exists
      const logsColRef = collection(db, 'users', uid, 'habitLogs');
      
      // Fallback query for exact string match on date
      const qSimple = query(logsColRef, where('habitId', '==', habitId));
      const querySnap = await getDocs(qSimple);
      let existingLog: HabitLog | null = null;

      querySnap.forEach(snap => {
        const l = snap.data() as HabitLog;
        // Check if date component matches
        // completedAt could be string or Timestamp
        const logDateStr = typeof l.completedAt === 'string' 
          ? l.completedAt.substring(0, 10) 
          : new Date((l.completedAt as any).seconds * 1000).toISOString().substring(0, 10);
        
        if (logDateStr === dateStr) {
          existingLog = l;
        }
      });

      if (existingLog) {
        // Toggle OFF (Undo Completion)
        const streakUpdates = statsService.calculateStreakOnUndo((existingLog as HabitLog).streakAfter);
        const deductions = {
          xp: habit.xpReward,
          coins: habit.coinReward
        };

        await habitRepository.undoHabitCompletionTransaction(
          uid,
          habitId,
          (existingLog as HabitLog).id,
          streakUpdates,
          deductions,
          { completedIncrement: -1 }
        );
      } else {
        // Toggle ON (Complete Habit)
        const streakUpdates = statsService.calculateStreakOnComplete(habit.streak, habit.longestStreak);
        const rewards = {
          xp: habit.xpReward,
          coins: habit.coinReward
        };

        const newLog: HabitLog = {
          id: `log_${habitId}_${dateStr}_${Date.now()}`,
          habitId,
          completedAt: new Date().toISOString(),
          earnedXP: habit.xpReward,
          earnedCoins: habit.coinReward,
          streakAfter: streakUpdates.streak,
          note: noteText,
          version: 1,
          createdAt: new Date().toISOString()
        };

        await habitRepository.logHabitCompletionTransaction(
          uid,
          habitId,
          newLog,
          streakUpdates,
          rewards,
          { completedIncrement: 1 }
        );
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to toggle habit completion.' };
    }
  },

  async archiveHabit(uid: string, habitId: string): Promise<ServiceResponse<void>> {
    try {
      await habitRepository.updateHabit(uid, habitId, { archived: true, updatedAt: new Date().toISOString() });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to archive habit.' };
    }
  },

  async deleteHabit(uid: string, habitId: string): Promise<ServiceResponse<void>> {
    try {
      // Soft delete
      await habitRepository.updateHabit(uid, habitId, { 
        isDeleted: true, 
        deletedAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      });

      // Update userStats totalHabits count
      const user = await userRepository.getUserProfile(uid);
      if (user) {
        const statsDelta = statsService.calculateStatsDelta(user.stats, { totalHabits: -1 });
        await userRepository.updateUserProfile(uid, { stats: statsDelta });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete habit.' };
    }
  }
};
export default habitService;
