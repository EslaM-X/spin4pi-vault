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
import { BackendHealthCheck } from "@/components/BackendHealthCheck";

// ======= Hooks =======
import { useGameData } from "@/hooks/useGameData";
import { useSpin } from "@/hooks/useSpin";
import { usePiAuth } from "@/hooks/usePiAuth";
import { usePiPayment } from "@/hooks/usePiPayment";
import { useWallet } from "@/hooks/useWallet";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ======= Auth & Pi =======
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    authenticate,
    logout,
    refreshProfile,
    canFreeSpin,
    getNextFreeSpinTime,
  } = usePiAuth();

  const { jackpot, leaderboard, isLoading: isGameLoading, error: gameError, refreshData } = useGameData();

  // ======= Wallet =======
  const {
    wallet,
    profileId,
    fetchWalletData,
    applyReferral,
    updateBalance,
    setWallet,
  } = useWallet();

  // ======= Spin =======
  const {
    spin,
    isSpinning,
    setIsSpinning,
    targetResult,
    setTargetResult,
  } = useSpin({ onSpinComplete: null });

  // ======= UI States =======
  const [isLoading, setIsLoading] = useState(true);
  const [freeSpinTimer, setFreeSpinTimer] = useState("Available");
  const [showResultModal, setShowResultModal] = useState(false);

  // ======= Free Spin Timer =======
  useEffect(() => {
    const interval = setInterval(() => {
      if (getNextFreeSpinTime) {
        setFreeSpinTimer(getNextFreeSpinTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getNextFreeSpinTime]);

  // ======= Global Loading =====
  useEffect(() => {
    if (!isAuthLoading && !isGameLoading) {
      setIsLoading(false);
    }
  }, [isAuthLoading, isGameLoading]);

  // ======= Show result modal when spin completes =====
  useEffect(() => {
    if (targetResult) {
      setShowResultModal(true);
    }
  }, [targetResult]);

  if (isLoading) return <GlobalLoading isVisible={true} />;

  const handleLogin = async () => {
    try {
      const result = await authenticate();
      if (result && result.username) {
        localStorage.setItem("pi_username", result.username);
        await Promise.all([
          applyReferral(result.username, searchParams.get("ref")),
          fetchWalletData(result.username),
          refreshData()
        ]);
        toast.success(`Welcome, ${result.username}!`);
      }
    } catch (error) {
      toast.error("Login failed. Make sure you are in Pi Browser.");
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("pi_username");
    setWallet({
      balance: 0,
      totalSpins: 0,
      referralCode: "",
      referralCount: 0,
      referralEarnings: 0,
    });
    toast.info("Logged out");
  };

  const handleSpinClick = async (spinType: string, cost: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login with Pi first");
      return;
    }
    if (isSpinning) return;
    if (spinType === "free" && !canFreeSpin()) {
      toast.info("Free spin not available yet");
      return;
    }
    await spin(spinType, cost);
    refreshData();
    await refreshProfile();
  };

  return (
    <div className="min-h-screen bg-[#050507] overflow-hidden selection:bg-gold/30">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

      <Header
        isLoggedIn={isAuthenticated}
        username={user?.username || null}
        balance={wallet.balance}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoading={isAuthLoading}
      />

      <main className="container mx-auto px-4 pt-28 pb-20 relative">
        
        {/* ======= RE-DESIGNED HERO SECTION (IMPERIAL STYLE) ======= */}
        <section className="relative text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Glow effect behind text */}
            <div className="absolute inset-0 bg-gold/10 blur-[120px] rounded-full -z-10 h-32 w-full max-w-2xl mx-auto" />

            <h1 className="relative inline-block mb-6">
              <span className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase 
                bg-gradient-to-b from-[#FFFFFF] via-[#FFD700] to-[#B8860B] bg-clip-text text-transparent
                drop-shadow-[0_15px_30px_rgba(184,134,11,0.4)] leading-none">
                Spin4<span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">Pi</span>
              </span>
              
              {/* Decorative line under main title */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "80%" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[3px] 
                bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" 
              />
            </h1>

            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-lg md:text-xl font-bold tracking-[0.25em] text-white/90 uppercase italic">
                <span className="text-gold">✦</span> Spin & win <span className="text-gold">Pi rewards</span> instantly <span className="text-gold">✦</span>
              </p>
              <div className="h-[1px] w-24 bg-gold/20" />
              <p className="text-[10px] font-medium text-white/40 tracking-[0.5em] uppercase">
                Imperial Entertainment System
              </p>
            </div>
          </motion.div>

          {/* Daily Tribute Button with matching style */}
          {user && (
            <div className="mt-10">
              <DailyRewardButton
                piUsername={user.username}
                onRewardClaimed={() => fetchWalletData(user.username)}
              />
            </div>
          )}
        </section>

        {/* Jackpot Counter with more impact */}
        <div className="mb-16">
          <JackpotCounter amount={jackpot} />
        </div>

        <div className="flex flex-col lg:flex-row gap-12 my-16 justify-center items-start">
          <div className="flex flex-col items-center gap-6 sticky top-24">
            <SpinWheel
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              targetResult={targetResult}
              onSpinComplete={() => setTargetResult(null)}
            />
            {user && (
              <ActiveBoostsIndicator piUsername={user.username} isSpinning={isSpinning} />
            )}
          </div>

          <div className="flex flex-col gap-6 w-full lg:w-96">
            <VIPStatus totalSpins={wallet.totalSpins} compact />
            <TournamentPanel
              profileId={profileId}
              walletBalance={wallet.balance}
              onRefresh={() => fetchWalletData(user?.username)}
            />
            <Leaderboard 
              entries={leaderboard} 
              isLoading={isGameLoading} 
              error={gameError}
              onRetry={refreshData}
            />
            {user && (
              <StakingPanel
                username={user.username}
                walletBalance={wallet.balance}
                onBalanceUpdate={updateBalance}
              />
            )}
            {wallet.referralCode && (
              <ReferralPanel
                referralCode={wallet.referralCode}
                referralCount={wallet.referralCount}
                referralEarnings={wallet.referralEarnings}
              />
            )}
          </div>
        </div>

        <div className="mt-12 mb-24">
          <SpinButtons
            onSpin={handleSpinClick}
            disabled={isSpinning}
            canFreeSpin={canFreeSpin()}
            freeSpinTimer={freeSpinTimer}
          />
        </div>

        <Features />
      </main>

      <Footer />

      <ResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setTargetResult(null);
        }}
        result={targetResult}
      />

      <BackendHealthCheck />
    </div>
  );
};

export default Index;
