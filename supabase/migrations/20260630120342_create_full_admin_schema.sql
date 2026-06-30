-- =====================================================
-- MIGRATION 1: Main schema
-- =====================================================

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
  ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  dossier_number text UNIQUE NOT NULL DEFAULT '',
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
  ON dossiers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dossiers"
  ON dossiers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dossiers"
  ON dossiers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own dossiers"
  ON dossiers FOR DELETE TO authenticated USING (auth.uid() = user_id);

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
  ON documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = documents.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can upload documents to own dossiers"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = documents.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete documents from own dossiers"
  ON documents FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = documents.dossier_id AND dossiers.user_id = auth.uid()));

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
  ON questionnaire_templates FOR SELECT TO authenticated USING (true);

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
  ON questionnaire_responses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_responses.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can create responses in own dossiers"
  ON questionnaire_responses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_responses.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can update responses in own dossiers"
  ON questionnaire_responses FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_responses.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete responses from own dossiers"
  ON questionnaire_responses FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_responses.dossier_id AND dossiers.user_id = auth.uid()));

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
  ON photos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = photos.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can upload photos to own dossiers"
  ON photos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = photos.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can update photos in own dossiers"
  ON photos FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = photos.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete photos from own dossiers"
  ON photos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = photos.dossier_id AND dossiers.user_id = auth.uid()));

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
  ON audio_comments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = audio_comments.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can upload audio to own dossiers"
  ON audio_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = audio_comments.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can update audio in own dossiers"
  ON audio_comments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = audio_comments.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete audio from own dossiers"
  ON audio_comments FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = audio_comments.dossier_id AND dossiers.user_id = auth.uid()));

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
  ON reports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = reports.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can create reports for own dossiers"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = reports.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can update reports in own dossiers"
  ON reports FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = reports.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete reports from own dossiers"
  ON reports FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = reports.dossier_id AND dossiers.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION generate_dossier_number()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  year_str TEXT;
  sequence_num INTEGER;
BEGIN
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(dossier_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO sequence_num FROM dossiers WHERE dossier_number LIKE 'DOS-' || year_str || '-%';
  RETURN 'DOS-' || year_str || '-' || LPAD(sequence_num::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION set_dossier_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF NEW.dossier_number IS NULL OR NEW.dossier_number = '' THEN
    NEW.dossier_number := generate_dossier_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_dossier_number ON dossiers;
CREATE TRIGGER trigger_set_dossier_number
  BEFORE INSERT ON dossiers FOR EACH ROW EXECUTE FUNCTION set_dossier_number();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  NEW.updated_at = NOW(); RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_dossiers_updated_at ON dossiers;
CREATE TRIGGER trigger_update_dossiers_updated_at
  BEFORE UPDATE ON dossiers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_questionnaire_templates_updated_at ON questionnaire_templates;
CREATE TRIGGER trigger_update_questionnaire_templates_updated_at
  BEFORE UPDATE ON questionnaire_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_questionnaire_responses_updated_at ON questionnaire_responses;
CREATE TRIGGER trigger_update_questionnaire_responses_updated_at
  BEFORE UPDATE ON questionnaire_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_dossiers_user_id ON dossiers(user_id);

-- =====================================================
-- MIGRATION 2: Activity logs
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  level text DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'success')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================================================
-- MIGRATION 3: Add questionnaire_type to dossiers
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dossiers' AND column_name = 'questionnaire_type') THEN
    ALTER TABLE dossiers ADD COLUMN questionnaire_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dossiers' AND column_name = 'questionnaire_data') THEN
    ALTER TABLE dossiers ADD COLUMN questionnaire_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- =====================================================
-- MIGRATION 4: Questionnaire media tables
-- =====================================================

CREATE TABLE IF NOT EXISTS questionnaire_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  question_id text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  caption text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

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
  ai_analysis text,
  ai_analysis_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE questionnaire_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos from their dossiers"
  ON questionnaire_photos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_photos.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can insert photos to their dossiers"
  ON questionnaire_photos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_photos.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can update photos in their dossiers"
  ON questionnaire_photos FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_photos.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete photos from their dossiers"
  ON questionnaire_photos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_photos.dossier_id AND dossiers.user_id = auth.uid()));

CREATE POLICY "Users can view audio from their dossiers"
  ON questionnaire_audio FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_audio.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can insert audio to their dossiers"
  ON questionnaire_audio FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_audio.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can update audio in their dossiers"
  ON questionnaire_audio FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_audio.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete audio from their dossiers"
  ON questionnaire_audio FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_audio.dossier_id AND dossiers.user_id = auth.uid()));

