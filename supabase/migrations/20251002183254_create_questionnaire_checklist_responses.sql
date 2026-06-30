/*
  # Créer la table pour les réponses du questionnaire de contrôle

  1. Nouvelle Table
    - `questionnaire_checklist_responses`
      - `id` (uuid, primary key)
      - `dossier_id` (uuid, references dossiers) - Le dossier associé
      - `item_id` (integer) - L'ID de l'item du questionnaire
      - `status` (text) - Le statut: 'RAS', 'AS', 'D', 'NA'
      - `comment` (text, nullable) - Commentaire optionnel
      - `user_id` (uuid, references profiles) - L'utilisateur qui a fait le contrôle
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - UNIQUE(dossier_id, item_id) - Un seul statut par item par dossier

  2. Sécurité
    - Activer RLS
    - Politiques pour permettre aux utilisateurs de gérer leurs propres réponses
    - Les utilisateurs peuvent voir/modifier les réponses de leurs dossiers
*/

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
  ON questionnaire_checklist_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create checklist responses in own dossiers"
  ON questionnaire_checklist_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update checklist responses in own dossiers"
  ON questionnaire_checklist_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete checklist responses from own dossiers"
  ON questionnaire_checklist_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = questionnaire_checklist_responses.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_checklist_responses_dossier_id 
  ON questionnaire_checklist_responses(dossier_id);

CREATE INDEX IF NOT EXISTS idx_checklist_responses_user_id 
  ON questionnaire_checklist_responses(user_id);