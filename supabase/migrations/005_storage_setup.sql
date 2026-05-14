-- Richard Automotive: Storage Configuration
-- Creates the 'inventory' bucket and sets up public access policies.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'inventory', 
    'inventory', 
    true, 
    5242880, -- 5MB
    '{image/png,image/jpeg,image/webp}'
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = '{image/png,image/jpeg,image/webp}';

-- 2. Storage Policies (Allow public read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'inventory' );

-- 3. Allow uploads for authenticated users (or service role)
-- Note: Service role bypasses RLS, but we add this for future non-service-role uploads if needed.
CREATE POLICY "Allow Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'inventory' );
