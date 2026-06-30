/*
  # Add report sections columns to expertise_reports

  1. Changes
    - Add `identification_section` column (text) for vessel identification content
    - Add `contexte_section` column (text) for context and history content
    - Add `constatations_section` column (text) for findings content
    - Add `analyse_section` column (text) for technical analysis content
    - Add `estimation_section` column (text) for estimation content
    - Add `estimation_data` column (jsonb) for estimation calculation data

  2. Purpose
    These columns store the AI-generated content for each section of the expertise report.
*/

DO $$
BEGIN
  -- Add identification section column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expertise_reports' AND column_name = 'identification_section'
  ) THEN
    ALTER TABLE expertise_reports ADD COLUMN identification_section text;
  END IF;

  -- Add contexte section column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expertise_reports' AND column_name = 'contexte_section'
  ) THEN
    ALTER TABLE expertise_reports ADD COLUMN contexte_section text;
  END IF;

  -- Add constatations section column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expertise_reports' AND column_name = 'constatations_section'
  ) THEN
    ALTER TABLE expertise_reports ADD COLUMN constatations_section text;
  END IF;

  -- Add analyse section column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expertise_reports' AND column_name = 'analyse_section'
  ) THEN
    ALTER TABLE expertise_reports ADD COLUMN analyse_section text;
  END IF;

  -- Add estimation section column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expertise_reports' AND column_name = 'estimation_section'
  ) THEN
    ALTER TABLE expertise_reports ADD COLUMN estimation_section text;
  END IF;

  -- Add estimation data column for storing calculation details
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expertise_reports' AND column_name = 'estimation_data'
  ) THEN
    ALTER TABLE expertise_reports ADD COLUMN estimation_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
