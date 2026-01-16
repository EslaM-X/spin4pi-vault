-- Add S4P token balance to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS s4p_balance numeric DEFAULT 0;

-- Create ad_spin_claims table to track daily ad spins
CREATE TABLE IF NOT EXISTS public.ad_spin_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ads_watched integer NOT NULL DEFAULT 0,
  s4p_reward numeric DEFAULT 0,
  claimed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ad_spin_claims_profile_date 
ON public.ad_spin_claims(profile_id, claimed_at);

-- Enable RLS
ALTER TABLE public.ad_spin_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ad_spin_claims
CREATE POLICY "Ad spin claims viewable by everyone"
ON public.ad_spin_claims FOR SELECT
USING (true);

CREATE POLICY "Service role manages ad spin claims"
ON public.ad_spin_claims FOR ALL
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role');

-- Create s4p_transactions table for S4P token history
CREATE TABLE IF NOT EXISTS public.s4p_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_type text NOT NULL, -- 'earn', 'spend', 'jackpot', 'stake'
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.s4p_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for s4p_transactions
CREATE POLICY "S4P transactions viewable by everyone"
ON public.s4p_transactions FOR SELECT
USING (true);

CREATE POLICY "Service role manages S4P transactions"
ON public.s4p_transactions FOR INSERT
WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role');