import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, Users, Wallet, TrendingUp, History,
  ShieldCheck, Lock, Unlock, Fingerprint, XCircle, Code, ShieldAlert
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';
import { Header } from '@/components/Header';

// مكون فرعي للإحصائيات
const StatBox = ({ label, value, icon, color }: any) => (
  <div className="bg-[#0d0d12] border border-white/5 p-6 rounded-[30px] shadow-xl group hover:border-gold/20 transition-all">
     <div className="flex items-center gap-3 mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
        <div className={color}>{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-[2px]">{label}</span>
     </div>
     <div className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</div>
  </div>
);

const Admin = () => {
  const { user, isAuthenticated, authenticate } = usePiAuth();
  const navigate = useNavigate();
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0, totalDeposits: 0, totalWithdrawals: 0, jackpotAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('pi_username', user?.username)
        .single();

      if (error || !data?.is_admin) {
        toast.error("Access Denied: Imperial Clearance Required");
        navigate('/');
      } else {
        setIsAdminConfirmed(true);
        fetchData();
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user, navigate]);

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
        supabase.from('withdrawals').select('*, profiles(pi_username, wallet_address, wallet_balance)').eq('status', 'pending'),
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
      toast.error("Security Protocol: Terminal is Locked!");
      return;
    }

    if (amount > userBalance) {
      toast.error(`Fraud Alert: User only has ${userBalance} π`);
      return;
    }

    const toastId = toast.loading(`Bridging Assets for @${piUser}...`);
    try {
      const { error } = await supabase.functions.invoke('process-pi-payout', {
        body: { withdrawalId: wId, amount, username: piUser }
      });
      
      if (error) throw error;
      
      toast.success("Extraction Completed Successfully!", { id: toastId });
      fetchData();
    } catch (err: any) {
      toast.error(`Blockchain Error: ${err.message}`, { id: toastId });
    }
  };

  if (!isAuthenticated || !isAdminConfirmed) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Header isLoggedIn={isAuthenticated} username={user?.username} balance={0} onLogin={authenticate} />

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="text-gold w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[4px] text-gold/60">Imperial High Command</span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              CENTRAL <span className="text-gold">TERMINAL</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
            <div className="px-4">
              <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Master Key</p>
              <p className={`text-[10px] font-bold uppercase ${isSecureMode ? 'text-emerald-500' : 'text-red-500'}`}>
                {isSecureMode ? 'Ready' : 'Locked'}
              </p>
            </div>
            <Button 
              onClick={() => setIsSecureMode(!isSecureMode)}
              className={`h-12 w-12 rounded-xl transition-all duration-500 ${isSecureMode ? 'bg-red-500' : 'bg-gold text-black'}`}
            >
              {isSecureMode ? <Lock size={20} /> : <Unlock size={20} />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
           <StatBox label="Citizens" value={analytics.totalUsers} icon={<Users size={20}/>} color="text-white" />
           <StatBox label="Inflow" value={`${analytics.totalDeposits.toFixed(2)} π`} icon={<TrendingUp size={20}/>} color="text-emerald-500" />
           <StatBox label="Outflow" value={`${analytics.totalWithdrawals.toFixed(2)} π`} icon={<History size={20}/>} color="text-red-500" />
           <StatBox label="Treasury" value={`${analytics.jackpotAmount.toFixed(2)} π`} icon={<Wallet size={20}/>} color="text-gold" />
        </div>

        <div className="bg-[#0d0d12]/80 border border-white/5 rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-gold">
              <Fingerprint /> Extraction Queue
            </h3>
            <Button onClick={fetchData} variant="ghost" className="text-white/20 hover:text-white">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 bg-black/40">
                  <TableHead className="px-8 text-[10px] font-black text-white/30">Recipient</TableHead>
                  <TableHead className="text-[10px] font-black text-white/30">Audit</TableHead>
                  <TableHead className="text-[10px] font-black text-white/30">Amount</TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black text-white/30">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWithdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-white/10 font-black uppercase tracking-[5px] italic">
                      Empty Queue
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingWithdrawals.map((w: any) => {
                    const isFraudRisk = w.amount > (w.profiles?.wallet_balance || 0);
                    return (
                      <TableRow key={w.id} className="border-white/5 hover:bg-white/[0.02] transition-all">
                        <TableCell className="px-8 py-6">
                          <div className="text-white font-bold text-lg">@{w.profiles?.pi_username}</div>
                          <div className="text-[9px] text-white/40 font-mono truncate max-w-[120px]">{w.profiles?.wallet_address || 'NO ADDRESS'}</div>
                        </TableCell>
                        <TableCell>
                          {isFraudRisk ? (
                            <div className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-[8px] font-black border border-red-500/20">RISK</div>
                          ) : (
                            <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-[8px] font-black border border-emerald-500/20">SAFE</div>
                          )}
                        </TableCell>
                        <TableCell className="text-gold font-black italic text-2xl">{w.amount} π</TableCell>
                        <TableCell className="text-right px-8">
                          <Button 
                            onClick={() => processBlockchainPayment(w.id, w.amount, w.profiles?.pi_username, w.profiles?.wallet_balance)}
                            disabled={!isSecureMode || isFraudRisk || !w.profiles?.wallet_address}
                            className={`font-black uppercase text-[10px] rounded-xl px-6 py-4 ${
                              isSecureMode && !isFraudRisk ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/10'
                            }`}
                          >
                            {isSecureMode ? 'Authorize' : 'Locked'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
