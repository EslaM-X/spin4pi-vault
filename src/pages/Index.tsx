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

  const {
    wallet,
    profileId,
    fetchWalletData,
    applyReferral,
    updateBalance,
    setWallet,
  } = useWallet();

  const {
    spin,
    isSpinning,
    setIsSpinning,
    targetResult,
    setTargetResult,
  } = useSpin({ onSpinComplete: null });

  const [isLoading, setIsLoading] = useState(true);
  const [freeSpinTimer, setFreeSpinTimer] = useState("Available");
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (getNextFreeSpinTime) {
        setFreeSpinTimer(getNextFreeSpinTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getNextFreeSpinTime]);

  useEffect(() => {
    if (!isAuthLoading && !isGameLoading) {
      setIsLoading(false);
    }
  }, [isAuthLoading, isGameLoading]);

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
    <div className="min-h-screen bg-[#050507] overflow-x-hidden selection:bg-gold/30">
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-gold/10 via-transparent to-transparent pointer-events-none" />

      <Header
        isLoggedIn={isAuthenticated}
        username={user?.username || null}
        balance={wallet.balance}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoading={isAuthLoading}
      />

      <main className="container mx-auto px-4 pt-28 pb-20 relative">
        
        {/* ======= AUTHORIZED HERO SECTION - FIXED TEXT OVERFLOW ======= */}
        <section className="relative text-center mb-16 px-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-gold/10 blur-[130px] rounded-full -z-10 h-40 w-full max-w-3xl mx-auto" />

            <h1 className="relative inline-block mb-6">
              <span className="text-6xl md:text-[110px] font-[1000] tracking-tighter uppercase italic 
                bg-gradient-to-b from-[#FFFFFF] via-[#FFD700] via-[#D4AF37] to-[#8A6623] bg-clip-text text-transparent
                drop-shadow-[0_15px_40px_rgba(138,102,35,0.5)] leading-none block">
                SPIN4<span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">PI</span>
              </span>
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-gold to-transparent mt-2 opacity-50" />
            </h1>

            <div className="mt-4 flex flex-col items-center gap-6">
              <p className="text-base md:text-2xl font-black tracking-[0.2em] text-white/95 uppercase italic">
                <span className="text-gold">✦</span> DOMINATE THE <span className="text-gold">PI ECONOMY</span> <span className="text-gold">✦</span>
              </p>
              
              <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
                <div className="flex items-center gap-2 w-full">
                  <div className="hidden md:block h-[1px] flex-1 bg-gold/30" />
                  {/* تم إزالة whitespace-nowrap وتعديل حجم الخط ليناسب الجوال */}
                  <p className="text-[9px] md:text-[11px] font-black text-gold/70 uppercase tracking-[0.4em] leading-relaxed text-center">
                    THE AUTHORIZED PI NETWORK UTILITY & REWARD PROTOCOL
                  </p>
                  <div className="hidden md:block h-[1px] flex-1 bg-gold/30" />
                </div>
                
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[8px] md:text-[9px] font-bold text-white/70 uppercase tracking-[0.15em]">Compliance Verified Utility Interface</span>
                </div>
              </div>
            </div>
          </motion.div>

          {user && (
            <div className="mt-10">
              <DailyRewardButton
                piUsername={user.username}
                onRewardClaimed={() => fetchWalletData(user.username)}
              />
            </div>
          )}
        </section>

        <div className="mb-16">
          <JackpotCounter amount={jackpot} />
        </div>

        {/* ======= FIXED SPIN WHEEL SPACING ======= */}
        <div className="flex flex-col lg:flex-row gap-12 my-12 justify-center items-center lg:items-start">
          <div className="flex flex-col items-center gap-8 w-full max-w-[500px]">
            <div className="relative p-2 md:p-4"> {/* إضافة Padding لضمان عدم قص العجلة */}
              <SpinWheel
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
                targetResult={targetResult}
                onSpinComplete={() => setTargetResult(null)}
              />
            </div>
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

        <div className="mt-8 mb-24">
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
