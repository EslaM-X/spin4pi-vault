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

  const { createPayment } = usePiPayment();
  const { jackpot, leaderboard, isLoading: isGameLoading, refreshData } =
    useGameData();

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
  const spinFn = useSpin({ onSpinComplete: null });
  const {
    isSpinning,
    setIsSpinning,
    targetResult,
    handleSpinClick,
    setTargetResult,
  } = useSpinHandler(
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
  const [adRewardType, setAdRewardType] =
    useState<"free_spin" | "bonus_pi" | "boost">("free_spin");

  const toggleMenu = () => {
    setIsMenuOpen((p) => !p);
    setIsBlur((p) => !p);
  };

  // ======= Protect route =======
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) navigate("/");
  }, [isAuthenticated, isAuthLoading]);

  // ======= Free Spin Timer =======
  useEffect(() => {
    const interval = setInterval(() => {
      if (getNextFreeSpinTime) {
        setFreeSpinTimer(getNextFreeSpinTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getNextFreeSpinTime]);

  // ======= Global Loading =======
  useEffect(() => {
    if (!isAuthLoading && !isGameLoading && profileId) {
      setIsLoading(false);
    }
  }, [isAuthLoading, isGameLoading, profileId]);

  if (isLoading) return <GlobalLoading />;

  // ======= Auth Handlers =======
  const handleLogin = async () => {
    const result = await authenticate();
    if (result) {
      localStorage.setItem("pi_username", result.username);
      await applyReferral(result.username, searchParams.get("ref"));
      await fetchWalletData(result.username);
      toast.success(`Welcome, ${result.username}`);
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

  return (
    <div
      className={`min-h-screen bg-background overflow-hidden ${
        isBlur ? "blur-sm" : ""
      }`}
    >
      {/* Background */}
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />

      <Header
        isLoggedIn={isAuthenticated}
        username={user?.username || null}
        balance={wallet.balance}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <section className="text-center mb-12">
          <h1 className="text-6xl font-display font-black mb-4">
            <span className="text-gradient-gold">Spin</span>4
            <span className="text-gradient-purple">Pi</span>
          </h1>
          <p className="text-muted-foreground text-xl">
            Spin & win Pi rewards instantly!
          </p>

          {user && (
            <DailyRewardButton
              piUsername={user.username}
              onRewardClaimed={() => fetchWalletData(user.username)}
            />
          )}
        </section>

        <JackpotCounter amount={jackpot} />

        <div className="flex flex-col lg:flex-row gap-12 my-16 justify-center">
          <div className="flex flex-col items-center gap-4">
            <SpinWheel
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              targetResult={targetResult}
              onSpinComplete={() => setTargetResult(null)}
            />
            {user && (
              <ActiveBoostsIndicator
                piUsername={user.username}
                isSpinning={isSpinning}
              />
            )}
          </div>

          <div className="flex flex-col gap-6 w-full lg:w-80">
            <VIPStatus totalSpins={wallet.totalSpins} compact />
            <TournamentPanel
              profileId={profileId}
              walletBalance={wallet.balance}
              onRefresh={() => fetchWalletData(user!.username)}
            />
            <Leaderboard entries={leaderboard} isLoading={isGameLoading} />
            <StakingPanel
              username={user!.username}
              walletBalance={wallet.balance}
              onBalanceUpdate={updateBalance}
            />
            {wallet.referralCode && (
              <ReferralPanel
                referralCode={wallet.referralCode}
                referralCount={wallet.referralCount}
                referralEarnings={wallet.referralEarnings}
              />
            )}
          </div>
        </div>

        <SpinButtons
          onSpin={(type, cost) =>
            handleSpinClick(type, cost, user, canFreeSpin, createPayment)
          }
          disabled={isSpinning}
          canFreeSpin={canFreeSpin()}
          freeSpinTimer={freeSpinTimer}
        />

        <Features />
      </main>

      <Footer />

      <ResultModal
        isOpen={!!targetResult}
        onClose={() => setTargetResult(null)}
      />

      <PiAdsReward
        isOpen={showAdReward}
        onClose={() => setShowAdReward(false)}
        onAdComplete={() =>
          handleSpinClick("free", 0, user, canFreeSpin, createPayment)
        }
        rewardType={adRewardType}
      />

      <JackpotPopup
        isOpen={showJackpotPopup}
        onClose={() => setShowJackpotPopup(false)}
        jackpotAmount={jackpot}
      />
    </div>
  );
};

export default Index;
