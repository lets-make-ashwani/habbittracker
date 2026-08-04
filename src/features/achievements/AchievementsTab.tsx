import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, CheckCircle2, Coins, Palette, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector, unlockTheme, setTheme } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';

export const AchievementsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Shop themes database
  const shopThemes = [
    { id: 'default', name: 'Indigo Core', price: 0, color: '#6366F1', desc: 'Standard platform styling' },
    { id: 'midnight', name: 'Midnight Neon', price: 100, color: '#EC4899', desc: 'Sleek hot-pink dark cyber vibe' },
    { id: 'cyberpunk', name: 'Cyberpunk Gold', price: 200, color: '#F59E0B', desc: 'High contrast tactical amber' },
    { id: 'emerald', name: 'Emerald Synth', price: 300, color: '#10B981', desc: 'Relaxing retro mint terminal green' },
    { id: 'lavender', name: 'Lavender Bliss', price: 150, color: '#8B5CF6', desc: 'Calming lilac lavender tone' }
  ];

  const handleBuyOrSelect = (themeId: string, price: number) => {
    const isUnlocked = auth.unlockedThemes.includes(themeId);
    
    if (isUnlocked) {
      dispatch(setTheme(themeId));
      alert(`Applied ${themeId} theme!`);
    } else {
      if (auth.coins >= price) {
        dispatch(unlockTheme({ themeId, price }));
        dispatch(setTheme(themeId));
        alert(`Successfully purchased and unlocked ${themeId} theme!`);
      } else {
        alert('Insufficient coins! Complete more habits to earn coins.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-1">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Achievements & Shop</h1>
          <p className="text-sm text-textMuted mt-1">Unlock badges and spend your coins on premium interface themes.</p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-xl text-yellow-400 font-semibold shadow-glow shadow-yellow-500/5">
          <Coins className="w-5 h-5 animate-spin" />
          <span className="font-mono text-base">{auth.coins} Coins</span>
        </div>
      </div>

      {/* Gamification summary card */}
      <GlassCard className="p-6 bg-gradient-to-br from-indigo-950/20 via-zinc-950 to-zinc-900 border-indigo-900/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Level Progress</span>
          <h3 className="text-3xl font-extrabold text-white">Level {auth.level}</h3>
          <p className="text-xs text-textMuted">Progress compounded across all tracked routines.</p>
        </div>

        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-textMuted">XP Status: {auth.xp} / 1000 XP</span>
            <span className="text-indigo-400">{(1000 - auth.xp)} XP to Level {auth.level + 1}</span>
          </div>
          <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#6366F1] to-purple-500"
              style={{ width: `${(auth.xp / 1000) * 100}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${(auth.xp / 1000) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Achievements list (Milestones) */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Badges & Milestones</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {auth.achievements.map((ach) => (
              <GlassCard 
                key={ach.id} 
                className={`p-4 flex items-center justify-between border transition-all ${
                  ach.unlocked 
                    ? 'border-indigo-500/30 bg-zinc-900/30' 
                    : 'border-zinc-800 bg-zinc-950/20'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Badge visual */}
                  <span className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border ${
                    ach.unlocked ? 'border-indigo-500/50 shadow-glow shadow-indigo-500/10' : 'border-zinc-800 opacity-40'
                  }`}>
                    {ach.unlocked ? ach.badgeUrl : <Lock className="w-5 h-5 text-textMuted" />}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">{ach.title}</h4>
                      {ach.unlocked && <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded font-semibold">Unlocked</span>}
                    </div>
                    <p className="text-xs text-textMuted max-w-xs">{ach.description}</p>
                    
                    {/* Progress Slider */}
                    {!ach.unlocked && (
                      <div className="flex items-center space-x-2 pt-1 w-48">
                        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                          <div className="h-full bg-[#6366F1]" style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-textMuted font-bold">
                          {ach.progress}/{ach.maxProgress}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-yellow-400 block">+{ach.xpReward} XP</span>
                  {ach.unlockedAt && (
                    <span className="text-[10px] text-textMuted mt-1 block">Unlocked {ach.unlockedAt}</span>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Theme Shop */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <span>Theme Marketplace</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {shopThemes.map((theme) => {
              const isUnlocked = auth.unlockedThemes.includes(theme.id);
              const isActive = auth.currentTheme === theme.id;

              return (
                <GlassCard 
                  key={theme.id}
                  className={`p-4 flex items-center justify-between border-l-4 transition-all ${
                    isActive ? 'bg-zinc-900/50 border-white' : 'bg-zinc-950/20'
                  }`}
                  style={{ borderLeftColor: theme.color }}
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Visual dot preview */}
                    <div className="w-6 h-6 rounded-full flex items-center justify-center border border-white/20 shadow-glow" style={{ backgroundColor: theme.color }}>
                      {isActive && <Check className="w-3.5 h-3.5 text-white font-bold" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{theme.name}</h4>
                      <p className="text-xs text-textMuted">{theme.desc}</p>
                    </div>
                  </div>

                  <div>
                    {isActive ? (
                      <button className="px-3.5 py-1.5 bg-zinc-900 text-xs text-white border border-zinc-800 rounded-lg font-bold select-none cursor-default">
                        Active Theme
                      </button>
                    ) : isUnlocked ? (
                      <button 
                        onClick={() => handleBuyOrSelect(theme.id, 0)}
                        className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg font-semibold"
                      >
                        Apply Theme
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBuyOrSelect(theme.id, theme.price)}
                        className="px-3.5 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-black rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Buy ({theme.price})</span>
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
