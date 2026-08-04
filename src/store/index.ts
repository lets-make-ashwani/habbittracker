import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import dayjs from 'dayjs';

import {
  generateMockData,
  initialAchievements,
  initialLeaderboard
} from './mockGenerator';
import type {
  Habit,
  HabitLog,
  WaterLog,
  SleepLog,
  MoodLog,
  JournalEntry,
  Achievement,
  LeaderboardEntry
} from './mockGenerator';


// Types
export interface UserState {
  isLoggedIn: boolean;
  name: string;
  avatar: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  longestStreak: number;
  unlockedThemes: string[];
  currentTheme: string;
  twoFactorEnabled: boolean;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  recentLevelUp: boolean;
}

export interface RootState {
  auth: UserState;
  habits: {
    list: Habit[];
    logs: HabitLog[];
  };
  journal: {
    entries: JournalEntry[];
  };
  health: {
    water: WaterLog[];
    sleep: SleepLog[];
    mood: MoodLog[];
  };
  focus: {
    sessions: { date: string; duration: number; category: string }[];
  };
}

// Load initial state from localstorage or mock
const getInitialState = (): RootState => {
  const localData = localStorage.getItem('habitflow_state');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse local storage', e);
    }
  }

  // Generate fallback mock data
  const mocks = generateMockData();
  return {
    auth: {
      isLoggedIn: true,
      name: 'Ashwani',
      avatar: '🔮',
      email: 'ashwani@habitflow.ai',
      level: 4,
      xp: 750,
      coins: 420,
      streak: 15,
      longestStreak: 22,
      unlockedThemes: ['default'],
      currentTheme: 'default',
      twoFactorEnabled: false,
      achievements: initialAchievements,
      leaderboard: initialLeaderboard,
      recentLevelUp: false
    },
    habits: {
      list: mocks.habits,
      logs: mocks.logs
    },
    journal: {
      entries: mocks.journalEntries
    },
    health: {
      water: mocks.waterLogs,
      sleep: mocks.sleepLogs,
      mood: mocks.moodLogs
    },
    focus: {
      sessions: [
        { date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), duration: 50, category: 'Development' },
        { date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), duration: 25, category: 'Development' },
        { date: dayjs().format('YYYY-MM-DD'), duration: 25, category: 'Development' }
      ]
    }
  };
};

const defaultInitialState = getInitialState();

// 1. Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: defaultInitialState.auth,
  reducers: {
    loginUser(state, action: PayloadAction<{ email: string; name: string }>) {
      state.isLoggedIn = true;
      state.email = action.payload.email;
      state.name = action.payload.name || 'User';
    },
    logoutUser(state) {
      state.isLoggedIn = false;
    },
    enable2FA(state, action: PayloadAction<boolean>) {
      state.twoFactorEnabled = action.payload;
    },
    addXpAndCoins(state, action: PayloadAction<{ xp: number; coins: number }>) {
      state.xp += action.payload.xp;
      state.coins += action.payload.coins;
      
      // Level up logic (1000 XP per level)
      if (state.xp >= 1000) {
        state.level += 1;
        state.xp = state.xp - 1000;
        state.recentLevelUp = true;
      }
      
      // Update user in leaderboard
      const userIdx = state.leaderboard.findIndex(l => l.isCurrentUser);
      if (userIdx !== -1) {
        state.leaderboard[userIdx].level = state.level;
        state.leaderboard[userIdx].xp = state.level * 1000 + state.xp;
      }
    },
    clearLevelUpFlag(state) {
      state.recentLevelUp = false;
    },
    spendCoins(state, action: PayloadAction<number>) {
      if (state.coins >= action.payload) {
        state.coins -= action.payload;
      }
    },
    unlockTheme(state, action: PayloadAction<{ themeId: string; price: number }>) {
      if (state.coins >= action.payload.price && !state.unlockedThemes.includes(action.payload.themeId)) {
        state.coins -= action.payload.price;
        state.unlockedThemes.push(action.payload.themeId);
      }
    },
    setTheme(state, action: PayloadAction<string>) {
      state.currentTheme = action.payload;
    },
    updateAchievementProgress(state, action: PayloadAction<{ id: string; increment: number; absolute?: number }>) {
      const ach = state.achievements.find(a => a.id === action.payload.id);
      if (ach && !ach.unlocked) {
        if (action.payload.absolute !== undefined) {
          ach.progress = action.payload.absolute;
        } else {
          ach.progress += action.payload.increment;
        }
        
        if (ach.progress >= ach.maxProgress) {
          ach.progress = ach.maxProgress;
          ach.unlocked = true;
          ach.unlockedAt = dayjs().format('YYYY-MM-DD');
          state.xp += ach.xpReward;
          state.coins += 50; // default bonus coins
          
          if (state.xp >= 1000) {
            state.level += 1;
            state.xp -= 1000;
            state.recentLevelUp = true;
          }
        }
      }
    },
    updateProfile(state, action: PayloadAction<{ name: string; avatar: string }>) {
      state.name = action.payload.name;
      state.avatar = action.payload.avatar;
      const userIdx = state.leaderboard.findIndex(l => l.isCurrentUser);
      if (userIdx !== -1) {
        state.leaderboard[userIdx].name = action.payload.name + ' (You)';
        state.leaderboard[userIdx].avatar = action.payload.avatar;
      }
    }
  }
});

