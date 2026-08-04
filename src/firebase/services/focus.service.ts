import { focusRepository } from '../repositories/focus.repository';
import type { FocusSession, ServiceResponse } from '../types';

export const focusService = {
  async getFocusSessions(uid: string): Promise<ServiceResponse<FocusSession[]>> {
    try {
      const sessions = await focusRepository.getFocusSessions(uid);
      return { success: true, data: sessions };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to fetch focus sessions.' };
    }
  },

  async addFocusSession(
    uid: string, 
    sessionData: { duration: number; mode: 'focus' | 'short' | 'long'; category: string }
  ): Promise<ServiceResponse<FocusSession>> {
    try {
      const isCompleted = sessionData.mode === 'focus';
      const xpReward = isCompleted ? 50 : 0;
      const coinReward = isCompleted ? 25 : 0;

      const newSession: FocusSession = {
        id: `focus_${Date.now()}`,
        duration: sessionData.duration,
        completed: isCompleted,
        mode: sessionData.mode,
        xpReward,
        coinReward,
        date: new Date().toISOString().substring(0, 10), // YYYY-MM-DD
        category: sessionData.category,
        version: 1,
        createdAt: new Date().toISOString()
      };

      const focusHoursIncrement = isCompleted ? (sessionData.duration / 60) : 0;

      await focusRepository.saveFocusSessionTransaction(
        uid,
        newSession,
        { xp: xpReward, coins: coinReward },
        { focusHoursIncrement }
      );

      return { success: true, data: newSession };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to log focus session.' };
    }
  }
};
export default focusService;
