import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useAppDispatch } from '../store';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';
import { migrationService } from '../firebase/migrations/migration.service';
import { 
  setProfileData, 
  setHabits, 
  setHabitLogs, 
  setWaterLogs, 
  setSleepLogs, 
  setMoodLogs, 
  setFocusSessions, 
  setJournalEntries,
  logoutUser
} from '../store';

export const useFirebaseSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(`[useFirebaseSync] User authenticated: ${user.uid}. Starting sync...`);
        
        // 1. Run migrations if necessary
        await migrationService.migrateUserProfile(user.uid);

        // 2. Setup Firestore Listeners
        
        // Listener 1: User Profile Document
        const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            dispatch(setProfileData({
              isLoggedIn: true,
              name: data.name || 'User',
              avatar: data.photoURL || '🔮',
              email: data.email || '',
              level: data.level || 1,
              xp: data.xp || 0,
              coins: data.coins || 0,
              streak: data.stats?.currentStreak || 0,
              longestStreak: data.stats?.longestStreak || 0,
              unlockedThemes: data.ownedItems || ['default'],
              currentTheme: data.preferences?.theme || 'default',
              twoFactorEnabled: data.preferences?.twoFactorEnabled || false
            }));
          }
        }, (err) => console.error('Error listening to user profile:', err));

        // Listener 2: Habits Subcollection (filter out soft-deleted habits)
        const habitsRef = collection(db, 'users', user.uid, 'habits');
        const habitsQuery = query(habitsRef, where('isDeleted', '==', false));
        const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
          const habitsList: any[] = [];
          snapshot.forEach((docSnap) => {
            const h = docSnap.data();
            habitsList.push({
              id: h.id,
              name: h.title, // UI compatibility mapping
              title: h.title,
              category: h.category,
              difficulty: h.difficulty,
              estimatedTime: h.targetTime, // UI compatibility mapping
              targetTime: h.targetTime,
              streak: h.streak || 0,
              longestStreak: h.longestStreak || 0,
              emoji: h.emoji || '🎯',
              color: h.color || '#6366F1',
              createdAt: h.createdAt,
              archived: h.archived || false,
              tags: h.tags || []
            });
          });
          dispatch(setHabits(habitsList));
        }, (err) => console.error('Error listening to habits:', err));

        // Listener 3: Habit Logs Subcollection
        const logsRef = collection(db, 'users', user.uid, 'habitLogs');
        const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
          const logsList: any[] = [];
          snapshot.forEach((docSnap) => {
            const l = docSnap.data();
            const completedAtISO = typeof l.completedAt === 'string'
              ? l.completedAt
              : new Date(l.completedAt.seconds * 1000).toISOString();
            
            logsList.push({
              id: l.id,
              habitId: l.habitId,
              date: completedAtISO.substring(0, 10), // YYYY-MM-DD
              status: 'completed',
              notes: l.note || '',
              timestamp: completedAtISO,
              xpEarned: l.earnedXP || 0
            });
          });
          dispatch(setHabitLogs(logsList));
        }, (err) => console.error('Error listening to habit logs:', err));

        // Listener 4: Water Logs Subcollection
        const waterRef = collection(db, 'users', user.uid, 'waterLogs');
        const unsubscribeWater = onSnapshot(waterRef, (snapshot) => {
          const waterList: any[] = [];
          snapshot.forEach((docSnap) => {
            const w = docSnap.data();
            waterList.push({
              date: w.date,
              amount: w.amount,
              target: w.target
            });
          });
          dispatch(setWaterLogs(waterList));
        }, (err) => console.error('Error listening to water logs:', err));

        // Listener 5: Sleep Logs Subcollection
        const sleepRef = collection(db, 'users', user.uid, 'sleepLogs');
        const unsubscribeSleep = onSnapshot(sleepRef, (snapshot) => {
          const sleepList: any[] = [];
          snapshot.forEach((docSnap) => {
            const s = docSnap.data();
            sleepList.push({
              date: s.date,
              duration: s.hours, // UI compatibility mapping
              quality: s.quality,
              sleepTime: s.sleepTime,
              wakeTime: s.wakeTime
            });
          });
          dispatch(setSleepLogs(sleepList));
        }, (err) => console.error('Error listening to sleep logs:', err));

        // Listener 6: Mood Logs Subcollection
        const moodRef = collection(db, 'users', user.uid, 'moodLogs');
        const unsubscribeMood = onSnapshot(moodRef, (snapshot) => {
          const moodList: any[] = [];
          snapshot.forEach((docSnap) => {
            const m = docSnap.data();
            moodList.push({
              date: m.date,
              score: m.mood, // UI compatibility mapping
              notes: m.note || ''
            });
          });
          dispatch(setMoodLogs(moodList));
        }, (err) => console.error('Error listening to mood logs:', err));

        // Listener 7: Focus Sessions Subcollection
        const focusRef = collection(db, 'users', user.uid, 'focusSessions');
        const unsubscribeFocus = onSnapshot(focusRef, (snapshot) => {
          const focusList: any[] = [];
          snapshot.forEach((docSnap) => {
            const f = docSnap.data();
            focusList.push({
              date: f.date,
              duration: f.duration,
              category: f.category || 'Development'
            });
          });
          dispatch(setFocusSessions(focusList));
        }, (err) => console.error('Error listening to focus sessions:', err));

        // Listener 8: Journal Subcollection
        const journalRef = collection(db, 'users', user.uid, 'journal');
        const unsubscribeJournal = onSnapshot(journalRef, (snapshot) => {
          const journalList: any[] = [];
          snapshot.forEach((docSnap) => {
            const j = docSnap.data();
            journalList.push({
              id: j.id,
              date: j.date,
              mood: j.mood || 3,
              content: j.content || '',
              tags: j.tags || []
            });
          });
          dispatch(setJournalEntries(journalList));
        }, (err) => console.error('Error listening to journal:', err));

        // Return unsubscribe functions to clean up listeners on logout/unmount
        return () => {
          console.log('[useFirebaseSync] Cleaning up Firestore listeners...');
          unsubscribeProfile();
          unsubscribeHabits();
          unsubscribeLogs();
          unsubscribeWater();
          unsubscribeSleep();
          unsubscribeMood();
          unsubscribeFocus();
          unsubscribeJournal();
        };
      } else {
        console.log('[useFirebaseSync] User logged out. Clearing Redux auth state.');
        dispatch(logoutUser());
      }
    });

    return () => unsubscribeAuth();
  }, [dispatch]);
};
export default useFirebaseSync;
