# ⚡ HabitFlow - Gamified Habit Tracker & AI Coach

Welcome to **HabitFlow**, a state-of-the-art, gamified habit tracking application built with **React, TypeScript, Redux Toolkit, and Tailwind CSS**. HabitFlow combines traditional habit tracking with gamification (XP, level-ups, coins, and shop rewards), a focus timer (Pomodoro), health tracking, deep analytics, and an integrated AI Coach.

---

## 🚀 Quick Start

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Install Dependencies
```bash
npm install
```

### Run the Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 🛠️ Technology Stack

- **Framework**: React 18 (Vite-powered for ultra-fast bundler performance)
- **Language**: TypeScript (Strict typing for components, state, and actions)
- **State Management**: Redux Toolkit (Single source of truth with persistent local storage sync)
- **Styling**: Tailwind CSS (Modern utility classes, fluid grid layouts, Glassmorphism card overlays)
- **Animations**: Framer Motion (Smooth tab transitions, modal overlays, level-up banners)
- **Icons**: Lucide React (Clean vector iconography)
- **Charts**: Recharts (Dynamic responsive SVGs for dashboard stats and historical analysis)
- **Date Utilities**: Day.js (Lightweight date parsing and relative time computations)

---

## 📂 Project Architecture

```
habbit-tracker/
├── public/                 # Static assets (Favicons, SVG sprite maps)
├── src/
│   ├── assets/             # Images & static assets
│   ├── components/
│   │   ├── layout/         # Core application shell & navigation
│   │   │   └── AppLayout.tsx
│   │   └── ui/             # Reusable UI controls (GlassCard, ProgressRing, SplashScreen)
│   │       ├── GlassCard.tsx
│   │       ├── ProgressRing.tsx
│   │       └── SplashScreen.tsx
│   ├── features/           # Modularized feature folders
│   │   ├── achievements/   # Shop & theme unlock system
│   │   ├── analytics/      # Historical completion & category matrix charts
│   │   ├── auth/           # Login, sign-up, and 2FA simulation
│   │   ├── calendar/       # 365-day annual habit completion heatmap
│   │   ├── coach/          # AI Coach recommendation chat module
│   │   ├── dashboard/      # Daily overview, stats, and streaks
│   │   ├── focus/          # Pomodoro timer with lofi/ambient sounds
│   │   ├── habits/         # Habit management (CRUD + logging)
│   │   └── health/         # Water, sleep, and mood tracker logs
│   │   └── settings/       # Profile management and customization
│   ├── store/              # Redux Store slices & actions
│   │   ├── index.ts        # Central Redux config & reducers
│   │   └── mockGenerator.ts# Synthetic initial data generator
│   ├── App.tsx             # Root component (auth routing wrapper)
│   ├── main.tsx            # DOM mounting & provider configuration
│   └── index.css           # Custom CSS variables, themes, & animation keyframes
├── tailwind.config.js      # Custom theme palettes & glassmorphic presets
└── tsconfig.json           # Compiler rules
```

---

## 🌟 Feature Breakdown

### 1. 🎛️ Dashboard Tab
* **Personalized Greeting**: Dynamic morning/afternoon greeting with motivational quotes.
* **Level & Gamification**: Displays user Level, current XP progress, and Coin balance.
* **Daily Completion Ring**: Interactive circular progress ring detailing percentage of today's habits completed.
* **Streak Tracking**: Displays current consecutive days active.
* **Quick Log**: Quick action list to mark today's habits as complete.

### 2. 📅 Today's Habits Tab
* **Habit Management**: Fully functional Create, Edit, Delete, and Archive actions.
* **Custom Configurations**: Emojis, color pickers, category grouping, tags, target times, and difficulties (Easy = 10 XP, Medium = 20 XP, Hard = 30 XP).
* **Search & Filters**: Live filtering by category, search query, or status (Todo / Done).

### 3. 🗺️ Annual Heatmap (Calendar)
* **365-Day Matrix**: Interactive contribution grid mapping your habit logs across the entire year.
* **Intensity Scaling**: Colors adapt from deep gray to vibrant theme accents depending on daily completion ratios.
* **Category Filters**: Filter the heatmap to isolate individual habits (e.g., just Gym workouts).

### 4. 📈 Rich Analytics
* **Completion Trend**: Curved area chart showing day-over-day success rate.
* **Category Matrix**: Recharts Radar Chart visualizing performance metrics across different areas of life.
* **Focus Analytics**: Visual breakdown of total focused study/work hours.

### 5. ⏱️ Focus Timer (Pomodoro)
* **Mode Selectors**: Choose between standard Pomodoro (25m), Short Break (5m), and Long Break (15m).
* **Ambient Soundscapes**: Play integrated background soundtracks (Lofi Beats, Soft Rain, Forest Birds) directly from your browser.
* **Gamification Hook**: Completing a timer rewards the user with bonus XP and coins.

### 6. 🧠 AI Coach
* **Contextual Suggestions**: Chat with an AI Coach that reads your current habits and suggests timing or difficulty modifications.
- **Auto-Scheduler**: Ask the AI to schedule a custom habit in your dashboard.

### 7. 🏥 Holistic Health Logs
* **Water Tracker**: Quick-log buttons for water intake (+250ml, +500ml) with animation cues.
* **Sleep Tracker**: Sleep quality score tracker calculating hours slept.
* **Mood & Mind**: Log daily mood scores (1–5 scale) alongside optional context notes.
* **Correlation Engine**: Internal formulas calculating mood fluctuation on completion vs. non-completion days.

### 8. 🛡️ Settings & Theme Engine
* **Profile Configuration**: Alter username and avatar emoji.
* **2-Factor Authentication (Simulated)**: Optional OTP screen on login.
* **Multi-Theme Palette**: Toggle between 5 custom visual schemes:
  1. **Indigo Core** (Default sleek purple)
  2. **Midnight Neon** (Vibrant cyber pink)
  3. **Cyberpunk Gold** (Amber tactical tint)
  4. **Emerald Synth** (Soothing mint green)
  5. **Lavender Bliss** (Calming lilac)

---

## 💾 State Management (Redux Store)

The global state is split into modular slices configured in `src/store/index.ts`:

1. **`auth`**: Manages session state, username, user Level, current XP, coins, and unlocked themes.
2. **`habits`**: Lists all active habits, archived habits, and history logs.
3. **`health`**: Tracks historical water intake, sleep cycles, and daily mood entries.
4. **`focus`**: Stores stats on completed Pomodoro focus sessions.

### Key Actions
- `addHabit`, `editHabit`, `toggleHabitLog`, `deleteHabit`, `archiveHabit`
- `addXpAndCoins` (triggers automated Level Up if XP threshold is exceeded)
- `unlockTheme`, `setTheme`
- `logWater`, `logSleep`, `logMood`
- `addFocusSession`
