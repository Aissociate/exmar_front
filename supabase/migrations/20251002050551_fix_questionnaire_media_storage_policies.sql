/*
  # Fix questionnaire media storage policies

  1. Changes
    - Update INSERT policy to check dossier ownership based on folder structure
    - Path format: questionnaire-photos/{dossierId}/{questionId}/file.jpg
    - Check that the dossierId in path belongs to the user
    
  2. Security
    - Users can only upload to folders of dossiers they own
    - Uses the second folder level (dossierId) for validation
*/

-- Drop existing policies for questionnaire-media bucket
DROP POLICY IF EXISTS "Users can upload questionnaire media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own questionnaire media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own questionnaire media" ON storage.objects;

-- Create new INSERT policy that checks dossier ownership
CREATE POLICY "Users can upload questionnaire media to own dossiers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'questionnaire-media' 
    AND (storage.foldername(name))[2] IN (
      SELECT dossiers.id::text 
      FROM dossiers 
      WHERE dossiers.user_id = auth.uid()
    )
  );

-- Create new DELETE policy that checks dossier ownership
CREATE POLICY "Users can delete questionnaire media from own dossiers"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'questionnaire-media' 
    AND (storage.foldername(name))[2] IN (
      SELECT dossiers.id::text 
      FROM dossiers 
      WHERE dossiers.user_id = auth.uid()
    )
  );

-- Create new UPDATE policy that checks dossier ownership
CREATE POLICY "Users can update questionnaire media in own dossiers"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'questionnaire-media' 
    AND (storage.foldername(name))[2] IN (
      SELECT dossiers.id::text 
      FROM dossiers 
      WHERE dossiers.user_id = auth.uid()
    )
  );