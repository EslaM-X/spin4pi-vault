import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, ArrowUpRight } from "lucide-react";

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
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('withdraw-pi', {
        body: { pi_username: piUsername, amount: withdrawAmount }
      });

      if (error || data?.error) {
        toast.error(data?.error || error?.message || "Withdrawal failed");
        return;
      }

      toast.success(`Withdrawal of ${withdrawAmount} Pi initiated!`);
      setAmount("");
      onWithdrawSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to process withdrawal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ArrowUpRight className="w-5 h-5 text-primary" />
            Withdraw Pi
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="text-xl font-bold text-primary flex items-center gap-1">
                <Wallet className="w-4 h-4" />
                {currentBalance.toFixed(2)} π
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Amount to Withdraw</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.1"
              step="0.01"
              max={currentBalance}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">Minimum withdrawal: 0.1 Pi</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAmount((currentBalance * 0.5).toFixed(2))}
              className="flex-1"
            >
              50%
            </Button>
            <Button
              variant="outline"
              onClick={() => setAmount(currentBalance.toFixed(2))}
              className="flex-1"
            >
              Max
            </Button>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Processing..." : "Withdraw Pi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
