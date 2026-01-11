import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  email: string | null;
  dailyReminder: boolean;
  streakWarning: boolean;
  tournamentAlerts: boolean;
}

export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendDailyReminder = useCallback(async (
    piUsername: string,
    email: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-streak-reminder', {
        body: {
          pi_username: piUsername,
          email,
          reminder_type: 'daily_reset'
        }
      });

      if (error) throw error;

      toast({
        title: "Reminder sent!",
        description: "Check your email for the daily reward notification.",
      });

      return data;
    } catch (error) {
      console.error('Failed to send daily reminder:', error);
      toast({
        title: "Failed to send reminder",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendStreakWarning = useCallback(async (
    piUsername: string,
    email: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-streak-reminder', {
        body: {
          pi_username: piUsername,
          email,
          reminder_type: 'streak_warning'
        }
      });

      if (error) throw error;

      toast({
        title: "Streak warning sent!",
        description: "Check your email for the streak warning.",
      });

      return data;
    } catch (error) {
      console.error('Failed to send streak warning:', error);
      toast({
        title: "Failed to send warning",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const sendTournamentEndAlert = useCallback(async (
    email: string,
    tournamentName: string,
    position: number,
    prize: number
  ) => {
    setIsLoading(true);
    try {
      // Use the existing send-streak-reminder with tournament data
      // In production, create a dedicated tournament notification function
      const { data, error } = await supabase.functions.invoke('send-streak-reminder', {
        body: {
          email,
          reminder_type: 'daily_reset', // Reuse existing template for now
          pi_username: `Tournament: ${tournamentName}`,
        }
      });

      if (error) throw error;

      toast({
        title: "Tournament alert sent!",
        description: `Notification sent for ${tournamentName} results.`,
      });

      return data;
    } catch (error) {
      console.error('Failed to send tournament alert:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const requestBrowserNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled!",
          description: "You'll receive spin reminders and alerts.",
        });
        return true;
      } else {
        toast({
          title: "Notifications blocked",
          description: "Enable notifications in your browser settings.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }, [toast]);

  const showLocalNotification = useCallback((title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'spin4pi-notification'
      });
    }
  }, []);

  const scheduleSpinReminder = useCallback((delay: number = 3600000) => {
    // Schedule a local notification after delay (default 1 hour)
    setTimeout(() => {
      showLocalNotification(
        '🎰 Time to Spin!',
        'Your next spin is ready. Come back and win Pi!'
      );
    }, delay);
  }, [showLocalNotification]);

  return {
    isLoading,
    sendDailyReminder,
    sendStreakWarning,
    sendTournamentEndAlert,
    requestBrowserNotificationPermission,
    showLocalNotification,
    scheduleSpinReminder
  };
}
