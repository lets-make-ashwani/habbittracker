import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firestore';
import type { Habit, HabitLog, UserProfile } from '../types';

export const habitRepository = {
  async getHabits(uid: string): Promise<Habit[]> {
    const habitsColRef = collection(db, 'users', uid, 'habits');
    // Exclude soft-deleted habits
    const q = query(habitsColRef, where('isDeleted', '==', false));
    const querySnapshot = await getDocs(q);
    const habits: Habit[] = [];
    querySnapshot.forEach((docSnap) => {
      habits.push(docSnap.data() as Habit);
    });
    return habits;
  },

  async getHabit(uid: string, habitId: string): Promise<Habit | null> {
    const habitDocRef = doc(db, 'users', uid, 'habits', habitId);
    const docSnap = await getDoc(habitDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as Habit;
    }
    return null;
  },

  async createHabit(uid: string, habit: Habit): Promise<void> {
    const habitDocRef = doc(db, 'users', uid, 'habits', habit.id);
    await setDoc(habitDocRef, habit);
  },

  async updateHabit(uid: string, habitId: string, data: Partial<Habit>): Promise<void> {
    const habitDocRef = doc(db, 'users', uid, 'habits', habitId);
    await updateDoc(habitDocRef, data);
  },

  async getHabitLogs(uid: string): Promise<HabitLog[]> {
    const logsColRef = collection(db, 'users', uid, 'habitLogs');
    const querySnapshot = await getDocs(logsColRef);
    const logs: HabitLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as HabitLog);
    });
    return logs;
  },

  // Atomic transaction to log habit completion, update streaks, and allocate user XP & Coins
  async logHabitCompletionTransaction(
    uid: string, 
    habitId: string, 
    log: HabitLog, 
    streakUpdates: { streak: number; longestStreak: number },
    rewards: { xp: number; coins: number },
    statsUpdates: { completedIncrement: number }
  ): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const habitDocRef = doc(db, 'users', uid, 'habits', habitId);
    const logDocRef = doc(db, 'users', uid, 'habitLogs', log.id);

    await runTransaction(db, async (transaction) => {
      // 1. Get current user profile
      const userSnap = await transaction.get(userDocRef);
      if (!userSnap.exists()) throw new Error('User not found.');
      const user = userSnap.data() as UserProfile;

      // 2. Add log entry
      transaction.set(logDocRef, log);

      // 3. Update habit streaks
      transaction.update(habitDocRef, {
        streak: streakUpdates.streak,
        longestStreak: streakUpdates.longestStreak,
        updatedAt: new Date().toISOString()
      });

      // 4. Update user XP, Coins, and Stats
      let newXp = user.xp + rewards.xp;
      let newLevel = user.level;
      const xpPerLevel = 1000;
      if (newXp >= xpPerLevel) {
        newLevel += Math.floor(newXp / xpPerLevel);
        newXp = newXp % xpPerLevel;
      }

      transaction.update(userDocRef, {
        xp: newXp,
        level: newLevel,
        coins: user.coins + rewards.coins,
        'stats.completedHabits': Math.max(0, user.stats.completedHabits + statsUpdates.completedIncrement),
        updatedAt: new Date().toISOString()
      });
    });
  },

  // Atomic transaction to undo habit completion
  async undoHabitCompletionTransaction(
    uid: string, 
    habitId: string, 
    logId: string, 
    streakUpdates: { streak: number },
    deductions: { xp: number; coins: number },
    statsUpdates: { completedIncrement: number }
  ): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const habitDocRef = doc(db, 'users', uid, 'habits', habitId);
    const logDocRef = doc(db, 'users', uid, 'habitLogs', logId);

    await runTransaction(db, async (transaction) => {
      // 1. Get current user profile
      const userSnap = await transaction.get(userDocRef);
      if (!userSnap.exists()) throw new Error('User not found.');
      const user = userSnap.data() as UserProfile;

      // 2. Delete log entry
      transaction.delete(logDocRef);

      // 3. Update habit streaks
      transaction.update(habitDocRef, {
        streak: streakUpdates.streak,
        updatedAt: new Date().toISOString()
      });

      // 4. Update user XP, Coins, and Stats (ensure no negative values)
      let newXp = user.xp - deductions.xp;
      let newLevel = user.level;
      const xpPerLevel = 1000;
      if (newXp < 0) {
        if (newLevel > 1) {
          newLevel -= 1;
          newXp = xpPerLevel + newXp; // newXp is negative, so this subtracts from 1000
        } else {
          newXp = 0;
        }
      }

      transaction.update(userDocRef, {
        xp: newXp,
        level: newLevel,
        coins: Math.max(0, user.coins - deductions.coins),
        'stats.completedHabits': Math.max(0, user.stats.completedHabits + statsUpdates.completedIncrement),
        updatedAt: new Date().toISOString()
      });
    });
  }
};
