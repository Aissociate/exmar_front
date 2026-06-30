/*
  # Add AI Analysis to Audio Recordings

  1. Changes
    - Add `ai_analysis` column to `questionnaire_audio` table to store AI-generated insights
    - Add `ai_analysis_status` column to track analysis state (pending, processing, completed, failed)
  
  2. Purpose
    - Enable AI analysis of audio transcriptions to extract insights and observations
    - Track analysis status for user feedback
*/

-- Add AI analysis columns to questionnaire_audio
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questionnaire_audio' AND column_name = 'ai_analysis'
  ) THEN
    ALTER TABLE questionnaire_audio ADD COLUMN ai_analysis TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questionnaire_audio' AND column_name = 'ai_analysis_status'
  ) THEN
    ALTER TABLE questionnaire_audio ADD COLUMN ai_analysis_status TEXT DEFAULT 'pending';
  END IF;
END $$;