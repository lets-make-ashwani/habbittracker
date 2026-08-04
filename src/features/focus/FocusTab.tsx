import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Flame, BarChart2, ShieldCheck, 
  Coffee, HelpCircle, Activity, Sparkles 
} from 'lucide-react';
import { useAppDispatch, useAppSelector, addFocusSession, addXpAndCoins } from '../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';

export const FocusTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector((state) => state.focus.sessions);

  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeSound, setActiveSound] = useState<string>('Lofi');

  // Soundscape items list
  const soundscapes = [
    { name: 'Lofi Beats', emoji: '🎧' },
    { name: 'Soft Rain', emoji: '🌧️' },
    { name: 'Forest Birds', emoji: '🌲' },
    { name: 'Coffee Shop', emoji: '☕' }
  ];

  // Timer configuration limits
  const modeLimits = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  useEffect(() => {
    setTimeLeft(modeLimits[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleSessionComplete();
    }
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    if (mode === 'focus') {
      dispatch(addFocusSession({ duration: 25, category: 'Development' }));
      dispatch(addXpAndCoins({ xp: 50, coins: 25 }));
      alert('Focus Session Complete! You gained +50 XP and +25 Coins! 🚀');
    } else {
      alert('Break finished! Ready to focus?');
    }
    setMode('focus');
  };

  const handleToggleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(modeLimits[mode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Chart data formatting (aggregates focus minutes by date)
  const chartDataMap: Record<string, number> = {};
  sessions.slice(-7).forEach(s => {
    chartDataMap[s.date] = (chartDataMap[s.date] || 0) + s.duration;
  });

  const chartData = Object.keys(chartDataMap).map(date => ({
    date: date.slice(5), // YYYY-MM-DD to MM-DD
    Minutes: chartDataMap[date]
  }));

  const totalMinFocused = sessions.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Focus Pomodoro</h1>
        <p className="text-sm text-textMuted mt-1">Boost productivity, track sessions, and listen to focus soundscapes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Circular Timer widget (takes 2 cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center glass-panel p-8 min-h-[480px] relative overflow-hidden">
          
          {/* Background glowing rings */}
          <div className="absolute w-[350px] h-[350px] bg-indigo-500 rounded-full blur-[140px] opacity-10 pointer-events-none" />

          {/* Mode selectors */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl z-10 mb-8">
            <button
              onClick={() => setMode('focus')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'focus' ? 'bg-[#6366F1] text-white shadow-glow' : 'text-textMuted hover:text-white'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => setMode('short')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'short' ? 'bg-emerald-500 text-white' : 'text-textMuted hover:text-white'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => setMode('long')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'long' ? 'bg-indigo-600 text-white' : 'text-textMuted hover:text-white'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Circular dial and countdown */}
          <div className="relative w-64 h-64 flex items-center justify-center z-10 mb-8">
            {/* Visual background circle */}
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800/40" />
            
            {/* Pulsing indicator ring */}
            <motion.div 
              className={`absolute inset-0 rounded-full border-4 border-l-transparent transition-all ${
                isRunning ? 'animate-spin border-indigo-500' : 'border-zinc-700'
              }`}
              style={{ animationDuration: '30s' }}
            />

            <div className="text-center space-y-1">
              <span className="text-5xl font-bold tracking-tight text-white font-mono block select-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest block">
                {isRunning ? 'concentration active' : 'timer paused'}
              </span>
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex items-center space-x-4 z-10">
            <button
              onClick={handleReset}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-textMuted hover:text-white rounded-xl transition-all"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleStart}
              className="px-8 py-3 bg-[#6366F1] hover:bg-indigo-600 text-white rounded-2xl shadow-glow shadow-indigo-500/20 font-bold transition-all flex items-center space-x-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 border rounded-xl transition-all ${
                soundEnabled 
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                  : 'bg-zinc-900 border-zinc-800 text-textMuted hover:text-white'
              }`}
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Right Side: Soundscapes & Statistics */}
        <div className="space-y-6">
          {/* Soundscapes deck */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Focus Soundscapes</h3>
              </div>
              {soundEnabled && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold animate-pulse">
                  PLAYING
                </span>
              )}
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              Ambient music streams (simulated). Protect focus and block peripheral noise.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {soundscapes.map((sound) => {
                const isActive = activeSound === sound.name && soundEnabled;
                return (
                  <button
                    key={sound.name}
                    onClick={() => {
                      setActiveSound(sound.name);
                      setSoundEnabled(true);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                      isActive 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-glow shadow-indigo-500/5 scale-[1.03]' 
                        : 'bg-zinc-900/50 border-zinc-800/80 text-textMuted hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-2xl">{sound.emoji}</span>
                    <span>{sound.name}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Statistics */}
          <GlassCard className="space-y-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Focus Activity Grid</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/40">
                <span className="text-[10px] text-textMuted uppercase font-semibold">Total Focus</span>
                <p className="text-lg font-bold text-white mt-1">{totalMinFocused} mins</p>
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/40">
                <span className="text-[10px] text-textMuted uppercase font-semibold">Sessions</span>
                <p className="text-lg font-bold text-white mt-1">{sessions.length} cycles</p>
              </div>
            </div>

            <div className="h-[120px] w-full text-[10px]">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-textMuted text-xs">Run focus timers to plot details</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" stroke="#A1A1AA" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: '#3F3F46', color: '#FFFFFF' }} />
                    <Bar dataKey="Minutes" fill="#6366F1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
