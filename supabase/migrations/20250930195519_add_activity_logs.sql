/*
  # Add Activity Logs Table

  ## Overview
  This migration creates a table to track user activity and system events throughout the application.
  Useful for monitoring, debugging, and audit trails.

  ## New Tables

  ### `activity_logs`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, nullable) - User who performed the action
  - `action` (text) - Type of action (e.g., 'dossier_created', 'document_uploaded', 'login', 'logout')
  - `entity_type` (text, nullable) - Type of entity affected (e.g., 'dossier', 'document', 'photo')
  - `entity_id` (uuid, nullable) - ID of the affected entity
  - `details` (jsonb) - Additional details about the action
  - `ip_address` (text, nullable) - IP address of the user
  - `user_agent` (text, nullable) - Browser/device information
  - `level` (text) - Log level: 'info', 'warning', 'error', 'success'
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on `activity_logs` table
  - Users can view their own logs
  - Only authenticated users can create logs
*/

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  level text DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'success')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create logs
CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_level ON activity_logs(level);
