import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Trophy, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePiAuth } from '@/hooks/usePiAuth';
import GlobalLoading from '@/components/GlobalLoading';
import DashboardLayout from '@/layouts/DashboardLayout';

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  entry_fee: number;
  prize_pool: number;
  status: string;
}

interface WalletAnalytics {
  totalUsers: number;
  totalSpins: number;
  totalDeposits: number;
  totalWithdrawals: number;
  jackpotAmount: number;
  activeTournaments: number;
}

const Admin = () => {
  const { user, isLoading: authLoading, isAuthenticated } = usePiAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [analytics, setAnalytics] = useState<WalletAnalytics>({
    totalUsers: 0,
    totalSpins: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    jackpotAmount: 0,
    activeTournaments: 0,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    entry_fee: 0.1,
    prize_pool: 10,
    duration_hours: 24,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/');
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, authLoading]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { count: usersCount },
        { count: spinsCount },
        { data: depositsData },
        { data: withdrawalsData },
        { data: jackpotData },
        { data: tournamentsData },
      ] = await Promise.all([
        supabase.from('profiles').select('', { count: 'exact', head: true }),
        supabase.from('spins').select('', { count: 'exact', head: true }),
        supabase.from('deposits').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('amount').eq('status', 'completed'),
        supabase.from('jackpot').select('total_pi').single(),
        supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
      ]);

      const totalDeposits = depositsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const totalWithdrawals = withdrawalsData?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const activeTournaments = tournamentsData?.filter((t) => t.status === 'active').length || 0;

      setAnalytics({
        totalUsers: usersCount || 0,
        totalSpins: spinsCount || 0,
        totalDeposits,
        totalWithdrawals,
        jackpotAmount: Number(jackpotData?.total_pi) || 0,
        activeTournaments,
      });

      setTournaments(tournamentsData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'completed':
        return 'text-muted-foreground';
      case 'upcoming':
        return 'text-blue-500';
      default:
        return 'text-foreground';
    }
  };

  const createTournament = async () => {
    if (!newTournament.name) return toast.error('Tournament name is required');
    setIsCreating(true);
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + newTournament.duration_hours * 60 * 60 * 1000);
      const { error } = await supabase.from('tournaments').insert({
        name: newTournament.name,
        description: newTournament.description || null,
        entry_fee: newTournament.entry_fee,
        prize_pool: newTournament.prize_pool,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'active',
      });
      if (error) throw error;
      toast.success('Tournament created successfully!');
      setShowCreateForm(false);
      setNewTournament({ name: '', description: '', entry_fee: 0.1, prize_pool: 10, duration_hours: 24 });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create tournament');
    } finally {
      setIsCreating(false);
    }
  };

  const endTournament = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('end-tournament', { body: { tournament_id: id } });
      if (error) throw error;
      toast.success(`Tournament ended! Winners: ${data.winners?.length || 0}`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to end tournament');
    }
  };

  if (authLoading || isLoading) return <GlobalLoading isVisible={true} />;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 /> Admin Dashboard
          </h1>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw /> Refresh
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries({
            Users: analytics.totalUsers,
            'Total Spins': analytics.totalSpins,
            Deposits: `${analytics.totalDeposits.toFixed(2)} π`,
            Withdrawals: `${analytics.totalWithdrawals.toFixed(2)} π`,
            Jackpot: `${analytics.jackpotAmount.toFixed(2)} π`,
            'Active Tournaments': analytics.activeTournaments,
          }).map(([label, value], idx) => (
            <Card key={idx} className="bg-card/50 border border-border">
              <CardContent className="pt-6">
                <div className="text-muted-foreground text-sm">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tournaments Table */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Trophy /> Tournaments
            </CardTitle>
            <Button onClick={() => setShowCreateForm((p) => !p)} className="gap-2">
              <Plus /> New Tournament
            </Button>
          </CardHeader>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-muted/30 rounded mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newTournament.name}
                    onChange={(e) => setNewTournament((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newTournament.description}
                    onChange={(e) => setNewTournament((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Entry Fee</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTournament.entry_fee}
                    onChange={(e) => setNewTournament((p) => ({ ...p, entry_fee: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Prize Pool</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newTournament.prize_pool}
                    onChange={(e) => setNewTournament((p) => ({ ...p, prize_pool: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Duration (h)</Label>
                  <Input
                    type="number"
                    value={newTournament.duration_hours}
                    onChange={(e) => setNewTournament((p) => ({ ...p, duration_hours: parseInt(e.target.value) || 24 }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createTournament} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entry Fee</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell className={getStatusColor(t.status)}>{t.status}</TableCell>
                    <TableCell>{t.entry_fee} π</TableCell>
                    <TableCell className="text-gold font-bold">{t.prize_pool} π</TableCell>
                    <TableCell>{new Date(t.start_time).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(t.end_time).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {t.status === 'active' && (
                        <Button size="sm" variant="destructive" onClick={() => endTournament(t.id)}>
                          End
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
