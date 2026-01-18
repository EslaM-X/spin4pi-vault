import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, ArrowUpRight, ShieldCheck, Info, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  piUsername: string;
  currentBalance: number;
  onWithdrawSuccess: () => void;
}

export function WithdrawModal({ isOpen, onClose, piUsername, currentBalance, onWithdrawSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (withdrawAmount < 0.1) {
      toast.error("Minimum withdrawal is 0.1 Pi");
      return;
    }

    if (withdrawAmount > currentBalance) {
      toast.error("Insufficient balance in your Imperial account");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('withdraw-pi', {
        body: { pi_username: piUsername, amount: withdrawAmount }
      });

      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Bridge connection failed");
        return;
      }

      toast.success(`Success! ${withdrawAmount} Pi is on its way to your wallet.`);
      setAmount("");
      onWithdrawSuccess();
      onClose();
    } catch (err) {
      toast.error("Critical error in Bridge Protocol");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d12] border-2 border-gold/20 rounded-[2.5rem] p-0 overflow-hidden backdrop-blur-2xl max-w-md">
        {/* Header Section */}
        <div className="bg-gradient-to-b from-gold/10 to-transparent p-8 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                <ArrowUpRight className="w-6 h-6 text-gold" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-xl italic uppercase tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                  Withdraw <span className="text-gold">Assets</span>
                </span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Pi Mainnet Bridge v2</span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-8 pt-2 space-y-6">
          {/* Balance Display Card */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
               <Wallet className="w-12 h-12 text-gold" />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Available for Transfer</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white italic" style={{ fontFamily: 'Cinzel, serif' }}>
                {currentBalance.toFixed(2)}
              </span>
              <span className="text-sm font-black text-gold">π</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Amount to Bridge</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setAmount((currentBalance * 0.5).toFixed(2))}
                  className="text-[9px] font-black text-gold hover:text-white transition-colors"
                >
                  [ 50% ]
                </button>
                <button 
                  onClick={() => setAmount(currentBalance.toFixed(2))}
                  className="text-[9px] font-black text-gold hover:text-white transition-colors"
                >
                  [ MAX ]
                </button>
              </div>
            </div>
            
            <div className="relative group">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 bg-white/5 border-white/10 rounded-2xl px-5 font-bold text-white text-lg focus:border-gold/50 focus:ring-0 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] font-black text-white/20 uppercase">Pi Token</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-1">
              <Info className="w-3 h-3 text-gold/40" />
              <p className="text-[9px] font-bold text-white/30 uppercase">Minimum: 0.1 Pi | Network Fee: 0.01 Pi</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5" />
            <p className="text-[9px] text-emerald-500/60 font-bold uppercase leading-relaxed">
              Your transaction is protected by Pi Network's end-to-end encryption. Funds will arrive directly in your Pi Wallet.
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleWithdraw}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="w-full h-14 bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-gold/10 group overflow-hidden"
          >
            {isLoading ? (
              <Zap className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Confirm Bridge Transfer <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
