import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { auth } from '../auth';
import { db } from '../firestore';
import { userRepository } from '../repositories/user.repository';
import type { UserProfile, ServiceResponse, UserPreferences } from '../types';

const googleProvider = new GoogleAuthProvider();

export const userService = {
  // Setup user profile doc on first-time login
  async initializeUserProfile(user: FirebaseUser): Promise<UserProfile> {
    const existing = await userRepository.getUserProfile(user.uid);
    if (existing) {
      // Update lastLogin
      const updated = {
        ...existing,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await userRepository.updateUserProfile(user.uid, {
        lastLogin: updated.lastLogin,
        updatedAt: updated.updatedAt
      });
      return updated;
    }

    const defaultProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Flow User',
      email: user.email || '',
      photoURL: user.photoURL || '🔮', // Default avatar emoji
      level: 1,
      xp: 0,
      coins: 200, // start with 200 coins to buy themes!
      ownedItems: ['default'],
      preferences: {
        theme: 'default',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        darkMode: true,
        notificationsEnabled: true
      },
      stats: {
        totalHabits: 0,
        completedHabits: 0,
        currentStreak: 0,
        longestStreak: 0,
        focusHours: 0,
        waterToday: 0,
        sleepAverage: 0,
        completionRate: 0
      },
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await userRepository.createUserProfile(user.uid, defaultProfile);
    return defaultProfile;
  },

  async signUpWithEmail(email: string, password: string): Promise<ServiceResponse<UserProfile>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const profile = await this.initializeUserProfile(userCredential.user);
      // Try sending verification email in the background
      sendEmailVerification(userCredential.user).catch(err => console.warn('Failed to send verification email:', err));
      return { success: true, data: profile };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to sign up.' };
    }
  },

  async loginWithEmail(email: string, password: string): Promise<ServiceResponse<UserProfile>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await this.initializeUserProfile(userCredential.user);
      return { success: true, data: profile };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to login.' };
    }
  },

  async loginWithGoogle(): Promise<ServiceResponse<UserProfile>> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const profile = await this.initializeUserProfile(userCredential.user);
      return { success: true, data: profile };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to login with Google.' };
    }
  },

  async logout(): Promise<ServiceResponse<void>> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to logout.' };
    }
  },

  async resetPassword(email: string): Promise<ServiceResponse<void>> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to send password reset email.' };
    }
  },

  async verifyEmail(): Promise<ServiceResponse<void>> {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: 'No user authenticated.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to send email verification.' };
    }
  },

  async deleteAccount(password?: string): Promise<ServiceResponse<void>> {
    try {
      const user = auth.currentUser;
      if (!user) return { success: false, error: 'No authenticated user.' };

      // Re-authenticate if password is provided (required for sensitive operations like deleteAccount)
      if (password && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      const uid = user.uid;
      // Delete user doc first
      // In production, we'd also delete subcollections or trigger a batch delete.
      await deleteDoc(doc(db, 'users', uid));
      await deleteUser(user);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete account. Try logging in again.' };
    }
  },

  async updateProfile(uid: string, name: string, avatarEmoji: string): Promise<ServiceResponse<void>> {
    try {
      await userRepository.updateUserProfile(uid, {
        name,
        photoURL: avatarEmoji,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update profile.' };
    }
  },

  async updatePreferences(uid: string, prefs: Partial<UserPreferences>): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, 'users', uid);
      const userSnap = await getDoc(docRef);
      if (!userSnap.exists()) return { success: false, error: 'User profile not found.' };
      const current = userSnap.data() as UserProfile;

      await userRepository.updateUserProfile(uid, {
        preferences: {
          ...current.preferences,
          ...prefs
        },
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update preferences.' };
    }
  },

  // Atomic shop purchase transaction
  async purchaseShopTheme(uid: string, themeId: string, price: number): Promise<ServiceResponse<void>> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userDocRef);
        if (!userSnap.exists()) throw new Error('User not found.');
        const user = userSnap.data() as UserProfile;

        if (user.coins < price) throw new Error('Insufficient coins.');
        if (user.ownedItems.includes(themeId)) throw new Error('Theme already unlocked.');

        transaction.update(userDocRef, {
          coins: user.coins - price,
          ownedItems: [...user.ownedItems, themeId],
          'preferences.theme': themeId,
          updatedAt: new Date().toISOString()
        });
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Purchase transaction failed.' };
    }
  },

  // Export User Data Backup (JSON format)
  async exportUserData(uid: string): Promise<ServiceResponse<string>> {
    try {
      const profile = await userRepository.getUserProfile(uid);
      if (!profile) return { success: false, error: 'Profile not found.' };
      
      // In production, we'd also pull all subcollections.
      const backup = {
        profile,
        exportedAt: new Date().toISOString()
      };
      
      return { success: true, data: JSON.stringify(backup, null, 2) };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to export backup.' };
    }
  }
};

// Helper for deletion
import { deleteDoc } from 'firebase/firestore';
