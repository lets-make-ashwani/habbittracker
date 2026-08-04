export interface ShopItemSeed {
  id: string;
  name: string;
  desc: string;
  price: number;
  type: 'theme' | 'avatar';
  color: string;
}

export const initialShopItems: ShopItemSeed[] = [
  {
    id: 'midnight',
    name: 'Midnight Neon',
    desc: 'Sleek hot-pink dark cyber vibe',
    price: 100,
    type: 'theme',
    color: '#EC4899'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Gold',
    desc: 'High contrast tactical amber',
    price: 200,
    type: 'theme',
    color: '#F59E0B'
  },
  {
    id: 'emerald',
    name: 'Emerald Synth',
    desc: 'Relaxing retro mint terminal green',
    price: 300,
    type: 'theme',
    color: '#10B981'
  },
  {
    id: 'lavender',
    name: 'Lavender Bliss',
    desc: 'Calming lilac lavender tone',
    price: 150,
    type: 'theme',
    color: '#8B5CF6'
  }
];
