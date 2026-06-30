-- =====================================================
-- Open all tables to anon/public access (no-auth bypass)
-- =====================================================

-- DOSSIERS: make user_id nullable, open to anon
ALTER TABLE dossiers ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can view own dossiers" ON dossiers;
DROP POLICY IF EXISTS "Users can create own dossiers" ON dossiers;
DROP POLICY IF EXISTS "Users can update own dossiers" ON dossiers;
DROP POLICY IF EXISTS "Users can delete own dossiers" ON dossiers;

CREATE POLICY "Public full access to dossiers" ON dossiers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- DOCUMENTS
DROP POLICY IF EXISTS "Users can view documents from own dossiers" ON documents;
DROP POLICY IF EXISTS "Users can upload documents to own dossiers" ON documents;
DROP POLICY IF EXISTS "Users can delete documents from own dossiers" ON documents;

CREATE POLICY "Public full access to documents" ON documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- QUESTIONNAIRE_TEMPLATES
DROP POLICY IF EXISTS "All authenticated users can view templates" ON questionnaire_templates;
CREATE POLICY "Public access to templates" ON questionnaire_templates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- QUESTIONNAIRE_RESPONSES
DROP POLICY IF EXISTS "Users can view responses from own dossiers" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users can create responses in own dossiers" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users can update responses in own dossiers" ON questionnaire_responses;
DROP POLICY IF EXISTS "Users can delete responses from own dossiers" ON questionnaire_responses;
CREATE POLICY "Public full access to questionnaire_responses" ON questionnaire_responses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- PHOTOS
DROP POLICY IF EXISTS "Users can view photos from own dossiers" ON photos;
DROP POLICY IF EXISTS "Users can upload photos to own dossiers" ON photos;
DROP POLICY IF EXISTS "Users can update photos in own dossiers" ON photos;
DROP POLICY IF EXISTS "Users can delete photos from own dossiers" ON photos;
CREATE POLICY "Public full access to photos" ON photos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- AUDIO_COMMENTS
DROP POLICY IF EXISTS "Users can view audio from own dossiers" ON audio_comments;
DROP POLICY IF EXISTS "Users can upload audio to own dossiers" ON audio_comments;
DROP POLICY IF EXISTS "Users can update audio in own dossiers" ON audio_comments;
DROP POLICY IF EXISTS "Users can delete audio from own dossiers" ON audio_comments;
CREATE POLICY "Public full access to audio_comments" ON audio_comments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- REPORTS
DROP POLICY IF EXISTS "Users can view reports from own dossiers" ON reports;
DROP POLICY IF EXISTS "Users can create reports for own dossiers" ON reports;
DROP POLICY IF EXISTS "Users can update reports in own dossiers" ON reports;
DROP POLICY IF EXISTS "Users can delete reports from own dossiers" ON reports;
CREATE POLICY "Public full access to reports" ON reports FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ACTIVITY_LOGS
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
CREATE POLICY "Public full access to activity_logs" ON activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- QUESTIONNAIRE_PHOTOS
DROP POLICY IF EXISTS "Users can view photos from their dossiers" ON questionnaire_photos;
DROP POLICY IF EXISTS "Users can insert photos to their dossiers" ON questionnaire_photos;
DROP POLICY IF EXISTS "Users can update photos in their dossiers" ON questionnaire_photos;
DROP POLICY IF EXISTS "Users can delete photos from their dossiers" ON questionnaire_photos;
CREATE POLICY "Public full access to questionnaire_photos" ON questionnaire_photos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- QUESTIONNAIRE_AUDIO
DROP POLICY IF EXISTS "Users can view audio from their dossiers" ON questionnaire_audio;
DROP POLICY IF EXISTS "Users can insert audio to their dossiers" ON questionnaire_audio;
DROP POLICY IF EXISTS "Users can update audio in their dossiers" ON questionnaire_audio;
DROP POLICY IF EXISTS "Users can delete audio from their dossiers" ON questionnaire_audio;
CREATE POLICY "Public full access to questionnaire_audio" ON questionnaire_audio FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- QUESTIONNAIRE_CHECKLIST_RESPONSES
DROP POLICY IF EXISTS "Users can view checklist responses from own dossiers" ON questionnaire_checklist_responses;
DROP POLICY IF EXISTS "Users can create checklist responses in own dossiers" ON questionnaire_checklist_responses;
DROP POLICY IF EXISTS "Users can update checklist responses in own dossiers" ON questionnaire_checklist_responses;
DROP POLICY IF EXISTS "Users can delete checklist responses from own dossiers" ON questionnaire_checklist_responses;
CREATE POLICY "Public full access to checklist_responses" ON questionnaire_checklist_responses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- EXPERTISE_REPORTS
DROP POLICY IF EXISTS "Experts can view own reports" ON expertise_reports;
DROP POLICY IF EXISTS "Experts can insert own reports" ON expertise_reports;
DROP POLICY IF EXISTS "Experts can update own reports" ON expertise_reports;
DROP POLICY IF EXISTS "Experts can delete own reports" ON expertise_reports;
CREATE POLICY "Public full access to expertise_reports" ON expertise_reports FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- REPORT_SECTIONS
DROP POLICY IF EXISTS "Experts can view sections of own reports" ON report_sections;
DROP POLICY IF EXISTS "Experts can insert sections in own reports" ON report_sections;
DROP POLICY IF EXISTS "Experts can update sections in own reports" ON report_sections;
DROP POLICY IF EXISTS "Experts can delete sections in own reports" ON report_sections;
CREATE POLICY "Public full access to report_sections" ON report_sections FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- EXPERT_PROFILES: make user_id nullable, open to anon
ALTER TABLE expert_profiles ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can view own expert profile" ON expert_profiles;
DROP POLICY IF EXISTS "Users can insert own expert profile" ON expert_profiles;
DROP POLICY IF EXISTS "Users can update own expert profile" ON expert_profiles;
CREATE POLICY "Public full access to expert_profiles" ON expert_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Public full access to profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- SITE_SETTINGS: open to anon
CREATE POLICY "Public full access to site_settings" ON site_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
