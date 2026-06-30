/*
  # Create expertise reports schema

  1. New Tables
    - `expertise_reports`
      - `id` (uuid, primary key)
      - `dossier_id` (uuid, foreign key to dossiers)
      - `report_number` (text) - numéro du rapport
      - `status` (text) - draft, in_progress, completed
      - `expert_name` (text)
      - `expert_title` (text)
      - `expert_address` (text)
      - `expert_contact` (text)
      - `owner_name` (text)
      - `owner_address` (text)
      - `requester_name` (text)
      - `requester_address` (text)
      - `visit_date` (date)
      - `visit_location` (text)
      - `mission` (text)
      - `navigation_history` (text) - section II
      - `maintenance_state_content` (jsonb) - section III generated content
      - `valuation_method` (text)
      - `hull_value` (numeric)
      - `engine_value` (numeric)
      - `navigation_equipment_value` (numeric)
      - `total_value` (numeric)
      - `value_range_min` (numeric)
      - `value_range_max` (numeric)
      - `conclusions` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key)
    
    - `report_sections`
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key)
      - `section_type` (text) - pont_accastillage, structure, oeuvres_mortes, etc.
      - `section_title` (text)
      - `content` (text) - generated or edited content
      - `ai_generated` (boolean)
      - `generation_prompt` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

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

CREATE POLICY "Users can view own reports"
  ON expertise_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON expertise_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON expertise_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON expertise_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view sections of own reports"
  ON report_sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sections in own reports"
  ON report_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections in own reports"
  ON report_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections in own reports"
  ON report_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expertise_reports
      WHERE expertise_reports.id = report_sections.report_id
      AND expertise_reports.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_expertise_reports_dossier 
  ON expertise_reports(dossier_id);

CREATE INDEX IF NOT EXISTS idx_expertise_reports_user 
  ON expertise_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_report_sections_report 
  ON report_sections(report_id);

CREATE INDEX IF NOT EXISTS idx_report_sections_order 
  ON report_sections(report_id, order_index);
