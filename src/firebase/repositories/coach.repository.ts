import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firestore';
import type { CoachMessage } from '../types';

export const coachRepository = {
  async getCoachHistory(uid: string, conversationId: string): Promise<CoachMessage[]> {
    const colRef = collection(db, 'users', uid, 'coachHistory');
    const q = query(
      colRef, 
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const history: CoachMessage[] = [];
    querySnapshot.forEach((docSnap) => {
      history.push(docSnap.data() as CoachMessage);
    });
    return history;
  },

  async saveCoachMessage(uid: string, message: CoachMessage): Promise<void> {
    const docRef = doc(db, 'users', uid, 'coachHistory', message.id);
    await setDoc(docRef, message);
  }
};
