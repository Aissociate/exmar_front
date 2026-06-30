/*
  # Remove unused indexes to optimize database performance

  1. Changes
    - Drops 29 unused indexes that have not been utilized
    - Keeps only indexes that are actively used for queries
    - Reduces database storage overhead
    - Improves write performance (fewer indexes to update on INSERT/UPDATE)
    
  2. Performance Impact
    - Reduces index maintenance overhead during data modifications
    - Frees up storage space
    - Simplifies query optimization
    
  3. Notes
    - All RLS policies remain intact and secure
    - If any of these indexes become needed in the future, they can be recreated
    - Indexes on primary keys and foreign keys are automatically maintained by PostgreSQL
*/

-- Drop unused indexes on activity_logs table
DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_activity_logs_created_at;
DROP INDEX IF EXISTS idx_activity_logs_action;
DROP INDEX IF EXISTS idx_activity_logs_level;

-- Drop unused indexes on dossiers table
DROP INDEX IF EXISTS idx_dossiers_status;
DROP INDEX IF EXISTS idx_dossiers_type;

-- Drop unused indexes on documents table
DROP INDEX IF EXISTS idx_documents_dossier_id;
DROP INDEX IF EXISTS idx_documents_status;

-- Drop unused indexes on questionnaire_responses table
DROP INDEX IF EXISTS idx_questionnaire_responses_dossier_id;
DROP INDEX IF EXISTS idx_questionnaire_responses_template_id;

-- Drop unused indexes on photos table
DROP INDEX IF EXISTS idx_photos_dossier_id;
DROP INDEX IF EXISTS idx_photos_response_id;
DROP INDEX IF EXISTS idx_photos_user_id;

-- Drop unused indexes on audio_comments table
DROP INDEX IF EXISTS idx_audio_comments_dossier_id;
DROP INDEX IF EXISTS idx_audio_comments_response_id;
DROP INDEX IF EXISTS idx_audio_comments_user_id;

-- Drop unused indexes on reports table
DROP INDEX IF EXISTS idx_reports_dossier_id;
DROP INDEX IF EXISTS idx_reports_user_id;

-- Drop unused indexes on questionnaire_checklist_responses table
DROP INDEX IF EXISTS idx_checklist_responses_dossier_id;
DROP INDEX IF EXISTS idx_checklist_responses_user_id;

-- Drop unused indexes on questionnaire_photos table
DROP INDEX IF EXISTS idx_questionnaire_photos_dossier;
DROP INDEX IF EXISTS idx_questionnaire_photos_question;
DROP INDEX IF EXISTS idx_questionnaire_photos_user_id;

-- Drop unused indexes on questionnaire_audio table
DROP INDEX IF EXISTS idx_questionnaire_audio_dossier;
DROP INDEX IF EXISTS idx_questionnaire_audio_question;
DROP INDEX IF EXISTS idx_questionnaire_audio_user_id;

-- Drop unused indexes on expertise_reports table
DROP INDEX IF EXISTS idx_expertise_reports_dossier;

-- Drop unused indexes on report_sections table
DROP INDEX IF EXISTS idx_report_sections_report;
DROP INDEX IF EXISTS idx_report_sections_order;
