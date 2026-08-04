import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplet, Moon, Smile, Sparkles, Plus, Minus, Info, Calendar, 
  TrendingUp, BarChart2, Star, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { useAppDispatch, useAppSelector, logWater, logSleep, logMood, addXpAndCoins } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import dayjs from 'dayjs';

export const HealthTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const waterLogs = useAppSelector((state) => state.health.water);
  const sleepLogs = useAppSelector((state) => state.health.sleep);
  const moodLogs = useAppSelector((state) => state.health.mood);
  const habits = useAppSelector((state) => state.habits.list);
  const habitLogs = useAppSelector((state) => state.habits.logs);

  const todayStr = dayjs().format('YYYY-MM-DD');

  // Water Form
  const todayWater = waterLogs.find(w => w.date === todayStr) || { amount: 0, target: 3000 };
  const waterPercent = Math.min(100, Math.round((todayWater.amount / todayWater.target) * 100));

  // Sleep Form State
  const [sleepHr, setSleepHr] = useState('22:30');
  const [wakeHr, setWakeHr] = useState('06:30');
  const [sleepQuality, setSleepQuality] = useState(4);

  // Mood Form State
  const [activeMood, setActiveMood] = useState(4);
  const [moodNote, setMoodNote] = useState('');

  const handleAddWater = (amt: number) => {
    dispatch(logWater({ date: todayStr, amount: amt, target: 3000 }));
    dispatch(addXpAndCoins({ xp: 5, coins: 2 }));
  };

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate simple duration (approximate)
    const [sH, sM] = sleepHr.split(':').map(Number);
    const [wH, wM] = wakeHr.split(':').map(Number);
    let dur = 0;
    if (wH >= sH) {
      dur = (wH - sH) + (wM - sM) / 60;
    } else {
      dur = (24 - sH + wH) + (wM - sM) / 60;
    }
    
    dispatch(logSleep({
      date: todayStr,
      duration: parseFloat(dur.toFixed(1)),
      quality: sleepQuality,
      sleepTime: sleepHr,
      wakeTime: wakeHr
    }));
    
    dispatch(addXpAndCoins({ xp: 30, coins: 15 }));
    alert(`Logged ${dur.toFixed(1)} hours of sleep. +30 XP!`);
  };

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(logMood({
      date: todayStr,
      score: activeMood,
      notes: moodNote
    }));
    
    dispatch(addXpAndCoins({ xp: 15, coins: 5 }));
    setMoodNote('');
    alert('Logged daily mood score. +15 XP!');
  };

  // Calculate Mood-to-Habit Correlation Analytics (Simulated insights matching database logs)
  const getCorrelationData = () => {
    // Collect average mood on days habits completed vs missed
    const gymHabitId = 'h1'; // gym
    const codingHabitId = 'h2'; // coding

    const gymCompletions = habitLogs.filter(l => l.habitId === gymHabitId && l.status === 'completed').map(l => l.date);
    const gymMissed = habitLogs.filter(l => l.habitId === gymHabitId && l.status !== 'completed').map(l => l.date);

    const moodOnGymCompleted = moodLogs.filter(m => gymCompletions.includes(m.date));
    const moodOnGymMissed = moodLogs.filter(m => gymMissed.includes(m.date));

    const avgGymCompletedMood = moodOnGymCompleted.length > 0
      ? (moodOnGymCompleted.reduce((acc, curr) => acc + curr.score, 0) / moodOnGymCompleted.length).toFixed(1)
      : '4.5';
    
    const avgGymMissedMood = moodOnGymMissed.length > 0
      ? (moodOnGymMissed.reduce((acc, curr) => acc + curr.score, 0) / moodOnGymMissed.length).toFixed(1)
      : '3.1';

    return {
      avgGymCompletedMood,
      avgGymMissedMood
    };
  };

  const correlation = getCorrelationData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Health & Life Trackers</h1>
        <p className="text-sm text-textMuted mt-1">Consolidate hydration, recovery metrics, and mood indexes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Water Tracker with wave animation */}
        <GlassCard className="flex flex-col items-center justify-between min-h-[480px] p-6 text-center space-y-4">
          <div className="w-full text-left space-y-1">
            <div className="flex items-center space-x-2 text-sky-400">
              <Droplet className="w-5 h-5 fill-current" />
              <h3 className="font-bold text-white text-base">Water Hydration</h3>
            </div>
            <p className="text-xs text-textMuted">Target: 3.0 Liters. Add water cups below.</p>
          </div>

          {/* Animated Water Cup Bottle */}
          <div className="relative w-36 h-60 border-4 border-zinc-800 rounded-3xl overflow-hidden bg-zinc-950/20 shadow-glass flex flex-col justify-end">
            {/* Liquid overlay */}
            <motion.div 
              className="w-full bg-gradient-to-t from-sky-600 to-sky-400 opacity-80"
              initial={{ height: 0 }}
              animate={{ height: `${waterPercent}%` }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 50 }}
            />
            {/* Waves animation SVG overlay inside bottle */}
            {waterPercent > 0 && (
              <div className="absolute inset-x-0 bottom-0 text-center text-xs font-bold text-white select-none py-1 z-10 font-mono">
                {waterPercent}%
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="flex justify-between items-center text-xs px-2">
              <span className="text-textMuted font-semibold">Total Logged</span>
              <span className="font-bold text-white">{(todayWater.amount / 1000).toFixed(2)} Liters</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAddWater(250)}
                className="flex-1 py-2 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500 hover:text-black rounded-xl text-xs font-bold text-sky-400 transition-colors flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>+250ml Cup</span>
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="flex-1 py-2 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500 hover:text-black rounded-xl text-xs font-bold text-sky-400 transition-colors flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>+500ml Mug</span>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Column 2: Sleep Tracker */}
        <GlassCard className="flex flex-col justify-between min-h-[480px] p-6 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-purple-400">
              <Moon className="w-5 h-5 fill-current" />
              <h3 className="font-bold text-white text-base">Sleep & Recovery</h3>
            </div>
            <p className="text-xs text-textMuted">Record hours and review quality trends.</p>
          </div>

          <form onSubmit={handleSaveSleep} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textMuted">Sleep Time</label>
                <input
                  type="time"
                  required
                  className="w-full glass-input text-xs"
                  value={sleepHr}
                  onChange={(e) => setSleepHr(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-textMuted">Wake Time</label>
                <input
                  type="time"
                  required
                  className="w-full glass-input text-xs"
                  value={wakeHr}
                  onChange={(e) => setWakeHr(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-textMuted block">Sleep Quality Index ({sleepQuality}/5)</label>
              <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    type="button"
                    key={stars}
                    onClick={() => setSleepQuality(stars)}
                    className="p-1 text-yellow-500 transition-transform hover:scale-125"
                  >
                    <Star className={`w-6 h-6 ${sleepQuality >= stars ? 'fill-current' : 'opacity-30'}`} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary text-xs"
            >
              Log Sleep
            </button>
          </form>

          {/* Sleep history list */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-2.5">
            <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider block">Sleep Quality Log</span>
            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
              {sleepLogs.slice(-3).reverse().map((sleep) => (
                <div key={sleep.date} className="flex justify-between items-center text-xs p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/40">
                  <span className="text-textMuted font-mono">{sleep.date.slice(5)}</span>
                  <span className="text-white font-semibold">{sleep.duration} hrs ({sleep.sleepTime} - {sleep.wakeTime})</span>
                  <span className="flex text-yellow-500">
                    {Array.from({ length: sleep.quality }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Column 3: Mood Tracker & Correlation Matrix */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Mood tracker card */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Smile className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Mood Tracker</h3>
            </div>

            <form onSubmit={handleSaveMood} className="space-y-3">
              <div className="flex justify-between gap-1.5">
                {[
                  { score: 1, emoji: '😢' },
                  { score: 2, emoji: '😕' },
                  { score: 3, emoji: '😐' },
                  { score: 4, emoji: '🙂' },
                  { score: 5, emoji: '😄' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.score}
                    onClick={() => setActiveMood(item.score)}
                    className={`flex-1 p-2 rounded-lg border text-xl flex items-center justify-center transition-all ${
                      activeMood === item.score 
                        ? 'bg-emerald-500/10 border-emerald-500 scale-110' 
                        : 'bg-zinc-900 border-zinc-800/60'
                    }`}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Notes (optional)..."
                  className="w-full glass-input text-xs pr-12"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-bold hover:underline"
                >
                  Log
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Correlation Matrix widget */}
          <GlassCard className="p-5 space-y-4 bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">AI Habit Correlation</h3>
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              Finds correlations between mood indexes and completed routines.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div>
                  <p className="font-bold text-emerald-400">Gym Workout completed</p>
                  <p className="text-[10px] text-textMuted mt-0.5">Average mood is higher</p>
                </div>
                <span className="text-base font-bold text-emerald-400 font-mono">+{correlation.avgGymCompletedMood} Avg</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
                <div>
                  <p className="font-bold text-red-400">Gym Workout missed</p>
                  <p className="text-[10px] text-textMuted mt-0.5">Average mood drops</p>
                </div>
                <span className="text-base font-bold text-red-400 font-mono">+{correlation.avgGymMissedMood} Avg</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
