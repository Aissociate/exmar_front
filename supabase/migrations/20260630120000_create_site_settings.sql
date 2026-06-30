/*
  # Create site_settings table

  ## Summary
  Simple key/value store for configurable site settings managed from the admin
  back-office. Used for the contact-form notification email address.

  ## New Tables
  - `site_settings`
    - `key` (text, primary key)
    - `value` (text)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Only authenticated users (the expert/admin) can read and write settings.
  - The public contact form does NOT read this table directly; the
    `send-contact-email` edge function reads it server-side via the service role.

  ## Seed
  - Default contact notification email: contact@exmar-oi.com
*/

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

INSERT INTO site_settings (key, value)
VALUES ('contact_notification_email', 'contact@exmar-oi.com')
ON CONFLICT (key) DO NOTHING;
