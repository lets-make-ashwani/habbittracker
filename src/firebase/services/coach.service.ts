import { coachRepository } from '../repositories/coach.repository';
import type { CoachMessage, Habit, ServiceResponse } from '../types';

export interface CoachProvider {
  sendMessage(
    message: string, 
    _history: CoachMessage[], 
    habits: Habit[]
  ): Promise<{ response: string; action?: { type: string; payload: any } }>;
}

// Rule-based engine that simulates an AI Coach and is fully swappable for real LLMs later
export class RuleBasedCoachProvider implements CoachProvider {
  async sendMessage(
    message: string, 
    _history: CoachMessage[], 
    habits: Habit[]
  ): Promise<{ response: string; action?: { type: string; payload: any } }> {
    const text = message.toLowerCase();
    
    // 1. Help with scheduling
    if (text.includes('schedule') || text.includes('routine') || text.includes('plan')) {
      return {
        response: `Based on your current routine, I recommend scheduling a focus block in the afternoon. How about adding a "30 Minutes Reading" habit around 4:00 PM when your brain is transitioning from main work?`,
        action: {
          type: 'SUGGEST_HABIT',
          payload: {
            title: 'Afternoon Reading',
            description: 'Read a book for personal growth.',
            emoji: '📚',
            color: '#8B5CF6',
            category: 'Mindfulness',
            difficulty: 'Easy',
            targetTime: 30
          }
        }
      };
    }

    // 2. Health insights
    if (text.includes('water') || text.includes('hydrate')) {
      const activeHydration = habits.some(h => h.category === 'Health' && h.titleLowercase.includes('water'));
      if (activeHydration) {
        return {
          response: "I see you already have a water logging routine! Excellent work. Remember that drinking a glass right after waking up boots up your metabolism by 24%."
        };
      }
      return {
        response: "Staying hydrated boosts cognitive output by up to 15%. I suggest setting a daily target of 3 liters of water. Would you like me to add a quick-log habit for water tracking?",
        action: {
          type: 'SUGGEST_HABIT',
          payload: {
            title: 'Drink 3L Water',
            description: 'Stay fully hydrated throughout the day.',
            emoji: '💧',
            color: '#0EA5E9',
            category: 'Health',
            difficulty: 'Easy',
            targetTime: 5
          }
        }
      };
    }

    // 3. Analytics
    if (text.includes('analytics') || text.includes('stat') || text.includes('progress') || text.includes('how am i doing')) {
      const total = habits.length;
      if (total === 0) {
        return { response: "You haven't created any habits yet! Let's start by adding a simple task to build momentum." };
      }
      return {
        response: `You currently have ${total} active habits. Your consistency is looking solid. Let's aim to complete at least 80% of them today to maintain your current streak!`
      };
    }

    // 4. Default AI feedback
    return {
      response: "Hey! I'm your HabitFlow AI Coach. I'm here to analyze your streaks, suggest micro-habits, and help optimize your daily schedule. Ask me to 'schedule a habit' or for 'water tracking tips'!"
    };
  }
}

const defaultProvider = new RuleBasedCoachProvider();

export const coachService = {
  privateProvider: defaultProvider as CoachProvider,

  setProvider(provider: CoachProvider) {
    this.privateProvider = provider;
  },

  async getHistory(uid: string, conversationId: string): Promise<ServiceResponse<CoachMessage[]>> {
    try {
      const history = await coachRepository.getCoachHistory(uid, conversationId);
      return { success: true, data: history };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to fetch coach history.' };
    }
  },

  async sendCoachMessage(
    uid: string, 
    conversationId: string, 
    userText: string, 
    habits: Habit[]
  ): Promise<ServiceResponse<{ userMsg: CoachMessage; assistantMsg: CoachMessage; action?: any }>> {
    try {
      const historyResponse = await this.getHistory(uid, conversationId);
      const history = historyResponse.success ? (historyResponse.data || []) : [];

      // 1. Create and save User Message doc
      const userMsg: CoachMessage = {
        id: `msg_user_${Date.now()}`,
        message: userText,
        response: '',
        role: 'user',
        modelProvider: 'client',
        conversationId,
        version: 1,
        createdAt: new Date().toISOString()
      };
      await coachRepository.saveCoachMessage(uid, userMsg);

      // 2. Query the Coach Provider
      const result = await this.privateProvider.sendMessage(userText, [...history, userMsg], habits);

      // 3. Create and save Assistant Message doc
      const assistantMsg: CoachMessage = {
        id: `msg_ai_${Date.now()}`,
        message: userText,
        response: result.response,
        role: 'assistant',
        modelProvider: 'rule-engine',
        conversationId,
        version: 1,
        createdAt: new Date().toISOString()
      };
      await coachRepository.saveCoachMessage(uid, assistantMsg);

      return {
        success: true,
        data: {
          userMsg,
          assistantMsg,
          action: result.action
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to send coach message.' };
    }
  }
};
export default coachService;
