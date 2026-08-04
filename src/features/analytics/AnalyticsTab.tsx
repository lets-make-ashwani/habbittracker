import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, BarChart2, Activity, Calendar, Award } from 'lucide-react';
import { useAppSelector } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import dayjs from 'dayjs';

export const AnalyticsTab: React.FC = () => {
  const habits = useAppSelector((state) => state.habits.list);
  const logs = useAppSelector((state) => state.habits.logs);
  const waterLogs = useAppSelector((state) => state.health.water);
  const sleepLogs = useAppSelector((state) => state.health.sleep);
  const focusSessions = useAppSelector((state) => state.focus.sessions);

  const [timeframe, setTimeframe] = useState<'30days' | '7days'>('30days');

  const activeHabits = habits.filter(h => !h.archived);

  // 1. Calculate completion trend for the last N days
  const daysCount = timeframe === '30days' ? 30 : 7;
  const trendData = Array.from({ length: daysCount }, (_, idx) => {
    const d = dayjs().subtract(daysCount - 1 - idx, 'day');
    const dStr = d.format('YYYY-MM-DD');
    const dayLogs = logs.filter(l => l.date === dStr && l.status === 'completed');
    
    const activeHabitsOnDate = habits.filter(h => {
      return !h.archived && dayjs(h.createdAt).isBefore(d.add(1, 'day'));
    });

    const completionRate = activeHabitsOnDate.length > 0 
      ? Math.round((dayLogs.length / activeHabitsOnDate.length) * 100)
      : 0;

    return {
      date: d.format('MMM DD'),
      Rate: completionRate
    };
  });

  // 2. Streaks comparison data
  const streakData = activeHabits.map(h => ({
    name: h.name.length > 15 ? h.name.slice(0, 15) + '...' : h.name,
    Current: h.streak,
    Longest: h.longestStreak
  }));

  // 3. Category distribution (Radar Chart)
  const categorySummary = ['Gym', 'Development', 'Health', 'Sleep', 'Mindfulness'].map(cat => {
    const catHabits = activeHabits.filter(h => h.category === cat);
    
    // total logs for this category
    const catLogs = logs.filter(l => {
      if (l.status !== 'completed') return false;
      const habit = habits.find(h => h.id === l.habitId);
      return habit?.category === cat;
    });

    const potentialCompletions = catHabits.length * daysCount;
    const score = potentialCompletions > 0 
      ? Math.round((catLogs.length / potentialCompletions) * 100)
      : 0;

    return {
      subject: cat,
      Score: score,
      fullMark: 100
    };
  });

  // 4. Focus session time spent distribution (Pie Chart)
  const focusCategoriesMap: Record<string, number> = {};
  focusSessions.forEach(s => {
    focusCategoriesMap[s.category] = (focusCategoriesMap[s.category] || 0) + s.duration;
  });

  const pieColors = ['#6366F1', '#10B981', '#38BDF8', '#8B5CF6', '#F97316'];
  const focusPieData = Object.keys(focusCategoriesMap).map((cat, idx) => ({
    name: cat,
    value: focusCategoriesMap[cat],
    color: pieColors[idx % pieColors.length]
  }));

  // Generic metrics
  const avgCompletionRate = Math.round(
    trendData.reduce((acc, curr) => acc + curr.Rate, 0) / trendData.length
  );
  
  const totalFocusMin = focusSessions.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-textMuted mt-1">Detailed statistical records of your habits & routines.</p>
        </div>
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setTimeframe('7days')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              timeframe === '7days' ? 'bg-[#6366F1] text-white' : 'text-textMuted hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe('30days')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              timeframe === '30days' ? 'bg-[#6366F1] text-white' : 'text-textMuted hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Small Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase font-semibold">Average Rate</span>
            <p className="text-xl font-bold text-white mt-0.5">{avgCompletionRate}%</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase font-semibold">Focus Hours</span>
            <p className="text-xl font-bold text-white mt-0.5">{(totalFocusMin / 60).toFixed(1)} hrs</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase font-semibold">Water Intakes</span>
            <p className="text-xl font-bold text-white mt-0.5">
              {waterLogs.filter(w => w.amount >= w.target).length} Goals Met
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-textMuted uppercase font-semibold">Best Streak</span>
            <p className="text-xl font-bold text-white mt-0.5">
              {Math.max(...habits.map(h => h.longestStreak), 0)} Days
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion rate trend line */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Completion Rate Trend</h3>
          </div>
          <div className="h-[280px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="date" stroke="#A1A1AA" />
                <YAxis stroke="#A1A1AA" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', color: '#FFFFFF' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Rate" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Streaks comparison bar chart */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Habits Streak Performance</h3>
          </div>
          <div className="h-[280px] w-full text-xs">
            {streakData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-textMuted text-xs">Create habits to plot streaks</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="name" stroke="#A1A1AA" />
                  <YAxis stroke="#A1A1AA" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', color: '#FFFFFF' }}
                  />
                  <Bar dataKey="Current" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Longest" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        {/* Category representation radar chart */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Category Performance Matrix</h3>
          </div>
          <div className="h-[280px] w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={categorySummary}>
                <PolarGrid stroke="#27272A" />
                <PolarAngleAxis dataKey="subject" stroke="#A1A1AA" />
                <PolarRadiusAxis stroke="#A1A1AA" angle={30} domain={[0, 100]} />
                <Radar name="Completions" dataKey="Score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', color: '#FFFFFF' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Focus distribution pie chart */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Focused Focus Time (Minutes)</h3>
          </div>
          <div className="h-[280px] w-full text-xs flex flex-col md:flex-row items-center justify-around">
            {focusPieData.length === 0 ? (
              <div className="text-textMuted text-xs">Run focus sessions to display data</div>
            ) : (
              <>
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={focusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {focusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', color: '#FFFFFF' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Labels legend */}
                <div className="space-y-2 mt-4 md:mt-0 text-left">
                  {focusPieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-textCustom font-medium text-xs">{item.name}:</span>
                      <span className="text-textMuted font-mono text-xs">{item.value}m</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
