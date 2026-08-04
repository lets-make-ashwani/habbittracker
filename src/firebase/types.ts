import { FieldValue, Timestamp } from 'firebase/firestore';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserPreferences {
  theme: string;
  language: string;
  timezone: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

export interface UserStats {
  totalHabits: number;
  completedHabits: number;
  currentStreak: number;
  longestStreak: number;
  focusHours: number;
  waterToday: number;
  sleepAverage: number;
  completionRate: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  level: number;
  xp: number;
  coins: number;
  ownedItems: string[]; // List of shop item IDs unlocked
  preferences: UserPreferences;
  stats: UserStats;
  version: number;
  createdAt: string | FieldValue | Timestamp;
  updatedAt: string | FieldValue | Timestamp;
  lastLogin: string | FieldValue | Timestamp;
}

export interface Habit {
  id: string;
  title: string;
  titleLowercase: string;
  description: string;
  emoji: string;
  color: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  coinReward: number;
  targetTime: number; // in minutes
  streak: number;
  longestStreak: number;
  archived: boolean;
  version: number;
  isDeleted: boolean;
  deletedAt: string | FieldValue | Timestamp | null;
  createdAt: string | FieldValue | Timestamp;
  updatedAt: string | FieldValue | Timestamp;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string | FieldValue | Timestamp;
  earnedXP: number;
  earnedCoins: number;
  streakAfter: number;
  note: string;
  version: number;
  createdAt: string | FieldValue | Timestamp;
}

export interface FocusSession {
  id: string;
  duration: number; // in minutes
  completed: boolean;
  mode: 'focus' | 'short' | 'long';
  xpReward: number;
  coinReward: number;
  date: string; // YYYY-MM-DD
  category: string;
  version: number;
  createdAt: string | FieldValue | Timestamp;
}

export interface WaterLog {
  id: string;
  amount: number; // ml
  target: number; // ml
  date: string; // YYYY-MM-DD
  version: number;
  createdAt: string | FieldValue | Timestamp;
  updatedAt: string | FieldValue | Timestamp;
}

export interface SleepLog {
  id: string;
  hours: number;
  quality: number; // 1-5
  sleepTime: string; // HH:mm
  wakeTime: string; // HH:mm
  date: string; // YYYY-MM-DD
  version: number;
  createdAt: string | FieldValue | Timestamp;
  updatedAt: string | FieldValue | Timestamp;
}

export interface MoodLog {
  id: string;
  mood: number; // 1-5
  note: string;
  date: string; // YYYY-MM-DD
  version: number;
  createdAt: string | FieldValue | Timestamp;
  updatedAt: string | FieldValue | Timestamp;
}

export interface UserAchievement {
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt: string | FieldValue | Timestamp | null;
  version: number;
  updatedAt: string | FieldValue | Timestamp;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  rewardXP: number;
  rewardCoins: number;
  version: number;
  createdAt: string | FieldValue | Timestamp;
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  type: 'theme' | 'avatar';
  color: string;
  version: number;
  createdAt: string | FieldValue | Timestamp;
}

export interface Theme {
  id: string;
  name: string;
  color: string;
  desc: string;
  fonts?: string[];
  gradients?: string[];
  version: number;
  createdAt: string | FieldValue | Timestamp;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'level_up' | 'milestone' | 'reminder';
  read: boolean;
  version: number;
  createdAt: string | FieldValue | Timestamp;
}

export interface CoachMessage {
  id: string;
  message: string;
  response: string;
  role: 'user' | 'assistant';
  modelProvider: string; // e.g. "gemini-flash" or "rule-engine"
  conversationId: string;
  version: number;
  createdAt: string | FieldValue | Timestamp;
}
