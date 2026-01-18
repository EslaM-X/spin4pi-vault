import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Clock, CheckCircle, XCircle, ShieldCheck, ShieldAlert, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePiAuth } from "@/hooks/usePiAuth";
import { toast } from "sonner";
import GlobalLoading from "@/components/GlobalLoading";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  txid: string | null;
}

const WithdrawalHistory = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, authenticate } = usePiAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  // الفحص الإمبراطوري (الدخول + الموافقة القانونية)
  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!isLoading) {
      if (!isAuthenticated || !hasConsented) {
        navigate("/");
        if (!hasConsented && isAuthenticated) {
          toast.error("Security Protocol: Accept Imperial Terms to view Ledger", {
            icon: <ShieldAlert className="text-gold" />
          });
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchWithdrawals();
    }
  }, [user, isAuthenticated]);

  const fetchWithdrawals = async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, wallet_balance")
        .eq("pi_username", user.username)
        .single();

      if (profile) {
        setWalletBalance(Number(profile.wallet_balance) || 0);

        const { data } = await supabase
          .from("withdrawals")
          .select("*")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false });

        setWithdrawals(data || []);
      }
    } catch (error) {
      console.error("Ledger Sync Error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-white/20" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "pending":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "failed":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-white/40 bg-white/5 border-white/5";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (isLoading || !isAuthenticated || dataLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-gold/30">
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

      <Header 
        isLoggedIn={isAuthenticated} 
        username={user?.username || null} 
        balance={walletBalance} 
        onLogin={authenticate}
      />

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        {/* Navigation */}
        <Link to="/profile">
          <Button variant="ghost" className="mb-10 gap-2 text-white/40 hover:text-gold hover:bg-gold/5 rounded-xl border border-transparent hover:border-gold/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[2px]">Profile Vault</span>
          </Button>
        </Link>

        {/* Header Section */}
        <motion.div
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] w-8 bg-gold" />
              <span className="text-[10px] font-black text-gold uppercase tracking-[4px]">Verified Records</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase flex items-center gap-4">
              <History className="w-10 h-10 text-gold" />
              Imperial <span className="text-gold">Ledger</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
             <ShieldCheck className="text-gold w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Secure Protocol Active</span>
          </div>
        </motion.div>

        {/* Withdrawals List */}
        <motion.div className="space-y-4 max-w-4xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {withdrawals.length === 0 ? (
            <div className="text-center py-20 bg-[#0d0d12] rounded-[40px] border border-white/5 shadow-2xl">
              <ArrowUpRight className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <h3 className="text-xl font-black italic uppercase text-white/40 tracking-widest">No Extraction History</h3>
              <p className="text-white/20 text-[10px] mt-2 uppercase tracking-[2px]">Your transaction records will appear here</p>
            </div>
          ) : (
            withdrawals.map((withdrawal, index) => (
              <motion.div
                key={withdrawal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#0d0d12] border border-white/5 rounded-[28px] p-6 hover:border-gold/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${getStatusStyle(withdrawal.status || 'pending')}`}>
                      {getStatusIcon(withdrawal.status || 'pending')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black italic tracking-tighter">
                          {withdrawal.amount.toFixed(2)} <span className="text-gold text-sm">π</span>
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                        {formatDate(withdrawal.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3">
                    <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[2px] border ${getStatusStyle(withdrawal.status || 'pending')}`}>
                      {withdrawal.status || 'pending'}
                    </span>
                    {withdrawal.txid && (
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        <span className="text-[8px] text-white/20 uppercase font-black">Hash:</span>
                        <span className="text-[10px] text-gold/60 font-mono tracking-tighter">
                          {withdrawal.txid.slice(0, 12)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {withdrawal.completed_at && (
                  <div className="mt-4 pt-4 border-t border-white/[0.03] flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                       Finalized on {formatDate(withdrawal.completed_at)}
                     </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Imperial Summary */}
        {withdrawals.length > 0 && (
          <motion.div
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[
              { label: "Total Operations", val: withdrawals.length, color: "text-white" },
              { label: "Successfully Extracted", val: `${withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0).toFixed(2)} π`, color: "text-emerald-500" },
              { label: "In Transmission", val: `${withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0).toFixed(2)} π`, color: "text-amber-500" }
            ].map((stat, i) => (
              <div key={i} className="bg-[#0d0d12] rounded-[24px] border border-white/5 p-6 text-center shadow-xl">
                <p className={`text-2xl font-black italic tracking-tighter ${stat.color} mb-1`}>{stat.val}</p>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[2px]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WithdrawalHistory;
