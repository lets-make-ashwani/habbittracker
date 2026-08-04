import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Award, Coins, Zap, Trophy, ArrowRight, BrainCircuit, Calendar, 
  CheckCircle2, Sparkles, Play, Coffee, Target
} from 'lucide-react';
import { useAppDispatch, useAppSelector, toggleHabitLog, addXpAndCoins } from '../../store';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { GlassCard } from '../../components/ui/GlassCard';
import dayjs from 'dayjs';

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ setActiveTab }) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const habits = useAppSelector((state) => state.habits.list);
  const logs = useAppSelector((state) => state.habits.logs);
  const waterLogs = useAppSelector((state) => state.health.water);
  const sleepLogs = useAppSelector((state) => state.health.sleep);

  const [greeting, setGreeting] = useState('Good Morning');
  const [quote, setQuote] = useState({ text: '', author: '' });

  const quotes = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
    { text: "Atomic habits compound over time. 1% better every day leads to massive growth.", author: "James Clear" },
    { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
    { text: "Your habits will determine your future.", author: "Jack Canfield" }
  ];

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good Morning');
    else if (hr < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Quote of the day seed based on date
    const quoteIdx = new Date().getDate() % quotes.length;
    setQuote(quotes[quoteIdx]);
  }, []);

  // Today date format
  const todayStr = dayjs().format('YYYY-MM-DD');

  // Today habits calculations
  const activeHabits = habits.filter(h => !h.archived);
  const totalToday = activeHabits.length;
  const completedTodayLogs = logs.filter(l => l.date === todayStr && l.status === 'completed');
  const completedTodayCount = completedTodayLogs.length;
  const habitProgress = totalToday > 0 ? Math.round((completedTodayCount / totalToday) * 100) : 0;

  // Hydration calculations
  const todayWater = waterLogs.find(w => w.date === todayStr) || { amount: 0, target: 3000 };
  const waterProgress = Math.min(100, Math.round((todayWater.amount / todayWater.target) * 100));

  // Sleep calculations
  const todaySleep = sleepLogs.find(s => s.date === todayStr) || { duration: 0, quality: 0 };
  const sleepProgress = Math.min(100, Math.round((todaySleep.duration / 8) * 100));

  // Upcoming habits (uncompleted for today)
  const upcomingHabits = activeHabits.filter(
    h => !logs.some(l => l.habitId === h.id && l.date === todayStr && l.status === 'completed')
  );

  const handleQuickComplete = (habitId: string) => {
    dispatch(toggleHabitLog({ habitId, date: todayStr }));
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const xp = habit.difficulty === 'Easy' ? 10 : habit.difficulty === 'Medium' ? 20 : 30;
      dispatch(addXpAndCoins({ xp, coins: Math.floor(xp / 2) }));
    }
  };

  // Mini-heatmap grid configuration (last 12 weeks - 84 days)
  const heatmapWeeks = 12;
  const heatmapDays = heatmapWeeks * 7;
  const heatmapCells = Array.from({ length: heatmapDays }, (_, idx) => {
    const d = dayjs().subtract(heatmapDays - 1 - idx, 'day');
    const dStr = d.format('YYYY-MM-DD');
    const dayLogs = logs.filter(l => l.date === dStr && l.status === 'completed');
    const completionRatio = activeHabits.length > 0 ? dayLogs.length / activeHabits.length : 0;
    
    let level = 0;
    if (completionRatio > 0.75) level = 4;
    else if (completionRatio > 0.5) level = 3;
    else if (completionRatio > 0.25) level = 2;
    else if (completionRatio > 0) level = 1;

    return { date: dStr, level };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1">
      {/* Top Banner: Greeting & Quote */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight text-white"
          >
            {greeting}, <span className="text-[#6366F1]">{auth.name}</span>
          </motion.h1>
          <p className="text-textMuted text-sm mt-1">Ready to crush your goals today?</p>
        </div>
        
        {/* Quote Ticker */}
        <GlassCard className="max-w-md py-3 px-4 flex items-start space-x-3 border-zinc-800 bg-zinc-950/40">
          <Coffee className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="text-textCustom font-medium leading-relaxed">"{quote.text}"</p>
            <p className="text-textMuted font-semibold mt-1">— {quote.author}</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Rings Progress Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Habit ring card */}
        <GlassCard animate delay={0.05} className="flex items-center justify-between hoverEffect">
          <div className="space-y-2">
            <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">Today's Habits</span>
            <h3 className="text-2xl font-bold text-white">{completedTodayCount} / {totalToday}</h3>
            <p className="text-xs text-textMuted">Completing habits awards XP and Coins.</p>
          </div>
          <ProgressRing 
            progress={habitProgress} 
            size={90} 
            strokeWidth={10} 
            color="#6366F1"
            label={`${habitProgress}%`}
            sublabel="habit"
          />
        </GlassCard>

        {/* Water Ring */}
        <GlassCard animate delay={0.1} className="flex items-center justify-between hoverEffect">
          <div className="space-y-2">
            <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">Daily Hydration</span>
            <h3 className="text-2xl font-bold text-white">{(todayWater.amount / 1000).toFixed(1)}L / {(todayWater.target / 1000).toFixed(0)}L</h3>
            <p className="text-xs text-textMuted">Log hydration levels in health tab.</p>
          </div>
          <ProgressRing 
            progress={waterProgress} 
            size={90} 
            strokeWidth={10} 
            color="#38BDF8"
            label={`${waterProgress}%`}
            sublabel="h2o"
          />
        </GlassCard>

        {/* Sleep Efficiency */}
        <GlassCard animate delay={0.15} className="flex items-center justify-between hoverEffect">
          <div className="space-y-2">
            <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">Sleep Duration</span>
            <h3 className="text-2xl font-bold text-white">{todaySleep.duration}h / 8h</h3>
            <p className="text-xs text-textMuted">Quality index: {todaySleep.quality}/5 stars</p>
          </div>
          <ProgressRing 
            progress={sleepProgress} 
            size={90} 
            strokeWidth={10} 
            color="#A855F7"
            label={`${sleepProgress}%`}
            sublabel="sleep"
          />
        </GlassCard>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Streaks and Mini Heatmap (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Streak Ticker banner */}
          <GlassCard className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gradient-to-br from-indigo-950/20 to-zinc-900 border-indigo-900/30">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-textMuted font-semibold">Current Streak</p>
                <p className="text-xl font-bold text-white">{auth.streak} Days</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-textMuted font-semibold">Longest Streak</p>
                <p className="text-xl font-bold text-white">{auth.longestStreak} Days</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                <Coins className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-textMuted font-semibold">Current Coins</p>
                <p className="text-xl font-bold text-white">{auth.coins}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-textMuted font-semibold">Platform Level</p>
                <p className="text-xl font-bold text-white">Lvl {auth.level}</p>
              </div>
            </div>
          </GlassCard>

          {/* Mini-Heatmap */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white">Daily Heatmap Preview</h3>
              </div>
              <button 
                onClick={() => setActiveTab('calendar')} 
                className="text-xs text-[#6366F1] hover:underline flex items-center space-x-1"
              >
                <span>Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Heatmap Grid */}
            <div className="flex flex-col overflow-x-auto pb-2">
              <div className="grid grid-flow-col gap-1 mx-auto" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
                {heatmapCells.map((cell, index) => {
                  let bgClass = 'bg-zinc-800/40';
                  if (cell.level === 1) bgClass = 'bg-indigo-950/60';
                  else if (cell.level === 2) bgClass = 'bg-indigo-800/50';
                  else if (cell.level === 3) bgClass = 'bg-indigo-600/70';
                  else if (cell.level === 4) bgClass = 'bg-indigo-500 shadow-glow shadow-indigo-500/10';

                  return (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 rounded-sm heatmap-cell ${bgClass}`}
                      title={`${cell.date}: Level ${cell.level}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-textMuted mt-3 px-2 font-semibold">
                <span>12 WEEKS AGO</span>
                <div className="flex items-center space-x-1">
                  <span>LESS</span>
                  <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800/40" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-950/60" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-800/50" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600/70" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                  <span>MORE</span>
                </div>
                <span>TODAY</span>
              </div>
            </div>
          </GlassCard>

          {/* AI recommendations widget */}
          <GlassCard className="bg-gradient-to-br from-zinc-900 to-indigo-950/20 border-indigo-950/30 p-5 space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500 rounded-full blur-[50px] opacity-10" />
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">AI Coach Insight</span>
            </div>
            <p className="text-sm text-textCustom font-medium leading-relaxed">
              "Ashwani, you're on a **15-day streak** with your Coding Daily Routine. However, you've slept late the past 3 days (avg. 11:45 PM), which correlates with a **30% slower workout time** the following morning. Consider shifting your coding slot to 4:00 PM to protect your 10:30 PM bedtime."
            </p>
            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setActiveTab('coach')} 
                className="text-xs text-[#6366F1] font-semibold flex items-center space-x-1 hover:underline"
              >
                <span>Consult Coach</span>
                <Sparkles className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Upcoming Habits & Leaderboard */}
        <div className="space-y-6">
          {/* Upcoming list */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white">Upcoming Habits</h3>
              </div>
              <button 
                onClick={() => setActiveTab('today')} 
                className="text-xs text-[#6366F1] hover:underline"
              >
                View Today
              </button>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {upcomingHabits.length === 0 ? (
                <div className="text-center py-6 text-textMuted text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60 animate-bounce" />
                  All caught up for today!
                </div>
              ) : (
                upcomingHabits.map((habit) => (
                  <div 
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60 hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{habit.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{habit.name}</p>
                        <p className="text-[10px] text-textMuted mt-0.5">{habit.category} · {habit.reminder}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickComplete(habit.id)}
                      className="p-2 rounded-lg bg-zinc-800 text-textMuted group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors"
                      title="Log completed"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Mini-leaderboard widget */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white">Leaderboard Top</h3>
              </div>
              <button 
                onClick={() => setActiveTab('leaderboard')} 
                className="text-xs text-[#6366F1] hover:underline"
              >
                Full List
              </button>
            </div>

            <div className="space-y-3">
              {auth.leaderboard.slice(0, 3).map((entry, idx) => (
                <div 
                  key={entry.name}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    entry.isCurrentUser 
                      ? 'bg-indigo-950/10 border-[#6366F1]/30 font-semibold' 
                      : 'bg-zinc-900/30 border-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`text-xs font-mono font-bold w-4 h-4 flex items-center justify-center rounded ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      idx === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-base">{entry.avatar}</span>
                    <span className="text-xs text-white">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{entry.xp} XP</p>
                    <p className="text-[9px] text-textMuted">Lvl {entry.level} · {entry.streak}d streak</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
