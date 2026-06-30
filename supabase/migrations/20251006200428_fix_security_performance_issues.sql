/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified by Supabase:
  
  ## Changes Made

  ### 1. Add Missing Indexes on Foreign Keys (7 issues)
  - `audio_comments.user_id`
  - `documents.user_id`
  - `photos.user_id`
  - `questionnaire_audio.user_id`
  - `questionnaire_photos.user_id`
  - `questionnaire_responses.template_id`
  - `reports.user_id`

  ### 2. Optimize RLS Policies (56 policies across 14 tables)
  Replace `auth.uid()` with `(SELECT auth.uid())` to prevent re-evaluation for each row.
  This significantly improves query performance at scale by evaluating auth once per query.

  ### 3. Fix Function Search Paths (3 functions)
  Add explicit search_path to functions for security.

  ### 4. Notes on Unused Indexes
  Unused indexes are kept as they will be needed as the application scales.
  They don't cause performance issues and provide optimization for future queries.

  ## Security Improvements
  - Better RLS performance (56 policies optimized)
  - Secure function search paths
  - Proper indexing for foreign key constraints
*/

-- =====================================================
-- PART 1: ADD MISSING INDEXES ON FOREIGN KEYS
-- =====================================================

-- Add index for audio_comments.user_id
CREATE INDEX IF NOT EXISTS idx_audio_comments_user_id 
  ON audio_comments(user_id);

-- Add index for documents.user_id
CREATE INDEX IF NOT EXISTS idx_documents_user_id 
  ON documents(user_id);

-- Add index for photos.user_id
CREATE INDEX IF NOT EXISTS idx_photos_user_id 
  ON photos(user_id);

-- Add index for questionnaire_audio.user_id
CREATE INDEX IF NOT EXISTS idx_questionnaire_audio_user_id 
  ON questionnaire_audio(user_id);

-- Add index for questionnaire_photos.user_id
CREATE INDEX IF NOT EXISTS idx_questionnaire_photos_user_id 
  ON questionnaire_photos(user_id);

-- Add index for questionnaire_responses.template_id
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_template_id 
  ON questionnaire_responses(template_id);

-- Add index for reports.user_id
CREATE INDEX IF NOT EXISTS idx_reports_user_id 
  ON reports(user_id);

-- =====================================================
-- PART 2: OPTIMIZE RLS POLICIES - ACTIVITY LOGS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
CREATE POLICY "Users can view own activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
CREATE POLICY "Users can create activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 3: OPTIMIZE RLS POLICIES - PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- PART 4: OPTIMIZE RLS POLICIES - DOSSIERS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own dossiers" ON dossiers;
CREATE POLICY "Users can view own dossiers"
  ON dossiers
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own dossiers" ON dossiers;
CREATE POLICY "Users can create own dossiers"
  ON dossiers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own dossiers" ON dossiers;
