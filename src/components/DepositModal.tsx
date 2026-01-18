import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowDownCircle, ShieldCheck, Zap, Coins, Loader2 } from "lucide-react";
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
      toast.error("Please enter a noble amount");
      return;
    }

    if (!piSDK.isAvailable()) {
      toast.error("Pi Network connection lost");
      return;
    }

    setIsProcessing(true);

    const callbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        const { error } = await supabase.functions.invoke("deposit-pi", {
          body: { payment_id: paymentId, pi_username: username, amount: depositAmount },
        });
        if (error) {
          toast.error("Imperial Approval Failed");
          setIsProcessing(false);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        const { data, error } = await supabase.functions.invoke("complete-deposit", {
          body: { payment_id: paymentId, txid },
        });
        if (error || !data?.success) {
          toast.error("Vault Synchronization Failed");
        } else {
          toast.success(`Success! ${depositAmount} π secured in vault.`);
          onSuccess();
          onClose();
        }
        setIsProcessing(false);
      },
      onCancel: () => {
        toast.info("Transaction Aborted");
        setIsProcessing(false);
      },
      onError: (error: Error) => {
        toast.error("System Error: " + error.message);
        setIsProcessing(false);
      },
    };

    await piSDK.createPayment(depositAmount, "Imperial Wallet Recharge", { type: "deposit" }, callbacks);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d12] border-gold/20 max-w-sm rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        
        {/* Header Decor */}
        <div className="bg-gradient-to-b from-gold/10 to-transparent p-8 text-center relative">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-16 h-16 bg-gold rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(251,191,36,0.3)] rotate-3"
          >
            <Wallet className="w-8 h-8 text-black" />
          </motion.div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter" style={{ fontFamily: 'Cinzel, serif' }}>
            Vault Recharge
          </h2>
          <p className="text-gold/50 font-bold text-[9px] uppercase tracking-[0.3em] mt-1">Secure Imperial Transaction</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {/* Quick Selection */}
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustomAmount(""); }}
                className={`py-3 rounded-xl border-2 transition-all font-black text-xs ${
                  amount === a && !customAmount 
                  ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:border-gold/40'
                }`}
              >
                {a}π
              </button>
            ))}
          </div>

          {/* Custom Input Area */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Coins className="w-4 h-4 text-gold/40 group-focus-within:text-gold transition-colors" />
            </div>
            <Input 
              type="number" 
              placeholder="Enter Custom Amount" 
              value={customAmount} 
              onChange={(e) => setCustomAmount(e.target.value)}
              className="pl-12 bg-white/5 border-white/10 rounded-2xl h-14 text-white font-bold placeholder:text-white/10 focus:border-gold/50 focus:ring-0 transition-all"
            />
          </div>

          {/* Security Features Info */}
          <div className="flex justify-between gap-2">
            {[
              { icon: ShieldCheck, label: "Secured" },
              { icon: Zap, label: "Instant" },
              { icon: ArrowDownCircle, label: "Official" }
            ].map((item, i) => (
              <div key={i} className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-2 flex flex-col items-center gap-1">
                <item.icon className="w-3 h-3 text-gold/40" />
                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button 
            className="w-full h-16 bg-gold hover:bg-gold-dark text-black font-black rounded-2xl text-sm shadow-[0_10px_30px_rgba(251,191,36,0.2)] transition-all active:scale-95 group"
            onClick={handleDeposit} 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2 uppercase tracking-widest">
                <Loader2 className="w-4 h-4 animate-spin" />
                Synchronizing...
              </div>
            ) : (
              <div className="flex items-center gap-2 uppercase tracking-[0.15em]">
                Initialize Deposit <Zap className="w-4 h-4 fill-black group-hover:animate-pulse" />
              </div>
            )}
          </Button>

          <p className="text-[8px] text-center text-white/20 font-bold uppercase tracking-[0.2em]">
            Transactions are processed via Pi Network Official SDK
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
