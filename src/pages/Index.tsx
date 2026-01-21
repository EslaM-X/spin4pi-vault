import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldAlert, Zap } from "lucide-react";

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
import StakingPanel from "@/components/StakingPanel"; // تم التأكد من تفعيله
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
    if (!isAuthLoading && !isGameLoading) {
      setTimeout(() => setIsLoading(false), 500);
    }
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
      toast.error("Imperial sync failed.");
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("pi_username");
    setWallet({ balance: 0, totalSpins: 0, referralCode: "", referralCount: 0, referralEarnings: 0 });
    toast.info("Session Terminated");
  };

  const handleSpinClick = async (spinType: string, cost: number) => {
    if (!isAuthenticated || !user) {
      handleLoginAttempt();
      return;
    }
    if (isSpinning) return;
    if (spinType === "free" && !canFreeSpin()) {
      toast.info(`Available in: ${freeSpinTimer}`);
      return;
    }
    await spin(spinType, cost);
    refreshData();
    await refreshProfile();
    // جلب الرصيد المحدث بعد اللفة
    await fetchWalletData(user.username);
  };

  if (isLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] overflow-x-hidden selection:bg-gold/20">
      <Header
        isLoggedIn={isAuthenticated}
        username={user?.username || null}
        balance={wallet.balance}
        onLogin={handleLoginAttempt}
        onLogout={handleLogout}
        isLoading={isAuthLoading}
      />

      <main className="container mx-auto px-4 pt-28 pb-20 relative">
        <section className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h1 className="text-7xl md:text-[120px] font-black italic text-white uppercase tracking-tighter leading-none mb-4">
               SPIN4<span className="text-gold">PI</span>
             </h1>
             <p className="text-[10px] font-bold tracking-[0.5em] text-white/30 uppercase mb-8">
               Imperial Utility Network
             </p>
          </motion.div>

          {user && (
            <div className="flex justify-center mt-4">
              <DailyRewardButton piUsername={user.username} onRewardClaimed={() => fetchWalletData(user.username)} />
            </div>
          )}
        </section>

        <JackpotCounter amount={jackpot} />

        {/* Game Layout */}
        <div className="flex flex-col lg:flex-row gap-10 my-12 justify-center items-start">
          {/* Wheel - Left Column */}
          <div className="flex flex-col items-center gap-8 w-full max-w-[550px] mx-auto lg:mx-0">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gold/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <SpinWheel 
                isSpinning={isSpinning} 
                setIsSpinning={() => {}} 
                targetResult={targetResult} 
                onSpinComplete={() => setTargetResult(null)} 
              />
            </div>
            {user && <ActiveBoostsIndicator piUsername={user.username} isSpinning={isSpinning} />}
          </div>

          {/* Side Panels - Right Column */}
          <div className="flex flex-col gap-6 w-full lg:w-[400px]">
            <VIPStatus totalSpins={wallet.totalSpins} compact />
            
            <TournamentPanel 
              profileId={profileId} 
              walletBalance={wallet.balance} 
              onRefresh={() => fetchWalletData(user?.username)} 
            />

            <Leaderboard entries={leaderboard} isLoading={isGameLoading} onRetry={refreshData} />
            
            {user && (
              <StakingPanel 
                username={user.username} 
                walletBalance={wallet.balance} 
                onBalanceUpdate={(newBal) => updateBalance(newBal, true)} 
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

        <div className="mt-8 mb-24 max-w-4xl mx-auto">
          <SpinButtons onSpin={handleSpinClick} disabled={isSpinning} canFreeSpin={canFreeSpin()} freeSpinTimer={freeSpinTimer} />
        </div>
        
        <Features />
      </main>

      <Footer />

      <AnimatePresence>
        {showResultModal && (
          <ResultModal 
            isOpen={showResultModal} 
            onClose={() => { setShowResultModal(false); setTargetResult(null); }} 
            result={targetResult} 
          />
        )}
      </AnimatePresence>
      
      <LegalConsentModal 
        isOpenExternal={showLegalModal} 
        onClose={() => setShowLegalModal(false)} 
        onSuccess={handleLoginAttempt} 
      />
      
      <BackendHealthCheck />

      {/* Admin Quick Terminal - Improved Position */}
      {isAuthenticated && (
        <button
          onClick={() => navigate('/admin')}
          className="fixed bottom-6 right-6 z-[60] bg-[#13131a] border border-gold/30 p-4 rounded-2xl shadow-2xl hover:bg-gold/10 transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
            <ShieldAlert size={20} />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[8px] font-black text-gold uppercase tracking-widest leading-none">Access</p>
            <p className="text-xs font-bold text-white uppercase">Terminal</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default Index;
