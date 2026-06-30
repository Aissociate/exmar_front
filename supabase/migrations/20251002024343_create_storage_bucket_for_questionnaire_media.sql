/*
  # Create storage bucket for questionnaire media

  1. Storage
    - Create `questionnaire-media` bucket for photos and audio
    - Set bucket to public for easy access
    - Add policies for authenticated users to upload and manage their media

  2. Security
    - Users can only upload their own media
    - Users can only delete their own media
    - Public read access for viewing media
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('questionnaire-media', 'questionnaire-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload
CREATE POLICY "Users can upload questionnaire media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'questionnaire-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow public read access
CREATE POLICY "Public read access for questionnaire media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'questionnaire-media');

-- Policy: Allow users to delete their own media
CREATE POLICY "Users can delete own questionnaire media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'questionnaire-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own media
CREATE POLICY "Users can update own questionnaire media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'questionnaire-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
