import { 
  collection, 
  doc, 
  getDocs, 
  runTransaction
} from 'firebase/firestore';
import { db } from '../firestore';
import type { FocusSession, UserProfile } from '../types';

export const focusRepository = {
  async getFocusSessions(uid: string): Promise<FocusSession[]> {
    const colRef = collection(db, 'users', uid, 'focusSessions');
    const querySnapshot = await getDocs(colRef);
    const sessions: FocusSession[] = [];
    querySnapshot.forEach((docSnap) => {
      sessions.push(docSnap.data() as FocusSession);
    });
    return sessions;
  },

  async saveFocusSessionTransaction(
    uid: string, 
    session: FocusSession, 
    rewards: { xp: number; coins: number }, 
    statsUpdate: { focusHoursIncrement: number }
  ): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    const sessionDocRef = doc(db, 'users', uid, 'focusSessions', session.id);

    await runTransaction(db, async (transaction) => {
      // 1. Get current user profile
      const userSnap = await transaction.get(userDocRef);
      if (!userSnap.exists()) throw new Error('User not found.');
      const user = userSnap.data() as UserProfile;

      // 2. Write session doc
      transaction.set(sessionDocRef, session);

      // 3. Update user profile statistics & rewards
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
        'stats.focusHours': parseFloat((user.stats.focusHours + statsUpdate.focusHoursIncrement).toFixed(2)),
        updatedAt: new Date().toISOString()
      });
    });
  }
};
