import { createClient } from './client';

/**
 * Service to handle image uploads to Supabase Storage.
 */
export const storageService = {
  /**
   * Uploads a file to the specified bucket and returns the public URL.
   */
  uploadImage: async (file: File, bucket: string = 'inventory'): Promise<string> => {
    const supabase = createClient();
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log(`📤 [Storage] Uploading to '${bucket}': ${filePath}`);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`❌ [Storage] Upload Failed: ${error.message}`, error);
      throw new Error(`Error de Almacenamiento: ${error.message}`);
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrl) {
      console.error('❌ [Storage] Failed to generate public URL');
      throw new Error('No se pudo generar la URL pública de la imagen.');
    }

    console.log('✅ [Storage] Upload Successful:', publicUrl);
    return publicUrl;
  }
};
