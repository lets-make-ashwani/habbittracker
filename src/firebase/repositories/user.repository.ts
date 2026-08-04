import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  runTransaction 
} from 'firebase/firestore';
import { db } from '../firestore';
import type { UserProfile } from '../types';

export const userRepository = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  async createUserProfile(uid: string, profile: UserProfile): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, profile);
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
  },

  // Runs a transaction to update user fields safely
  async updateUserWithTransaction(
    uid: string, 
    updateFn: (transaction: any, currentProfile: UserProfile) => Partial<UserProfile>
  ): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User profile does not exist.');
      }
      const currentProfile = userDoc.data() as UserProfile;
      const updates = updateFn(transaction, currentProfile);
      transaction.update(userDocRef, {
        ...updates,
        updatedAt: new Date().toISOString() // We can also use serverTimestamp() inside transactions
      });
    });
  }
};
