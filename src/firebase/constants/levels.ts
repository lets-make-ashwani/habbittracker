export const XP_PER_LEVEL = 1000;

export const calculateLevelInfo = (totalXp: number): { level: number; currentXp: number; nextLevelXp: number } => {
  // If we want a simple flat level threshold of 1000 XP per level:
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentXp = totalXp % XP_PER_LEVEL;
  return {
    level,
    currentXp,
    nextLevelXp: XP_PER_LEVEL
  };
};
