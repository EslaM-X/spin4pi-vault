import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePiAuth } from "@/hooks/usePiAuth";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  txid: string | null;
}

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, authenticate } = usePiAuth();

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
    }
  }, [user]);

  const fetchWithdrawals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First get the profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('pi_username', user.username)
        .single();

      if (profile) {
        const { data } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false });

        setWithdrawals(data || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-amber-500 bg-amber-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />
      
      <Header 
        isLoggedIn={isAuthenticated} 
        username={user?.username || null} 
        balance={0} 
        onLogin={authenticate}
      />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Back Button */}
        <Link to="/profile">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <ArrowUpRight className="w-8 h-8 text-primary" />
            Withdrawal History
          </h1>
          <p className="text-muted-foreground mt-2">Track your Pi withdrawals and their status</p>
        </motion.div>

        {/* Withdrawals List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-4">Loading withdrawals...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <ArrowUpRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No withdrawals yet</h3>
              <p className="text-muted-foreground mt-2">Your withdrawal history will appear here</p>
            </div>
          ) : (
            withdrawals.map((withdrawal, index) => (
              <motion.div
                key={withdrawal.id}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(withdrawal.status || 'pending')}
                    <div>
                      <p className="font-bold text-lg text-foreground">
                        {withdrawal.amount.toFixed(2)} π
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(withdrawal.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(withdrawal.status || 'pending')}`}>
                      {withdrawal.status || 'pending'}
                    </span>
                    {withdrawal.txid && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        TX: {withdrawal.txid.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
                {withdrawal.completed_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Completed: {formatDate(withdrawal.completed_at)}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Summary Stats */}
        {withdrawals.length > 0 && (
          <motion.div
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {withdrawals.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-green-500">
                {withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0).toFixed(2)} π
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">
                {withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0).toFixed(2)} π
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WithdrawalHistory;
