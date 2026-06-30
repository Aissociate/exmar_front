/*
  # Add questionnaire type to dossiers

  1. Changes
    - Add `questionnaire_type` column to store the selected questionnaire type
    - Add `questionnaire_data` column to store questionnaire responses in JSON format
  
  2. Notes
    - questionnaire_type is optional and can be set after dossier creation
    - questionnaire_data stores the complete questionnaire state
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dossiers' AND column_name = 'questionnaire_type'
  ) THEN
    ALTER TABLE dossiers ADD COLUMN questionnaire_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dossiers' AND column_name = 'questionnaire_data'
  ) THEN
    ALTER TABLE dossiers ADD COLUMN questionnaire_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
