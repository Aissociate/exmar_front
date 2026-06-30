/*
  # Add unique constraint for one report per dossier

  1. Changes
    - Add unique constraint on `expertise_reports(dossier_id)`
    - This ensures only one expertise report can exist per dossier
    - Prevents duplicate reports from being created for the same dossier
  
  2. Notes
    - This constraint maintains data integrity
    - Any attempt to create a second report for the same dossier will fail
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'expertise_reports_dossier_id_key'
  ) THEN
    ALTER TABLE expertise_reports 
    ADD CONSTRAINT expertise_reports_dossier_id_key UNIQUE (dossier_id);
  END IF;
END $$;
