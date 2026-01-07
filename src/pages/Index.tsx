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
  const [pendingSpinType, setPendingSpinType] = useState<string | null>(null);
  const [freeSpinTimer, setFreeSpinTimer] = useState("Available!");
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);

  // Pi Network authentication
  const { 
    user, 
    profile, 
    isLoading: isAuthLoading, 
    authenticate, 
    refreshProfile,
    canFreeSpin,
    getNextFreeSpinTime,
    isAuthenticated,
  } = usePiAuth();

  // Pi Network payments
  const { createPayment, isPaying } = usePiPayment();

  // Fetch game data from backend
  const { jackpot, leaderboard, isLoading, refreshData } = useGameData();

  // Apply referral code on login
  const applyReferral = useCallback(async (piUsername: string) => {
    const refCode = searchParams.get('ref');
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

  // Fetch wallet balance and referral data from profile
  const fetchWalletData = useCallback(async (piUsername: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('wallet_balance, referral_code, referral_count, referral_earnings')
      .eq('pi_username', piUsername)
      .maybeSingle();
    
    if (profileData) {
      setBalance(Number(profileData.wallet_balance) || 0);
      setReferralCode(profileData.referral_code || '');
      setReferralCount(profileData.referral_count || 0);
      setReferralEarnings(Number(profileData.referral_earnings) || 0);
    }
  }, []);

  // Handle spin result from backend
  const handleSpinResult = useCallback((result: string, rewardAmount: number) => {
    setLastResult(result);
    setShowResult(true);
    
    // Update local balance with winnings
    if (rewardAmount > 0) {
      setBalance(prev => prev + rewardAmount);
    }
    
    // Refresh profile and leaderboard data
    refreshData();
    refreshProfile();
    if (user) fetchWalletData(user.username);
  }, [refreshData, refreshProfile, user, fetchWalletData]);

  const { spin, isSpinning, setIsSpinning, completeAnimation } = useSpin({
    onSpinComplete: handleSpinResult,
  });

  // Handle Pi login
  const handleLogin = async () => {
    const result = await authenticate();
    if (result) {
      localStorage.setItem('pi_username', result.username);
      await applyReferral(result.username);
      await fetchWalletData(result.username);
    }
  };

  // Handle deposit success
  const handleDepositSuccess = useCallback(() => {
    if (user) {
      fetchWalletData(user.username);
    }
  }, [user, fetchWalletData]);

  // Handle spin button click - initiates spin with backend
  const handleSpin = async (type: string, cost: number) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login with Pi first!");
      return;
    }
    
    if (type === "free") {
      if (!canFreeSpin()) {
        toast.error("Daily free spin not available yet!");
        return;
      }
    } else {
      if (balance < cost) {
        toast.error("Insufficient Pi balance! Deposit more Pi to continue.");
        return;
      }
      
      // Create Pi payment for paid spins
      const paymentResult = await createPayment(
        cost,
        `Spin4Pi ${type} spin`,
        user.username,
        { spin_type: type }
      );
      
      if (!paymentResult.success) {
        if (paymentResult.error !== 'cancelled') {
          toast.error("Payment failed. Please try again.");
        }
        return;
      }
      
      // Deduct cost after successful payment
      setBalance(prev => prev - cost);
    }

    setPendingSpinType(type);
    toast.info(type === "free" ? "Using daily free spin!" : `Spinning for ${cost} π...`);
    
    // Call backend for spin result
    const result = await spin(user.username, type);
    
    if (!result) {
      // Refund if spin failed (only for paid spins - payment already completed)
      setPendingSpinType(null);
    }
  };

  // Handle free spin shortcut
  const handleFreeSpin = useCallback(() => {
    if (canFreeSpin()) {
      handleSpin('free', 0);
    }
  }, [canFreeSpin]);

  // Handle any spin shortcut
  const handleQuickSpin = useCallback(() => {
    if (canFreeSpin()) {
      handleSpin('free', 0);
    } else {
      handleSpin('basic', SPIN_COSTS.basic);
    }
  }, [canFreeSpin]);

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onSpin: handleQuickSpin,
    onFreeSpin: handleFreeSpin,
    canSpin: !isSpinning && !isPaying && isAuthenticated,
  });

  // Handle wheel animation completion
  const handleWheelComplete = (result: string) => {
    completeAnimation();
    setPendingSpinType(null);
  };

  // Timer effect for free spin
  useEffect(() => {
    const interval = setInterval(() => {
      setFreeSpinTimer(getNextFreeSpinTime());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [getNextFreeSpinTime]);

  // Update username in localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('pi_username', user.username);
      fetchWalletData(user.username);
    }
  }, [user, fetchWalletData]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />
      
      <Header 
        isLoggedIn={isAuthenticated} 
        username={user?.username || null} 
        balance={balance} 
        onLogin={handleLogin}
        onDepositSuccess={handleDepositSuccess}
        isLoading={isAuthLoading}
        shortcuts={shortcuts}
      />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <motion.section
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gradient-gold">Spin</span>
            <span className="text-foreground">4</span>
            <span className="text-gradient-purple">Pi</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Spin Smart. Unlock Pi Value.
          </motion.p>
        </motion.section>

        {/* Jackpot */}
        <div className="max-w-lg mx-auto mb-12">
          <JackpotCounter amount={jackpot} />
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 mb-16">
          {/* Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SpinWheel 
              onSpinComplete={handleWheelComplete}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </motion.div>
          
          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <Leaderboard entries={leaderboard} isLoading={isLoading} />
            
            {/* Referral Panel - Only show when logged in */}
            {isAuthenticated && referralCode && (
              <ReferralPanel 
                referralCode={referralCode}
                referralCount={referralCount}
                referralEarnings={referralEarnings}
              />
            )}
          </div>
        </div>

        {/* Spin Options */}
        <div className="mb-20">
          <SpinButtons 
            onSpin={handleSpin}
            disabled={isSpinning || isPaying}
            canFreeSpin={canFreeSpin()}
            freeSpinTimer={freeSpinTimer}
          />
        </div>

        {/* Features */}
        <Features />
      </main>

      <Footer />

      {/* Result Modal */}
      <ResultModal 
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        result={lastResult}
      />
    </div>
  );
};

export default Index;
