import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Tag, Smile, Image as ImageIcon, Mic, Trash2, Calendar, 
  ChevronDown, ChevronUp, AlertCircle, Save, Info 
} from 'lucide-react';
import { useAppDispatch, useAppSelector, addJournalEntry, deleteJournalEntry, addXpAndCoins } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import dayjs from 'dayjs';

export const JournalTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.journal.entries);

  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number>(4); // happy by default
  const [tagsInput, setTagsInput] = useState('');
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Simulated uploads
  const [voiceAttached, setVoiceAttached] = useState(false);
  const [imageAttached, setImageAttached] = useState(false);

  const moods = [
    { score: 1, emoji: '😢', label: 'Awful' },
    { score: 2, emoji: '😕', label: 'Bad' },
    { score: 3, emoji: '😐', label: 'Neutral' },
    { score: 4, emoji: '🙂', label: 'Good' },
    { score: 5, emoji: '😄', label: 'Excellent' }
  ];

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    dispatch(addJournalEntry({
      date: dayjs().format('YYYY-MM-DD'),
      mood,
      content,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    }));

    // Reward XP for journaling
    dispatch(addXpAndCoins({ xp: 40, coins: 20 }));

    // Reset Form
    setContent('');
    setMood(4);
    setTagsInput('');
    setVoiceAttached(false);
    setImageAttached(false);
    setIsWriteOpen(false);
    alert('Reflection logged successfully! +40 XP');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-1">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mindfulness Journal</h1>
          <p className="text-sm text-textMuted mt-1">Reflect on your habits, log moods, and store daily progress logs.</p>
        </div>
        <button
          onClick={() => setIsWriteOpen(!isWriteOpen)}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          {isWriteOpen ? <span>Close Canvas</span> : <span>Write Reflection</span>}
          {!isWriteOpen && <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Editor Drawer / Box */}
      <AnimatePresence>
        {isWriteOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6 space-y-4 border-indigo-500/20 bg-zinc-900/40">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Smile className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">New Reflection Entry</h3>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-4">
                {/* Mood picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-textMuted block">How is your mood today?</label>
                  <div className="flex gap-4">
                    {moods.map((m) => (
                      <button
                        type="button"
                        key={m.score}
                        onClick={() => setMood(m.score)}
                        className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          mood === m.score 
                            ? 'bg-indigo-500/10 border-indigo-500 shadow-glow shadow-indigo-500/5 scale-105' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[10px] font-semibold text-white">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content text */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-textMuted mb-1 font-semibold">
                    <span>Journal Entry (Markdown Supported)</span>
                    <span className="flex items-center text-[10px]">
                      <Info className="w-3 h-3 mr-1" />
                      Markdown enabled
                    </span>
                  </div>
                  <textarea
                    required
                    rows={6}
                    placeholder="### Focus & Routine reflection...&#10;- Bullet items&#10;**Bold notes**"
                    className="w-full glass-input text-xs leading-relaxed font-mono"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                {/* Tags and attachments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="productivity, mindfulness, workout"
                      className="w-full glass-input text-xs"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-textMuted block">Attach Media (Simulation)</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImageAttached(!imageAttached);
                          if (!imageAttached) alert('Simulated Image Upload Successful!');
                        }}
                        className={`flex-1 py-2 px-3 border rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                          imageAttached 
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                            : 'bg-zinc-950 border-zinc-800 text-textMuted hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>{imageAttached ? 'Image Attached' : 'Attach Image'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVoiceAttached(!voiceAttached);
                          if (!voiceAttached) alert('Simulated Voice Note recorded!');
                        }}
                        className={`flex-1 py-2 px-3 border rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                          voiceAttached 
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                            : 'bg-zinc-950 border-zinc-800 text-textMuted hover:text-white'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                        <span>{voiceAttached ? 'Voice Log Loaded' : 'Record Audio'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsWriteOpen(false)}
                    className="btn-secondary text-xs"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Log Reflection</span>
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diary feed list */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-base flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Previous Reflections ({entries.length})</span>
        </h3>

        <div className="space-y-3">
          {entries.length === 0 ? (
            <GlassCard className="py-16 text-center text-textMuted space-y-2">
              <AlertCircle className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
              <h3 className="font-bold text-white">No journal entries written yet</h3>
              <p className="text-xs max-w-xs mx-auto">Click "Write Reflection" to log your mood, thoughts, and earn coins/XP.</p>
            </GlassCard>
          ) : (
            entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const moodObj = moods.find(m => m.score === entry.mood) || moods[3];

              return (
                <GlassCard 
                  key={entry.id} 
                  className={`p-4 border-l-4 transition-all ${
                    isExpanded ? 'bg-zinc-900/30' : 'bg-zinc-950/20'
                  }`}
                  style={{ borderLeftColor: '#6366F1' }}
                >
                  <div 
                    onClick={() => toggleExpand(entry.id)}
                    className="flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                        {moodObj.emoji}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">Reflection Log</h4>
                          <span className="text-[10px] text-textMuted bg-zinc-900 px-2 py-0.5 rounded font-mono font-bold flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {dayjs(entry.date).format('MMM D, YYYY')}
                          </span>
                        </div>
                        <p className="text-[10px] text-textMuted mt-1">
                          Mood: {moodObj.label} · {entry.tags.length} Tags logged
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this journal entry?')) {
                            dispatch(deleteJournalEntry(entry.id));
                          }
                        }}
                        className="p-1 rounded text-textMuted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-textMuted" /> : <ChevronDown className="w-4 h-4 text-textMuted" />}
                    </div>
                  </div>

                  {/* Expanded detail (markdown display) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-zinc-900 text-xs font-medium text-textCustom space-y-4"
                      >
                        <div className="prose prose-invert max-w-none text-left space-y-2 leading-relaxed">
                          {entry.content.split('\n').map((line, idx) => {
                            if (line.startsWith('###')) {
                              return <h4 key={idx} className="font-bold text-sm text-indigo-400 mt-2 mb-1">{line.replace('###', '')}</h4>;
                            }
                            if (line.startsWith('*')) {
                              return <li key={idx} className="ml-4 list-disc font-medium">{line.replace('*', '').trim()}</li>;
                            }
                            if (line.startsWith('-')) {
                              return <li key={idx} className="ml-4 list-disc font-medium">{line.replace('-', '').trim()}</li>;
                            }
                            return <p key={idx} className="my-1.5 font-medium">{line}</p>;
                          })}
                        </div>

                        {/* Tag list */}
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {entry.tags.map(t => (
                              <span key={t} className="text-[9px] bg-zinc-900 border border-zinc-800 text-textMuted px-2 py-0.5 rounded-md flex items-center">
                                <Tag className="w-2.5 h-2.5 mr-1" />
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
