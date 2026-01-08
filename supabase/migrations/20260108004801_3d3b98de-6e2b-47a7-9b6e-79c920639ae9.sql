-- Add daily login tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_date date,
ADD COLUMN IF NOT EXISTS login_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_login_rewards numeric DEFAULT 0;

-- Create withdrawals table to track Pi cashouts
CREATE TABLE public.withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  payment_id text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  txid text
);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS policies for withdrawals
CREATE POLICY "Withdrawals viewable by everyone" ON public.withdrawals FOR SELECT USING (true);
CREATE POLICY "Withdrawals can be inserted" ON public.withdrawals FOR INSERT WITH CHECK (true);
CREATE POLICY "Withdrawals can be updated" ON public.withdrawals FOR UPDATE USING (true);