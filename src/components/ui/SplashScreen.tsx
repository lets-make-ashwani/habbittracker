import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300); // Small pause at 100% for smooth entry
          return 100;
        }
        return prev + 4; // increment fast
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090B] overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6366F1] rounded-full blur-[160px] opacity-15 pointer-events-none" />
      
      <div className="flex flex-col items-center max-w-sm w-full px-8 text-center z-10">
        {/* Animated Brand Mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 80 }}
          className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] shadow-glow mb-6"
        >
          {/* Wave animation */}
          <span className="text-4xl text-white font-bold select-none">H</span>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold tracking-tight text-white mb-2"
        >
          HabitFlow <span className="text-[#6366F1]">AI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xs text-textMuted uppercase tracking-widest mb-10"
        >
          Build Better Habits Every Day
        </motion.p>

        {/* Loader Container */}
        <div className="w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text status */}
        <div className="mt-3 flex justify-between w-full text-[10px] text-textMuted font-mono">
          <span>INITIALIZING SYSTEMS</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
