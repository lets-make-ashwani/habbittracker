import dayjs from 'dayjs';

export interface Habit {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number; // in minutes
  frequency: 'daily' | 'weekly' | 'custom';
  repeatDays?: number[]; // [0-6] Sunday-Saturday
  reminder: string; // HH:MM
  streak: number;
  longestStreak: number;
  emoji: string;
  color: string;
  createdAt: string;
  archived: boolean;
  tags: string[];
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'skipped' | 'missed';
  notes?: string;
  timestamp: string;
  xpEarned: number;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amount: number; // in ml
  target: number; // in ml
}

export interface SleepLog {
  date: string; // YYYY-MM-DD
  duration: number; // hours
  quality: number; // 1-5
  sleepTime: string; // HH:MM
  wakeTime: string; // HH:MM
}

export interface MoodLog {
  date: string; // YYYY-MM-DD
  score: number; // 1-5
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: number;
  content: string;
  tags: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeUrl: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

// Fixed Habits list
export const initialHabits: Habit[] = [
  {
    id: 'h1',
    name: 'Morning Workout',
    category: 'Gym',
    difficulty: 'Hard',
    estimatedTime: 45,
    frequency: 'daily',
    reminder: '07:00',
    streak: 6,
    longestStreak: 12,
    emoji: '🏋️‍♂️',
    color: '#6366F1', // indigo
    createdAt: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    archived: false,
    tags: ['fitness', 'morning', 'energy']
  },
  {
    id: 'h2',
    name: 'Code Daily Routine',
    category: 'Development',
    difficulty: 'Medium',
    estimatedTime: 90,
    frequency: 'daily',
    reminder: '10:00',
    streak: 15,
    longestStreak: 22,
    emoji: '💻',
    color: '#22C55E', // green
    createdAt: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    archived: false,
    tags: ['career', 'focus', 'learning']
  },
  {
    id: 'h3',
    name: 'Drink 3 Liters Water',
    category: 'Health',
    difficulty: 'Easy',
    estimatedTime: 5,
    frequency: 'daily',
    reminder: '09:00',
    streak: 8,
    longestStreak: 18,
    emoji: '💧',
    color: '#0EA5E9', // sky blue
    createdAt: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    archived: false,
    tags: ['hydration', 'vitality']
  },
  {
    id: 'h4',
    name: 'Sleep 8 Hours',
    category: 'Sleep',
    difficulty: 'Medium',
    estimatedTime: 480,
    frequency: 'daily',
    reminder: '22:30',
    streak: 3,
    longestStreak: 8,
    emoji: '😴',
    color: '#A855F7', // purple
    createdAt: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    archived: false,
    tags: ['recovery', 'mind']
  },
  {
    id: 'h5',
    name: 'Evening Reflection & Journal',
    category: 'Mindfulness',
    difficulty: 'Easy',
    estimatedTime: 10,
    frequency: 'daily',
    reminder: '21:30',
    streak: 0,
    longestStreak: 6,
    emoji: '📓',
    color: '#F97316', // orange
    createdAt: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    archived: false,
    tags: ['mental-health', 'peace']
  }
];

export const generateMockData = () => {
  const habits = [...initialHabits];
  const logs: HabitLog[] = [];
  const waterLogs: WaterLog[] = [];
  const sleepLogs: SleepLog[] = [];
  const moodLogs: MoodLog[] = [];
  const journalEntries: JournalEntry[] = [];

  const today = dayjs();

  // Populate data for the last 30 days
  for (let i = 30; i >= 0; i--) {
    const currentDate = today.subtract(i, 'day');
    const dateStr = currentDate.format('YYYY-MM-DD');

    // Gym workout completion logic
    let gymCompleted = Math.random() > 0.25;
    if (i <= 6 && i > 0) gymCompleted = true;
    if (i === 0) gymCompleted = false; // today is not completed yet

    if (gymCompleted && i > 0) {
      logs.push({
        id: `log-gym-${dateStr}`,
        habitId: 'h1',
        date: dateStr,
        status: 'completed',
        timestamp: `${dateStr}T07:45:00Z`,
        xpEarned: 25
      });
    } else if (i > 0) {
      logs.push({
        id: `log-gym-${dateStr}`,
        habitId: 'h1',
        date: dateStr,
        status: Math.random() > 0.5 ? 'skipped' : 'missed',
        timestamp: `${dateStr}T08:00:00Z`,
        xpEarned: 0
      });
    }

    // Coding completion logic (90% success)
    let codeCompleted = Math.random() > 0.1;
    if (i <= 15 && i > 0) codeCompleted = true;
    if (i === 0) codeCompleted = false;

    if (codeCompleted && i > 0) {
      logs.push({
        id: `log-code-${dateStr}`,
        habitId: 'h2',
        date: dateStr,
        status: 'completed',
        timestamp: `${dateStr}T14:30:00Z`,
        xpEarned: 20
      });
    } else if (i > 0) {
      logs.push({
        id: `log-code-${dateStr}`,
        habitId: 'h2',
        date: dateStr,
        status: 'missed',
        timestamp: `${dateStr}T23:59:00Z`,
        xpEarned: 0
      });
    }

    // Water completion logic (85% success)
    let waterCompleted = Math.random() > 0.15;
    if (i <= 8 && i > 0) waterCompleted = true;
    if (i === 0) waterCompleted = false;

    if (waterCompleted && i > 0) {
      logs.push({
        id: `log-water-${dateStr}`,
        habitId: 'h3',
        date: dateStr,
        status: 'completed',
        timestamp: `${dateStr}T19:00:00Z`,
        xpEarned: 10
      });
    } else if (i > 0) {
      logs.push({
        id: `log-water-${dateStr}`,
        habitId: 'h3',
        date: dateStr,
        status: 'missed',
        timestamp: `${dateStr}T23:59:00Z`,
        xpEarned: 0
      });
    }

    // Sleep completion logic (70% success)
    let sleepCompleted = Math.random() > 0.3;
    if (i <= 3 && i > 0) sleepCompleted = true;
    if (i === 0) sleepCompleted = false;

    if (sleepCompleted && i > 0) {
      logs.push({
        id: `log-sleep-${dateStr}`,
        habitId: 'h4',
        date: dateStr,
        status: 'completed',
        timestamp: `${dateStr}T07:00:00Z`,
        xpEarned: 15
      });
    } else if (i > 0) {
      logs.push({
        id: `log-sleep-${dateStr}`,
        habitId: 'h4',
        date: dateStr,
        status: 'missed',
        timestamp: `${dateStr}T09:00:00Z`,
        xpEarned: 0
      });
    }

    // Journal completion logic (50% success)
    let journalCompleted = Math.random() > 0.5;
    if (i === 0) journalCompleted = false;

    if (journalCompleted && i > 0) {
      logs.push({
        id: `log-journal-${dateStr}`,
        habitId: 'h5',
        date: dateStr,
        status: 'completed',
        timestamp: `${dateStr}T22:00:00Z`,
        xpEarned: 10
      });
    } else if (i > 0) {
      logs.push({
        id: `log-journal-${dateStr}`,
        habitId: 'h5',
        date: dateStr,
        status: 'skipped',
        timestamp: `${dateStr}T23:00:00Z`,
        xpEarned: 0
      });
    }

    // Water target (ml) and actual logs
    const waterTarget = 3000;
    const waterAmount = waterCompleted ? (3000 + Math.floor(Math.random() * 500)) : (1000 + Math.floor(Math.random() * 1000));
    if (i > 0) {
      waterLogs.push({
        date: dateStr,
        amount: waterAmount,
        target: waterTarget
      });
    } else {
      waterLogs.push({
        date: dateStr,
        amount: 750,
        target: waterTarget
      });
    }

    // Sleep records
    const sleepDuration = 6.0 + Math.random() * 2.8;
    const sleepQuality = Math.floor(sleepDuration - 4.5) + Math.floor(Math.random() * 2) + 1;
    const sleepQualityClamped = Math.max(1, Math.min(5, sleepQuality));
    const hrSleep = Math.floor(22 + Math.random() * 2);
    const minSleep = Math.floor(Math.random() * 60);
    const hrWake = Math.floor(6 + Math.random() * 2);
    const minWake = Math.floor(Math.random() * 60);
    
    sleepLogs.push({
      date: dateStr,
      duration: parseFloat(sleepDuration.toFixed(1)),
      quality: sleepQualityClamped,
      sleepTime: `${hrSleep.toString().padStart(2, '0')}:${minSleep.toString().padStart(2, '0')}`,
      wakeTime: `${hrWake.toString().padStart(2, '0')}:${minWake.toString().padStart(2, '0')}`
    });

    // Mood logs
    const moodScore = Math.min(5, Math.max(1, Math.floor(Math.random() * 3) + 3 - (gymCompleted ? 0 : 1)));
    moodLogs.push({
      date: dateStr,
      score: moodScore,
      notes: moodScore >= 4 ? 'Felt productive and energized today!' : 'A bit sluggish, missed a few habits.'
    });

    // Journal reflections
    if (i > 0 && i % 6 === 0) {
      journalEntries.push({
        id: `journal-${dateStr}`,
        date: dateStr,
        mood: moodScore,
        content: `### Evening Summary - ${currentDate.format('MMMM D, YYYY')}\n\nToday was a pretty dynamic day. I spent a good amount of time coding up the features for the new SaaS application. Core modules are coming together nicely.\n\n* **Highlights**: Completed my daily coding target and had a solid session at the gym.\n* **Learnings**: I need to drink more water in the afternoon. Felt a minor headache around 3 PM.\n* **Gratitude**: Thankful for good coffee and fast compile times!`,
        tags: ['productivity', 'fitness', 'career']
      });
    }
  }

  return { habits, logs, waterLogs, sleepLogs, moodLogs, journalEntries };
};

// Initial Achievements
export const initialAchievements: Achievement[] = [
  {
    id: 'a1',
    title: 'First Step',
    description: 'Complete your first habit.',
    badgeUrl: '🚀',
    xpReward: 100,
    unlocked: true,
    unlockedAt: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'a2',
    title: 'Super Coder',
    description: 'Complete the Code Daily Routine for 10 days in a row.',
    badgeUrl: '⚡',
    xpReward: 250,
    unlocked: true,
    unlockedAt: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    progress: 10,
    maxProgress: 10
  },
  {
    id: 'a3',
    title: 'Hydro Homie',
    description: 'Meet your 3L water hydration target 15 times.',
    badgeUrl: '🔱',
    xpReward: 150,
    unlocked: true,
    unlockedAt: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    progress: 15,
    maxProgress: 15
  },
  {
    id: 'a4',
    title: 'Perfect Week',
    description: 'Complete all habits in a single week.',
    badgeUrl: '👑',
    xpReward: 500,
    unlocked: false,
    progress: 5,
    maxProgress: 7
  },
  {
    id: 'a5',
    title: 'Habit Overlord',
    description: 'Unlock a lifetime streak of 30 days on any habit.',
    badgeUrl: '🪐',
    xpReward: 1000,
    unlocked: false,
    progress: 22,
    maxProgress: 30
  },
  {
    id: 'a6',
    title: 'Mindfulness Master',
    description: 'Log 10 journal reflections.',
    badgeUrl: '🧘‍♂️',
    xpReward: 200,
    unlocked: false,
    progress: 5,
    maxProgress: 10
  }
];

// Leaderboard entries
export const initialLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Emma Vance', avatar: '👩‍💻', level: 12, xp: 5400, streak: 28 },
  { rank: 2, name: 'Liam Sterling', avatar: '🏃‍♂️', level: 10, xp: 4250, streak: 19 },
  { rank: 3, name: 'Ashwani (You)', avatar: '🔮', level: 4, xp: 750, streak: 15, isCurrentUser: true },
  { rank: 4, name: 'Sophia Chen', avatar: '🎨', level: 4, xp: 620, streak: 8 },
  { rank: 5, name: 'Noah Miller', avatar: '🏋️‍♂️', level: 3, xp: 410, streak: 5 }
];
