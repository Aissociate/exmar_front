/*
  # Add language preference to expert profiles

  1. Changes
    - Add `language` column to `expert_profiles` table
    - Default language is 'fr' (French)
    - Supported languages: 'fr' (French), 'en' (English)
  
  2. Notes
    - This allows users to choose their preferred language for the application
    - Reports and UI will adapt based on this preference
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expert_profiles' AND column_name = 'language'
  ) THEN
    ALTER TABLE expert_profiles 
    ADD COLUMN language text DEFAULT 'fr' CHECK (language IN ('fr', 'en'));
  END IF;
END $$;
