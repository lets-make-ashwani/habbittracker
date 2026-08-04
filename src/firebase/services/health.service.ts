import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firestore';
import { healthRepository } from '../repositories/health.repository';
import type { WaterLog, SleepLog, MoodLog, ServiceResponse } from '../types';

export const healthService = {
  async logWater(uid: string, date: string, amountChange: number, target: number): Promise<ServiceResponse<void>> {
    try {
      const waterDocRef = doc(db, 'users', uid, 'waterLogs', date);
      const waterSnap = await getDoc(waterDocRef);

      let currentAmount = 0;
      if (waterSnap.exists()) {
        const data = waterSnap.data() as WaterLog;
        currentAmount = data.amount;
      }

      const updatedAmount = Math.max(0, currentAmount + amountChange);

      const waterLog: WaterLog = {
        id: `water_${date}`,
        amount: updatedAmount,
        target,
        date,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await healthRepository.saveWaterLogTransaction(uid, waterLog, { waterToday: updatedAmount });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to log water.' };
    }
  },

  async logSleep(uid: string, sleepLogData: Omit<SleepLog, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<void>> {
    try {
      const sleepLog: SleepLog = {
        id: `sleep_${sleepLogData.date}`,
        ...sleepLogData,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Calculate sleep average based on existing logs + new entry
      const existingLogs = await healthRepository.getSleepLogs(uid);
      const filtered = existingLogs.filter(s => s.date !== sleepLogData.date);
      const totalHours = filtered.reduce((sum, current) => sum + current.hours, 0) + sleepLogData.hours;
      const count = filtered.length + 1;
      const avg = parseFloat((totalHours / count).toFixed(2));

      await healthRepository.saveSleepLogTransaction(uid, sleepLog, { sleepAverage: avg });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to log sleep.' };
    }
  },

  async logMood(uid: string, moodLogData: Omit<MoodLog, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<void>> {
    try {
      const moodLog: MoodLog = {
        id: `mood_${moodLogData.date}`,
        ...moodLogData,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await healthRepository.saveMoodLog(uid, moodLog);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to log mood.' };
    }
  }
};
export default healthService;
