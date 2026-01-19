import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowUpRight, Clock, CheckCircle, XCircle, 
  ShieldCheck, ShieldAlert, History, Zap, ExternalLink, Download 
} from "lucide-react";
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

  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!isLoading) {
      if (!isAuthenticated || !hasConsented) {
        navigate("/");
        if (!hasConsented && isAuthenticated) {
          toast.error("Security Protocol: Accept Imperial Terms", {
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

  // ميزة تصدير السجل كملف نصي احترافي
  const exportLedger = () => {
    if (withdrawals.length === 0) return;
    
    const header = `IMPERIAL LEDGER - SPIN4PI ELITE\nUser: ${user?.username}\nGenerated: ${new Date().toLocaleString()}\n${"=".repeat(40)}\n\n`;
    const body = withdrawals.map(w => (
      `Amount: ${w.amount.toFixed(2)} Pi\nStatus: ${w.status.toUpperCase()}\nDate: ${new Date(w.created_at).toLocaleString()}\nTXID: ${w.txid || 'N/A'}\n${"-".repeat(20)}`
    )).join("\n");
    
    const element = document.createElement("a");
    const file = new Blob([header + body], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Imperial_Ledger_${user?.username}.txt`;
    document.body.appendChild(element);
    element.click();
    toast.success("Ledger exported successfully");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case "pending": return <Clock className="w-6 h-6 text-amber-500 animate-pulse" />;
      case "failed": return <XCircle className="w-6 h-6 text-red-500" />;
      default: return <Clock className="w-6 h-6 text-white/20" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
      case "pending": return "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
      case "failed": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-white/40 bg-white/5 border-white/5";
    }
  };

  if (isLoading || !isAuthenticated || dataLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-gold/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.03),transparent)] pointer-events-none" />

      <Header isLoggedIn={isAuthenticated} username={user?.username || null} balance={walletBalance} onLogin={authenticate} />

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <Link to="/profile" className="inline-flex items-center gap-2 text-white/20 hover:text-gold mb-6 transition-all group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
              <span className="text-[10px] font-black uppercase tracking-[3px]">Identity Hub</span>
            </Link>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gold uppercase tracking-[5px]">Financial Archives</p>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
                IMPERIAL <span className="text-gold">LEDGER</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {withdrawals.length > 0 && (
              <Button 
                onClick={exportLedger}
                className="bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/30 text-white rounded-2xl px-6 py-6 transition-all group"
              >
                <Download className="w-5 h-5 mr-2 text-gold group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Export Ledger</span>
              </Button>
            )}
            <div className="flex items-center gap-3 px-5 py-3 bg-[#0d0d12] border border-white/10 rounded-2xl backdrop-blur-md">
               <ShieldCheck className="text-gold w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Secure Protocol Active</span>
            </div>
          </div>
        </header>

        {/* Withdrawals List */}
        <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
          {withdrawals.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-[#0d0d12] rounded-[40px] border border-white/5">
              <History className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <h3 className="text-xl font-black italic uppercase text-white/40 tracking-widest">No Extraction History</h3>
              <p className="text-white/20 text-[10px] mt-2 uppercase tracking-[3px]">Your financial logs are empty</p>
            </motion.div>
          ) : (
            withdrawals.map((withdrawal, index) => (
              <motion.div
                key={withdrawal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#0d0d12] border border-white/5 rounded-[35px] p-6 hover:border-gold/30 transition-all duration-500 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${getStatusStyle(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">
                          {withdrawal.amount.toFixed(2)}
                        </span>
                        <span className="text-gold font-black text-sm">Π</span>
                      </div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[2px] mt-1">{new Date(withdrawal.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[2px] border self-start sm:self-auto ${getStatusStyle(withdrawal.status)}`}>
                    {withdrawal.status}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Summary Footer */}
        {withdrawals.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#0d0d12] rounded-[30px] border border-white/5 p-8 text-center">
              <p className="text-3xl font-black italic text-emerald-500 mb-2">
                {withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0).toFixed(2)} π
              </p>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px]">Successfully Extracted</p>
            </div>
            <div className="bg-[#0d0d12] rounded-[30px] border border-white/5 p-8 text-center">
              <p className="text-3xl font-black italic text-amber-500 mb-2">
                {withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0).toFixed(2)} π
              </p>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px]">Currently Transmitting</p>
            </div>
            <div className="bg-[#0d0d12] rounded-[30px] border border-white/5 p-8 text-center">
              <p className="text-3xl font-black italic text-white mb-2">{withdrawals.length}</p>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[3px]">Total Operations</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WithdrawalHistory;