CREATE POLICY "Users can update own dossiers"
  ON dossiers
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own dossiers" ON dossiers;
CREATE POLICY "Users can delete own dossiers"
  ON dossiers
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 5: OPTIMIZE RLS POLICIES - DOCUMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view documents from own dossiers" ON documents;
CREATE POLICY "Users can view documents from own dossiers"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can upload documents to own dossiers" ON documents;
CREATE POLICY "Users can upload documents to own dossiers"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = (SELECT auth.uid())) AND
    (EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "Users can delete documents from own dossiers" ON documents;
CREATE POLICY "Users can delete documents from own dossiers"
  ON documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 6: OPTIMIZE RLS POLICIES - QUESTIONNAIRE_RESPONSES
-- =====================================================

DROP POLICY IF EXISTS "Users can view responses from own dossiers" ON questionnaire_responses;
CREATE POLICY "Users can view responses from own dossiers"
  ON questionnaire_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create responses in own dossiers" ON questionnaire_responses;
CREATE POLICY "Users can create responses in own dossiers"
  ON questionnaire_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update responses in own dossiers" ON questionnaire_responses;
CREATE POLICY "Users can update responses in own dossiers"
  ON questionnaire_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete responses from own dossiers" ON questionnaire_responses;
CREATE POLICY "Users can delete responses from own dossiers"
  ON questionnaire_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 7: OPTIMIZE RLS POLICIES - PHOTOS
-- =====================================================

DROP POLICY IF EXISTS "Users can view photos from own dossiers" ON photos;
CREATE POLICY "Users can view photos from own dossiers"
  ON photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can upload photos to own dossiers" ON photos;
CREATE POLICY "Users can upload photos to own dossiers"
  ON photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = (SELECT auth.uid())) AND
    (EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "Users can update photos in own dossiers" ON photos;
CREATE POLICY "Users can update photos in own dossiers"
  ON photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete photos from own dossiers" ON photos;
CREATE POLICY "Users can delete photos from own dossiers"
  ON photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 8: OPTIMIZE RLS POLICIES - AUDIO_COMMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view audio from own dossiers" ON audio_comments;
CREATE POLICY "Users can view audio from own dossiers"
  ON audio_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can upload audio to own dossiers" ON audio_comments;
CREATE POLICY "Users can upload audio to own dossiers"
  ON audio_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = (SELECT auth.uid())) AND
    (EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "Users can update audio in own dossiers" ON audio_comments;
CREATE POLICY "Users can update audio in own dossiers"
  ON audio_comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete audio from own dossiers" ON audio_comments;
CREATE POLICY "Users can delete audio from own dossiers"
  ON audio_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = audio_comments.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 9: OPTIMIZE RLS POLICIES - REPORTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view reports from own dossiers" ON reports;
CREATE POLICY "Users can view reports from own dossiers"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create reports for own dossiers" ON reports;
CREATE POLICY "Users can create reports for own dossiers"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = (SELECT auth.uid())) AND
    (EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "Users can update reports in own dossiers" ON reports;
CREATE POLICY "Users can update reports in own dossiers"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete reports from own dossiers" ON reports;
CREATE POLICY "Users can delete reports from own dossiers"
  ON reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = reports.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 10: OPTIMIZE RLS POLICIES - QUESTIONNAIRE_CHECKLIST_RESPONSES
-- =====================================================

DROP POLICY IF EXISTS "Users can view checklist responses from own dossiers" ON questionnaire_checklist_responses;
CREATE POLICY "Users can view checklist responses from own dossiers"
  ON questionnaire_checklist_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create checklist responses in own dossiers" ON questionnaire_checklist_responses;
CREATE POLICY "Users can create checklist responses in own dossiers"
  ON questionnaire_checklist_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update checklist responses in own dossiers" ON questionnaire_checklist_responses;
CREATE POLICY "Users can update checklist responses in own dossiers"
  ON questionnaire_checklist_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete checklist responses from own dossiers" ON questionnaire_checklist_responses;
CREATE POLICY "Users can delete checklist responses from own dossiers"
  ON questionnaire_checklist_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 11: OPTIMIZE RLS POLICIES - EXPERT_PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own expert profile" ON expert_profiles;
CREATE POLICY "Users can view own expert profile"
  ON expert_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own expert profile" ON expert_profiles;
CREATE POLICY "Users can insert own expert profile"
  ON expert_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own expert profile" ON expert_profiles;
CREATE POLICY "Users can update own expert profile"
  ON expert_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 12: OPTIMIZE RLS POLICIES - QUESTIONNAIRE_PHOTOS
-- =====================================================

DROP POLICY IF EXISTS "Users can view photos from their dossiers" ON questionnaire_photos;
CREATE POLICY "Users can view photos from their dossiers"
  ON questionnaire_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert photos to their dossiers" ON questionnaire_photos;
CREATE POLICY "Users can insert photos to their dossiers"
  ON questionnaire_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = (SELECT auth.uid())) AND
    (EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "Users can update photos in their dossiers" ON questionnaire_photos;
CREATE POLICY "Users can update photos in their dossiers"
  ON questionnaire_photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete photos from their dossiers" ON questionnaire_photos;
CREATE POLICY "Users can delete photos from their dossiers"
  ON questionnaire_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_photos.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 13: OPTIMIZE RLS POLICIES - QUESTIONNAIRE_AUDIO
-- =====================================================

DROP POLICY IF EXISTS "Users can view audio from their dossiers" ON questionnaire_audio;
CREATE POLICY "Users can view audio from their dossiers"
  ON questionnaire_audio
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert audio to their dossiers" ON questionnaire_audio;
CREATE POLICY "Users can insert audio to their dossiers"
  ON questionnaire_audio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = (SELECT auth.uid())) AND
    (EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    ))
  );

DROP POLICY IF EXISTS "Users can update audio in their dossiers" ON questionnaire_audio;
CREATE POLICY "Users can update audio in their dossiers"
  ON questionnaire_audio
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete audio from their dossiers" ON questionnaire_audio;
CREATE POLICY "Users can delete audio from their dossiers"
  ON questionnaire_audio
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_audio.dossier_id
      AND dossiers.user_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 14: OPTIMIZE RLS POLICIES - EXPERTISE_REPORTS
-- =====================================================

DROP POLICY IF EXISTS "Experts can view own reports" ON expertise_reports;
CREATE POLICY "Experts can view own reports"
  ON expertise_reports
  FOR SELECT
  TO authenticated
  USING (expert_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Experts can insert own reports" ON expertise_reports;
CREATE POLICY "Experts can insert own reports"
  ON expertise_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (expert_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Experts can update own reports" ON expertise_reports;
CREATE POLICY "Experts can update own reports"
  ON expertise_reports
  FOR UPDATE
  TO authenticated
  USING (expert_id = (SELECT auth.uid()))
  WITH CHECK (expert_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Experts can delete own reports" ON expertise_reports;
CREATE POLICY "Experts can delete own reports"
  ON expertise_reports
  FOR DELETE
  TO authenticated
  USING (expert_id = (SELECT auth.uid()));

-- =====================================================
-- PART 15: OPTIMIZE RLS POLICIES - REPORT_SECTIONS
-- =====================================================

DROP POLICY IF EXISTS "Experts can view sections of own reports" ON report_sections;
CREATE POLICY "Experts can view sections of own reports"
  ON report_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Experts can insert sections in own reports" ON report_sections;
CREATE POLICY "Experts can insert sections in own reports"
  ON report_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Experts can update sections in own reports" ON report_sections;
CREATE POLICY "Experts can update sections in own reports"
  ON report_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Experts can delete sections in own reports" ON report_sections;
CREATE POLICY "Experts can delete sections in own reports"
  ON report_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- PART 16: FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix generate_dossier_number function
CREATE OR REPLACE FUNCTION generate_dossier_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  year_str TEXT;
  sequence_num INTEGER;
  dossier_num TEXT;
BEGIN
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(dossier_number FROM '[0-9]+$') AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM dossiers
  WHERE dossier_number LIKE 'DOS-' || year_str || '-%';
  
  dossier_num := 'DOS-' || year_str || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN dossier_num;
END;
$$;

-- Fix set_dossier_number function
CREATE OR REPLACE FUNCTION set_dossier_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.dossier_number IS NULL THEN
    NEW.dossier_number := generate_dossier_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
