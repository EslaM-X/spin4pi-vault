-- Create shares table for tracking social sharing activity
CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'tournament', 'referral', 'custom')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reward_pi NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own shares" 
ON public.shares 
FOR SELECT 
USING (true);

CREATE POLICY "Shares can be inserted" 
ON public.shares 
FOR INSERT 
WITH CHECK (true);