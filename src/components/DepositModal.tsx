import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowDownCircle, ShieldCheck, Zap, Coins, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { piSDK } from "@/lib/pi-sdk";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onSuccess: () => void;
}

const AMOUNTS = [1, 5, 10, 25];

export function DepositModal({ isOpen, onClose, username, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    const depositAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!depositAmount || depositAmount <= 0) {
      toast.error("Please enter a noble amount to proceed.");
      return;
    }

    if (!piSDK.isAvailable()) {
      toast.error("Pi Network connection lost. Re-open in Pi Browser.");
      return;
    }

    setIsProcessing(true);

    const callbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        const { error } = await supabase.functions.invoke("deposit-pi", {
          body: { payment_id: paymentId, pi_username: username, amount: depositAmount },
        });
        if (error) {
          toast.error("Imperial Approval Failed. Check your connection.");
          setIsProcessing(false);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        const { data, error } = await supabase.functions.invoke("complete-deposit", {
          body: { payment_id: paymentId, txid },
        });
        if (error || !data?.success) {
          toast.error("Vault Synchronization Failed. Contact support.");
        } else {
          toast.success(`Glory! ${depositAmount} π secured in your imperial vault.`);
          onSuccess();
          onClose();
        }
        setIsProcessing(false);
      },
      onCancel: () => {
        toast.info("Transaction Aborted by user.");
        setIsProcessing(false);
      },
      onError: (error: Error) => {
        toast.error("Bridge Error: " + error.message);
        setIsProcessing(false);
      },
    };

    await piSDK.createPayment(depositAmount, "Imperial Wallet Recharge", { type: "deposit" }, callbacks);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d12] border-2 border-gold/20 max-w-sm rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_80px_rgba(251,191,36,0.15)] outline-none">
        
        {/* Header Decor with Animated Shine */}
        <div className="bg-gradient-to-b from-gold/20 to-transparent p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 3 }}
            className="w-16 h-16 bg-gradient-to-br from-gold via-amber-500 to-gold rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-[0_10px_40px_rgba(251,191,36,0.4)] relative z-10"
          >
            <Wallet className="w-8 h-8 text-black" />
          </motion.div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter relative z-10" style={{ fontFamily: 'Cinzel, serif' }}>
            Vault <span className="text-gold">Recharge</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1 relative z-10">
            <div className="h-[1px] w-8 bg-gold/20" />
            <p className="text-gold/50 font-black text-[8px] uppercase tracking-[0.4em]">Mainnet Bridge</p>
            <div className="h-[1px] w-8 bg-gold/20" />
          </div>
        </div>

        <div className="px-8 pb-8 space-y-6 relative z-10">
          {/* Quick Selection Grid */}
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustomAmount(""); }}
                className={`py-3 rounded-xl border-2 transition-all duration-300 font-black text-xs relative overflow-hidden group ${
                  amount === a && !customAmount 
                  ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:border-gold/40 hover:text-white'
                }`}
              >
                {a}π
                {amount === a && !customAmount && (
                   <motion.div layoutId="activeSelect" className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Input Area */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Custom Tribute</p>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Coins className="w-4 h-4 text-gold/40 group-focus-within:text-gold transition-colors" />
              </div>
              <Input 
                type="number" 
                placeholder="Enter Amount" 
                value={customAmount} 
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 text-white font-bold placeholder:text-white/10 focus:border-gold/50 focus:ring-0 transition-all text-lg"
              />
            </div>
          </div>

          {/* Security Features Info */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: ShieldCheck, label: "Secured" },
              { icon: Zap, label: "Instant" },
              { icon: Sparkles, label: "Official" }
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl py-3 flex flex-col items-center gap-1.5 transition-colors hover:bg-white/[0.06]">
                <item.icon className="w-3.5 h-3.5 text-gold/60" />
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.15em]">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button 
            className="w-full h-16 bg-gold hover:bg-gold/90 text-black font-black rounded-2xl text-sm shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all active:scale-95 group relative overflow-hidden"
            onClick={handleDeposit} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-3 uppercase tracking-widest italic">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                Securing Vault...
              </div>
            ) : (
              <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
                Initialize Deposit <ArrowDownCircle className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </div>
            )}
          </Button>

          <div className="pt-2">
            <p className="text-[7px] text-center text-white/10 font-bold uppercase tracking-[0.3em] leading-relaxed">
              Imperial Bridge Protocol Active<br/>
              Verified by Pi Network Mainnet Nodes
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