-- =====================================================
-- MIGRATION 5: Storage bucket for questionnaire media
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('questionnaire-media', 'questionnaire-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- MIGRATION 6: Expertise reports schema
-- =====================================================

CREATE TABLE IF NOT EXISTS expertise_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  report_number text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  expert_name text DEFAULT 'Yannick DURAND',
  expert_title text DEFAULT 'Expert près de la Cour d''Appel',
  expert_address text,
  expert_contact text,
  owner_name text,
  owner_address text,
  requester_name text,
  requester_address text,
  visit_date date,
  visit_location text,
  mission text DEFAULT 'Evaluer la valeur vénale',
  navigation_history text,
  maintenance_state_content jsonb,
  valuation_method text,
  hull_value numeric(10,2),
  engine_value numeric(10,2),
  navigation_equipment_value numeric(10,2),
  total_value numeric(10,2),
  value_range_min numeric(10,2),
  value_range_max numeric(10,2),
  conclusions text,
  identification_section text,
  contexte_section text,
  constatations_section text,
  analyse_section text,
  estimation_section text,
  estimation_data jsonb DEFAULT '{}'::jsonb,
  expert_presentation_section text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expert_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expertise_reports_dossier_id_key') THEN
    ALTER TABLE expertise_reports ADD CONSTRAINT expertise_reports_dossier_id_key UNIQUE (dossier_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS report_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES expertise_reports(id) ON DELETE CASCADE NOT NULL,
  section_type text NOT NULL,
  section_title text NOT NULL,
  content text,
  ai_generated boolean DEFAULT false,
  generation_prompt text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expertise_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experts can view own reports"
  ON expertise_reports FOR SELECT TO authenticated USING (auth.uid() = expert_id);
CREATE POLICY "Experts can insert own reports"
  ON expertise_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Experts can update own reports"
  ON expertise_reports FOR UPDATE TO authenticated USING (auth.uid() = expert_id) WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Experts can delete own reports"
  ON expertise_reports FOR DELETE TO authenticated USING (auth.uid() = expert_id);

CREATE POLICY "Experts can view sections of own reports"
  ON report_sections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM expertise_reports WHERE expertise_reports.id = report_sections.report_id AND expertise_reports.expert_id = auth.uid()));
CREATE POLICY "Experts can insert sections in own reports"
  ON report_sections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM expertise_reports WHERE expertise_reports.id = report_sections.report_id AND expertise_reports.expert_id = auth.uid()));
CREATE POLICY "Experts can update sections in own reports"
  ON report_sections FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM expertise_reports WHERE expertise_reports.id = report_sections.report_id AND expertise_reports.expert_id = auth.uid()));
CREATE POLICY "Experts can delete sections in own reports"
  ON report_sections FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM expertise_reports WHERE expertise_reports.id = report_sections.report_id AND expertise_reports.expert_id = auth.uid()));

-- =====================================================
-- MIGRATION 7: Add extraction columns to documents
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'extraction_status') THEN
    ALTER TABLE documents ADD COLUMN extraction_status text DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'extracted_text') THEN
    ALTER TABLE documents ADD COLUMN extracted_text text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'metadata') THEN
    ALTER TABLE documents ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'storage_path') THEN
    ALTER TABLE documents ADD COLUMN storage_path text;
    UPDATE documents SET storage_path = file_path WHERE file_path IS NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'updated_at') THEN
    ALTER TABLE documents ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'uploaded_at')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_at') THEN
    ALTER TABLE documents RENAME COLUMN uploaded_at TO created_at;
  END IF;
END $$;

-- =====================================================
-- MIGRATION 8: Questionnaire checklist responses
-- =====================================================

CREATE TABLE IF NOT EXISTS questionnaire_checklist_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  item_id integer NOT NULL,
  status text NOT NULL CHECK (status IN ('RAS', 'AS', 'D', 'NA')),
  comment text DEFAULT '',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dossier_id, item_id)
);

ALTER TABLE questionnaire_checklist_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist responses from own dossiers"
  ON questionnaire_checklist_responses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_checklist_responses.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can create checklist responses in own dossiers"
  ON questionnaire_checklist_responses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_checklist_responses.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can update checklist responses in own dossiers"
  ON questionnaire_checklist_responses FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_checklist_responses.dossier_id AND dossiers.user_id = auth.uid()));
CREATE POLICY "Users can delete checklist responses from own dossiers"
  ON questionnaire_checklist_responses FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM dossiers WHERE dossiers.id = questionnaire_checklist_responses.dossier_id AND dossiers.user_id = auth.uid()));

-- =====================================================
-- MIGRATION 9: Expert profiles
-- =====================================================

CREATE TABLE IF NOT EXISTS expert_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  registration_number text DEFAULT '',
  qualifications text DEFAULT '',
  signature_url text DEFAULT '',
  language text DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expert profile"
  ON expert_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expert profile"
  ON expert_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expert profile"
  ON expert_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- MIGRATION 10: Auto-create profile trigger
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'expert')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- MIGRATION 11: site_settings
-- =====================================================

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO site_settings (key, value)
VALUES ('contact_notification_email', 'contact@exmar-oi.com')
ON CONFLICT (key) DO NOTHING;
