import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CapturedPhoto {
    blob: Blob;
    preview: string;
}

export const cameraService = {
    /**
     * Captures a high-quality photo using the native camera or web fallback.
     */
    async takePhoto(): Promise<CapturedPhoto | null> {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Uri,
                source: CameraSource.Prompt, // Ask user: Camera or Photos
                width: 1200, // Reasonable size for performance
            });

            if (!image.webPath) return null;

            // Fetch the image as a blob
            const response = await fetch(image.webPath);
            const blob = await response.blob();

            return {
                blob,
                preview: image.webPath
            };
        } catch (error: any) {
            if (error?.message?.includes('User cancelled')) {
                return null; // Silent cancel
            }
            console.error("Camera Capture Error:", error);
            throw error;
        }
    },

    /**
     * Helper to convert Blob to a File object for Firebase Storage
     */
    blobToFile(blob: Blob, fileName: string): File {
        return new File([blob], fileName, { type: blob.type });
    }
};
