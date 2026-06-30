/*
  # Add CASCADE DELETE for user-related data

  1. Changes
    - Drop and recreate foreign key constraints with CASCADE DELETE
    - This allows deleting users from auth.users without orphaning data
    - All related data (profiles, dossiers, documents, etc.) will be deleted automatically
    
  2. Security
    - Maintains existing RLS policies
    - Only affects deletion behavior, not read/write permissions
    
  3. Tables affected
    - profiles (references auth.users)
    - All tables that reference profiles.id
    - All tables that reference auth.users.id directly
*/

-- Drop and recreate profiles FK with CASCADE
ALTER TABLE IF EXISTS profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE IF EXISTS profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Drop and recreate expert_profiles FK with CASCADE
ALTER TABLE IF EXISTS expert_profiles
  DROP CONSTRAINT IF EXISTS expert_profiles_user_id_fkey;

ALTER TABLE IF EXISTS expert_profiles
  ADD CONSTRAINT expert_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Drop and recreate questionnaire_photos FK with CASCADE
ALTER TABLE IF EXISTS questionnaire_photos
  DROP CONSTRAINT IF EXISTS questionnaire_photos_user_id_fkey;

ALTER TABLE IF EXISTS questionnaire_photos
  ADD CONSTRAINT questionnaire_photos_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Drop and recreate questionnaire_audio FK with CASCADE
ALTER TABLE IF EXISTS questionnaire_audio
  DROP CONSTRAINT IF EXISTS questionnaire_audio_user_id_fkey;

ALTER TABLE IF EXISTS questionnaire_audio
  ADD CONSTRAINT questionnaire_audio_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Drop and recreate expertise_reports FK with CASCADE
ALTER TABLE IF EXISTS expertise_reports
  DROP CONSTRAINT IF EXISTS expertise_reports_user_id_fkey;

ALTER TABLE IF EXISTS expertise_reports
  ADD CONSTRAINT expertise_reports_user_id_fkey
  FOREIGN KEY (expert_id) REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Drop and recreate all FK constraints to profiles.id with CASCADE
ALTER TABLE IF EXISTS dossiers
  DROP CONSTRAINT IF EXISTS dossiers_user_id_fkey;

ALTER TABLE IF EXISTS dossiers
  ADD CONSTRAINT dossiers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS documents
  DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

ALTER TABLE IF EXISTS documents
  ADD CONSTRAINT documents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS photos
  DROP CONSTRAINT IF EXISTS photos_user_id_fkey;

ALTER TABLE IF EXISTS photos
  ADD CONSTRAINT photos_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS audio_comments
  DROP CONSTRAINT IF EXISTS audio_comments_user_id_fkey;

ALTER TABLE IF EXISTS audio_comments
  ADD CONSTRAINT audio_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS reports
  DROP CONSTRAINT IF EXISTS reports_user_id_fkey;

ALTER TABLE IF EXISTS reports
  ADD CONSTRAINT reports_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS activity_logs
  DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

ALTER TABLE IF EXISTS activity_logs
  ADD CONSTRAINT activity_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE IF EXISTS questionnaire_checklist_responses
  DROP CONSTRAINT IF EXISTS questionnaire_checklist_responses_user_id_fkey;

ALTER TABLE IF EXISTS questionnaire_checklist_responses
  ADD CONSTRAINT questionnaire_checklist_responses_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;