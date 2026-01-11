import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, BarChart3, Plus, RefreshCw, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  totalNFTs: number;
  dailyRewardsClaimed: number;
  activeBoosts: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [analytics, setAnalytics] = useState<WalletAnalytics>({
    totalUsers: 0,
    totalSpins: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    jackpotAmount: 0,
    activeTournaments: 0,
    totalNFTs: 0,
    dailyRewardsClaimed: 0,
    activeBoosts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    entry_fee: 0.1,
    prize_pool: 10,
    duration_hours: 24,
  });

  useEffect(() => {
    fetchData();
  }, []);

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
        { data: nftsData },
        { data: dailyRewardsData },
        { data: boostsData },
      ] = await Promise.all([
        supabase.from('profiles').select('', { count: 'exact', head: true }),
        supabase.from('spins').select('', { count: 'exact', head: true }),
        supabase.from('deposits').select('amount').eq('status', 'completed'),
        supabase.from('withdrawals').select('amount').eq('status', 'completed'),
        supabase.from('jackpot').select('total_pi').single(),
        supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
        supabase.from('nfts').select('*'),
        supabase.from('daily_rewards').select('*').eq('claimed', true),
        supabase.from('boosts').select('*').eq('active', true),
      ]);

      const totalDeposits = depositsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const totalWithdrawals = withdrawalsData?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const activeTournaments = tournamentsData?.filter(t => t.status === 'active').length || 0;

      setAnalytics({
        totalUsers: usersCount || 0,
        totalSpins: spinsCount || 0,
        totalDeposits,
        totalWithdrawals,
        jackpotAmount: Number(jackpotData?.total_pi) || 0,
        activeTournaments,
        totalNFTs: nftsData?.length || 0,
        dailyRewardsClaimed: dailyRewardsData?.length || 0,
        activeBoosts: boostsData?.length || 0,
      });

      setTournaments(tournamentsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
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
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
    } finally { setIsCreating(false); }
  };

  const endTournament = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('end-tournament', {
        body: { tournament_id: tournamentId },
      });
      if (error) throw error;
      toast.success(`Tournament ended! Prizes distributed to ${data.winners?.length || 0} winners`);
      fetchData();
    } catch (error) {
      console.error('Error ending tournament:', error);
      toast.error('Failed to end tournament');
    }
  };

  const runCronJob = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cron-end-tournaments');
      if (error) throw error;
      toast.success(`Cron job completed! Processed ${data.tournaments_processed} tournaments`);
      fetchData();
    } catch (error) {
      console.error('Error running cron:', error);
      toast.error('Failed to run cron job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'completed': return 'text-muted-foreground';
      case 'upcoming': return 'text-blue-500';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-pi-purple" /> Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage tournaments, wallet, NFTs, boosts & analytics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={runCronJob} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Run Cron
            </Button>
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries({
            Users: analytics.totalUsers,
            'Total Spins': analytics.totalSpins,
            Deposits: `${analytics.totalDeposits.toFixed(2)} π`,
            Withdrawals: `${analytics.totalWithdrawals.toFixed(2)} π`,
            Jackpot: `${analytics.jackpotAmount.toFixed(2)} π`,
            'Active Tournaments': analytics.activeTournaments,
            'NFTs': analytics.totalNFTs,
            'Daily Rewards': analytics.dailyRewardsClaimed,
            'Active Boosts': analytics.activeBoosts,
          }).map(([label, value], idx) => (
            <Card key={idx} className="bg-card/50 border-border">
              <CardContent className="pt-6">
                {isLoading ? <div className="animate-pulse h-12 w-full bg-muted rounded-lg"></div> :
                  <>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <span className="text-sm">{label}</span>
                    </div>
                    <p className="text-2xl font-bold">{value}</p>
                  </>}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Tournament Management */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" /> Tournament Management
            </CardTitle>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
              <Plus className="w-4 h-4" /> New Tournament
            </Button>
          </CardHeader>
          <CardContent>
            {showCreateForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-muted/30 rounded-lg">
                {isCreating ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="h-12 bg-muted rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={newTournament.name} onChange={e => setNewTournament(p => ({ ...p, name: e.target.value }))} placeholder="Tournament name" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" value={newTournament.description} onChange={e => setNewTournament(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
                    </div>
                    <div>
                      <Label htmlFor="entry_fee">Entry Fee (π)</Label>
                      <Input id="entry_fee" type="number" step="0.01" value={newTournament.entry_fee} onChange={e => setNewTournament(p => ({ ...p, entry_fee: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div>
                      <Label htmlFor="prize_pool">Prize Pool (π)</Label>
                      <Input id="prize_pool" type="number" step="0.1" value={newTournament.prize_pool} onChange={e => setNewTournament(p => ({ ...p, prize_pool: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input id="duration" type="number" value={newTournament.duration_hours} onChange={e => setNewTournament(p => ({ ...p, duration_hours: parseInt(e.target.value) || 24 }))} />
                    </div>
                  </div>
                )}
                {!isCreating && (
                  <div className="flex gap-2">
                    <Button onClick={createTournament}>Create Tournament</Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tournaments Table */}
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
                {isLoading ? Array.from({ length: 3 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, i) => (
                      <TableCell key={i}><div className="h-4 w-full bg-muted rounded" /></TableCell>
                    ))}
                  </TableRow>
                )) : tournaments.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell><span className={`font-semibold ${getStatusColor(t.status || 'upcoming')}`}>{t.status || 'upcoming'}</span></TableCell>
                    <TableCell>{t.entry_fee} π</TableCell>
                    <TableCell className="text-gold font-bold">{t.prize_pool} π</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(t.start_time).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(t.end_time).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {t.status === 'active' && <Button size="sm" variant="destructive" onClick={() => endTournament(t.id)}>End</Button>}
                      {t.status === 'upcoming' && <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/>Scheduled</span>}
                      {t.status === 'completed' && <span className="text-sm text-green-500">✓ Done</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
