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

    console.log(`📤 Uploading image to bucket '${bucket}': ${filePath}`);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Storage Upload Error:', error.message);
      throw error;
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('✅ Upload Successful. Public URL:', publicUrl);
    return publicUrl;
  }
};
