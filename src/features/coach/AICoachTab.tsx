import React, { useState, useRef, useEffect } from 'react';
import { 
  BrainCircuit, Send, User, AlertTriangle, Clock 
} from 'lucide-react';
import { useAppSelector } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';
import dayjs from 'dayjs';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AICoachTab: React.FC = () => {
  const habits = useAppSelector((state) => state.habits.list);
  const logs = useAppSelector((state) => state.habits.logs);
  const sleepLogs = useAppSelector((state) => state.health.sleep);
  const waterLogs = useAppSelector((state) => state.health.water);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Hello Ashwani! I am your AI Coach. I've analyzed your habit completion history, sleep averages, and hydration metrics for the past 30 days. Let me know if you want to run a weekly summary, analyze bad routines, or optimize your scheduling.",
      timestamp: dayjs().format('HH:mm')
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeHabits = habits.filter(h => !h.archived);

  // Scroll Chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: dayjs().format('HH:mm')
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      setTyping(false);
      let responseText = "";

      const query = textToSend.toLowerCase();
      if (query.includes('summary') || query.includes('report')) {
        responseText = generateWeeklyReportText();
      } else if (query.includes('analyze') || query.includes('routine') || query.includes('bad')) {
        responseText = generateRoutineAnalysisText();
      } else if (query.includes('schedule') || query.includes('optimize')) {
        responseText = generateScheduleAdviceText();
      } else {
        responseText = `Thanks for asking! Looking at your profile, your longest active streak is **${Math.max(...habits.map(h => h.longestStreak), 0)} days** on Coding. However, your Evening Reflection habit is lagging. I recommend setting a smaller 5-minute commitment at 9:00 PM to build momentum. Anything else you'd like to check?`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: dayjs().format('HH:mm')
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  // Helper text builders based on Redux state
  const generateWeeklyReportText = () => {
    const totalCompletions = logs.filter(l => l.status === 'completed').length;
    const avgSleep = (sleepLogs.reduce((acc, curr) => acc + curr.duration, 0) / Math.max(1, sleepLogs.length)).toFixed(1);
    const avgWater = Math.round(waterLogs.reduce((acc, curr) => acc + curr.amount, 0) / Math.max(1, waterLogs.length));

    return `### 📊 AI Weekly Insight Report\n\n* **Habit Completion**: You logged **${totalCompletions} completions** this month across ${activeHabits.length} routines.\n* **Hydration Balance**: Your average water intake stands at **${avgWater} ml** (Hydration target achievement rate: **${Math.round((waterLogs.filter(w => w.amount >= w.target).length / Math.max(1, waterLogs.length)) * 100)}%**).\n* **Recovery Sleep**: You averaged **${avgSleep} hours** of sleep. Your highest sleep quality logs occur on days you completed the Morning Workout.\n\n**Action Item**: Shift Evening Reflection to 9:30 PM to avoid screen-time stimulation before bed.`;
  };

  const generateRoutineAnalysisText = () => {
    return `### 🔍 Routine Friction & Sleep Correlation\n\n* **Morning Workout**: Completion is **75%**. However, when your Sleep Quality index falls below 3/5 stars, the workout completion rate drops by **40%**.\n* **Evening Journal**: High Friction. It is currently completed less than **50%** of the time. This corresponds to days when you worked late on Development target goals.\n\n**AI Recommendation**: Protect your bedtime by stopping active coding tasks 1 hour prior.`;
  };

  const generateScheduleAdviceText = () => {
    return `### ⏰ Smart Schedule Optimization\n\n* **Gym workout**: Currently set for **07:00 AM**.\n* **Sleep routine**: Set for **22:30 PM**.\n\nIf you sleep after 11:30 PM, your morning workout is missed 80% of the time. I suggest setting a smart snooze reminder at 10:15 PM to prepare for wind-down.`;
  };

  // Habits streak risk predictions
  const getRiskLevel = (habitName: string) => {
    const habit = habits.find(h => h.name === habitName);
    if (!habit) return { label: 'Low', color: 'text-emerald-400 bg-emerald-500/10' };

    // High risk if streak is 0 and was missed recently
    if (habit.streak === 0) {
      return { label: 'High Risk', color: 'text-red-400 bg-red-500/10' };
    } else if (habit.streak < 3) {
      return { label: 'Medium Risk', color: 'text-amber-400 bg-amber-500/10' };
    }
    return { label: 'Stable', color: 'text-emerald-400 bg-emerald-500/10' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Coach & Insights</h1>
        <p className="text-sm text-textMuted mt-1">Review personalized routines reports and chat with your virtual AI coach.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Dynamic Chat Interface (takes 2 cols) */}
        <div className="lg:col-span-2 flex flex-col h-[520px] glass-panel overflow-hidden border border-zinc-800">
          
          {/* Coach status bar */}
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">FlowCoach AI v1.0</h3>
                <span className="text-[10px] text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  Online & Reading Log State
                </span>
              </div>
            </div>

            <span className="text-[10px] bg-zinc-800 text-textMuted px-2 py-0.5 rounded font-semibold font-mono">
              ACTIVE MOCK LLM
            </span>
          </div>

          {/* Messages Scroller */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === 'user' ? 'bg-[#6366F1] text-white' : 'bg-zinc-900 border border-zinc-800 text-indigo-400'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                  </span>

                  {/* Bubble text */}
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#6366F1] text-white rounded-tr-none' 
                      : 'bg-zinc-900/60 border border-zinc-800 text-textCustom rounded-tl-none prose prose-invert'
                  }`}>
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('###')) {
                        return <h4 key={pIdx} className="font-bold text-sm text-indigo-400 mb-2 mt-1">{paragraph.replace('###', '')}</h4>;
                      }
                      if (paragraph.startsWith('*')) {
                        return (
                          <ul key={pIdx} className="list-disc pl-4 space-y-1 mb-2 font-medium">
                            {paragraph.split('\n').map((item, itemIdx) => (
                              <li key={itemIdx}>{item.replace('*', '').trim()}</li>
                            ))}
                          </ul>
                        );
                      }
                      return <p key={pIdx} className="mb-2 font-medium">{paragraph}</p>;
                    })}
                    <span className="block text-[8px] text-textMuted text-right mt-1 font-mono font-semibold">
                      {msg.timestamp}
                    </span>
                  </div>

                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 bg-zinc-900/40 border border-zinc-800 p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick recommendations action prompt row */}
          <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/20 flex gap-2 overflow-x-auto">
            <button 
              onClick={() => handleSendMessage("Analyze my habits and routine logs")}
              className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-textCustom font-semibold px-2.5 py-1 rounded-lg shrink-0"
            >
              🔍 Analyze Routines
            </button>
            <button 
              onClick={() => handleSendMessage("Generate a weekly report summary")}
              className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-textCustom font-semibold px-2.5 py-1 rounded-lg shrink-0"
            >
              📊 Weekly Summary
            </button>
            <button 
              onClick={() => handleSendMessage("Optimize my schedule timing")}
              className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-textCustom font-semibold px-2.5 py-1 rounded-lg shrink-0"
            >
              ⏰ Schedule Advice
            </button>
          </div>

          {/* Text Send Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask AI Coach..."
              className="flex-1 bg-zinc-950 border border-zinc-800 text-xs rounded-xl py-2.5 px-4 outline-none focus:border-indigo-500 transition-colors"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              className="p-2.5 bg-[#6366F1] hover:bg-indigo-600 text-white rounded-xl shadow-glow shadow-indigo-500/10 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Side: Risk Predictions & Schedule widgets */}
        <div className="space-y-6">
          {/* Risk predictor widget */}
          <GlassCard className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Streak Risk Predictor</h3>
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              Calculates probability risk metrics of breaking streaks based on log friction.
            </p>

            <div className="space-y-3">
              {activeHabits.map((habit) => {
                const risk = getRiskLevel(habit.name);
                return (
                  <div key={habit.id} className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-lg">{habit.emoji}</span>
                      <span className="text-xs text-white truncate max-w-[130px] font-medium">{habit.name}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${risk.color}`}>
                      {risk.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Smart scheduling widget */}
          <GlassCard className="space-y-4 bg-gradient-to-br from-zinc-950 to-zinc-900 border-zinc-800">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Smart Slot Adjustments</h3>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl relative">
                <span className="absolute -top-2 right-3 text-[8px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold font-mono">RECOMMENDED</span>
                <p className="font-bold text-white">Morning Workout (07:00 AM)</p>
                <p className="text-textMuted mt-1 leading-normal">
                  Friction is high. Recommend moving to **07:30 AM** on Tuesdays to match late sleep cycles on Mondays.
                </p>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                <p className="font-bold text-white">Evening Journal (21:30 PM)</p>
                <p className="text-textMuted mt-1 leading-normal">
                  Low completion density. Recommend tying directly after **Sleep target clock (22:30 PM)** to lock habit stacking.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
