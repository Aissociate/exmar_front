/*
  # Add automatic profile creation trigger

  1. Changes
    - Creates a trigger function to automatically create a profile when a new user signs up
    - Creates a trigger on auth.users table to call this function
    
  2. Security
    - Maintains existing RLS policies
    - Ensures every user has a corresponding profile
    
  3. Notes
    - This prevents foreign key constraint violations when creating dossiers
    - Profile is created with default values (role: 'expert')
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'expert'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
