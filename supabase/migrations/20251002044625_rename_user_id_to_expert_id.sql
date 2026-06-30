/*
  # Rename user_id to expert_id in expertise_reports

  1. Changes
    - Rename column `user_id` to `expert_id` in `expertise_reports` table
    - Update all RLS policies to use `expert_id` instead of `user_id`
    - Update indexes to use new column name

  2. Security
    - Maintain existing RLS policies with updated column references
*/

-- Rename column
ALTER TABLE expertise_reports 
RENAME COLUMN user_id TO expert_id;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own reports" ON expertise_reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON expertise_reports;
DROP POLICY IF EXISTS "Users can update own reports" ON expertise_reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON expertise_reports;
DROP POLICY IF EXISTS "Users can view sections of own reports" ON report_sections;
DROP POLICY IF EXISTS "Users can insert sections in own reports" ON report_sections;
DROP POLICY IF EXISTS "Users can update sections in own reports" ON report_sections;
DROP POLICY IF EXISTS "Users can delete sections in own reports" ON report_sections;

-- Recreate policies with expert_id
CREATE POLICY "Experts can view own reports"
  ON expertise_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = expert_id);

CREATE POLICY "Experts can insert own reports"
  ON expertise_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update own reports"
  ON expertise_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = expert_id)
  WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can delete own reports"
  ON expertise_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = expert_id);

CREATE POLICY "Experts can view sections of own reports"
  ON report_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = auth.uid()
    )
  );

CREATE POLICY "Experts can insert sections in own reports"
  ON report_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = auth.uid()
    )
  );

CREATE POLICY "Experts can update sections in own reports"
  ON report_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = auth.uid()
    )
  );

CREATE POLICY "Experts can delete sections in own reports"
  ON report_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.expert_id = auth.uid()
    )
  );

-- Recreate index with new column name
DROP INDEX IF EXISTS idx_expertise_reports_user;
CREATE INDEX IF NOT EXISTS idx_expertise_reports_expert 
  ON expertise_reports(expert_id);