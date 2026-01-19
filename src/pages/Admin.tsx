import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, Trophy, RefreshCw, 
  Users, Zap, Wallet, TrendingUp, History,
  ExternalLink, AlertCircle, Server, Code, Globe,
  ShieldCheck, Lock, Unlock, Fingerprint
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';
import { Header } from '@/components/Header';

const Admin = () => {
  const { user, isAuthenticated, authenticate } = usePiAuth();
  const navigate = useNavigate();
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0, totalDeposits: 0, totalWithdrawals: 0, jackpotAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSecureMode, setIsSecureMode] = useState(false); // نظام تأمين لوحة التحكم

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { count: usersCount },
        { data: depositsData },
        { data: withdrawalsData },
        { data: pendingData },
        { data: jackpotData }
      ] = await Promise.all([
        supabase.from('profiles').select('', { count: 'exact', head: true }),
        supabase.from('deposits').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('*, profiles(pi_username, wallet_address, balance)').eq('status', 'pending'),
        supabase.from('jackpot').select('total_pi').single()
      ]);

      setAnalytics({
        totalUsers: usersCount || 0,
        totalDeposits: depositsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0,
        totalWithdrawals: withdrawalsData?.reduce((sum, w) => sum + Number(w.amount), 0) || 0,
        jackpotAmount: Number(jackpotData?.total_pi) || 0,
      });
      setPendingWithdrawals(pendingData || []);
    } catch (err) {
      toast.error('Imperial Sync Error');
    } finally {
      setIsLoading(false);
    }
  };

  const processBlockchainPayment = async (wId: string, amount: number, piUser: string, userBalance: number) => {
    if (!isSecureMode) {
      toast.error("Security Protocol: Please unlock Admin Secure Mode first!");
      return;
    }

    // تأمين إضافي: التأكد من أن الرصيد المطلوب سحبه لا يتجاوز رصيد المستخدم في قاعدة البيانات
    if (amount > userBalance) {
      toast.error("Fraud Alert: Withdrawal amount exceeds user balance!");
      return;
    }

    const id = toast.loading(`Securing Blockchain Bridge for @${piUser}...`);
    try {
      const { data, error } = await supabase.functions.invoke('process-pi-payout', {
        body: { withdrawalId: wId, amount, username: piUser }
      });
      if (error) throw error;
      toast.success("Transaction Secured & Confirmed!", { id });
      fetchData();
    } catch (err: any) {
      toast.error(`Transfer Failed: ${err.message}`, { id });
    }
  };

  if (isLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Header isLoggedIn={isAuthenticated} username={user?.username} balance={0} onLogin={authenticate} />

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        
        {/* Security Control Panel */}
        <section className="mb-12 flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-gradient-to-br from-[#0d0d12] to-black border border-gold/20 rounded-[35px] p-8 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black uppercase italic text-gold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" /> Payment Security Layer
                </h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mt-2">
                  Status: {isSecureMode ? <span className="text-emerald-500">System Unlocked</span> : <span className="text-red-500">System Encrypted</span>}
                </p>
              </div>
              <Button 
                onClick={() => setIsSecureMode(!isSecureMode)}
                className={`rounded-2xl px-6 py-6 font-black uppercase text-[10px] transition-all duration-500 ${isSecureMode ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]'}`}
              >
                {isSecureMode ? <><Lock size={16} className="mr-2"/> Lock Console</> : <><Unlock size={16} className="mr-2"/> Unlock Console</>}
              </Button>
            </div>
          </div>
        </section>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
           <StatBox label="Total Inflow" value={`${analytics.totalDeposits.toFixed(2)} π`} icon={<TrendingUp size={20}/>} color="text-emerald-500" />
           <StatBox label="Treasury Reserve" value={`${analytics.jackpotAmount.toFixed(2)} π`} icon={<Wallet size={20}/>} color="text-gold" />
           <StatBox label="Admin Authority" value={isSecureMode ? "Level 4" : "ReadOnly"} icon={<Fingerprint size={20}/>} color="text-blue-500" />
           <StatBox label="Pending Safety" value={pendingWithdrawals.length} icon={<AlertCircle size={20}/>} color="text-amber-500" />
        </div>

        {/* Secured Withdrawal Queue */}
        <div className="bg-[#0d0d12] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              Imperial Payout Ledger
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 bg-black/40">
                  <TableHead className="px-8 text-[10px] font-black uppercase text-white/30 tracking-widest">Recipient</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/30 tracking-widest">Security Audit</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/30 tracking-widest">Amount</TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black uppercase text-white/30 tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWithdrawals.map((w: any) => {
                  const isFraudRisk = w.amount > (w.profiles?.balance || 0);
                  return (
                    <TableRow key={w.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="px-8 py-6">
                        <div className="text-white font-bold uppercase tracking-tighter text-lg">@{w.profiles?.pi_username}</div>
                        <div className="text-[9px] text-white/20 font-mono italic">{w.profiles?.wallet_address || 'UNLINKED'}</div>
                      </TableCell>
                      <TableCell>
                        {isFraudRisk ? (
                          <div className="flex items-center gap-2 text-red-500 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10 w-fit">
                            <AlertCircle size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Inconsistent Balance</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 w-fit">
                            <ShieldCheck size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Verified Transaction</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gold font-black italic text-2xl">{w.amount} π</TableCell>
                      <TableCell className="text-right px-8">
                        <Button 
                          onClick={() => processBlockchainPayment(w.id, w.amount, w.profiles?.pi_username, w.profiles?.balance)}
                          disabled={!isSecureMode || isFraudRisk || !w.profiles?.wallet_address}
                          className={`font-black uppercase text-[10px] rounded-xl px-8 py-6 transition-all ${
                            isSecureMode && !isFraudRisk ? 'bg-emerald-500 text-black shadow-[0_10px_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-white/10 grayscale'
                          }`}
                        >
                          {isSecureMode ? 'Execute Secure Payout' : 'Unlock to Authorize'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatBox = ({ label, value, icon, color }: any) => (
  <div className="bg-[#0d0d12] border border-white/5 p-6 rounded-[30px] shadow-lg">
     <div className="flex items-center gap-3 mb-2 opacity-40">
        <div className={color}>{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-[2px]">{label}</span>
     </div>
     <div className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</div>
  </div>
);

export default Admin;
