import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, User, Download, Upload, Trash2, KeyRound, ShieldCheck, 
  Palette, RefreshCw, Eye, EyeOff, Save, Check 
} from 'lucide-react';
import { useAppDispatch, useAppSelector, updateProfile, setTheme, enable2FA } from '../../store';
import { GlassCard } from '../../components/ui/GlassCard';

export const SettingsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Form State
  const [profileName, setProfileName] = useState(auth.name);
  const [profileAvatar, setProfileAvatar] = useState(auth.avatar);
  const [is2Fa, setIs2Fa] = useState(auth.twoFactorEnabled);

  const avatars = ['🔮', '🏋️‍♂️', '💻', '🏃‍♂️', '🧘‍♂️', '🎨', '📚', '👩‍💻', '👨‍💻'];

  const shopThemes = [
    { id: 'default', name: 'Indigo Core', color: '#6366F1' },
    { id: 'midnight', name: 'Midnight Neon', color: '#EC4899' },
    { id: 'cyberpunk', name: 'Cyberpunk Gold', color: '#F59E0B' },
    { id: 'emerald', name: 'Emerald Synth', color: '#10B981' },
    { id: 'lavender', name: 'Lavender Bliss', color: '#8B5CF6' }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile({ name: profileName, avatar: profileAvatar }));
    alert('Profile parameters updated!');
  };

  const handleToggle2FA = () => {
    const nextVal = !is2Fa;
    setIs2Fa(nextVal);
    dispatch(enable2FA(nextVal));
    alert(nextVal ? 'Simulated 2FA OTP verification is now enabled on login.' : 'Simulated 2FA disabled.');
  };

  const handleExportData = () => {
    const backupStr = localStorage.getItem('habitflow_state');
    if (!backupStr) {
      alert('No logged routines to backup.');
      return;
    }
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(backupStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUri);
    downloadAnchor.setAttribute('download', 'habitflow_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          const parsed = JSON.parse(text);
          if (parsed.auth && parsed.habits) {
            localStorage.setItem('habitflow_state', text);
            alert('Backup restored successfully! Reloading configuration...');
            window.location.reload();
          } else {
            alert('Invalid backup schema.');
          }
        }
      } catch (err) {
        alert('Failed to parse backup JSON.');
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleResetData = () => {
    if (confirm('Factory Reset: Are you sure you want to reset all habits, logged parameters, and levels? This cannot be undone.')) {
      localStorage.removeItem('habitflow_state');
      alert('State cleared. App will reload.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-textMuted mt-1">Manage profile configurations, themes, data backups, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <User className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">User Profile</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-textMuted">Display Username</label>
              <input
                type="text"
                required
                className="w-full glass-input text-xs"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>

            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-textMuted block">Choose Avatar Emoji</label>
              <div className="flex flex-wrap gap-2">
                {avatars.map(av => (
                  <button
                    type="button"
                    key={av}
                    onClick={() => setProfileAvatar(av)}
                    className={`text-xl p-2 rounded-lg border transition-all ${
                      profileAvatar === av ? 'bg-indigo-500/20 border-indigo-500 scale-110' : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary text-xs flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </form>
        </GlassCard>

        {/* Dynamic theme select card */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Palette className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Quick Theme Picker</h3>
          </div>
          <p className="text-xs text-textMuted leading-normal">
            Switch accents (locked themes must be bought with coins inside the Achievements Shop).
          </p>

          <div className="grid grid-cols-2 gap-3">
            {shopThemes.map((theme) => {
              const isUnlocked = auth.unlockedThemes.includes(theme.id);
              const isActive = auth.currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  disabled={!isUnlocked}
                  onClick={() => dispatch(setTheme(theme.id))}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 scale-[1.02]' 
                      : isUnlocked 
                        ? 'bg-zinc-900 border-zinc-800 text-textCustom hover:border-zinc-700' 
                        : 'bg-zinc-950/40 border-zinc-900 text-textMuted opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.color }} />
                    <span>{theme.name}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Security & 2FA */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <KeyRound className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Security & Authentication</h3>
          </div>

          <div className="flex justify-between items-center p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white">Two-Factor OTP Security</p>
              <p className="text-[10px] text-textMuted">Toggles a simulated OTP code card on next sign-in.</p>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                is2Fa ? 'bg-indigo-500' : 'bg-zinc-800'
              }`}
            >
              <motion.div 
                className="w-4 h-4 bg-white rounded-full"
                animate={{ x: is2Fa ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </GlassCard>

        {/* Backup & reset card */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Data Portability</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportData}
              className="py-2.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-white rounded-xl flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Backup</span>
            </button>

            <label className="py-2.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-white rounded-xl flex items-center justify-center space-x-2 cursor-pointer text-center">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
            </label>
          </div>

          <button
            onClick={handleResetData}
            className="w-full py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-black transition-colors rounded-xl text-xs font-bold text-red-400 flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Factory Settings</span>
          </button>
        </GlassCard>

      </div>
    </div>
  );
};
