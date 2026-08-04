import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, logoutUser, clearLevelUpFlag } from '../../store';
import { 
  LayoutDashboard, CheckSquare, Calendar, BarChart3, Award, BrainCircuit, 
  BookOpen, Clock, Heart, Settings, LogOut, Bell, Flame, Coins, ShieldAlert,
  Menu, X, Sparkles, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import views
import { DashboardTab } from '../../features/dashboard/DashboardTab';
import { TodayTab } from '../../features/habits/TodayTab';
import { CalendarTab } from '../../features/calendar/CalendarTab';
import { AnalyticsTab } from '../../features/analytics/AnalyticsTab';
import { AchievementsTab } from '../../features/achievements/AchievementsTab';
import { AICoachTab } from '../../features/coach/AICoachTab';
import { JournalTab } from '../../features/journal/JournalTab';
import { FocusTab } from '../../features/focus/FocusTab';
import { HealthTab } from '../../features/health/HealthTab';
import { SettingsTab } from '../../features/settings/SettingsTab';

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mock Notification lists
  const notifications = [
    { id: 'n1', text: "Your daily habits are waiting for reflection!", time: "10 min ago", unread: true },
    { id: 'n2', text: "Unlocked milestone: Hydro Homie! +150 XP", time: "5 hrs ago", unread: false },
    { id: 'n3', text: "AI Coach suggested slot adjustments for Gym Workout.", time: "1 day ago", unread: false }
  ];

  // Theme styling overrides mapping based on selected theme
  const getThemeClass = (themeId: string) => {
    switch (themeId) {
      case 'midnight':
        return 'theme-midnight text-[#EC4899]';
      case 'cyberpunk':
        return 'theme-cyberpunk text-[#F59E0B]';
      case 'emerald':
        return 'theme-emerald text-[#10B981]';
      case 'lavender':
        return 'theme-lavender text-[#8B5CF6]';
      default:
        return 'theme-default text-[#6366F1]';
    }
  };

  const getThemePrimaryColor = (themeId: string) => {
    switch (themeId) {
      case 'midnight': return '#EC4899';
      case 'cyberpunk': return '#F59E0B';
      case 'emerald': return '#10B981';
      case 'lavender': return '#8B5CF6';
      default: return '#6366F1';
    }
  };

  const activeColor = getThemePrimaryColor(auth.currentTheme);

  // Set visual css variable on body for dynamic SVG animations
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-accent', activeColor);
  }, [activeColor]);

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', name: "Today's Habits", icon: CheckSquare },
    { id: 'calendar', name: 'Heatmap Grid', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'achievements', name: 'Badges & Shop', icon: Award },
    { id: 'coach', name: 'AI Coach', icon: BrainCircuit },
    { id: 'journal', name: 'Journal', icon: BookOpen },
    { id: 'focus', name: 'Focus Pomodoro', icon: Clock },
    { id: 'health', name: 'Health Utilities', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm('Logout: Are you sure you want to end your current session?')) {
      dispatch(logoutUser());
    }
  };

  const handleClearLevelUp = () => {
    dispatch(clearLevelUpFlag());
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab setActiveTab={setActiveTab} />;
      case 'today':
        return <TodayTab />;
      case 'calendar':
        return <CalendarTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'achievements':
        return <AchievementsTab />;
      case 'coach':
        return <AICoachTab />;
      case 'journal':
        return <JournalTab />;
      case 'focus':
        return <FocusTab />;
      case 'health':
        return <HealthTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090B] text-white overflow-hidden font-sans">
      
      {/* Background Ambience Radial Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[200px] opacity-10 pointer-events-none" style={{ backgroundColor: activeColor }} />

      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden lg:flex flex-col w-64 bg-zinc-950 border-r border-zinc-900 justify-between shrink-0 relative z-30">
        
        {/* Upper Brand / Logo */}
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div 
              className="flex items-center justify-center w-9 h-9 rounded-xl shadow-glow transition-all"
              style={{ 
                background: `linear-gradient(135deg, ${activeColor} 0%, #18181B 100%)`,
                boxShadow: `0 0 15px ${activeColor}30`
              }}
            >
              <span className="text-lg text-white font-extrabold">H</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center">
              HabitFlow 
              <span className="ml-1 text-xs font-mono font-bold px-1 rounded py-0.5 bg-zinc-900 border border-zinc-800" style={{ color: activeColor }}>
                AI
              </span>
            </span>
          </div>
        </div>

        {/* Scrollable Nav Item List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-white' 
                    : 'text-textMuted hover:text-white hover:bg-zinc-900/40'
                }`}
                style={{
                  backgroundColor: isActive ? `${activeColor}12` : 'transparent',
                  border: isActive ? `1px solid ${activeColor}20` : '1px solid transparent'
                }}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? activeColor : undefined }} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* User profile bottom stats panel */}
        <div className="p-4 border-t border-zinc-900 space-y-4">
          
          {/* Stats quick view */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{auth.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{auth.name}</p>
                <p className="text-[10px] text-textMuted font-medium truncate">{auth.email}</p>
              </div>
            </div>

            {/* Level status */}
            <div className="space-y-1 pt-1.5 border-t border-zinc-800/50">
              <div className="flex justify-between text-[9px] font-bold">
                <span className="text-textMuted">Lvl {auth.level}</span>
                <span style={{ color: activeColor }}>{auth.xp}/1000 XP</span>
              </div>
              <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(auth.xp / 1000) * 100}%`, backgroundColor: activeColor }} />
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-textMuted hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
          >
            <span className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </span>
          </button>
        </div>

      </div>

      {/* 2. MAIN LAYOUT AND PAGES PANEL */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-20">
        
        {/* Top Header Row */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          
          <div className="flex items-center space-x-3">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-textMuted hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-white capitalize tracking-wide select-none">
              {navItems.find(n => n.id === activeTab)?.name || 'HabitFlow'}
            </h2>
          </div>

          {/* User currency status rows */}
          <div className="flex items-center space-x-4">
            
            {/* Streak metrics */}
            <div className="flex items-center space-x-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg text-orange-400 text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{auth.streak}d</span>
            </div>

            {/* Coins indicator */}
            <button 
              onClick={() => setActiveTab('achievements')}
              className="flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg text-yellow-400 text-xs font-bold font-mono hover:bg-yellow-500 hover:text-black transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{auth.coins}</span>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-textMuted hover:text-white transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>

              {/* Dropdown panel */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    {/* Click-out blocker backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 glass-panel p-4 z-50 border border-zinc-800"
                    >
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
                        <h4 className="font-bold text-xs text-white">Notifications</h4>
                        <span className="text-[10px] text-[#6366F1] font-semibold cursor-pointer hover:underline">Mark read</span>
                      </div>

                      <div className="space-y-3">
                        {notifications.map(item => (
                          <div 
                            key={item.id} 
                            className="flex flex-col gap-0.5 p-2 rounded-lg hover:bg-zinc-900/60 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <p className={`text-xs ${item.unread ? 'font-semibold text-white' : 'text-textMuted'}`}>
                                {item.text}
                              </p>
                              {item.unread && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1" />}
                            </div>
                            <span className="text-[9px] text-textMuted font-mono">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar trigger settings */}
            <button 
              onClick={() => setActiveTab('settings')}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg hover:border-zinc-700 transition-colors"
            >
              {auth.avatar}
            </button>

          </div>

        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {renderActiveTab()}
        </main>


        {/* 3. MOBILE BOTTOM TAB NAVIGATION BAR */}
        <div className="lg:hidden h-16 bg-zinc-950 border-t border-zinc-900 flex justify-around items-center px-4 shrink-0 relative z-30">
          {[
            { id: 'dashboard', name: 'Home', icon: LayoutDashboard },
            { id: 'today', name: 'Today', icon: CheckSquare },
            { id: 'coach', name: 'Coach', icon: BrainCircuit },
            { id: 'analytics', name: 'Stats', icon: BarChart3 },
            { id: 'health', name: 'Health', icon: Heart }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-1 p-2 focus:outline-none"
              >
                <Icon className="w-5 h-5 transition-colors" style={{ color: isActive ? activeColor : '#A1A1AA' }} />
                <span className="text-[9px] font-bold" style={{ color: isActive ? activeColor : '#A1A1AA' }}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. MOBILE SLIDING NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-900 z-50 flex flex-col justify-between"
            >
              <div>
                {/* Header brand */}
                <div className="p-5 flex justify-between items-center border-b border-zinc-900">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl text-white font-extrabold w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-glow">H</span>
                    <span className="text-base font-bold text-white">HabitFlow</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg bg-zinc-900 text-textMuted hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav items */}
                <div className="p-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'text-white' 
                            : 'text-textMuted hover:text-white hover:bg-zinc-900/40'
                        }`}
                        style={{
                          backgroundColor: isActive ? `${activeColor}12` : 'transparent',
                          border: isActive ? `1px solid ${activeColor}20` : '1px solid transparent'
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: isActive ? activeColor : undefined }} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom stats and logout */}
              <div className="p-4 border-t border-zinc-900 space-y-4">
                <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-2xl">{auth.avatar}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{auth.name}</p>
                    <p className="text-[10px] text-textMuted font-mono">Lvl {auth.level}</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-textMuted hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
                >
                  <span className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. LEVEL UP MODAL DIALOG POPUP CONGRATULATIONS */}
      <AnimatePresence>
        {auth.recentLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              className="w-full max-w-sm glass-panel p-8 text-center space-y-5 relative overflow-hidden"
              style={{ border: `1px solid ${activeColor}` }}
            >
              {/* Confetti particles glow simulation */}
              <div className="absolute right-0 top-0 w-24 h-24 rounded-full blur-[50px] opacity-20" style={{ backgroundColor: activeColor }} />
              
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto text-3xl animate-bounce">
                👑
              </div>

              <div className="space-y-1">
                <span className="text-xs text-yellow-400 font-bold uppercase tracking-widest block">Level Unlocked</span>
                <h3 className="text-2xl font-extrabold text-white">Level Up!</h3>
                <p className="text-xs text-textMuted leading-relaxed">
                  Congratulations Ashwani! You reached **Level {auth.level}**! You earned a level bonus of +50 coins. Keep up the streak!
                </p>
              </div>

              <button
                onClick={handleClearLevelUp}
                className="w-full btn-primary text-xs flex items-center justify-center space-x-1.5"
                style={{
                  background: `linear-gradient(135deg, ${activeColor} 0%, #4F46E5 100%)`
                }}
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Claim Rewards & Continue</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
