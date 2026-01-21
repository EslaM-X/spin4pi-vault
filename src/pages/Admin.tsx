import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, Users, Wallet, TrendingUp, History,
  Code, ShieldCheck, Lock, Unlock, Fingerprint, XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';
import { Header } from '@/components/Header';

const Admin = () => {
  const { user, isAuthenticated, authenticate, logout } = usePiAuth();
  const navigate = useNavigate();
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0, totalDeposits: 0, totalWithdrawals: 0, jackpotAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSecureMode, setIsSecureMode] = useState(false);

  useEffect(() => {
    // حماية الصفحة: إذا لم يكن مسجل دخول، اطرده بعد 2 ثانية
    if (!isAuthenticated && !isLoading) {
      const timer = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(timer);
    }
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, isLoading]);

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
      toast.error("Security Protocol: System is Locked!");
      return;
    }
    // ملاحظة: هذا الإجراء يجب أن يتم وفقاً لبروتوكول Pi SDK الرسمي فقط
    toast.info("Point-to-Point (P2P) Manual Review Required per Pi Policy.");
  };

  if (isLoading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* دمج الهيدر لضمان التناسق وقابلية العودة للخلف */}
      <Header 
        isLoggedIn={isAuthenticated} 
        username={user?.username} 
        balance={0} 
        onLogin={authenticate} 
        onLogout={() => { logout(); navigate('/'); }}
      />

      <main className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        
        {/* Header اللوحة */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="text-gold w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Authorized Interface</span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
              IMPERIAL <span className="text-gold">TERMINAL</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
            <div className="px-4 text-right">
              <p className="text-[8px] font-black uppercase text-white/30 tracking-widest">Master Auth</p>
              <p className={`text-[10px] font-bold uppercase ${isSecureMode ? 'text-emerald-500' : 'text-red-500'}`}>
                {isSecureMode ? 'System Unlocked' : 'System Locked'}
              </p>
            </div>
            <Button 
              onClick={() => setIsSecureMode(!isSecureMode)}
              className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 ${isSecureMode ? 'bg-red-500 text-white' : 'bg-gold text-black'}`}
            >
              {isSecureMode ? <Lock size={20} /> : <Unlock size={20} />}
            </Button>
          </div>
        </div>

        {/* شبكة الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
           <StatBox label="Total Citizens" value={analytics.totalUsers} icon={<Users size={20}/>} color="text-white" />
           <StatBox label="Eco Inflow" value={`${analytics.totalDeposits.toFixed(2)} π`} icon={<TrendingUp size={20}/>} color="text-emerald-500" />
           <StatBox label="Eco Outflow" value={`${analytics.totalWithdrawals.toFixed(2)} π`} icon={<History size={20}/>} color="text-red-500" />
           <StatBox label="Treasury" value={`${analytics.jackpotAmount.toFixed(2)} π`} icon={<Wallet size={20}/>} color="text-gold" />
        </div>

        {/* جدول العمليات المعلقة */}
        <div className="bg-[#0d0d12] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <Fingerprint className="text-gold" /> Extraction Queue
            </h3>
            <Button onClick={fetchData} variant="ghost" className="text-white/20 hover:text-white">
              <RefreshCw size={16} />
            </Button>
          </div>
          
          <div className="overflow-x-auto p-2">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 bg-black/40">
                  <TableHead className="px-8 text-[10px] font-black uppercase text-white/30 tracking-widest">Recipient</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/30 tracking-widest">Audit Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/30 tracking-widest">Amount</TableHead>
                  <TableHead className="text-right px-8 text-[10px] font-black uppercase text-white/30 tracking-widest">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWithdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-white/10 font-black uppercase tracking-[5px] italic">
                      No Pending Extractions
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingWithdrawals.map((w: any) => {
                    const isFraudRisk = w.amount > (w.profiles?.balance || 0);
                    return (
                      <TableRow key={w.id} className="border-white/5 hover:bg-white/[0.02] transition-all">
                        <TableCell className="px-8 py-6">
                          <div className="text-white font-bold uppercase tracking-tighter text-lg">@{w.profiles?.pi_username}</div>
                          <div className="text-[9px] text-white/20 font-mono italic truncate max-w-[150px]">{w.profiles?.wallet_address || 'NO WALLET'}</div>
                        </TableCell>
                        <TableCell>
                          {isFraudRisk ? (
                            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 w-fit">
                              <XCircle size={12} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Fraud Alert</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 w-fit">
                              <ShieldCheck size={12} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-gold font-black italic text-2xl">{w.amount} π</TableCell>
                        <TableCell className="text-right px-8">
                          <Button 
                            onClick={() => processBlockchainPayment(w.id, w.amount, w.profiles?.pi_username, w.profiles?.balance)}
                            disabled={!isSecureMode || isFraudRisk || !w.profiles?.wallet_address}
                            className={`font-black uppercase text-[10px] rounded-xl px-8 py-6 transition-all ${
                              isSecureMode && !isFraudRisk && w.profiles?.wallet_address 
                              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                              : 'bg-white/5 text-white/10 grayscale cursor-not-allowed'
                            }`}
                          >
                            {isSecureMode ? 'Review Transfer' : 'Unlock Terminal'}
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

const StatBox = ({ label, value, icon, color }: any) => (
  <div className="bg-[#0d0d12] border border-white/5 p-6 rounded-[30px] shadow-xl hover:border-gold/30 transition-all group">
     <div className="flex items-center gap-3 mb-2 opacity-40 group-hover:opacity-100">
        <div className={color}>{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-[2px]">{label}</span>
     </div>
     <div className={`text-3xl font-black italic tracking-tighter ${color}`}>{value}</div>
  </div>
);

export default Admin;
