import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react"; // أيقونة صغيرة وبسيطة

// Components
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
import { LegalConsentModal } from "@/components/LegalConsentModal";

// Hooks
import { useGameData } from "@/hooks/useGameData";
import { useSpin } from "@/hooks/useSpin";
import { usePiAuth } from "@/hooks/usePiAuth";
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

  const { jackpot, leaderboard, isLoading: isGameLoading, refreshData } = useGameData();
  const { wallet, profileId, fetchWalletData, applyReferral, updateBalance, setWallet } = useWallet();
  const { spin, isSpinning, targetResult, setTargetResult } = useSpin({ onSpinComplete: null });

  const [isLoading, setIsLoading] = useState(true);
  const [freeSpinTimer, setFreeSpinTimer] = useState("Available");
  const [showResultModal, setShowResultModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (getNextFreeSpinTime) setFreeSpinTimer(getNextFreeSpinTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [getNextFreeSpinTime]);

  useEffect(() => {
    if (!isAuthLoading && !isGameLoading) setIsLoading(false);
  }, [isAuthLoading, isGameLoading]);

  useEffect(() => {
    if (targetResult) setShowResultModal(true);
  }, [targetResult]);

  const handleLoginAttempt = async () => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!hasConsented) {
      setShowLegalModal(true);
      return;
    }
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
      toast.error("Login failed.");
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("pi_username");
    setWallet({ balance: 0, totalSpins: 0, referralCode: "", referralCount: 0, referralEarnings: 0 });
    toast.info("Logged out");
  };

  const handleSpinClick = async (spinType: string, cost: number) => {
    if (!isAuthenticated || !user) {
      handleLoginAttempt();
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

  if (isLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] overflow-x-hidden">
      <Header
        isLoggedIn={isAuthenticated}
        username={user?.username || null}
        balance={wallet.balance}
        onLogin={handleLoginAttempt}
        onLogout={handleLogout}
        isLoading={isAuthLoading}
      />

      <main className="container mx-auto px-4 pt-28 pb-20 relative">
        <section className="text-center mb-16">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-6xl md:text-[110px] font-black italic text-white uppercase tracking-tighter">
            SPIN4<span className="text-gold">PI</span>
          </motion.h1>
          {user && <DailyRewardButton piUsername={user.username} onRewardClaimed={() => fetchWalletData(user.username)} />}
        </section>

        <JackpotCounter amount={jackpot} />

        <div className="flex flex-col lg:flex-row gap-12 my-12 justify-center items-center lg:items-start">
          <div className="flex flex-col items-center gap-8 w-full max-w-[500px]">
            <SpinWheel isSpinning={isSpinning} setIsSpinning={() => {}} targetResult={targetResult} onSpinComplete={() => setTargetResult(null)} />
          </div>
          <div className="flex flex-col gap-6 w-full lg:w-96">
            <VIPStatus totalSpins={wallet.totalSpins} compact />
            <Leaderboard entries={leaderboard} isLoading={isGameLoading} onRetry={refreshData} />
            {wallet.referralCode && <ReferralPanel referralCode={wallet.referralCode} referralCount={wallet.referralCount} referralEarnings={wallet.referralEarnings} />}
          </div>
        </div>

        <div className="mt-8 mb-24">
          <SpinButtons onSpin={handleSpinClick} disabled={isSpinning} canFreeSpin={canFreeSpin()} freeSpinTimer={freeSpinTimer} />
        </div>
        <Features />
      </main>

      <Footer />
      <ResultModal isOpen={showResultModal} onClose={() => { setShowResultModal(false); setTargetResult(null); }} result={targetResult} />
      
      <LegalConsentModal 
        isOpenExternal={showLegalModal} 
        onClose={() => setShowLegalModal(false)} 
        onSuccess={handleLoginAttempt} 
      />
      <BackendHealthCheck />

      {/* زر الأدمن الصغير جداً - بعيد تماماً عن القائمة */}
      {isAuthenticated && (
        <button
          onClick={() => navigate('/admin')}
          className="fixed top-4 right-20 z-[60] w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gold/50 hover:text-gold transition-colors"
        >
          <ShieldAlert size={18} />
        </button>
      )}
    </div>
  );
};

export default Index;
