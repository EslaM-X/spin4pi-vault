import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Mail, Flame, ShieldCheck, Zap, Send } from "lucide-react";
import { motion } from "framer-motion";

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  piUsername: string;
}

export function NotificationSettings({ isOpen, onClose, piUsername }: NotificationSettingsProps) {
  const [email, setEmail] = useState("");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakWarning, setStreakWarning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // تحميل الإعدادات المحفوظة عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('notification_email') || "";
      const savedDaily = localStorage.getItem('daily_reminder') !== 'false';
      const savedStreak = localStorage.getItem('streak_warning') !== 'false';
      
      setEmail(savedEmail);
      setDailyReminder(savedDaily);
      setStreakWarning(savedStreak);
    }
  }, [isOpen]);

  const handleTestEmail = async (type: 'daily_reset' | 'streak_warning') => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid Imperial Mail address");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-streak-reminder', {
        body: { 
          pi_username: piUsername, 
          email,
          reminder_type: type 
        }
      });

      if (error || data?.error) {
        throw new Error(data?.error || "Connection to Oracle failed");
      }

      toast.success(`Imperial Messenger dispatched: ${type === 'daily_reset' ? 'Daily Reset' : 'Streak Alert'} sent!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send dispatch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('notification_email', email);
    localStorage.setItem('daily_reminder', String(dailyReminder));
    localStorage.setItem('streak_warning', String(streakWarning));
    
    toast.success("Imperial records updated successfully!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0d12] border-2 border-gold/20 shadow-[0_0_50px_rgba(0,0,0,0.9)] sm:max-w-[450px] overflow-hidden rounded-[2.5rem]">
        {/* Background Aura */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-3 text-gold italic uppercase tracking-widest text-xl" style={{ fontFamily: 'Cinzel, serif' }}>
            <div className="p-2 bg-gold/10 rounded-lg border border-gold/20">
              <Bell className="w-5 h-5 text-gold" />
            </div>
            Communications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-6 relative z-10">
          {/* Email Section */}
          <div className="space-y-3">
            <Label className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-black ml-1">Imperial Dispatch Mail</Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-gold/40 group-focus-within:text-gold transition-colors" />
              </div>
              <Input
                type="email"
                placeholder="emperor@pi-network.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.03] border-white/10 pl-11 h-12 rounded-xl text-white placeholder:text-white/10 focus:border-gold/50 focus:ring-gold/20 transition-all"
              />
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-gold/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold/10 rounded-xl">
                  <Zap className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white group-hover:text-gold transition-colors">Daily Reward Ping</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-tighter">Instant alert on treasury reset</p>
                </div>
              </div>
              <Switch
                checked={dailyReminder}
                onCheckedChange={setDailyReminder}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-orange-500/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white group-hover:text-orange-500 transition-colors">Streak Guardian</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-tighter">Danger alerts before fire dies</p>
                </div>
              </div>
              <Switch
                checked={streakWarning}
                onCheckedChange={setStreakWarning}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          </div>

          {/* Test System */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 space-y-3">
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest text-center">Test Transmission</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTestEmail('daily_reset')}
                disabled={isLoading || !email}
                className="flex-1 text-[10px] h-9 border border-white/5 hover:bg-gold/10 hover:text-gold"
              >
                <Send className="w-3 h-3 mr-2" />
                Daily
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTestEmail('streak_warning')}
                disabled={isLoading || !email}
                className="flex-1 text-[10px] h-9 border border-white/5 hover:bg-orange-500/10 hover:text-orange-500"
              >
                <Send className="w-3 h-3 mr-2" />
                Streak
              </Button>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={!email || isLoading}
            className="w-full h-14 bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition-all hover:scale-[1.02] active:scale-95"
          >
            {isLoading ? "Updating Records..." : "Establish Communication"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
