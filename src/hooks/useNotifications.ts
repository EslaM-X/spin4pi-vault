import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ReminderType =
  | "daily_reset"
  | "streak_warning"
  | "tournament_end";

interface SendReminderPayload {
  pi_username?: string;
  email: string;
  reminder_type: ReminderType;
  extra?: Record<string, any>;
}

export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ===== Generic Edge Function Caller =====
  const sendReminder = useCallback(
    async (payload: SendReminderPayload) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "send-streak-reminder",
          { body: payload }
        );

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Notification error:", error);
        toast({
          title: "Notification failed",
          description:
            error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // ===== Daily Reminder =====
  const sendDailyReminder = useCallback(
    async (piUsername: string, email: string) => {
      const result = await sendReminder({
        pi_username: piUsername,
        email,
        reminder_type: "daily_reset",
      });

      if (result) {
        toast({
          title: "Daily reminder sent",
          description: "Check your email for today's reward reminder.",
        });
      }

      return result;
    },
    [sendReminder, toast]
  );

  // ===== Streak Warning =====
  const sendStreakWarning = useCallback(
    async (piUsername: string, email: string) => {
      const result = await sendReminder({
        pi_username: piUsername,
        email,
        reminder_type: "streak_warning",
      });

      if (result) {
        toast({
          title: "Streak warning sent",
          description: "Your streak is about to reset!",
        });
      }

      return result;
    },
    [sendReminder, toast]
  );

  // ===== Tournament Alert =====
  const sendTournamentEndAlert = useCallback(
    async (
      email: string,
      tournamentName: string,
      position: number,
      prize: number
    ) => {
      const result = await sendReminder({
        email,
        reminder_type: "tournament_end",
        extra: {
          tournamentName,
          position,
          prize,
        },
      });

      if (result) {
        toast({
          title: "Tournament results sent",
          description: `${tournamentName} results have been emailed.`,
        });
      }

      return result;
    },
    [sendReminder, toast]
  );

  // ===== Browser Notification Permission =====
  const requestBrowserNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not supported",
        description: "Your browser does not support notifications.",
        variant: "destructive",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === "granted";

    toast({
      title: granted ? "Notifications enabled" : "Notifications blocked",
      description: granted
        ? "You will receive spin reminders."
        : "Enable notifications from browser settings.",
      variant: granted ? "default" : "destructive",
    });

    return granted;
  }, [toast]);

  // ===== Local Notification =====
  const showLocalNotification = useCallback(
    (title: string, body: string, icon?: string) => {
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(title, {
          body,
          icon: icon || "/favicon.ico",
          badge: "/favicon.ico",
          tag: "spin4pi",
        });
      }
    },
    []
  );

  // ===== Scheduled Reminder =====
  const scheduleSpinReminder = useCallback(
    (delayMs: number = 60 * 60 * 1000) => {
      setTimeout(() => {
        showLocalNotification(
          "🎰 Time to Spin!",
          "Your next spin is ready. Come back and win Pi!"
        );
      }, delayMs);
    },
    [showLocalNotification]
  );

  return {
    isLoading,
    sendDailyReminder,
    sendStreakWarning,
    sendTournamentEndAlert,
    requestBrowserNotificationPermission,
    showLocalNotification,
    scheduleSpinReminder,
  };
}
