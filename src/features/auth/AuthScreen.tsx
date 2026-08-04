import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Check, Loader } from 'lucide-react';
import { loginUser } from '../../store';

export const AuthScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp'>('login');
  const [email, setEmail] = useState('ashwani@habitflow.ai');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Ashwani');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === 'login') {
        // Go to OTP simulation for 2FA
        setMode('otp');
      } else if (mode === 'signup') {
        setMode('otp');
      } else if (mode === 'forgot') {
        alert('Reset link sent to your email!');
        setMode('login');
      }
    }, 1200);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // If filled, auto login
    if (newOtp.every(char => char !== '')) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        dispatch(loginUser({ email, name }));
      }, 1000);
    }
  };

  const handleSocialLogin = (provider: 'Google' | 'GitHub') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(loginUser({ 
        email: provider === 'Google' ? 'ashwani.google@gmail.com' : 'ashwani.git@github.com', 
        name: 'Ashwani' 
      }));
    }, 1000);
  };

  return (
    <div className="min-height-screen w-full flex items-center justify-center bg-[#09090B] p-4 md:p-8 overflow-y-auto">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6366F1] rounded-full blur-[180px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-[180px] opacity-5 pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl h-[640px] glass-panel grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Side: Branding and Stats */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-r border-zinc-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
          
          {/* Logo */}
          <div className="flex items-center space-x-3 z-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] shadow-glow">
              <span className="text-xl text-white font-bold">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">HabitFlow <span className="text-[#6366F1]">AI</span></span>
          </div>

          {/* Testimonial/Intro */}
          <div className="my-auto space-y-6 z-10 max-w-sm">
            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Habit tracking, reimagined with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-[#818CF8]">gamified AI</span>.
            </h2>
            <p className="text-sm text-textMuted leading-relaxed">
              Earn coins, gain levels, compete with peers, and let our custom AI coach detect bad routines before they form.
            </p>
            
            {/* Visual stats mini-grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <span className="text-xs text-textMuted uppercase tracking-wider">Active Users</span>
                <p className="text-xl font-bold text-white mt-1">42,890+</p>
              </div>
              <div>
                <span className="text-xs text-textMuted uppercase tracking-wider">Habits Tracked</span>
                <p className="text-xl font-bold text-white mt-1">2.4M+</p>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <p className="text-xs text-textMuted z-10">
            © 2026 HabitFlow Inc. All rights reserved.
          </p>
        </div>

        {/* Right Side: Interactive Forms */}
        <div className="flex flex-col justify-center p-8 md:p-12 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
                  <p className="text-sm text-textMuted">Enter your details to access your dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-textMuted" />
                      <input
                        type="email"
                        required
                        className="w-full glass-input pl-10"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-textMuted">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-[#6366F1] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-textMuted" />
                      <input
                        type="password"
                        required
                        className="w-full glass-input pl-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-xs text-textMuted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-[#6366F1] focus:ring-0 w-4 h-4"
                      />
                      <span>Remember me</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute w-full border-t border-zinc-800" />
                  <span className="relative px-3 bg-zinc-950 text-xs text-textMuted uppercase font-mono">Or Continue With</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSocialLogin('Google')}
                    className="btn-secondary flex items-center justify-center space-x-2 text-xs py-2.5 px-4"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    onClick={() => handleSocialLogin('GitHub')}
                    className="btn-secondary flex items-center justify-center space-x-2 text-xs py-2.5 px-4"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <p className="text-center text-xs text-textMuted">
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-[#6366F1] hover:underline font-semibold">
                    Sign up
                  </button>
                </p>
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
                  <p className="text-sm text-textMuted">Sign up to kickstart your habit routine.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Username</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-textMuted" />
                      <input
                        type="text"
                        required
                        className="w-full glass-input pl-10"
                        placeholder="Ashwani"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-textMuted" />
                      <input
                        type="email"
                        required
                        className="w-full glass-input pl-10"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Password</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-textMuted" />
                      <input
                        type="password"
                        required
                        className="w-full glass-input pl-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <p className="text-center text-xs text-textMuted">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-[#6366F1] hover:underline font-semibold">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {mode === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
                  <p className="text-sm text-textMuted">Enter your email and we'll send a password recovery link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-textMuted">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-textMuted" />
                      <input
                        type="email"
                        required
                        className="w-full glass-input pl-10"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Send Recovery Link</span>}
                  </button>
                </form>

                <p className="text-center text-xs text-textMuted">
                  Go back to{' '}
                  <button onClick={() => setMode('login')} className="text-[#6366F1] hover:underline font-semibold">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {mode === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Two-Factor Authentication</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Verify Your Identity</h1>
                  <p className="text-sm text-textMuted">
                    We've simulated a verification code. Enter <span className="text-white font-mono font-bold bg-zinc-800 px-1.5 py-0.5 rounded">1 2 3 4 5 6</span> to sign in.
                  </p>
                </div>

                <div className="flex justify-between gap-2 my-6">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl font-bold glass-input p-0"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && digit === '' && idx > 0) {
                          const prevInput = document.getElementById(`otp-${idx - 1}`);
                          prevInput?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      dispatch(loginUser({ email, name }));
                    }, 1000);
                  }}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <span>Verify and Connect</span>}
                </button>

                <p className="text-center text-xs text-textMuted">
                  Didn't receive a code?{' '}
                  <button onClick={() => alert('Code resent!')} className="text-[#6366F1] hover:underline font-semibold">
                    Resend Code
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
