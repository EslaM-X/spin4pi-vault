import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Wallet as WalletIcon, Trophy, Loader2, 
  CheckCircle2, XCircle, Camera,
  History, User, Zap, Share2, Star, Copy
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GlobalLoading from "@/components/GlobalLoading";

import { usePiAuth } from "@/hooks/usePiAuth";
import { useWallet } from "@/hooks/useWallet";
import { useSpin } from "@/hooks/useSpin";

// شعار Pi (تأكد من وجود الصورة في المسار الصحيح)
import piNetworkLogo from "@/assets/pinetwork.jpg";

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
  const { wallet, fetchWalletData, leaderboard, isLoading: walletLoading } = useWallet();

  const [freeSpinCountdown, setFreeSpinCountdown] = useState("00:00:00");
  const [loading, setLoading] = useState(true);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [spinSuccess, setSpinSuccess] = useState<{ result: string; reward: number } | null>(null);
  
  // حالة الصورة الشخصية
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const successSfx = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));

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

  // معالجة تغيير الصورة وحفظها في localStorage
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem(`profile_img_${user?.uid}`, base64String);
        toast.success("Profile image updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!isLoading) {
      if (!isAuthenticated || !hasConsented) {
        navigate("/");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
    if (user) {
        fetchWalletData();
        const savedImg = localStorage.getItem(`profile_img_${user?.uid}`);
        if (savedImg) setProfileImage(savedImg);
    }
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

  // حساب الـ XP (مثال: كل لفة تعطي 50 XP)
  const currentXP = (wallet.totalSpins * 50) % 1000;
  const currentLevel = Math.floor((wallet.totalSpins * 50) / 1000) + 1;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-gold/30 pb-20">
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-4 pt-28 relative z-10">
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 shrink-0"
          >
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>

          {/* User Image/Avatar */}
          <div className="relative group shrink-0">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-gold/30 overflow-hidden bg-[#13131a] flex items-center justify-center cursor-pointer hover:border-gold transition-all shadow-[0_0_15px_rgba(255,215,0,0.1)]"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-gold w-8 h-8" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="text-white w-5 h-5" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-gold uppercase tracking-[3px]">Spin4Pi Identity</p>
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase break-words leading-tight">
              {user?.username}
            </h1>
          </div>
        </div>

        {/* Level & XP System Card */}
        <Card className="bg-[#0d0d12] border-white/5 rounded-[24px] p-4 mb-8 shadow-xl border-l-4 border-l-gold">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
               <Trophy className="w-4 h-4 text-gold" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Level {currentLevel} Enthusiast</span>
            </div>
            <span className="text-[10px] font-bold text-gold">{currentXP} / 1000 XP</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${(currentXP / 1000) * 100}%` }} 
              className="h-full bg-gradient-to-r from-gold to-yellow-500 shadow-[0_0_8px_rgba(255,215,0,0.4)]"
            />
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {/* Main Balance Card */}
          <Card className="bg-[#0d0d12] border-white/5 rounded-[24px] p-5 shadow-xl relative overflow-hidden group border-t border-white/5">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl rounded-full" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                <WalletIcon className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pi Balance</p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-black italic text-white leading-none">
                        {wallet.balance.toFixed(4)}
                    </p>
                    <img src={piNetworkLogo} className="w-5 h-5 rounded-full object-cover shadow-[0_0_5px_rgba(255,215,0,0.5)]" alt="Pi" />
                </div>
              </div>
            </div>
          </Card>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-[#0d0d12] border-white/5 rounded-[24px] p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                <Zap className="text-gold w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Total Spins</p>
                <p className="text-lg font-black italic text-white">{wallet.totalSpins}</p>
              </div>
            </Card>

            <Card className="bg-[#0d0d12] border-white/5 rounded-[24px] p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <Share2 className="text-gold w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Referral Code</p>
                  <p className="text-sm font-black font-mono text-gold uppercase truncate">{wallet.referralCode || "—"}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  navigator.clipboard.writeText(wallet.referralCode || "");
                  toast.success("Code Copied!");
                }}
                className="w-8 h-8 rounded-lg hover:bg-gold/10 hover:text-gold shrink-0 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </Card>

            <Card className="bg-[#0d0d12] border-white/5 rounded-[24px] p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                <Star className="text-gold w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Referrals</p>
                <p className="text-lg font-black italic text-white">{wallet.referralCount}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-6">
          <Card className="bg-[#0d0d12] border-gold/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden border-t border-t-gold/20">
            <h2 className="text-lg font-black italic uppercase tracking-tighter mb-5 flex items-center justify-center gap-2 text-white">
              <Zap className="text-gold w-5 h-5" /> Immediate Action
            </h2>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleFreeSpin} 
                disabled={!canFreeSpin() || freeSpinCountdown !== "Available!" || isSpinning}
                className="w-full h-14 rounded-xl bg-white/5 border border-white/10 hover:bg-gold hover:text-black transition-all font-black uppercase tracking-widest text-[10px]"
              >
                {isSpinning ? <Loader2 className="animate-spin" /> : (freeSpinCountdown === "Available!" ? "🎡 Imperial Free Spin" : `⏰ ${freeSpinCountdown}`)}
              </Button>
              
              <Button 
                onClick={handlePaidSpin} 
                disabled={wallet.balance < 0.1 || isSpinning}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all"
              >
                {isSpinning ? <Loader2 className="animate-spin" /> : `💰 Invest 0.1 π`}
              </Button>
            </div>
          </Card>
          
          {/* History Section */}
          <div>
            <h2 className="text-lg font-black italic uppercase mb-4 flex items-center gap-2 px-2 text-white/80">
              <History className="text-gold w-5 h-5" /> Activity History
            </h2>
            <div className="space-y-3">
              {!wallet.recentSpins?.length ? (
                <div className="p-10 text-center bg-[#0d0d12] rounded-[24px] border border-white/5 text-white/20 font-black uppercase text-[10px] tracking-widest">
                  No activity in the vault
                </div>
              ) : (
                wallet.recentSpins.map((spinItem: SpinHistory) => (
                  <div key={spinItem.id} className="bg-[#0d0d12] border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{spinItem.spin_type === "free" ? "🎁" : "💰"}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase truncate text-white">{spinItem.result}</p>
                        <p className="text-[8px] text-white/30 uppercase">{new Date(spinItem.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-black text-sm italic ${(spinItem.reward_amount || 0) > 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {(spinItem.reward_amount || 0) > 0 ? "+" : ""}{(spinItem.reward_amount || 0).toFixed(4)} π
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
