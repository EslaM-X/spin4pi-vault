import { useState, useEffect } from 'react';
import { Lock, Unlock, TrendingUp, Clock, Coins, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StakingTier {
  id: string;
  name: string;
  minAmount: number;
  duration: number; // days
  apy: number;
  boostMultiplier: number;
}

interface UserStake {
  id: string;
  amount: number;
  tier: string;
  startDate: Date;
  endDate: Date;
  rewards: number;
  status: 'active' | 'completed' | 'withdrawn';
}

interface StakingPanelProps {
  username: string | null;
  walletBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const STAKING_TIERS: StakingTier[] = [
  { id: 'bronze', name: 'Bronze', minAmount: 1, duration: 7, apy: 5, boostMultiplier: 1.1 },
  { id: 'silver', name: 'Silver', minAmount: 5, duration: 14, apy: 10, boostMultiplier: 1.25 },
  { id: 'gold', name: 'Gold', minAmount: 10, duration: 30, apy: 20, boostMultiplier: 1.5 },
  { id: 'platinum', name: 'Platinum', minAmount: 50, duration: 90, apy: 35, boostMultiplier: 2.0 },
];

const StakingPanel = ({ username, walletBalance, onBalanceUpdate }: StakingPanelProps) => {
  const [selectedTier, setSelectedTier] = useState<StakingTier>(STAKING_TIERS[0]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [isStaking, setIsStaking] = useState(false);
  const [totalStaked, setTotalStaked] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (username) {
      fetchUserStakes();
    }
  }, [username]);

  const fetchUserStakes = async () => {
    // Simulated stakes - would fetch from database in production
    // This demonstrates the staking UI functionality
    setUserStakes([]);
    setTotalStaked(0);
  };

  const calculateRewards = (amount: number, tier: StakingTier): number => {
    const dailyRate = tier.apy / 365 / 100;
    return amount * dailyRate * tier.duration;
  };

  const handleStake = async () => {
    if (!username) {
      toast({
        title: "Authentication Required",
        description: "Please connect with Pi Network to stake",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount < selectedTier.minAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum stake for ${selectedTier.name} is ${selectedTier.minAmount} Pi`,
        variant: "destructive",
      });
      return;
    }

    if (amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough Pi in your wallet",
        variant: "destructive",
      });
      return;
    }

    setIsStaking(true);

    try {
      // Deduct from wallet
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_balance: walletBalance - amount })
        .eq('pi_username', username);

      if (error) throw error;

      const newStake: UserStake = {
        id: Date.now().toString(),
        amount,
        tier: selectedTier.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + selectedTier.duration * 24 * 60 * 60 * 1000),
        rewards: calculateRewards(amount, selectedTier),
        status: 'active',
      };

      setUserStakes(prev => [...prev, newStake]);
      setTotalStaked(prev => prev + amount);
      onBalanceUpdate(walletBalance - amount);
      setStakeAmount('');

      toast({
        title: "Stake Successful! 🔒",
        description: `Staked ${amount} Pi in ${selectedTier.name} tier for ${selectedTier.duration} days`,
      });
    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: "Staking Failed",
        description: "Could not complete staking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (stake: UserStake) => {
    if (stake.status !== 'completed') {
      toast({
        title: "Cannot Unstake",
        description: "Stake period has not ended yet",
        variant: "destructive",
      });
      return;
    }

    const totalReturn = stake.amount + stake.rewards;
    onBalanceUpdate(walletBalance + totalReturn);
    setUserStakes(prev => prev.filter(s => s.id !== stake.id));
    setTotalStaked(prev => prev - stake.amount);

    toast({
      title: "Unstaked Successfully! 💰",
      description: `Received ${totalReturn.toFixed(4)} Pi (${stake.amount} + ${stake.rewards.toFixed(4)} rewards)`,
    });
  };

  const getDaysRemaining = (endDate: Date): number => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgressPercent = (stake: UserStake): number => {
    const total = stake.endDate.getTime() - stake.startDate.getTime();
    const elapsed = Date.now() - stake.startDate.getTime();
    return Math.min(100, (elapsed / total) * 100);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Pi Staking
          <Badge variant="outline" className="ml-auto">
            {totalStaked.toFixed(2)} Pi Staked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake Pi</TabsTrigger>
            <TabsTrigger value="active">Active Stakes ({userStakes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-4 mt-4">
            {/* Tier Selection */}
            <div className="grid grid-cols-2 gap-2">
              {STAKING_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedTier.id === tier.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-semibold text-sm">{tier.name}</div>
                  <div className="text-xs text-muted-foreground">{tier.duration} days</div>
                  <div className="text-primary text-sm font-bold">{tier.apy}% APY</div>
                </button>
              ))}
            </div>

            {/* Selected Tier Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minimum Stake</span>
                <span className="font-medium">{selectedTier.minAmount} Pi</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lock Period</span>
                <span className="font-medium">{selectedTier.duration} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">APY</span>
                <span className="font-medium text-green-500">{selectedTier.apy}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spin Boost</span>
                <span className="font-medium text-primary">{selectedTier.boostMultiplier}x</span>
              </div>
            </div>

            {/* Stake Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={`Min: ${selectedTier.minAmount} Pi`}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setStakeAmount(Math.max(selectedTier.minAmount, walletBalance).toString())}
                >
                  Max
                </Button>
              </div>
              
              {stakeAmount && parseFloat(stakeAmount) >= selectedTier.minAmount && (
                <div className="text-sm text-muted-foreground">
                  Estimated rewards: <span className="text-green-500 font-medium">
                    +{calculateRewards(parseFloat(stakeAmount), selectedTier).toFixed(4)} Pi
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) < selectedTier.minAmount}
              className="w-full bg-gradient-to-r from-primary to-accent"
            >
              {isStaking ? (
                <>Staking...</>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Stake {stakeAmount || '0'} Pi
                </>
              )}
            </Button>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>Staked Pi is locked until the stake period ends. Early withdrawal is not available.</p>
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            {userStakes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active stakes</p>
                <p className="text-sm">Stake Pi to earn rewards and boost your spins!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userStakes.map((stake) => (
                  <div
                    key={stake.id}
                    className="bg-muted/50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{stake.amount} Pi</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {stake.tier} Tier
                        </div>
                      </div>
                      <Badge variant={stake.status === 'active' ? 'default' : 'secondary'}>
                        {stake.status === 'active' ? (
                          <><Clock className="h-3 w-3 mr-1" /> {getDaysRemaining(stake.endDate)}d left</>
                        ) : (
                          'Ready'
                        )}
                      </Badge>
                    </div>
                    
                    <Progress value={getProgressPercent(stake)} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Rewards: </span>
                        <span className="text-green-500 font-medium">+{stake.rewards.toFixed(4)} Pi</span>
                      </div>
                      
                      {stake.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleUnstake(stake)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Claim
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StakingPanel;
