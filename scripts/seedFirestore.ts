import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';

// Static assets configurations
const initialAchievementDefinitions = [
  {
    id: 'a1',
    title: 'First Step',
    description: 'Complete your first habit.',
    icon: '🚀',
    target: 1,
    rewardXP: 100,
    rewardCoins: 50,
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a2',
    title: 'Super Coder',
    description: 'Complete the Code Daily Routine for 10 days in a row.',
    icon: '⚡',
    target: 10,
    rewardXP: 250,
    rewardCoins: 100,
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a3',
    title: 'Hydro Homie',
    description: 'Meet your 3L water hydration target 15 times.',
    icon: '🔱',
    target: 15,
    rewardXP: 150,
    rewardCoins: 75,
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a4',
    title: 'Perfect Week',
    description: 'Complete all habits in a single week.',
    icon: '👑',
    target: 7,
    rewardXP: 500,
    rewardCoins: 250,
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a5',
    title: 'Habit Overlord',
    description: 'Unlock a lifetime streak of 30 days on any habit.',
    icon: '🪐',
    target: 30,
    rewardXP: 1000,
    rewardCoins: 500,
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a6',
    title: 'Mindfulness Master',
    description: 'Log 10 journal reflections.',
    icon: '🧘‍♂️',
    target: 10,
    rewardXP: 200,
    rewardCoins: 100,
    version: 1,
    createdAt: new Date().toISOString()
  }
];

const initialShopItems = [
  {
    id: 'midnight',
    name: 'Midnight Neon',
    desc: 'Sleek hot-pink dark cyber vibe',
    price: 100,
    type: 'theme',
    color: '#EC4899',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Gold',
    desc: 'High contrast tactical amber',
    price: 200,
    type: 'theme',
    color: '#F59E0B',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'emerald',
    name: 'Emerald Synth',
    desc: 'Relaxing retro mint terminal green',
    price: 300,
    type: 'theme',
    color: '#10B981',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lavender',
    name: 'Lavender Bliss',
    desc: 'Calming lilac lavender tone',
    price: 150,
    type: 'theme',
    color: '#8B5CF6',
    version: 1,
    createdAt: new Date().toISOString()
  }
];

const initialThemes = [
  {
    id: 'default',
    name: 'Indigo Core',
    color: '#6366F1',
    desc: 'Standard platform styling',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'midnight',
    name: 'Midnight Neon',
    color: '#EC4899',
    desc: 'Sleek hot-pink dark cyber vibe',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Gold',
    color: '#F59E0B',
    desc: 'High contrast tactical amber',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'emerald',
    name: 'Emerald Synth',
    color: '#10B981',
    desc: 'Relaxing retro mint terminal green',
    version: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lavender',
    name: 'Lavender Bliss',
    color: '#8B5CF6',
    desc: 'Calming lilac lavender tone',
    version: 1,
    createdAt: new Date().toISOString()
  }
];

// Setup path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  try {
    console.log('Seeding Database: Initializing configuration...');
    
    // Parse environment configurations manually
    const envPath = join(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });

    const app = initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    });

    const db = getFirestore(app);
    const batch = writeBatch(db);

    console.log('Building seed batches...');

    // 1. Seed Achievement Definitions
    initialAchievementDefinitions.forEach(ach => {
      const docRef = doc(db, 'achievementDefinitions', ach.id);
      batch.set(docRef, ach);
    });

    // 2. Seed Shop Items
    initialShopItems.forEach(item => {
      const docRef = doc(db, 'shopItems', item.id);
      batch.set(docRef, item);
    });

    // 3. Seed Themes
    initialThemes.forEach(theme => {
      const docRef = doc(db, 'themes', theme.id);
      batch.set(docRef, theme);
    });

    console.log('Writing batch updates to Cloud Firestore...');
    await batch.commit();
    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
