let _supabaseInstance: any = null;
async function getSupabase() {
  if (!_supabaseInstance) {
    const { createClient } = await import('@/shared/api/supabase/client');
    _supabaseInstance = createClient();
  }
  return _supabaseInstance;
}

export const uploadImage = async (file: File, bucket: string = 'images'): Promise<string> => {
  const supabase = await getSupabase();
  if (!supabase) throw new Error('Supabase client not initialized');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    console.error(`[StorageService] Upload failed for bucket ${bucket}:`, error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
};

export const uploadVehicleImages = async (files: File[], vin: string): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
    const filePath = `${vin}/${fileName}`;

    const { data, error } = await supabase.storage.from('inventory').upload(filePath, file);

    if (error) {
      console.error(
        `[StorageService] Vehicle image upload failed for VIN ${vin} in bucket 'inventory':`,
        error,
      );
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('inventory').getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};
