import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
  animate?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  animate = false,
  delay = 0,
  ...props
}) => {
  const baseClass = `glass-panel ${hoverEffect ? 'glass-panel-hover' : ''} ${glow ? 'pulse-glow border-primaryCustom/40' : ''} ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, type: 'spring', stiffness: 100 }}
        className={baseClass}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass} {...props}>
      {children}
    </div>
  );
};
