-- Create staking table for Pi staking functionality
CREATE TABLE public.staking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  tier TEXT NOT NULL,
  apy NUMERIC NOT NULL DEFAULT 5,
  boost_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  rewards_earned NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staking
CREATE POLICY "Staking viewable by everyone"
ON public.staking
FOR SELECT
USING (true);

CREATE POLICY "Staking can be inserted"
ON public.staking
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staking can be updated"
ON public.staking
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_staking_profile_id ON public.staking(profile_id);
CREATE INDEX idx_staking_status ON public.staking(status);