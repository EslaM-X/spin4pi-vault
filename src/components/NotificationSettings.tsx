import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Mail, Flame } from "lucide-react";

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

  const handleTestEmail = async (type: 'daily_reset' | 'streak_warning') => {
    if (!email) {
      toast.error("Please enter your email address");
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
        toast.error(data?.error || "Failed to send test email");
        return;
      }

      toast.success(`Test ${type === 'daily_reset' ? 'daily reminder' : 'streak warning'} email sent!`);
    } catch (err) {
      toast.error("Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    // In a real app, save these settings to the database
    localStorage.setItem('notification_email', email);
    localStorage.setItem('daily_reminder', String(dailyReminder));
    localStorage.setItem('streak_warning', String(streakWarning));
    toast.success("Notification settings saved!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bell className="w-5 h-5 text-primary" />
            Notification Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email Address</Label>
            <div className="flex gap-2">
              <Mail className="w-5 h-5 text-muted-foreground mt-2.5" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We'll send reminders to this email
            </p>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Daily Reward Reminder</p>
                  <p className="text-xs text-muted-foreground">Get notified when your daily reward resets</p>
                </div>
              </div>
              <Switch
                checked={dailyReminder}
                onCheckedChange={setDailyReminder}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Streak Warning</p>
                  <p className="text-xs text-muted-foreground">Alert when your streak is about to break</p>
                </div>
              </div>
              <Switch
                checked={streakWarning}
                onCheckedChange={setStreakWarning}
              />
            </div>
          </div>

          {/* Test Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Send test email:</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestEmail('daily_reset')}
                disabled={isLoading || !email}
                className="flex-1"
              >
                Daily Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestEmail('streak_warning')}
                disabled={isLoading || !email}
                className="flex-1"
              >
                Streak Warning
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={!email}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
