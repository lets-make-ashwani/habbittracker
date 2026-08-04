import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  runTransaction
} from 'firebase/firestore';
import { db } from '../firestore';
import type { WaterLog, SleepLog, MoodLog } from '../types';

export const healthRepository = {
  // Water Logs
  async getWaterLogs(uid: string): Promise<WaterLog[]> {
    const colRef = collection(db, 'users', uid, 'waterLogs');
    const querySnapshot = await getDocs(colRef);
    const logs: WaterLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as WaterLog);
    });
    return logs;
  },

  async saveWaterLogTransaction(
    uid: string, 
    log: WaterLog, 
    statsUpdate: { waterToday: number }
  ): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const waterDocRef = doc(db, 'users', uid, 'waterLogs', log.date);

    await runTransaction(db, async (transaction) => {
      transaction.set(waterDocRef, log);
      transaction.update(userDocRef, {
        'stats.waterToday': statsUpdate.waterToday,
        updatedAt: new Date().toISOString()
      });
    });
  },

  // Sleep Logs
  async getSleepLogs(uid: string): Promise<SleepLog[]> {
    const colRef = collection(db, 'users', uid, 'sleepLogs');
    const querySnapshot = await getDocs(colRef);
    const logs: SleepLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as SleepLog);
    });
    return logs;
  },

  async saveSleepLogTransaction(
    uid: string, 
    log: SleepLog, 
    statsUpdate: { sleepAverage: number }
  ): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const sleepDocRef = doc(db, 'users', uid, 'sleepLogs', log.date);

    await runTransaction(db, async (transaction) => {
      transaction.set(sleepDocRef, log);
      transaction.update(userDocRef, {
        'stats.sleepAverage': statsUpdate.sleepAverage,
        updatedAt: new Date().toISOString()
      });
    });
  },

  // Mood Logs
  async getMoodLogs(uid: string): Promise<MoodLog[]> {
    const colRef = collection(db, 'users', uid, 'moodLogs');
    const querySnapshot = await getDocs(colRef);
    const logs: MoodLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as MoodLog);
    });
    return logs;
  },

  async saveMoodLog(uid: string, log: MoodLog): Promise<void> {
    const docRef = doc(db, 'users', uid, 'moodLogs', log.date);
    await setDoc(docRef, log);
  }
};
