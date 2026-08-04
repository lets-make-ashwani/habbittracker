import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Filter, Clock, CheckCircle2, ChevronLeft, ChevronRight, X, Heart } from 'lucide-react';
import { useAppSelector } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import dayjs from 'dayjs';

export const CalendarTab: React.FC = () => {
  const habits = useAppSelector((state) => state.habits.list);
  const logs = useAppSelector((state) => state.habits.logs);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string | null>(dayjs().format('YYYY-MM-DD'));
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());

  const categories = ['All', 'Gym', 'Development', 'Health', 'Sleep', 'Mindfulness'];

  // Generate 365 days of cells for the selected year
  const startOfYear = dayjs(`${viewYear}-01-01`);
  const daysInYear = startOfYear.isLeapYear() ? 366 : 365;
  const daysArray = Array.from({ length: daysInYear }, (_, idx) => {
    return startOfYear.add(idx, 'day').format('YYYY-MM-DD');
  });

  // Calculate day completion values based on selected category filter
  const getDayCompletionDetails = (dateStr: string) => {
    const activeHabits = habits.filter(h => {
      if (h.archived) return false;
      if (activeCategory !== 'All' && h.category !== activeCategory) return false;
      // Filter out habits created after this date
      return dayjs(h.createdAt).isBefore(dayjs(dateStr).add(1, 'day'));
    });

    const dayLogs = logs.filter(l => {
      const isMatch = l.date === dateStr && l.status === 'completed';
      if (!isMatch) return false;
      if (activeCategory === 'All') return true;
      const habit = habits.find(h => h.id === l.habitId);
      return habit?.category === activeCategory;
    });

    const total = activeHabits.length;
    const completed = dayLogs.length;
    const ratio = total > 0 ? completed / total : 0;

    let level = 0;
    if (ratio > 0.75) level = 4;
    else if (ratio > 0.5) level = 3;
    else if (ratio > 0.25) level = 2;
    else if (ratio > 0) level = 1;

    return { completed, total, ratio, level, logs: dayLogs };
  };

  // Find logs for the selected date detail timeline
  const getTimelineLogsForDate = (dateStr: string) => {
    // Habits active around that date
    const dayHabits = habits.filter(h => !h.archived && dayjs(h.createdAt).isBefore(dayjs(dateStr).add(1, 'day')));
    
    return dayHabits.map(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === dateStr);
      return {
        habit: h,
        log: log || null
      };
    });
  };

  const timelineData = selectedDate ? getTimelineLogsForDate(selectedDate) : [];
  const selectedDateFormatted = selectedDate ? dayjs(selectedDate).format('dddd, MMMM D, YYYY') : '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Interactive Calendar</h1>
          <p className="text-sm text-textMuted mt-1">Review your habit density over time. Click any day for logs.</p>
        </div>
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button 
            onClick={() => setViewYear(prev => prev - 1)}
            className="p-1.5 hover:bg-zinc-800 rounded text-textMuted hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white px-2 font-mono">{viewYear}</span>
          <button 
            onClick={() => setViewYear(prev => prev + 1)}
            className="p-1.5 hover:bg-zinc-800 rounded text-textMuted hover:text-white transition-colors"
            disabled={viewYear >= new Date().getFullYear()}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 items-center bg-zinc-950/20 border border-zinc-800/40 p-2.5 rounded-xl">
        <span className="text-xs text-textMuted flex items-center mr-2">
          <Filter className="w-3.5 h-3.5 mr-1" />
          Filter Calendar:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-[#6366F1] text-white shadow-glow shadow-indigo-500/10'
                : 'bg-zinc-900/60 text-textMuted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Contribution Grid */}
      <GlassCard className="p-6 overflow-x-auto space-y-4">
        <div className="min-w-[800px] flex flex-col">
          <div className="grid grid-flow-col gap-1.5 mx-auto" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
            {daysArray.map((dateStr) => {
              const details = getDayCompletionDetails(dateStr);
              const isSelected = selectedDate === dateStr;
              
              let bgClass = 'bg-zinc-900/30 border border-zinc-800/20';
              if (details.level === 1) bgClass = 'bg-indigo-950/40 border border-indigo-900/20';
              else if (details.level === 2) bgClass = 'bg-indigo-800/40 border border-indigo-700/30';
              else if (details.level === 3) bgClass = 'bg-indigo-600/60 border border-indigo-500/30';
              else if (details.level === 4) bgClass = 'bg-indigo-500 shadow-glow shadow-indigo-500/5';

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`w-3.5 h-3.5 rounded-sm heatmap-cell relative transition-all ${bgClass} ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 z-10' : ''
                  }`}
                  title={`${dateStr}: ${details.completed}/${details.total} habits completed`}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-textMuted mt-4 px-2 font-mono font-semibold">
            <span>JANUARY {viewYear}</span>
            <span>DECEMBER {viewYear}</span>
          </div>
        </div>
      </GlassCard>

      {/* Double Column details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Day Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Timeline for {selectedDateFormatted}</span>
          </h3>

          <div className="space-y-3">
            {timelineData.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800/40 rounded-2xl text-textMuted text-xs">
                No active habits configured on this day.
              </div>
            ) : (
              timelineData.map(({ habit, log }) => {
                const isCompleted = log?.status === 'completed';
                const isSkipped = log?.status === 'skipped';
                
                return (
                  <GlassCard 
                    key={habit.id} 
                    className={`flex items-center justify-between p-4 border-l-4 transition-all ${
                      isCompleted ? 'border-emerald-500 bg-zinc-900/40' : 
                      isSkipped ? 'border-amber-500 bg-zinc-900/20' : 
                      'border-zinc-800 bg-zinc-950/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="text-2xl">{habit.emoji}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{habit.name}</h4>
                        <p className="text-[10px] text-textMuted mt-0.5">
                          {habit.category} · scheduled for {habit.reminder}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isCompleted ? (
                        <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Done (+{log.xpEarned} XP)</span>
                        </div>
                      ) : isSkipped ? (
                        <span className="text-amber-500 text-xs font-semibold">Skipped</span>
                      ) : (
                        <span className="text-zinc-500 text-xs font-semibold">Missed (0 XP)</span>
                      )}
                      
                      {log?.notes && (
                        <p className="text-[10px] italic text-textMuted mt-1 bg-zinc-900 px-2 py-0.5 rounded max-w-[200px] truncate">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Summary Cards for Selected Day */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base">Day Statistics</h3>
          
          <GlassCard className="p-5 space-y-4">
            {selectedDate && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-textMuted font-semibold">Daily Rate</span>
                  <span className="text-sm font-bold text-white">
                    {Math.round(getDayCompletionDetails(selectedDate).ratio * 100)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getDayCompletionDetails(selectedDate).ratio * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/40">
                    <span className="text-[10px] text-textMuted uppercase font-semibold">Completed</span>
                    <p className="text-xl font-bold text-white mt-1">
                      {getDayCompletionDetails(selectedDate).completed}
                    </p>
                  </div>
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/40">
                    <span className="text-[10px] text-textMuted uppercase font-semibold">XP Earned</span>
                    <p className="text-xl font-bold text-white mt-1">
                      {getDayCompletionDetails(selectedDate).logs.reduce((acc, l) => acc + l.xpEarned, 0)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-3">
                  <span className="text-xs text-textMuted font-semibold uppercase tracking-wider block mb-2">Category distribution</span>
                  <div className="space-y-1.5 text-xs text-textCustom">
                    {categories.filter(c => c !== 'All').map(cat => {
                      const count = getTimelineLogsForDate(selectedDate).filter(({ habit, log }) => {
                        return habit.category === cat && log?.status === 'completed';
                      }).length;
                      if (count === 0) return null;
                      return (
                        <div key={cat} className="flex justify-between items-center">
                          <span className="text-textMuted">{cat}</span>
                          <span className="font-bold">{count} habits</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
