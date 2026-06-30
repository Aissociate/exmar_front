/*
  # Allow public access to admin tables

  Temporarily removes authentication requirement for admin dashboard access.
  Adds public read/write policies on contact_submissions and dossiers_administratifs.
*/

-- contact_submissions: allow public read, update, delete
DROP POLICY IF EXISTS "Admin can read all submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin can update submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admin can delete submissions" ON contact_submissions;

CREATE POLICY "Public can read submissions"
  ON contact_submissions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can update submissions"
  ON contact_submissions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete submissions"
  ON contact_submissions FOR DELETE
  TO anon, authenticated
  USING (true);

-- dossiers_administratifs: allow public read, update
DROP POLICY IF EXISTS "Admin can read dossiers" ON dossiers_administratifs;
DROP POLICY IF EXISTS "Admin can update dossiers" ON dossiers_administratifs;

CREATE POLICY "Public can read dossiers"
  ON dossiers_administratifs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can update dossiers"
  ON dossiers_administratifs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
