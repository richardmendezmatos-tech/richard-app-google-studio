import { useState } from 'react';
import { DI } from '@/shared/lib/di/registry';

export interface PhotoState {
  [key: string]: File | null;
}

export const usePhotoUploader = (initialPhotos: PhotoState = {}) => {
  const [photos, setPhotos] = useState<PhotoState>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPhoto = (key: string, file: File | null) => {
    setPhotos((prev) => ({ ...prev, [key]: file }));
  };

  const uploadAllPhotos = async (): Promise<string[]> => {
    setUploading(true);
    setError(null);
    try {
      const uploadPromises = Object.values(photos).map(async (file) => {
        if (file) return await DI.getStorageRepository().uploadImage(file);
        return null;
      });

      const results = await Promise.all(uploadPromises);
      return results.filter((url) => url !== null) as string[];
    } catch (err) {
      console.error('Upload failed', err);
      setError('Error subiendo las imágenes.');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const countPhotos = () => Object.values(photos).filter(Boolean).length;
  const isComplete = (requiredCount: number) => countPhotos() >= requiredCount;

  return {
    photos,
    setPhoto,
    uploadAllPhotos,
    uploading,
    error,
    count: countPhotos(),
    isComplete,
  };
};
