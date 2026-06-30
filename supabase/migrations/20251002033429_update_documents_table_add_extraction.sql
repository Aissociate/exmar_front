/*
  # Update documents table for text extraction

  1. Changes
    - Add `extraction_status` column (pending, processing, completed, failed)
    - Add `extracted_text` column for storing extracted content
    - Add `metadata` column for additional document information
    - Add `storage_path` column if not exists
    - Rename `file_path` to `storage_path` if needed
    - Add `updated_at` column
    - Add index on extraction_status

  2. Notes
    - Preserves existing data
    - Backward compatible
*/

DO $$ 
BEGIN
  -- Add extraction_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'extraction_status'
  ) THEN
    ALTER TABLE documents ADD COLUMN extraction_status text DEFAULT 'pending';
  END IF;

  -- Add extracted_text if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'extracted_text'
  ) THEN
    ALTER TABLE documents ADD COLUMN extracted_text text;
  END IF;

  -- Add metadata if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE documents ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;

  -- Add storage_path if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE documents ADD COLUMN storage_path text;
    -- Copy data from file_path to storage_path if file_path exists
    UPDATE documents SET storage_path = file_path WHERE file_path IS NOT NULL;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE documents ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Rename uploaded_at to created_at if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'uploaded_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE documents RENAME COLUMN uploaded_at TO created_at;
  END IF;
END $$;

-- Add constraint on extraction_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'documents_extraction_status_check'
  ) THEN
    ALTER TABLE documents 
    ADD CONSTRAINT documents_extraction_status_check 
    CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed'));
  END IF;
END $$;

-- Create index on extraction_status
CREATE INDEX IF NOT EXISTS idx_documents_status 
  ON documents(extraction_status);
