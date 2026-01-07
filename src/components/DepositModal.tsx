import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { piSDK } from "@/lib/pi-sdk";
import { supabase } from "@/integrations/supabase/client";

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
      toast.error("Enter a valid amount");
      return;
    }

    if (!piSDK.isAvailable()) {
      toast.error("Pi Network not available");
      return;
    }

    setIsProcessing(true);

    const callbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        const { error } = await supabase.functions.invoke("deposit-pi", {
          body: { payment_id: paymentId, pi_username: username, amount: depositAmount },
        });
        if (error) {
          toast.error("Deposit approval failed");
          setIsProcessing(false);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        const { data, error } = await supabase.functions.invoke("complete-deposit", {
          body: { payment_id: paymentId, txid },
        });
        if (error || !data?.success) {
          toast.error("Deposit completion failed");
        } else {
          toast.success(`Deposited ${depositAmount} π to wallet!`);
          onSuccess();
          onClose();
        }
        setIsProcessing(false);
      },
      onCancel: () => {
        toast.info("Deposit cancelled");
        setIsProcessing(false);
      },
      onError: (error: Error) => {
        toast.error("Deposit failed: " + error.message);
        setIsProcessing(false);
      },
    };

    await piSDK.createPayment(depositAmount, "Spin4Pi Wallet Deposit", { type: "deposit" }, callbacks);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold" />
            Deposit Pi to Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <Button key={a} variant={amount === a && !customAmount ? "default" : "outline"} onClick={() => { setAmount(a); setCustomAmount(""); }}>
                {a} π
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" placeholder="Custom amount" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="flex-1" />
            <span className="text-muted-foreground">π</span>
          </div>
          <Button className="w-full" onClick={handleDeposit} disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Deposit ${customAmount || amount} π`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
