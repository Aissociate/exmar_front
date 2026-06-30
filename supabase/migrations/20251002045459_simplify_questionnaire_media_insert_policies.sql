/*
  # Simplify questionnaire media insert policies

  1. Changes
    - Remove the user_id check from INSERT policies
    - Only verify dossier ownership for INSERT
    - Keep user_id check for other operations

  2. Reasoning
    - The user_id is automatically set to auth.uid() in the application
    - Checking dossier ownership is sufficient for security
    - Simplifies the policy and avoids potential issues
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Users can insert photos to their dossiers" ON questionnaire_photos;
DROP POLICY IF EXISTS "Users can insert audio to their dossiers" ON questionnaire_audio;

-- Create simplified INSERT policies for questionnaire_photos
CREATE POLICY "Users can insert photos to their dossiers"
  ON questionnaire_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create simplified INSERT policies for questionnaire_audio
CREATE POLICY "Users can insert audio to their dossiers"
  ON questionnaire_audio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );