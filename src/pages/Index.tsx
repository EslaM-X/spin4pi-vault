import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { SpinWheel } from "@/components/SpinWheel";
import { JackpotCounter } from "@/components/JackpotCounter";
import { SpinButtons } from "@/components/SpinButtons";
import { ResultModal } from "@/components/ResultModal";
import { Leaderboard } from "@/components/Leaderboard";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { ReferralPanel } from "@/components/ReferralPanel";
import { DailyRewardButton } from "@/components/DailyRewardButton";
import { ActiveBoostsIndicator } from "@/components/ActiveBoostsIndicator";
import { TournamentPanel } from "@/components/TournamentPanel";
import { VIPStatus } from "@/components/VIPStatus";
import StakingPanel from "@/components/StakingPanel";
import PiAdsReward from "@/components/PiAdsReward";
import { useGameData } from "@/hooks/useGameData";
import { useSpin } from "@/hooks/useSpin";
import { usePiAuth } from "@/hooks/usePiAuth";
import { usePiPayment } from "@/hooks/usePiPayment";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { supabase } from "@/integrations/supabase/client";

const SPIN_COSTS: Record<string, number> = {
  free: 0,
  basic: 0.1,
  pro: 0.25,
  vault: 1,
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const [balance, setBalance] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastReward, setLastReward] = useState<number>(0);
  const [pendingSpinType, setPendingSpinType] = useState<string | null>(null);
  const [freeSpinTimer, setFreeSpinTimer] = useState("Available!");
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [profileId, setProfileId] = useState<string>("");
  const [showAdReward, setShowAdReward] = useState(false);
  const [adRewardType, setAdRewardType] = useState<'free_spin' | 'bonus_pi' | 'boost'>('free_spin');
  const [targetResult, setTargetResult] = useState<string | null>(null);
  const [piPrice, setPiPrice] = useState<number>(0);
  const [piPriceTrend, setPiPriceTrend] = useState<'up'|'down'|'neutral'>('neutral');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlur, setIsBlur] = useState(false);

  const {
    user, 
    profile, 
    isLoading: isAuthLoading, 
    authenticate, 
    logout,
    refreshProfile,
    canFreeSpin,
    getNextFreeSpinTime,
    isAuthenticated,
  } = usePiAuth();

  const { createPayment, isPaying } = usePiPayment();

  const { jackpot, leaderboard, isLoading, refreshData } = useGameData();

  const applyReferral = useCallback(async (piUsername: string) => {
    const refCode = searchParams.get('ref');
    if (!refCode) return;
    
    try {
      const { data } = await supabase.functions.invoke('apply-referral', {
        body: { pi_username: piUsername, referral_code: refCode }
      });
      if (data) {
        setReferralCode(data.referral_code || '');
        if (data.referral_applied) {
          toast.success('Referral bonus applied! +0.25 π added to your wallet');
        }
      }
    } catch (error) {
      console.error('Referral error:', error);
    }
  }, [searchParams]);

  const fetchWalletData = useCallback(async (piUsername: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, wallet_balance, referral_code, referral_count, referral_earnings, total_spins')
      .eq('pi_username', piUsername)
      .maybeSingle();
    
    if (profileData) {
      setProfileId(profileData.id);
      setBalance(Number(profileData.wallet_balance) || 0);
      setReferralCode(profileData.referral_code || '');
      setReferralCount(profileData.referral_count || 0);
      setReferralEarnings(Number(profileData.referral_earnings) || 0);
      setTotalSpins(profileData.total_spins || 0);
    }
  }, []);

  const handleSpinResult = useCallback((result: string, rewardAmount: number) => {
    setLastResult(result);
    setLastReward(rewardAmount);
    setShowResult(true);
    if (rewardAmount > 0) setBalance(prev => prev + rewardAmount);
    refreshData();
    refreshProfile();
    if (user) fetchWalletData(user.username);
  }, [refreshData, refreshProfile, user, fetchWalletData]);

  const { spin, isSpinning, setIsSpinning, completeAnimation } = useSpin({
    onSpinComplete: handleSpinResult,
  });

  const handleLogin = async () => {
    const result = await authenticate();
    if (result) {
      localStorage.setItem('pi_username', result.username);
      await applyReferral(result.username);
      await fetchWalletData(result.username);
      toast.success(`Welcome, ${result.username}!`);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('pi_username');
    setBalance(0);
    setReferralCode('');
    setReferralCount(0);
    setReferralEarnings(0);
    setTotalSpins(0);
    setProfileId('');
    toast.info('Disconnected from Pi Network');
  };

  const handleSpinClick = async (type: string, cost: number) => {
    if (!isAuthenticated || !user) return toast.error("Please login with Pi first!");
    if (isSpinning) return toast.error("Spin in progress!");
    if (type === "free" && !canFreeSpin()) return toast.error("Daily free spin not ready!");
    if (type !== "free" && balance < cost) return toast.error("Insufficient Pi balance!");

    if (type !== "free") {
      const paymentResult = await createPayment(cost, `Spin4Pi ${type} spin`, user.username, { spin_type: type });
      if (!paymentResult.success) return;
      setBalance(prev => prev - cost);
    }

    setPendingSpinType(type);
    setIsSpinning(true);

    const result = await spin(user.username, type);
    if (result) setTargetResult(result.result);
    else {
      setIsSpinning(false);
      setPendingSpinType(null);
    }
  };

  // Pi Price fetch every 5s
  useEffect(() => {
    let lastPrice = 0;
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://www.okx.com/price/pi-network-pi");
        const json = await res.json();
        const price = parseFloat(json.data?.last) || 0;
        setPiPrice(price);
        if (price > lastPrice) setPiPriceTrend('up');
        else if (price < lastPrice) setPiPriceTrend('down');
        else setPiPriceTrend('neutral');
        lastPrice = price;
      } catch (err) { console.error(err); }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hamburger menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    setIsBlur(!isBlur);
  };

  return (
    <div className={`min-h-screen bg-background overflow-hidden ${isBlur ? 'filter blur-sm' : ''}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />

      <Header 
        isLoggedIn={isAuthenticated} 
        username={user?.username || null} 
        balance={balance} 
        onLogin={handleLogin}
        onLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        piPrice={piPrice}
        piPriceTrend={piPriceTrend}
      />

      {/* Dropdown Hamburger */}
      {isMenuOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        />
      )}
      {isMenuOpen && (
        <motion.nav 
          className="fixed top-0 right-0 w-64 h-full bg-background z-50 shadow-xl p-6 flex flex-col gap-6"
          initial={{ x: 300 }} animate={{ x: 0 }}
        >
          <button onClick={toggleMenu} className="self-end text-2xl font-bold">&times;</button>
          <a href="/profile" className="hover:text-gold">Profile</a>
          <a href="/marketplace" className="hover:text-gold">Marketplace</a>
          <a href="/vip" className="hover:text-gold">VIP Benefits</a>
          <a href="/withdrawals" className="hover:text-gold">Withdrawals</a>
          <a href="/achievements" className="hover:text-gold">Achievements</a>
          <a href="/legal" className="hover:text-gold">Legal</a>
          <a href="/admin" className="hover:text-gold">Admin</a>
        </motion.nav>
      )}

      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.section className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-4">
            <span className="text-gradient-gold">Spin</span>
            <span className="text-foreground">4</span>
            <span className="text-gradient-purple">Pi</span>
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Spin Smart. Unlock Pi Value.
          </motion.p>
          {isAuthenticated && user && (
            <DailyRewardButton 
              piUsername={user.username}
              onRewardClaimed={() => fetchWalletData(user.username)}
            />
          )}
        </motion.section>

        <JackpotCounter amount={jackpot} />

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 mb-16">
          <div className="flex flex-col items-center gap-4">
            <SpinWheel 
              onSpinComplete={() => setTargetResult(null)}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              targetResult={targetResult}
            />
            {isAuthenticated && <ActiveBoostsIndicator piUsername={user?.username || null} isSpinning={isSpinning} />}
          </div>

          <div className="flex flex-col gap-6 w-full lg:w-80">
            {isAuthenticated && <VIPStatus totalSpins={totalSpins} compact />}
            {isAuthenticated && profileId && <TournamentPanel profileId={profileId} walletBalance={balance} onRefresh={() => user && fetchWalletData(user.username)} />}
            <Leaderboard entries={leaderboard} isLoading={isLoading} />
            {isAuthenticated && user && <StakingPanel username={user.username} walletBalance={balance} onBalanceUpdate={setBalance} />}
            {isAuthenticated && referralCode && <ReferralPanel referralCode={referralCode} referralCount={referralCount} referralEarnings={referralEarnings} />}
          </div>
        </div>

        <SpinButtons onSpin={handleSpinClick} disabled={isSpinning || isPaying} canFreeSpin={canFreeSpin()} freeSpinTimer={freeSpinTimer} />
        <Features />
      </main>

      <Footer />
      <ResultModal isOpen={showResult} onClose={() => setShowResult(false)} result={lastResult} />
      <PiAdsReward 
        isOpen={showAdReward} 
        onClose={() => setShowAdReward(false)} 
        onAdComplete={() => handleSpinClick('free', 0)} 
        rewardType={adRewardType}
      />
    </div>
  );
};

export default Index;
