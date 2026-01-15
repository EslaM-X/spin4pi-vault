-- Create enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');

-- Create admin_roles table
CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  role app_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admin roles
CREATE POLICY "Service role manages admin roles" ON public.admin_roles
  FOR ALL USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Public can view admin roles (needed for client-side admin check via edge function)
CREATE POLICY "Public can view admin roles" ON public.admin_roles
  FOR SELECT USING (true);

-- Fix spins table RLS: Only service role can insert spins
DROP POLICY IF EXISTS "Spins can be inserted" ON public.spins;
CREATE POLICY "Service role inserts spins" ON public.spins
  FOR INSERT WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Fix profiles table RLS: Prevent client-side updates to financial fields
-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new restrictive UPDATE policy - only service role can update financial fields
CREATE POLICY "Service role updates profiles" ON public.profiles
  FOR UPDATE USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Fix tournaments table: Only service role can insert/update
DROP POLICY IF EXISTS "Tournaments can be inserted" ON public.tournaments;
DROP POLICY IF EXISTS "Tournaments can be updated" ON public.tournaments;

CREATE POLICY "Service role manages tournaments" ON public.tournaments
  FOR ALL USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Keep SELECT for public viewing
CREATE POLICY "Public can view tournaments" ON public.tournaments
  FOR SELECT USING (true);

-- Fix shares table: Only service role can insert (prevent client-side reward manipulation)
DROP POLICY IF EXISTS "Shares can be inserted" ON public.shares;
CREATE POLICY "Service role inserts shares" ON public.shares
  FOR INSERT WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Create helper function to verify Pi Network token
CREATE OR REPLACE FUNCTION public.has_role(_profile_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE profile_id = _profile_id
      AND role = _role
  )
$$;