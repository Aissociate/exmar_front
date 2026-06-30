/*
  # Fix questionnaire media RLS policies

  1. Changes
    - Update policies for questionnaire_photos to also check dossier ownership
    - Update policies for questionnaire_audio to also check dossier ownership
    - Add caption column to questionnaire_photos
    - Add photo_url column to questionnaire_photos for public URLs

  2. Security
    - Users can only manage media for dossiers they own
    - Policies check both user_id match AND dossier ownership
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own photos" ON questionnaire_photos;
DROP POLICY IF EXISTS "Users can insert own photos" ON questionnaire_photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON questionnaire_photos;
DROP POLICY IF EXISTS "Users can view own audio" ON questionnaire_audio;
DROP POLICY IF EXISTS "Users can insert own audio" ON questionnaire_audio;
DROP POLICY IF EXISTS "Users can update own audio" ON questionnaire_audio;
DROP POLICY IF EXISTS "Users can delete own audio" ON questionnaire_audio;

-- Add caption and photo_url columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questionnaire_photos' AND column_name = 'caption'
  ) THEN
    ALTER TABLE questionnaire_photos ADD COLUMN caption text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questionnaire_photos' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE questionnaire_photos ADD COLUMN photo_url text;
  END IF;
END $$;

-- Create new policies for questionnaire_photos
CREATE POLICY "Users can view photos from their dossiers"
  ON questionnaire_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos to their dossiers"
  ON questionnaire_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos in their dossiers"
  ON questionnaire_photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from their dossiers"
  ON questionnaire_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create new policies for questionnaire_audio
CREATE POLICY "Users can view audio from their dossiers"
  ON questionnaire_audio
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert audio to their dossiers"
  ON questionnaire_audio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update audio in their dossiers"
  ON questionnaire_audio
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete audio from their dossiers"
  ON questionnaire_audio
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );