/*
  # Create Maritime Expertise Management Schema

  ## Overview
  This migration creates the complete database schema for a maritime expertise management application.
  It includes tables for user profiles, case files (dossiers), documents, questionnaires, photos, 
  audio comments with transcriptions, and AI-generated reports.

  ## New Tables

  ### 1. `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - expert, assistant, admin
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `dossiers` (Case Files)
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `dossier_number` (text, unique) - Auto-generated reference number
  - `type` (text) - vessel_incident, container_incident, vessel_evaluation
  - `status` (text) - draft, in_progress, inspection_complete, report_generated, validated, archived
  - `vessel_name` (text)
  - `vessel_type` (text) - cargo, tanker, container_ship, yacht, trawler, tugboat, barge, etc.
  - `imo_number` (text)
  - `flag` (text)
  - `port` (text)
  - `owner` (text)
  - `insurer` (text)
  - `incident_date` (date)
  - `inspection_date` (date)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `documents`
  - `id` (uuid, primary key)
  - `dossier_id` (uuid, references dossiers)
  - `user_id` (uuid, references profiles)
  - `file_name` (text)
  - `file_path` (text) - Storage path
  - `file_type` (text)
  - `file_size` (bigint)
  - `category` (text) - certificates, previous_reports, initial_photos, correspondence, other
  - `uploaded_at` (timestamptz)

  ### 4. `questionnaire_templates`
  - `id` (uuid, primary key)
  - `vessel_type` (text)
  - `name` (text)
  - `sections` (jsonb) - Array of sections with questions
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `questionnaire_responses`
  - `id` (uuid, primary key)
  - `dossier_id` (uuid, references dossiers)
  - `template_id` (uuid, references questionnaire_templates)
  - `question_id` (text) - Reference to question in template
  - `section_name` (text)
  - `question_text` (text)
  - `rating` (integer) - 1 (excellent), 2 (good), 3 (acceptable), 4 (not applicable)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `photos`
  - `id` (uuid, primary key)
  - `dossier_id` (uuid, references dossiers)
  - `response_id` (uuid, references questionnaire_responses, nullable)
  - `user_id` (uuid, references profiles)
  - `file_name` (text)
  - `file_path` (text) - Storage path
  - `file_size` (bigint)
  - `caption` (text)
  - `sort_order` (integer)
  - `created_at` (timestamptz)

  ### 7. `audio_comments`
  - `id` (uuid, primary key)
  - `dossier_id` (uuid, references dossiers)
  - `response_id` (uuid, references questionnaire_responses, nullable)
  - `user_id` (uuid, references profiles)
  - `file_name` (text)
  - `file_path` (text) - Storage path
  - `file_size` (bigint)
  - `duration` (integer) - Duration in seconds
  - `transcription` (text) - AI-generated transcription
  - `transcription_status` (text) - pending, processing, completed, failed
  - `created_at` (timestamptz)

  ### 8. `reports`
  - `id` (uuid, primary key)
  - `dossier_id` (uuid, references dossiers)
  - `user_id` (uuid, references profiles)
  - `version` (integer)
  - `content` (text) - AI-generated report content
  - `valuation_low` (numeric)
  - `valuation_mid` (numeric)
  - `valuation_high` (numeric)
  - `valuation_justification` (text)
  - `prompt_used` (text)
  - `model_used` (text)
  - `status` (text) - draft, finalized
  - `pdf_path` (text, nullable) - Storage path for PDF export
  - `generated_at` (timestamptz)
  - `finalized_at` (timestamptz, nullable)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Restrict access based on user_id ownership
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'expert' CHECK (role IN ('expert', 'assistant', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create dossiers table
CREATE TABLE IF NOT EXISTS dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dossier_number text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('vessel_incident', 'container_incident', 'vessel_evaluation')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'inspection_complete', 'report_generated', 'validated', 'archived')),
  vessel_name text,
  vessel_type text,
  imo_number text,
  flag text,
  port text,
  owner text,
  insurer text,
  incident_date date,
  inspection_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dossiers"
  ON dossiers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dossiers"
  ON dossiers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dossiers"
  ON dossiers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dossiers"
  ON dossiers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  category text DEFAULT 'other' CHECK (category IN ('certificates', 'previous_reports', 'initial_photos', 'correspondence', 'other')),
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents from own dossiers"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to own dossiers"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents from own dossiers"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create questionnaire_templates table
CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_type text NOT NULL,
  name text NOT NULL,
  sections jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view templates"
  ON questionnaire_templates FOR SELECT
  TO authenticated
  USING (true);

-- Create questionnaire_responses table
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES questionnaire_templates(id),
  question_id text NOT NULL,
  section_name text NOT NULL,
  question_text text NOT NULL,
  rating integer CHECK (rating IN (1, 2, 3, 4)),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dossier_id, question_id)
);

ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses from own dossiers"
  ON questionnaire_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses in own dossiers"
  ON questionnaire_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update responses in own dossiers"
  ON questionnaire_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete responses from own dossiers"
  ON questionnaire_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  response_id uuid REFERENCES questionnaire_responses(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos from own dossiers"
  ON photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload photos to own dossiers"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos in own dossiers"
  ON photos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from own dossiers"
  ON photos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create audio_comments table
CREATE TABLE IF NOT EXISTS audio_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  response_id uuid REFERENCES questionnaire_responses(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  duration integer DEFAULT 0,
  transcription text,
  transcription_status text DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audio_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audio from own dossiers"
  ON audio_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload audio to own dossiers"
  ON audio_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update audio in own dossiers"
  ON audio_comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete audio from own dossiers"
  ON audio_comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  version integer DEFAULT 1,
  content text,
  valuation_low numeric(15,2),
  valuation_mid numeric(15,2),
  valuation_high numeric(15,2),
  valuation_justification text,
  prompt_used text,
  model_used text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'finalized')),
  pdf_path text,
  generated_at timestamptz DEFAULT now(),
  finalized_at timestamptz
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports from own dossiers"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reports for own dossiers"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reports in own dossiers"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reports from own dossiers"
  ON reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Create function to generate unique dossier number
CREATE OR REPLACE FUNCTION generate_dossier_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_number text;
  year_prefix text;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT year_prefix || '-' || LPAD((COUNT(*) + 1)::text, 5, '0')
  INTO new_number
  FROM dossiers
  WHERE dossier_number LIKE year_prefix || '-%';
  
  RETURN new_number;
END;
$$;

-- Create trigger to auto-generate dossier number
CREATE OR REPLACE FUNCTION set_dossier_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.dossier_number IS NULL OR NEW.dossier_number = '' THEN
    NEW.dossier_number := generate_dossier_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_dossier_number
  BEFORE INSERT ON dossiers
  FOR EACH ROW
  EXECUTE FUNCTION set_dossier_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_dossiers_updated_at
  BEFORE UPDATE ON dossiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_questionnaire_templates_updated_at
  BEFORE UPDATE ON questionnaire_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_questionnaire_responses_updated_at
  BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dossiers_user_id ON dossiers(user_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_status ON dossiers(status);
CREATE INDEX IF NOT EXISTS idx_dossiers_type ON dossiers(type);
CREATE INDEX IF NOT EXISTS idx_documents_dossier_id ON documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_dossier_id ON questionnaire_responses(dossier_id);
CREATE INDEX IF NOT EXISTS idx_photos_dossier_id ON photos(dossier_id);
CREATE INDEX IF NOT EXISTS idx_photos_response_id ON photos(response_id);
CREATE INDEX IF NOT EXISTS idx_audio_comments_dossier_id ON audio_comments(dossier_id);
CREATE INDEX IF NOT EXISTS idx_audio_comments_response_id ON audio_comments(response_id);
CREATE INDEX IF NOT EXISTS idx_reports_dossier_id ON reports(dossier_id);