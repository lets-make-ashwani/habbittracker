import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firestore';
import type { ServiceResponse } from '../types';

export const migrationService = {
  // Current database version for User Profiles
  CURRENT_VERSION: 1,

  // Performs document upgrades if an older schema is detected
  async migrateUserProfile(uid: string): Promise<ServiceResponse<void>> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) return { success: true };

      const data = userSnap.data() as any;
      const docVersion = data.version || 0;

      if (docVersion < this.CURRENT_VERSION) {
        console.log(`[Migration] User profile version mismatch: detected v${docVersion}, current is v${this.CURRENT_VERSION}. Migrating...`);

        const migratedData = { ...data };

        // Migration step: v0 -> v1
        if (docVersion < 1) {
          if (!migratedData.ownedItems) {
            migratedData.ownedItems = ['default'];
          }
          if (!migratedData.preferences) {
            migratedData.preferences = {
              theme: 'default',
              language: 'en',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              darkMode: true,
              notificationsEnabled: true
            };
          }
          if (!migratedData.stats) {
            migratedData.stats = {
              totalHabits: 0,
              completedHabits: 0,
              currentStreak: 0,
              longestStreak: 0,
              focusHours: 0,
              waterToday: 0,
              sleepAverage: 0,
              completionRate: 0
            };
          }
          migratedData.version = 1;
        }

        await updateDoc(userDocRef, migratedData);
        console.log('[Migration] Migration to version 1 complete.');
      }
      
      return { success: true };
    } catch (e: any) {
      console.error('[Migration] Failed to migrate user profile:', e);
      return { success: false, error: e.message || 'Migration failed.' };
    }
  }
};
export default migrationService;
