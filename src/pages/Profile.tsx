import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Zap,
  Coins,
  Clock,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Bell,
  Award,
  Crown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { ReferralPanel } from '@/components/ReferralPanel';
import { NotificationSettings } from '@/components/NotificationSettings';
import { AchievementBadges } from '@/components/AchievementBadges';
import { VIPStatus } from '@/components/VIPStatus';

import { supabase } from '@/integrations/supabase/client';
import { usePiAuth } from '@/hooks/usePiAuth';

interface SpinHistory {
  id: string;
  result: string;
  spin_type: string;
  cost: number;
  reward_amount: number;
  created_at: string;
}

interface ProfileStats {
  profile_id: string;
  total_spins: number;
  total_winnings: number;
  best_win: number;
  win_rate: number;
  wallet_balance: number;
  referral_code: string;
  referral_count: number;
  referral_earnings: number;
  recent_spins: SpinHistory[];
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = usePiAuth();

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
      return;
    }

    if (user?.username) {
      fetchProfileData(user.username);
    }
  }, [isAuthenticated, isLoading, user]);

  const fetchProfileData = async (piUsername: string) => {
    setPageLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('pi_username', piUsername)
        .maybeSingle();

      if (!profile) {
        setPageLoading(false);
        return;
      }

      const { data: spins } = await supabase
        .from('spins')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const spinHistory = spins || [];
      const winningSpins = spinHistory.filter(s => s.reward_amount > 0);
      const bestWin =
        spinHistory.length > 0
          ? Math.max(...spinHistory.map(s => s.reward_amount || 0))
          : 0;

      setStats({
        profile_id: profile.id,
        total_spins: profile.total_spins || 0,
        total_winnings: profile.total_winnings || 0,
        best_win: bestWin,
        win_rate:
          spinHistory.length > 0
            ? (winningSpins.length / spinHistory.length) * 100
            : 0,
        wallet_balance: Number(profile.wallet_balance) || 0,
        referral_code: profile.referral_code || '',
        referral_count: profile.referral_count || 0,
        referral_earnings: Number(profile.referral_earnings) || 0,
        recent_spins: spinHistory,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResultColor = (result: string) => {
    if (result.toLowerCase().includes('jackpot')) return 'text-pi-gold';
    if (result.toLowerCase().includes('win') || result.includes('π'))
      return 'text-green-400';
    if (result.toLowerCase().includes('nft')) return 'text-pi-purple';
    return 'text-muted-foreground';
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    suffix = '',
    highlight = false,
  }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    suffix?: string;
    highlight?: boolean;
  }) => (
    <Card
      className={`bg-card/50 backdrop-blur-sm border-border/50 ${
        highlight ? 'border-gold/50' : ''
      }`}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={`p-3 rounded-full ${
            highlight ? 'bg-gold/20' : 'bg-primary/20'
          }`}
        >
          <Icon
            className={`w-6 h-6 ${
              highlight ? 'text-gold' : 'text-primary'
            }`}
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={`text-2xl font-bold ${
              highlight ? 'text-gold' : 'text-foreground'
            }`}
          >
            {typeof value === 'number' ? value.toFixed(2) : value}
            {suffix}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Your Profile
            </h1>
            <p className="text-muted-foreground">@{user?.username}</p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Wallet}
            label="Wallet Balance"
            value={stats?.wallet_balance || 0}
            suffix=" π"
            highlight
          />
          <StatCard
            icon={Zap}
            label="Total Spins"
            value={stats?.total_spins || 0}
          />
          <StatCard
            icon={Coins}
            label="Total Winnings"
            value={stats?.total_winnings || 0}
            suffix=" π"
          />
          <StatCard
            icon={Trophy}
            label="Best Win"
            value={stats?.best_win || 0}
            suffix=" π"
          />
          <StatCard
            icon={TrendingUp}
            label="Win Rate"
            value={stats?.win_rate?.toFixed(1) || 0}
            suffix="%"
          />
        </div>

        <VIPStatus totalSpins={stats?.total_spins || 0} />

        {stats?.referral_code && (
          <ReferralPanel
            referralCode={stats.referral_code}
            referralCount={stats.referral_count}
            referralEarnings={stats.referral_earnings}
          />
        )}
      </div>

      {user?.username && (
        <NotificationSettings
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          piUsername={user.username}
        />
      )}
    </div>
  );
};

export default Profile;
