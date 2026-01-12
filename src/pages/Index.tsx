import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";

// ======= Components =======
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
import GlobalLoading from "@/components/GlobalLoading";
import JackpotPopup from "@/components/JackpotPopup";

// ======= Hooks =======
import { useGameData } from "@/hooks/useGameData";
import { useSpin } from "@/hooks/useSpin";
import { usePiAuth } from "@/hooks/usePiAuth";
import { usePiPayment } from "@/hooks/usePiPayment";
import { useWallet } from "@/hooks/useWallet";
import { useSpinHandler } from "@/hooks/useSpinHandler";

// ======= Constants =======
const SPIN_COSTS: Record<string, number> = { free: 0, basic: 0.1, pro: 0.25, vault: 1 };

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ======= Auth & Pi =======
  const { user, isAuthenticated, isLoading: isAuthLoading, authenticate, logout, refreshProfile, canFreeSpin, getNextFreeSpinTime } = usePiAuth();
  const { createPayment } = usePiPayment();
  const { jackpot, leaderboard, isLoading: isGameLoading, refreshData } = useGameData();

  // ======= Wallet Hook =======
  const { wallet, profileId, fetchWalletData, applyReferral, updateBalance, setWallet } = useWallet();

  // ======= Spin Hook =======
  const spinFn = useSpin({ onSpinComplete: null });
  const { isSpinning, setIsSpinning, targetResult, handleSpinClick, setTargetResult } = useSpinHandler(
    spinFn.spin,
    updateBalance,
    refreshData,
    refreshProfile
  );

  // ======= UI States =======
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlur, setIsBlur] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [freeSpinTimer, setFreeSpinTimer] = useState("Available");
  const [showJackpotPopup, setShowJackpotPopup] = useState(false);
  const [showAdReward, setShowAdReward] = useState(false);
  const [adRewardType, setAdRewardType] = useState<'free_spin' | 'bonus_pi' | 'boost'>('free_spin');
  const [lastReward, setLastReward] = useState(0);
  const toggleMenu = () => { setIsMenuOpen(prev => !prev); setIsBlur(prev => !prev); };

  // ======= Protect route =======
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) navigate('/');
  }, [isAuthenticated, isAuthLoading]);

  // ======= Pi Price Live =======
  const [piPrice, setPiPrice] = useState(0);
  const [piPriceTrend, setPiPriceTrend] = useState<'up'|'down'|'neutral'>('neutral');
  useEffect(() => {
    let lastPrice = 0;
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://www.okx.com/price/pi-network-pi");
        const json = await res.json();
        const price = parseFloat(json.data?.last) || 0;
        setPiPrice(price);
        setPiPriceTrend(price > lastPrice ? 'up' : price < lastPrice ? 'down' : 'neutral');
        lastPrice = price;
      } catch (err) { console.error(err); }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 15000);
    return () => clearInterval(interval);
  }, []);

  // ======= Free Spin Timer =======
  useEffect(() => {
    const interval = setInterval(() => {
      if (getNextFreeSpinTime) setFreeSpinTimer(getNextFreeSpinTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [getNextFreeSpinTime]);

  // ======= Global Loading =======
  useEffect(() => {
    if (!isAuthLoading && !isGameLoading && profileId) setIsLoading(false);
  }, [isAuthLoading, isGameLoading, profileId]);

  if (isLoading) return <GlobalLoading />;

  // ======= Handlers =======
  const handleLogin = async () => {
    const result = await authenticate();
    if (result) {
      localStorage.setItem('pi_username', result.username);
      await applyReferral(result.username, searchParams.get('ref'));
      await fetchWalletData(result.username);
      toast.success(`Welcome, ${result.username}`);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('pi_username');
    setWallet({ balance:0, totalSpins:0, referralCode:'', referralCount:0, referralEarnings:0 });
    toast.info("Logged out");
  };

  return (
    <div className={`min-h-screen bg-background overflow-hidden ${isBlur ? 'filter blur-sm' : ''}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <Header 
        isLoggedIn={isAuthenticated} 
        username={user?.username || null} 
        balance={wallet.balance} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        piPrice={piPrice}
        piPriceTrend={piPriceTrend}
      />

      {/* Menu */}
      {isMenuOpen && <motion.div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMenu} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
      {isMenuOpen && (
        <motion.nav className="fixed top-0 right-0 w-64 h-full bg-background z-50 shadow-xl p-6 flex flex-col gap-6" initial={{ x: 300 }} animate={{ x: 0 }}>
          <button onClick={toggleMenu} className="self-end text-2xl font-bold">&times;</button>
          <a href="/profile" className="hover:text-gold">Profile</a>
          <a href="/marketplace" className="hover:text-gold">Marketplace</a>
          <a href="/vip" className="hover:text-gold">VIP</a>
          <a href="/withdrawals" className="hover:text-gold">Withdrawals</a>
          <a href="/achievements" className="hover:text-gold">Achievements</a>
          <a href="/legal" className="hover:text-gold">Legal</a>
          <a href="/admin" className="hover:text-gold">Admin</a>
        </motion.nav>
      )}

      <main className="container mx-auto px-4 pt-24 pb-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-4">
            <span className="text-gradient-gold">Spin</span>
            <span className="text-foreground">4</span>
            <span className="text-gradient-purple">Pi</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Spin & win Pi rewards instantly!
          </p>

          {isAuthenticated && user && (
            <DailyRewardButton 
              piUsername={user.username}
              onRewardClaimed={() => fetchWalletData(user.username)}
            />
          )}
        </section>

        <JackpotCounter amount={jackpot} />

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 mb-16">
          <div className="flex flex-col items-center gap-4">
            <SpinWheel isSpinning={isSpinning} setIsSpinning={setIsSpinning} targetResult={targetResult} onSpinComplete={() => setTargetResult(null)} />
            <ActiveBoostsIndicator piUsername={user.username} isSpinning={isSpinning} />
          </div>

          <div className="flex flex-col gap-6 w-full lg:w-80">
            <VIPStatus totalSpins={wallet.totalSpins} compact />
            <TournamentPanel profileId={profileId} walletBalance={wallet.balance} onRefresh={() => fetchWalletData(user.username)} />
            <Leaderboard entries={leaderboard} isLoading={isGameLoading} />
            <StakingPanel username={user.username} walletBalance={wallet.balance} onBalanceUpdate={updateBalance} />
            {wallet.referralCode && <ReferralPanel referralCode={wallet.referralCode} referralCount={wallet.referralCount} referralEarnings={wallet.referralEarnings} />}
          </div>
        </div>

        <SpinButtons 
          onSpin={(type, cost) => handleSpinClick(type, cost, user, canFreeSpin, createPayment)}
          disabled={isSpinning}
          canFreeSpin={canFreeSpin()}
          freeSpinTimer={freeSpinTimer}
        />

        <Features />
      </main>

      <Footer />
      <ResultModal isOpen={!!targetResult} onClose={() => setTargetResult(null)} />
      <PiAdsReward 
        isOpen={showAdReward} 
        onClose={() => setShowAdReward(false)} 
        onAdComplete={() => handleSpinClick('free', 0, user, canFreeSpin, createPayment)} 
        rewardType={adRewardType}
      />
      <JackpotPopup isOpen={showJackpotPopup} onClose={() => setShowJackpotPopup(false)} reward={lastReward} />
    </div>
  );
};

export default Index;
