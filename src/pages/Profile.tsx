import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Zap, Coins, Clock, TrendingUp, Wallet, ArrowUpRight, Bell, Award } from 'lucide-react';
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
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('pi_username');
    if (!storedUsername) {
      navigate('/');
      return;
    }
    setUsername(storedUsername);
    fetchProfileData(storedUsername);
  }, [navigate]);

  const fetchProfileData = async (piUsername: string) => {
    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('pi_username', piUsername)
        .maybeSingle();

      if (!profile) {
        setIsLoading(false);
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
      const bestWin = spinHistory.length > 0 
        ? Math.max(...spinHistory.map(s => s.reward_amount || 0)) 
        : 0;

      setStats({
        profile_id: profile.id,
        total_spins: profile.total_spins || 0,
        total_winnings: profile.total_winnings || 0,
        best_win: bestWin,
        win_rate: spinHistory.length > 0 
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
      setIsLoading(false);
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
    if (result.toLowerCase().includes('win') || result.includes('π')) return 'text-green-400';
    if (result.toLowerCase().includes('nft')) return 'text-pi-purple';
    return 'text-muted-foreground';
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    suffix = '',
    highlight = false
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: number | string; 
    suffix?: string;
    highlight?: boolean;
  }) => (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${highlight ? 'border-gold/50' : ''}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-full ${highlight ? 'bg-gold/20' : 'bg-primary/20'}`}>
          <Icon className={`w-6 h-6 ${highlight ? 'text-gold' : 'text-primary'}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${highlight ? 'text-gold' : 'text-foreground'}`}>
            {typeof value === 'number' ? value.toFixed(2) : value}{suffix}
          </p>
        </div>
      </CardContent>
    </Card>
  );

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
            <p className="text-muted-foreground">@{username}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/withdrawals" className="gap-2">
                <ArrowUpRight className="w-4 h-4" />
                <span className="hidden sm:inline">Withdrawals</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-card/50">
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
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
            </>
          )}
        </motion.div>

        {/* VIP Status & Achievements Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <VIPStatus totalSpins={stats?.total_spins || 0} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.profile_id && (
                  <AchievementBadges profileId={stats.profile_id} compact />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Spin History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Spin History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : stats?.recent_spins?.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Reward</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recent_spins.map((spin) => (
                        <TableRow key={spin.id}>
                          <TableCell className="text-muted-foreground">
                            {formatDate(spin.created_at)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {spin.spin_type}
                          </TableCell>
                          <TableCell className={getResultColor(spin.result)}>
                            {spin.result}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {spin.cost > 0 ? `-${spin.cost} π` : 'Free'}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={spin.reward_amount > 0 ? 'text-green-400' : 'text-muted-foreground'}>
                              {spin.reward_amount > 0 ? `+${spin.reward_amount} π` : '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No spins yet. Start spinning to see your history!</p>
                    <Button asChild className="mt-4">
                      <Link to="/">Go Spin!</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {stats?.referral_code && (
              <ReferralPanel 
                referralCode={stats.referral_code}
                referralCount={stats.referral_count}
                referralEarnings={stats.referral_earnings}
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Notification Settings Modal */}
      {username && (
        <NotificationSettings
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          piUsername={username}
        />
      )}
    </div>
  );
};

export default Profile;
