/*
  # Create Expert Profiles Table

  1. New Tables
    - `expert_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `full_name` (text) - Expert's full name
      - `title` (text) - Professional title (e.g., "Expert près de la Cour d'Appel")
      - `address` (text) - Business address
      - `phone` (text) - Contact phone number
      - `email` (text) - Contact email
      - `registration_number` (text) - Professional registration number if applicable
      - `qualifications` (text) - Professional qualifications and certifications
      - `signature_url` (text) - URL to signature image in storage (optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `expert_profiles` table
    - Add policy for authenticated users to read their own profile
    - Add policy for authenticated users to insert their own profile
    - Add policy for authenticated users to update their own profile

  3. Important Notes
    - Each user can have only one expert profile (enforced by unique constraint on user_id)
    - This profile will be used for report generation and export
*/

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expert profile"
  ON expert_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expert profile"
  ON expert_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expert profile"
  ON expert_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
