import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Check, X, Clock, Play, Dumbbell, Code, Droplet, Moon, BookOpen, 
  Trash2, Archive, Edit2, AlertCircle, Sparkles, Filter, Search, Tag, MessageSquare, ArrowLeft
} from 'lucide-react';
import { 
  useAppDispatch, useAppSelector, toggleHabitLog, addHabit, editHabit, 
  deleteHabit, archiveHabit, addXpAndCoins 
} from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import dayjs from 'dayjs';

export const TodayTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.habits.list);
  const logs = useAppSelector((state) => state.habits.logs);

  const todayStr = dayjs().format('YYYY-MM-DD');

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Todo' | 'Done'>('All');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Timer Drawer state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerHabitId, setTimerHabitId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Log Notes state
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesHabitId, setNotesHabitId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Create Habit Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Gym');
  const [formDifficulty, setFormDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [formTime, setFormTime] = useState(30);
  const [formReminder, setFormReminder] = useState('08:00');
  const [formEmoji, setFormEmoji] = useState('🏋️‍♂️');
  const [formColor, setFormColor] = useState('#6366F1');
  const [formTags, setFormTags] = useState('');

  // Edit Habit Form State
  const [editFormName, setEditFormName] = useState('');
  const [editFormCategory, setEditFormCategory] = useState('Gym');
  const [editFormDifficulty, setEditFormDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [editFormTime, setEditFormTime] = useState(30);
  const [editFormReminder, setEditFormReminder] = useState('08:00');
  const [editFormEmoji, setEditFormEmoji] = useState('🏋️‍♂️');
  const [editFormColor, setEditFormColor] = useState('#6366F1');
  const [editFormTags, setEditFormTags] = useState('');

  const categories = ['All', 'Gym', 'Development', 'Health', 'Sleep', 'Mindfulness'];
  const emojis = ['🏋️‍♂️', '💻', '💧', '😴', '📓', '🥗', '🧘‍♂️', '📚', '🍎', '🚶‍♂️'];
  const colors = ['#6366F1', '#22C55E', '#0EA5E9', '#A855F7', '#F97316', '#EF4444', '#EC4899'];

  // Timer Effect
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const id = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(id);
    } else if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      handleCompleteTimer();
    }
  }, [isTimerRunning, timeLeft]);

  const handleStartTimer = (habitId: string, durationMin: number) => {
    setTimerHabitId(habitId);
    setTimeLeft(durationMin * 60);
    setIsTimerOpen(true);
    setIsTimerRunning(true);
  };

  const handleCompleteTimer = () => {
    if (timerHabitId) {
      dispatch(toggleHabitLog({ habitId: timerHabitId, date: todayStr, notes: 'Completed focus session.' }));
      const habit = habits.find(h => h.id === timerHabitId);
      if (habit) {
        const xp = habit.difficulty === 'Easy' ? 20 : habit.difficulty === 'Medium' ? 40 : 60; // bonus XP for timer focus!
        dispatch(addXpAndCoins({ xp, coins: Math.floor(xp / 2) }));
        alert(`Congratulations! You completed ${habit.name} focus session and earned ${xp} XP!`);
      }
    }
    setIsTimerOpen(false);
    setTimerHabitId(null);
  };

  const handleOpenNotes = (habitId: string) => {
    setNotesHabitId(habitId);
    const existingLog = logs.find(l => l.habitId === habitId && l.date === todayStr);
    setNoteText(existingLog?.notes || '');
    setIsNotesOpen(true);
  };

  const handleSaveNotes = () => {
    if (notesHabitId) {
      // Toggle off and on to save notes if not logged yet, or replace notes
      const isCompleted = logs.some(l => l.habitId === notesHabitId && l.date === todayStr && l.status === 'completed');
      if (!isCompleted) {
        dispatch(toggleHabitLog({ habitId: notesHabitId, date: todayStr, notes: noteText }));
        const habit = habits.find(h => h.id === notesHabitId);
        if (habit) {
          const xp = habit.difficulty === 'Easy' ? 10 : habit.difficulty === 'Medium' ? 20 : 30;
          dispatch(addXpAndCoins({ xp, coins: Math.floor(xp / 2) }));
        }
      } else {
        // Toggle twice to refresh notes (simplified)
        dispatch(toggleHabitLog({ habitId: notesHabitId, date: todayStr })); // off
        dispatch(toggleHabitLog({ habitId: notesHabitId, date: todayStr, notes: noteText })); // on with notes
      }
    }
    setIsNotesOpen(false);
    setNotesHabitId(null);
  };

  const handleToggleHabit = (habitId: string) => {
    dispatch(toggleHabitLog({ habitId, date: todayStr }));
    
    const isCompleted = logs.some(l => l.habitId === habitId && l.date === todayStr && l.status === 'completed');
    const habit = habits.find(h => h.id === habitId);
    
    if (habit && !isCompleted) {
      const xp = habit.difficulty === 'Easy' ? 10 : habit.difficulty === 'Medium' ? 20 : 30;
      dispatch(addXpAndCoins({ xp, coins: Math.floor(xp / 2) }));
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    dispatch(addHabit({
      name: formName,
      category: formCategory,
      difficulty: formDifficulty,
      estimatedTime: formTime,
      frequency: 'daily',
      reminder: formReminder,
      emoji: formEmoji,
      color: formColor,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean)
    }));

    // Reset Form
    setFormName('');
    setFormTags('');
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setSelectedHabitId(habitId);
      setEditFormName(habit.name);
      setEditFormCategory(habit.category);
      setEditFormDifficulty(habit.difficulty);
      setEditFormTime(habit.estimatedTime);
      setEditFormReminder(habit.reminder);
      setEditFormEmoji(habit.emoji);
      setEditFormColor(habit.color);
      setEditFormTags(habit.tags.join(', '));
      setIsEditOpen(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHabitId || !editFormName.trim()) return;

    const originalHabit = habits.find(h => h.id === selectedHabitId);
    if (!originalHabit) return;

    dispatch(editHabit({
      ...originalHabit,
      name: editFormName,
      category: editFormCategory,
      difficulty: editFormDifficulty,
      estimatedTime: editFormTime,
      reminder: editFormReminder,
      emoji: editFormEmoji,
      color: editFormColor,
      tags: editFormTags.split(',').map(t => t.trim()).filter(Boolean)
    }));

    setIsEditOpen(false);
    setSelectedHabitId(null);
  };

  const handleDelete = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit permanently? All completions will be removed.')) {
      dispatch(deleteHabit(habitId));
      setIsEditOpen(false);
    }
  };

  const handleArchive = (habitId: string) => {
    dispatch(archiveHabit(habitId));
    setIsEditOpen(false);
    alert('Habit archived successfully.');
  };

  // Filter and Search logic
  const filteredHabits = habits.filter(h => {
    if (h.archived) return false;
    if (filterCategory !== 'All' && h.category !== filterCategory) return false;
    
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    const isCompleted = logs.some(l => l.habitId === h.id && l.date === todayStr && l.status === 'completed');
    if (filterStatus === 'Todo' && isCompleted) return false;
    if (filterStatus === 'Done' && !isCompleted) return false;

    return true;
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1 relative">
      {/* Title Header with Add CTA */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Today's Habits</h1>
          <p className="text-sm text-textMuted mt-1">Complete your routines or focus with sessions.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === cat
                  ? 'bg-[#6366F1] text-white shadow-glow shadow-indigo-500/10'
                  : 'bg-zinc-900 border border-zinc-800 text-textMuted hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 w-4 h-4 text-textMuted top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search habits or tags..."
              className="w-full glass-input pl-9 text-xs py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs px-2 text-white focus:outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="All">All status</option>
            <option value="Todo">Todo</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {/* Habit List View */}
      {filteredHabits.length === 0 ? (
        <GlassCard className="py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#6366F1] mx-auto opacity-75" />
          <h3 className="text-lg font-bold text-white">No habits match your filters</h3>
          <p className="text-sm text-textMuted max-w-xs mx-auto">
            Try adjusting your search queries or category tags. Or create a new habit.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-secondary text-xs inline-flex items-center space-x-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Habit</span>
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => {
            const isCompleted = logs.some(
              l => l.habitId === habit.id && l.date === todayStr && l.status === 'completed'
            );
            const activeLog = logs.find(
              l => l.habitId === habit.id && l.date === todayStr && l.status === 'completed'
            );

            return (
              <GlassCard 
                key={habit.id} 
                className={`flex flex-col justify-between p-5 hoverEffect border-l-4 transition-all ${
                  isCompleted ? 'bg-zinc-900/40 border-emerald-500' : 'border-zinc-800'
                }`}
                style={{ borderLeftColor: isCompleted ? '#22C55E' : habit.color }}
              >
                {/* Upper row: Emoji, Name, Edit CTA */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">{habit.emoji}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-base">{habit.name}</h3>
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ 
                            backgroundColor: `${habit.color}15`, 
                            color: habit.color 
                          }}
                        >
                          {habit.difficulty}
                        </span>
                      </div>
                      <p className="text-[10px] text-textMuted mt-1">
                        {habit.category} · {habit.reminder} · {habit.estimatedTime}m duration
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(habit.id)}
                    className="p-1 text-textMuted hover:text-white rounded hover:bg-zinc-800/80 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tag badges */}
                {habit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {habit.tags.map(t => (
                      <span key={t} className="text-[9px] font-mono bg-zinc-900 border border-zinc-800/60 text-textMuted px-2 py-0.5 rounded-md flex items-center">
                        <Tag className="w-2 h-2 mr-1" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Separator line */}
                <div className="border-t border-zinc-800/80 my-4" />

                {/* Footer action row */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {/* Streak Info */}
                    <div className="text-left">
                      <span className="text-[10px] text-textMuted uppercase font-semibold">Streak</span>
                      <p className="text-xs font-bold text-white">{habit.streak} days</p>
                    </div>
                    {/* Log Note status */}
                    <button 
                      onClick={() => handleOpenNotes(habit.id)}
                      className={`text-[10px] flex items-center space-x-1 ${
                        activeLog?.notes ? 'text-indigo-400 font-semibold' : 'text-textMuted hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{activeLog?.notes ? 'Edit note' : 'Add note'}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Timer Trigger */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleStartTimer(habit.id, habit.estimatedTime)}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-textMuted hover:text-indigo-400 hover:border-indigo-500/30 transition-colors"
                        title="Start focus timer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Completion Action */}
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-900 border border-zinc-800 text-textMuted hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400 font-bold' : ''}`} />
                      <span>{isCompleted ? 'Completed' : 'Complete'}</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Floating Focus Timer Drawer */}
      <AnimatePresence>
        {isTimerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm glass-panel p-8 text-center space-y-6"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-white text-sm">Focus Session Active</h3>
                <button 
                  onClick={() => {
                    setIsTimerRunning(false);
                    setIsTimerOpen(false);
                  }}
                  className="p-1 rounded bg-zinc-800/80 text-textMuted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-5xl text-white font-mono font-bold tracking-tight block">
                  {formatTime(timeLeft)}
                </span>
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  {habits.find(h => h.id === timerHabitId)?.name}
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="btn-primary text-xs w-28"
                >
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={handleCompleteTimer}
                  className="btn-secondary text-xs w-28"
                >
                  Skip to End
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adding Note Drawer */}
      <AnimatePresence>
        {isNotesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel p-6 space-y-4"
            >
              <h3 className="font-bold text-white text-base">Log Reflected Note</h3>
              <p className="text-xs text-textMuted">Add specific details about your habit session today.</p>
              
              <textarea
                className="w-full h-24 glass-input text-xs"
                placeholder="E.g. completed 5 sets of squats. Had high focus energy today."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsNotesOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="btn-primary text-xs"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE HABIT MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="w-full max-w-lg glass-panel p-6 space-y-5 my-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold text-white text-base">Create HabitFlow Routine</span>
                </div>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded bg-zinc-800/80 text-textMuted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-textMuted">Habit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Code for 30 minutes, Drink water..."
                    className="w-full glass-input text-xs"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Category</label>
                    <select
                      className="w-full glass-input text-xs"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Difficulty (XP Weight)</label>
                    <select
                      className="w-full glass-input text-xs"
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as any)}
                    >
                      <option value="Easy">Easy (10 XP)</option>
                      <option value="Medium">Medium (20 XP)</option>
                      <option value="Hard">Hard (30 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full glass-input text-xs"
                      value={formTime}
                      onChange={(e) => setFormTime(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Reminder Time</label>
                    <input
                      type="time"
                      required
                      className="w-full glass-input text-xs"
                      value={formReminder}
                      onChange={(e) => setFormReminder(e.target.value)}
                    />
                  </div>
                </div>

                {/* Emoji Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMuted">Select Emoji Icon</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {emojis.map(e => (
                      <button
                        type="button"
                        key={e}
                        onClick={() => setFormEmoji(e)}
                        className={`text-xl p-2 rounded-lg border transition-all ${
                          formEmoji === e ? 'bg-indigo-500/20 border-indigo-500' : 'bg-zinc-900 border-zinc-800'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMuted">Select Theme Color</label>
                  <div className="flex gap-3">
                    {colors.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormColor(c)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          formColor === c ? 'scale-125 border-white ring-2 ring-indigo-500/40' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-textMuted">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="gym, health, workout"
                    className="w-full glass-input text-xs"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs"
                  >
                    Create Routine
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT/CRUD HABIT MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="w-full max-w-lg glass-panel p-6 space-y-5 my-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-white text-base">Edit Routine Details</h3>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 rounded bg-zinc-800/80 text-textMuted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-textMuted">Habit Name</label>
                  <input
                    type="text"
                    required
                    className="w-full glass-input text-xs"
                    value={editFormName}
                    onChange={(e) => setEditFormName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Category</label>
                    <select
                      className="w-full glass-input text-xs"
                      value={editFormCategory}
                      onChange={(e) => setEditFormCategory(e.target.value)}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Difficulty (XP Weight)</label>
                    <select
                      className="w-full glass-input text-xs"
                      value={editFormDifficulty}
                      onChange={(e) => setEditFormDifficulty(e.target.value as any)}
                    >
                      <option value="Easy">Easy (10 XP)</option>
                      <option value="Medium">Medium (20 XP)</option>
                      <option value="Hard">Hard (30 XP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full glass-input text-xs"
                      value={editFormTime}
                      onChange={(e) => setEditFormTime(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Reminder Time</label>
                    <input
                      type="time"
                      required
                      className="w-full glass-input text-xs"
                      value={editFormReminder}
                      onChange={(e) => setEditFormReminder(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMuted">Select Emoji Icon</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {emojis.map(e => (
                      <button
                        type="button"
                        key={e}
                        onClick={() => setEditFormEmoji(e)}
                        className={`text-xl p-2 rounded-lg border transition-all ${
                          editFormEmoji === e ? 'bg-indigo-500/20 border-indigo-500' : 'bg-zinc-900 border-zinc-800'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-textMuted">Select Theme Color</label>
                  <div className="flex gap-3">
                    {colors.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setEditFormColor(c)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          editFormColor === c ? 'scale-125 border-white ring-2 ring-indigo-500/40' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-textMuted">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    className="w-full glass-input text-xs"
                    value={editFormTags}
                    onChange={(e) => setEditFormTags(e.target.value)}
                  />
                </div>

                <div className="flex justify-between pt-3 border-t border-zinc-800">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => selectedHabitId && handleDelete(selectedHabitId)}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectedHabitId && handleArchive(selectedHabitId)}
                      className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-textMuted rounded-lg text-xs flex items-center space-x-1"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary text-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
