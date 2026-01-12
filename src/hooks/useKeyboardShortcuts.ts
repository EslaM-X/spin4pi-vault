import { useEffect, useCallback } from "react";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";

interface ShortcutHandlers {
  onSpin?: () => void;
  onFreeSpin?: () => void;
  canSpin?: boolean;
}

export function useKeyboardShortcuts({
  onSpin,
  onFreeSpin,
  canSpin = true,
}: ShortcutHandlers) {
  const { isMuted, toggleMute } = useSoundSettings();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // تجاهل لو المستخدم بيكتب
      const target = event.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      // M → Mute / Unmute
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
        return;
      }

      if (!canSpin) return;

      // Space → Spin
      if (event.code === "Space") {
        event.preventDefault();
        onSpin?.();
        return;
      }

      // F → Free Spin
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        onFreeSpin?.();
        return;
      }

      // 1 - 4 → Spin presets (مستقبلي)
      if (/^[1-4]$/.test(event.key)) {
        event.preventDefault();
        onSpin?.();
      }
    },
    [toggleMute, onSpin, onFreeSpin, canSpin]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: [
      { key: "Space", action: "Spin" },
      { key: "F", action: "Free Spin" },
      { key: "M", action: isMuted ? "Unmute Sounds" : "Mute Sounds" },
      { key: "1-4", action: "Spin Presets" },
    ],
  };
}
