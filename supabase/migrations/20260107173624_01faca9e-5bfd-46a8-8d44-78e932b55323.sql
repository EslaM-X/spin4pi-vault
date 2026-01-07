-- Add wallet_balance and referral columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_earnings numeric DEFAULT 0;

-- Create index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Create NFT ownership tracking table
CREATE TABLE IF NOT EXISTS public.nft_ownership (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nft_asset_id uuid NOT NULL REFERENCES public.nft_assets(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  is_equipped boolean DEFAULT false,
  UNIQUE(profile_id, nft_asset_id)
);

-- Enable RLS on nft_ownership
ALTER TABLE public.nft_ownership ENABLE ROW LEVEL SECURITY;

-- RLS policies for nft_ownership
CREATE POLICY "NFT ownership is viewable by everyone" 
ON public.nft_ownership 
FOR SELECT 
USING (true);

CREATE POLICY "NFT ownership can be inserted" 
ON public.nft_ownership 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "NFT ownership can be updated" 
ON public.nft_ownership 
FOR UPDATE 
USING (true);

-- Create referral rewards tracking table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_type text NOT NULL,
  reward_amount numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on referral_rewards
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_rewards
CREATE POLICY "Referral rewards viewable by everyone" 
ON public.referral_rewards 
FOR SELECT 
USING (true);

CREATE POLICY "Referral rewards can be inserted" 
ON public.referral_rewards 
FOR INSERT 
WITH CHECK (true);

-- Create deposit transactions table
CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_id text NOT NULL UNIQUE,
  txid text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS on deposits
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- RLS policies for deposits
CREATE POLICY "Deposits viewable by everyone" 
ON public.deposits 
FOR SELECT 
USING (true);

CREATE POLICY "Deposits can be inserted" 
ON public.deposits 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Deposits can be updated" 
ON public.deposits 
FOR UPDATE 
USING (true);