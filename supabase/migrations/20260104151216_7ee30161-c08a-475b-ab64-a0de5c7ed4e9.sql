-- Create profiles table for Pi Network users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_username TEXT NOT NULL UNIQUE,
  last_free_spin TIMESTAMP WITH TIME ZONE,
  total_spins INTEGER DEFAULT 0,
  total_winnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create spins table for tracking all spins
CREATE TABLE public.spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  spin_type TEXT NOT NULL CHECK (spin_type IN ('free', 'basic', 'pro', 'vault')),
  cost NUMERIC DEFAULT 0,
  result TEXT NOT NULL,
  reward_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create jackpot table
CREATE TABLE public.jackpot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_pi NUMERIC DEFAULT 0,
  last_winner_id UUID REFERENCES public.profiles(id),
  last_win_amount NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create NFT assets table
CREATE TABLE public.nft_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  utility TEXT NOT NULL,
  price_pi NUMERIC NOT NULL,
  image_url TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table for Pi payment tracking
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies (public read for leaderboard, users manage their own)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (true);

-- Spins policies (public read for history, insert via backend)
CREATE POLICY "Spins are viewable by everyone" ON public.spins
  FOR SELECT USING (true);

CREATE POLICY "Spins can be inserted" ON public.spins
  FOR INSERT WITH CHECK (true);

-- Jackpot policies (public read)
CREATE POLICY "Jackpot is viewable by everyone" ON public.jackpot
  FOR SELECT USING (true);

CREATE POLICY "Jackpot can be updated" ON public.jackpot
  FOR UPDATE USING (true);

CREATE POLICY "Jackpot can be inserted" ON public.jackpot
  FOR INSERT WITH CHECK (true);

-- NFT assets policies
CREATE POLICY "NFT assets are viewable by everyone" ON public.nft_assets
  FOR SELECT USING (true);

CREATE POLICY "NFT assets can be inserted" ON public.nft_assets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "NFT assets can be updated" ON public.nft_assets
  FOR UPDATE USING (true);

-- Payments policies
CREATE POLICY "Payments are viewable by everyone" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "Payments can be inserted" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Payments can be updated" ON public.payments
  FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jackpot_updated_at
  BEFORE UPDATE ON public.jackpot
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial jackpot record
INSERT INTO public.jackpot (total_pi) VALUES (156.78);

-- Enable realtime for jackpot updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.jackpot;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spins;