import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Copy, Gift, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReferralPanelProps {
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
}

export function ReferralPanel({ referralCode, referralCount, referralEarnings }: ReferralPanelProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div className="bg-card border border-border rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-pi-purple" />
        <h3 className="font-display font-bold text-lg">Invite Friends</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Share your link and earn 0.5 π for each friend who joins!</p>
      <div className="bg-muted rounded-lg p-3 flex items-center gap-2 mb-4">
        <code className="flex-1 text-sm truncate">{referralLink}</code>
        <Button size="sm" variant="ghost" onClick={copyLink}>
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-pi-purple">{referralCount}</div>
          <div className="text-xs text-muted-foreground">Friends Invited</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold text-gold">{referralEarnings.toFixed(2)} π</div>
          <div className="text-xs text-muted-foreground">Total Earned</div>
        </div>
      </div>
    </motion.div>
  );
}
