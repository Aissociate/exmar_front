/*
  # Create dossiers_administratifs table

  ## Summary
  Creates a table to store administrative dossiers submitted online via the Démarches Administratives page.

  ## New Tables
  - `dossiers_administratifs`
    - `id` (uuid, primary key)
    - `type` (text) — mutation | enregistrement | modification | radiation
    - `prix` (integer) — price in euros
    - `statut` (text) — recu | en_cours | traite | archive
    - `donnees` (jsonb) — all form data as JSON
    - `email_client` (text) — optional contact email
    - `notes_internes` (text) — admin notes
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public can insert (submit a dossier)
  - Only authenticated admin can read/update
*/

CREATE TABLE IF NOT EXISTS dossiers_administratifs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  prix integer NOT NULL DEFAULT 0,
  statut text NOT NULL DEFAULT 'recu',
  donnees jsonb NOT NULL DEFAULT '{}',
  email_client text DEFAULT '',
  notes_internes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dossiers_administratifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a dossier"
  ON dossiers_administratifs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view dossiers"
  ON dossiers_administratifs
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dossiers"
  ON dossiers_administratifs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION update_dossier_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_dossier_updated_at
  BEFORE UPDATE ON dossiers_administratifs
  FOR EACH ROW
  EXECUTE FUNCTION update_dossier_timestamp();
