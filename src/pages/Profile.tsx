import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Wallet as WalletIcon, Trophy, Loader2, 
  AlertCircle, CheckCircle2, XCircle, ShieldAlert,
  History, User, Zap, Share2, Star
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GlobalLoading from "@/components/GlobalLoading";

import { usePiAuth } from "@/hooks/usePiAuth";
import { useWallet } from "@/hooks/useWallet";
import { useSpin } from "@/hooks/useSpin";

interface SpinHistory {
  id: string;
  result: string;
  spin_type: string;
  cost: number | null;
  reward_amount: number | null;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, canFreeSpin } = usePiAuth();
  const {
    wallet,
    fetchWalletData,
    leaderboard,
    isLoading: walletLoading,
  } = useWallet();

  const [freeSpinCountdown, setFreeSpinCountdown] = useState("00:00:00");
  const [loading, setLoading] = useState(true);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [spinSuccess, setSpinSuccess] = useState<{ result: string; reward: number } | null>(null);

  // مرجع صوتي للنجاح
  const successSfx = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));

  // ===== Spin Hook =====
  const { spin, isSpinning } = useSpin({
    onSpinComplete: (result, rewardAmount) => {
      successSfx.current.play().catch(() => {});
      setSpinSuccess({ result, reward: rewardAmount });
      setSpinError(null);
      setTimeout(() => setSpinSuccess(null), 5000);
    },
    onError: (error) => {
      setSpinError(error);
      setSpinSuccess(null);
      setTimeout(() => setSpinError(null), 5000);
    },
  });

  // ===== الفحص الإمبراطوري =====
  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!isLoading) {
      if (!isAuthenticated || !hasConsented) {
        navigate("/");
        if (!hasConsented && isAuthenticated) {
          toast.error("Imperial Protocol: Consent Required", {
            icon: <ShieldAlert className="text-gold" />
          });
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // ===== التحميل الأولي =====
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // ===== عداد الـ Free Spin =====
  useEffect(() => {
    if (!wallet.lastFreeSpin) {
      setFreeSpinCountdown("Available!");
      return;
    }
    const interval = setInterval(() => {
      const last = new Date(wallet.lastFreeSpin!);
      const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      if (now >= next) {
        setFreeSpinCountdown("Available!");
        clearInterval(interval);
      } else {
        const diff = next.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setFreeSpinCountdown(
          `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [wallet.lastFreeSpin]);

  useEffect(() => {
    if (user) fetchWalletData();
  }, [user, fetchWalletData]);

  const handleFreeSpin = useCallback(async () => {
    if (!canFreeSpin()) return;
    await spin("free", 0);
    fetchWalletData();
  }, [canFreeSpin, spin, fetchWalletData]);

  const handlePaidSpin = useCallback(async () => {
    if (wallet.balance < 0.1) {
      toast.error("Treasury empty: 0.1 π required");
      return;
    }
    await spin("paid", 0.1);
    fetchWalletData();
  }, [wallet.balance, spin, fetchWalletData]);

  if (loading || walletLoading) return <GlobalLoading isVisible={true} />;

  const canDoFreeSpin = canFreeSpin() && freeSpinCountdown === "Available!";
  const canDoPaidSpin = wallet.balance >= 0.1;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-gold/30">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="w-12 h-12 rounded-2xl border border-white/5 bg-white/5 hover:bg-gold/10 hover:text-gold transition-all"
          >
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gold uppercase tracking-[3px]">Imperial Identity</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <User className="text-gold w-8 h-8" />
              {user?.username}
            </h1>
          </div>
        </div>

        {/* Spin Alerts */}
        <AnimatePresence>
          {spinError && (
            <motion.div initial={{ opacity: 0, h: 0 }} animate={{ opacity: 1, h: "auto" }} exit={{ opacity: 0, h: 0 }} className="mb-6">
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 rounded-2xl">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="font-bold uppercase text-[10px] tracking-wider">{spinError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          {spinSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
              <Alert className="border-gold/30 bg-gold/10 rounded-2xl backdrop-blur-md">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <AlertDescription className="text-gold font-black italic uppercase">
                  Artifact Recovered: {spinSuccess.result}! +{spinSuccess.reward.toFixed(4)} π
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-[#0d0d12] border-white/5 rounded-[32px] p-6 shadow-xl group hover:border-gold/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
                <WalletIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Imperial Balance</p>
                <p className="text-2xl font-black italic text-white">{wallet.balance.toFixed(4)} <span className="text-gold text-sm">π</span></p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0d0d12] border-white/5 rounded-[32px] p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Zap className="text-gold w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Spins</p>
                <p className="text-2xl font-black italic text-white">{wallet.totalSpins}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0d0d12] border-white/5 rounded-[32px] p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Share2 className="text-gold w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Imperial Code</p>
                <p className="text-xl font-black font-mono text-gold uppercase">{wallet.referralCode || "—"}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0d0d12] border-white/5 rounded-[32px] p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Star className="text-gold w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Referrals</p>
                <p className="text-2xl font-black italic text-white">{wallet.referralCount}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[#0d0d12] border-gold/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
               <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                 <Zap className="text-gold" /> Immediate Action
               </h2>
               <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleFreeSpin} 
                    disabled={!canDoFreeSpin || isSpinning}
                    className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-gold hover:text-black transition-all font-black uppercase tracking-widest text-xs"
                  >
                    {isSpinning ? <Loader2 className="animate-spin" /> : canDoFreeSpin ? "🎡 Imperial Free Spin" : `⏰ ${freeSpinCountdown}`}
                  </Button>
                  
                  <Button 
                    onClick={handlePaidSpin} 
                    disabled={!canDoPaidSpin || isSpinning}
                    className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {isSpinning ? <Loader2 className="animate-spin" /> : `💰 Invest 0.1 π`}
                  </Button>
               </div>
            </Card>

            {/* Recent Spins */}
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                <History className="text-gold" /> Transaction History
              </h2>
              <div className="space-y-4">
                {!wallet.recentSpins || wallet.recentSpins.length === 0 ? (
                  <div className="p-12 text-center bg-[#0d0d12] rounded-[32px] border border-white/5 text-white/20 font-black uppercase tracking-widest text-xs">
                    No history found in the Vault
                  </div>
                ) : (
                  wallet.recentSpins.map((spinItem: SpinHistory) => (
                    <motion.div
                      key={spinItem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#0d0d12] border border-white/5 p-5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          (spinItem.reward_amount || 0) > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        }`}>
                          {spinItem.spin_type === "free" ? "🎁" : "💰"}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tighter">{spinItem.result}</p>
                          <p className="text-[9px] text-white/30 uppercase">{new Date(spinItem.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black italic ${
                          (spinItem.reward_amount || 0) > 0 ? "text-emerald-500" : "text-red-500"
                        }`}>
                          {(spinItem.reward_amount || 0) > 0 ? "+" : ""}{(spinItem.reward_amount || 0).toFixed(4)} <span className="text-[10px]">π</span>
                        </p>
                        {spinItem.cost ? <p className="text-[8px] text-white/20 uppercase">Cost: {spinItem.cost} π</p> : null}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Leaderboard */}
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Trophy className="text-gold" /> High Command
            </h2>
            <div className="bg-[#0d0d12] border border-gold/10 rounded-[32px] overflow-hidden shadow-2xl">
              {leaderboard.map((entry, i) => (
                <div key={i} className={`p-5 flex items-center justify-between border-b border-white/5 last:border-0 ${i === 0 ? "bg-gold/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gold/50">{i + 1}.</span>
                    <span className={`text-sm font-black italic uppercase ${i === 0 ? "text-gold" : "text-white"}`}>{entry.username}</span>
                  </div>
                  <span className="text-xs font-black italic">{entry.totalWinnings.toFixed(2)} <span className="text-gold">π</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
