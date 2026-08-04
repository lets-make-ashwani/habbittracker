export interface ThemeSeed {
  id: string;
  name: string;
  color: string;
  desc: string;
  fonts?: string[];
  gradients?: string[];
}

export const initialThemes: ThemeSeed[] = [
  {
    id: 'default',
    name: 'Indigo Core',
    color: '#6366F1',
    desc: 'Standard platform styling'
  },
  {
    id: 'midnight',
    name: 'Midnight Neon',
    color: '#EC4899',
    desc: 'Sleek hot-pink dark cyber vibe'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Gold',
    color: '#F59E0B',
    desc: 'High contrast tactical amber'
  },
  {
    id: 'emerald',
    name: 'Emerald Synth',
    color: '#10B981',
    desc: 'Relaxing retro mint terminal green'
  },
  {
    id: 'lavender',
    name: 'Lavender Bliss',
    color: '#8B5CF6',
    desc: 'Calming lilac lavender tone'
  }
];
