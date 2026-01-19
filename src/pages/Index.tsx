import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react"; // استيراد أيقونة الحماية

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
      toast.error("Login failed. Use Pi Browser.");
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
    <div className="min-h-screen bg-[#050507] overflow-x-hidden selection:bg-gold/30">
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-gold/10 via-transparent to-transparent pointer-events-none" />

      <Header
        isLoggedIn={isAuthenticated}
        username={user?.username || null}
        balance={wallet.balance}
        onLogin={handleLoginAttempt}
        onLogout={handleLogout}
        isLoading={isAuthLoading}
      />

      <main className="container mx-auto px-4 pt-28 pb-20 relative">
        <section className="relative text-center mb-16 px-2">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div className="absolute inset-0 bg-gold/10 blur-[130px] rounded-full -z-10 h-40 w-full max-w-3xl mx-auto" />
            <h1 className="relative inline-block mb-6">
              <span className="text-6xl md:text-[110px] font-[1000] tracking-tighter uppercase italic bg-gradient-to-b from-[#FFFFFF] via-[#FFD700] to-[#8A6623] bg-clip-text text-transparent leading-none block">
                SPIN4<span className="text-white">PI</span>
              </span>
              <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-gold to-transparent mt-2 opacity-50" />
            </h1>
            <div className="mt-4 flex flex-col items-center gap-6">
              <p className="text-base md:text-2xl font-black tracking-[0.2em] text-white/95 uppercase italic">
                <span className="text-gold">✦</span> DOMINATE THE <span className="text-gold">PI ECONOMY</span> <span className="text-gold">✦</span>
              </p>
              <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
                <p className="text-[9px] md:text-[11px] font-black text-gold/70 uppercase tracking-[0.4em] text-center">
                  THE AUTHORIZED PI NETWORK UTILITY & REWARD PROTOCOL
                </p>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] md:text-[9px] font-bold text-white/70 uppercase tracking-[0.15em]">Compliance Verified Utility Interface</span>
                </div>
              </div>
            </div>
          </motion.div>
          {user && (
            <div className="mt-10">
              <DailyRewardButton piUsername={user.username} onRewardClaimed={() => fetchWalletData(user.username)} />
            </div>
          )}
        </section>

        <JackpotCounter amount={jackpot} />

        <div className="flex flex-col lg:flex-row gap-12 my-12 justify-center items-center lg:items-start">
          <div className="flex flex-col items-center gap-8 w-full max-w-[500px]">
            <SpinWheel isSpinning={isSpinning} setIsSpinning={() => {}} targetResult={targetResult} onSpinComplete={() => setTargetResult(null)} />
            {user && <ActiveBoostsIndicator piUsername={user.username} isSpinning={isSpinning} />}
          </div>
          <div className="flex flex-col gap-6 w-full lg:w-96">
            <VIPStatus totalSpins={wallet.totalSpins} compact />
            <TournamentPanel profileId={profileId} walletBalance={wallet.balance} onRefresh={() => fetchWalletData(user?.username)} />
            <Leaderboard entries={leaderboard} isLoading={isGameLoading} onRetry={refreshData} />
            {user && <StakingPanel username={user.username} walletBalance={wallet.balance} onBalanceUpdate={updateBalance} />}
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

      {/* ADMIN FLOATING ACTION BUTTON - الحل النهائي */}
      {isAuthenticated && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/admin')}
          className="fixed bottom-24 right-6 z-[9999] w-14 h-14 bg-emerald-500 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] border-2 border-white/20 flex items-center justify-center text-black shadow-emerald-500/20"
        >
          <ShieldCheck size={30} strokeWidth={2.5} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-emerald-500">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </motion.button>
      )}
    </div>
  );
};

export default Index;
