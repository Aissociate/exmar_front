/*
  # Create questionnaire media tables

  1. New Tables
    - `questionnaire_photos`
      - `id` (uuid, primary key)
      - `dossier_id` (uuid, foreign key)
      - `question_id` (text) - identifier of the question
      - `storage_path` (text) - path in Supabase storage
      - `file_name` (text) - original file name
      - `file_size` (integer) - size in bytes
      - `mime_type` (text) - image mime type
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)
    
    - `questionnaire_audio`
      - `id` (uuid, primary key)
      - `dossier_id` (uuid, foreign key)
      - `question_id` (text) - identifier of the question
      - `storage_path` (text) - path in Supabase storage
      - `file_name` (text) - original file name
      - `file_size` (integer) - size in bytes
      - `duration` (integer) - duration in seconds
      - `transcription` (text) - AI transcription
      - `transcription_status` (text) - pending, processing, completed, failed
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own media
*/

-- Create questionnaire_photos table
CREATE TABLE IF NOT EXISTS questionnaire_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  question_id text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create questionnaire_audio table
CREATE TABLE IF NOT EXISTS questionnaire_audio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  question_id text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  duration integer DEFAULT 0,
  transcription text,
  transcription_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE questionnaire_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_audio ENABLE ROW LEVEL SECURITY;

-- Policies for questionnaire_photos
CREATE POLICY "Users can view own photos"
  ON questionnaire_photos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON questionnaire_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON questionnaire_photos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for questionnaire_audio
CREATE POLICY "Users can view own audio"
  ON questionnaire_audio
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audio"
  ON questionnaire_audio
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own audio"
  ON questionnaire_audio
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audio"
  ON questionnaire_audio
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questionnaire_photos_dossier 
  ON questionnaire_photos(dossier_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_photos_question 
  ON questionnaire_photos(dossier_id, question_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_audio_dossier 
  ON questionnaire_audio(dossier_id);

CREATE INDEX IF NOT EXISTS idx_questionnaire_audio_question 
  ON questionnaire_audio(dossier_id, question_id);
