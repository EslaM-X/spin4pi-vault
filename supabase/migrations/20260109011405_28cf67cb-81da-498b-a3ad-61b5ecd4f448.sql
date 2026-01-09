
-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  reward_pi NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, achievement_id)
);

-- Create VIP tiers table
CREATE TABLE public.vip_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL UNIQUE,
  min_total_spins INTEGER NOT NULL,
  spin_discount NUMERIC DEFAULT 0,
  bonus_multiplier NUMERIC DEFAULT 1,
  exclusive_rewards TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_pool NUMERIC DEFAULT 0,
  entry_fee NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournament_entries table
CREATE TABLE public.tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_winnings NUMERIC DEFAULT 0,
  spin_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, profile_id)
);

-- Enable RLS on all tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (viewable by everyone)
CREATE POLICY "Achievements viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- RLS policies for user_achievements
CREATE POLICY "User achievements viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "User achievements can be inserted" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- RLS policies for vip_tiers
CREATE POLICY "VIP tiers viewable by everyone" ON public.vip_tiers FOR SELECT USING (true);

-- RLS policies for tournaments
CREATE POLICY "Tournaments viewable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Tournaments can be inserted" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Tournaments can be updated" ON public.tournaments FOR UPDATE USING (true);

-- RLS policies for tournament_entries
CREATE POLICY "Tournament entries viewable by everyone" ON public.tournament_entries FOR SELECT USING (true);
CREATE POLICY "Tournament entries can be inserted" ON public.tournament_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Tournament entries can be updated" ON public.tournament_entries FOR UPDATE USING (true);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, reward_pi) VALUES
('First Spin', 'Complete your first spin', 'Sparkles', 'total_spins', 1, 0.01),
('Spinning Novice', 'Complete 10 spins', 'Zap', 'total_spins', 10, 0.05),
('Spin Master', 'Complete 100 spins', 'Trophy', 'total_spins', 100, 0.25),
('Spin Legend', 'Complete 1000 spins', 'Crown', 'total_spins', 1000, 1),
('Lucky Winner', 'Win 1 Pi total', 'Coins', 'total_winnings', 1, 0.1),
('High Roller', 'Win 10 Pi total', 'Gem', 'total_winnings', 10, 0.5),
('Jackpot Hunter', 'Win 100 Pi total', 'Star', 'total_winnings', 100, 2),
('Streak Starter', 'Achieve a 3-day login streak', 'Flame', 'login_streak', 3, 0.05),
('Streak Master', 'Achieve a 7-day login streak', 'Fire', 'login_streak', 7, 0.15),
('Streak Legend', 'Achieve a 30-day login streak', 'Rocket', 'login_streak', 30, 1),
('Social Butterfly', 'Refer 5 friends', 'Users', 'referral_count', 5, 0.25),
('Influencer', 'Refer 25 friends', 'Share2', 'referral_count', 25, 1);

-- Insert VIP tiers
INSERT INTO public.vip_tiers (name, level, min_total_spins, spin_discount, bonus_multiplier, exclusive_rewards) VALUES
('Bronze', 1, 0, 0, 1, ARRAY['Standard rewards']),
('Silver', 2, 50, 0.05, 1.1, ARRAY['5% spin discount', '10% bonus multiplier']),
('Gold', 3, 200, 0.10, 1.25, ARRAY['10% spin discount', '25% bonus multiplier', 'Priority support']),
('Platinum', 4, 500, 0.15, 1.5, ARRAY['15% spin discount', '50% bonus multiplier', 'Exclusive NFTs', 'Priority support']),
('Diamond', 5, 1000, 0.20, 2, ARRAY['20% spin discount', '2x bonus multiplier', 'Exclusive NFTs', 'VIP tournaments', 'Personal manager']);

-- Insert sample tournament
INSERT INTO public.tournaments (name, description, start_time, end_time, prize_pool, entry_fee, status) VALUES
('Weekly Spin Championship', 'Compete for the highest winnings this week!', now(), now() + interval '7 days', 100, 0.1, 'active');
