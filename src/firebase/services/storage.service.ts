import { storageRepository } from '../repositories/storage.repository';
import { userRepository } from '../repositories/user.repository';
import type { ServiceResponse } from '../types';

export const storageService = {
  async uploadUserAvatar(uid: string, file: File): Promise<ServiceResponse<string>> {
    try {
      // 1. Fetch current profile to get old avatar url
      const profile = await userRepository.getUserProfile(uid);
      const oldPhotoURL = profile?.photoURL;

      // 2. Upload new avatar
      const newPhotoURL = await storageRepository.uploadAvatar(uid, file);

      // 3. Update user profile document photoURL
      await userRepository.updateUserProfile(uid, {
        photoURL: newPhotoURL,
        updatedAt: new Date().toISOString()
      });

      // 4. Delete old avatar from storage if it was a file upload
      if (oldPhotoURL && oldPhotoURL.includes('firebasestorage.googleapis.com')) {
        // Run in background, don't block success return
        storageRepository.deleteFileByUrl(oldPhotoURL).catch(e => {
          console.warn('Failed to clean up old avatar:', e);
        });
      }

      return { success: true, data: newPhotoURL };
    } catch (e: any) {
      return { success: false, error: e.message || 'Avatar upload failed.' };
    }
  }
};
export default storageService;
