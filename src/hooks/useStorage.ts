import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    if (!user) {
      setUploadError('Must be logged in to upload assets.');
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create a unique path with timestamp to prevent collisions
      const timestamp = Date.now();
      const storagePath = `users/${user.uid}/${path}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Failed to upload image.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadError
  };
};