// 2. Habits Slice
const habitsSlice = createSlice({
  name: 'habits',
  initialState: {
    list: defaultInitialState.habits.list,
    logs: defaultInitialState.habits.logs
  },
  reducers: {
    addHabit(state, action: PayloadAction<Omit<Habit, 'id' | 'createdAt' | 'streak' | 'longestStreak' | 'archived'>>) {
      const newHabit: Habit = {
        ...action.payload,
        id: `h-${Date.now()}`,
        createdAt: dayjs().format('YYYY-MM-DD'),
        streak: 0,
        longestStreak: 0,
        archived: false
      };
      state.list.push(newHabit);
    },
    editHabit(state, action: PayloadAction<Habit>) {
      const idx = state.list.findIndex(h => h.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
      }
    },
    archiveHabit(state, action: PayloadAction<string>) {
      const idx = state.list.findIndex(h => h.id === action.payload);
      if (idx !== -1) {
        state.list[idx].archived = true;
      }
    },
    deleteHabit(state, action: PayloadAction<string>) {
      state.list = state.list.filter(h => h.id !== action.payload);
      state.logs = state.logs.filter(l => l.habitId !== action.payload);
    },
    toggleHabitLog(state, action: PayloadAction<{ habitId: string; date: string; notes?: string }>) {
      const { habitId, date, notes } = action.payload;
      const existingLogIdx = state.logs.findIndex(l => l.habitId === habitId && l.date === date);
      
      const habit = state.list.find(h => h.id === habitId);
      if (!habit) return;

      if (existingLogIdx !== -1) {
        // Toggle off (remove completion)
        state.logs.splice(existingLogIdx, 1);
        
        // Decrement streak
        habit.streak = Math.max(0, habit.streak - 1);
      } else {
        // Toggle on (add completion)
        const xpForDiff = habit.difficulty === 'Easy' ? 10 : habit.difficulty === 'Medium' ? 20 : 30;
        state.logs.push({
          id: `log-${habitId}-${date}-${Date.now()}`,
          habitId,
          date,
          status: 'completed',
          notes,
          timestamp: dayjs().toISOString(),
          xpEarned: xpForDiff
        });
        
        // Increment streak
        habit.streak += 1;
        if (habit.streak > habit.longestStreak) {
          habit.longestStreak = habit.streak;
        }
      }
    }
  }
});

// 3. Journal Slice
const journalSlice = createSlice({
  name: 'journal',
  initialState: {
    entries: defaultInitialState.journal.entries
  },
  reducers: {
    addJournalEntry(state, action: PayloadAction<Omit<JournalEntry, 'id'>>) {
      const newEntry: JournalEntry = {
        ...action.payload,
        id: `journal-${Date.now()}`
      };
      state.entries.unshift(newEntry);
    },
    deleteJournalEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter(e => e.id !== action.payload);
    }
  }
});

// 4. Health Slice
const healthSlice = createSlice({
  name: 'health',
  initialState: {
    water: defaultInitialState.health.water,
    sleep: defaultInitialState.health.sleep,
    mood: defaultInitialState.health.mood
  },
  reducers: {
    logWater(state, action: PayloadAction<{ date: string; amount: number; target: number }>) {
      const { date, amount, target } = action.payload;
      const idx = state.water.findIndex(w => w.date === date);
      if (idx !== -1) {
        state.water[idx].amount = Math.max(0, state.water[idx].amount + amount);
      } else {
        state.water.push({ date, amount, target });
      }
    },
    logSleep(state, action: PayloadAction<SleepLog>) {
      const idx = state.sleep.findIndex(s => s.date === action.payload.date);
      if (idx !== -1) {
        state.sleep[idx] = action.payload;
      } else {
        state.sleep.push(action.payload);
      }
    },
    logMood(state, action: PayloadAction<MoodLog>) {
      const idx = state.mood.findIndex(m => m.date === action.payload.date);
      if (idx !== -1) {
        state.mood[idx] = action.payload;
      } else {
        state.mood.push(action.payload);
      }
    }
  }
});

// 5. Focus Slice
const focusSlice = createSlice({
  name: 'focus',
  initialState: {
    sessions: defaultInitialState.focus.sessions
  },
  reducers: {
    addFocusSession(state, action: PayloadAction<{ duration: number; category: string }>) {
      state.sessions.push({
        date: dayjs().format('YYYY-MM-DD'),
        duration: action.payload.duration,
        category: action.payload.category
      });
    }
  }
});

// Root Reducer Reset
const rootReducer = {
  auth: authSlice.reducer,
  habits: habitsSlice.reducer,
  journal: journalSlice.reducer,
  health: healthSlice.reducer,
  focus: focusSlice.reducer
};

// Store creation
export const store = configureStore({
  reducer: rootReducer
});

// Subscribe to store to auto-save to localStorage
store.subscribe(() => {
  localStorage.setItem('habitflow_state', JSON.stringify(store.getState()));
});

// Actions
export const {
  loginUser,
  logoutUser,
  enable2FA,
  addXpAndCoins,
  clearLevelUpFlag,
  spendCoins,
  unlockTheme,
  setTheme,
  updateAchievementProgress,
  updateProfile
} = authSlice.actions;

export const {
  addHabit,
  editHabit,
  archiveHabit,
  deleteHabit,
  toggleHabitLog
} = habitsSlice.actions;

export const {
  addJournalEntry,
  deleteJournalEntry
} = journalSlice.actions;

export const {
  logWater,
  logSleep,
  logMood
} = healthSlice.actions;

export const {
  addFocusSession
} = focusSlice.actions;

// Redux hooks types
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useAppDispatchHook<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
import { useDispatch as useAppDispatchHook } from 'react-redux';
