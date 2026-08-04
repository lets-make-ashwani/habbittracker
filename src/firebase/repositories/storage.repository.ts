import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../storage';

export const storageRepository = {
  async uploadAvatar(uid: string, file: File): Promise<string> {
    // Generate Webp or correct extension
    const fileExtension = file.name.split('.').pop() || 'webp';
    const fileName = `avatar.${fileExtension}`;
    const storageRef = ref(storage, `avatars/${uid}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  // Deletes an object by full download URL or relative path
  async deleteFileByUrl(fileUrl: string): Promise<void> {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (e) {
      console.warn('Could not delete old avatar, might not exist:', e);
    }
  }
};
