import { useEffect, useCallback } from 'react';
import { useSoundSettings } from '@/contexts/SoundSettingsContext';

interface ShortcutHandlers {
  onSpin?: () => void;
  onFreeSpin?: () => void;
  canSpin?: boolean;
}

export function useKeyboardShortcuts({ onSpin, onFreeSpin, canSpin = true }: ShortcutHandlers) {
  const { isMuted, toggleMute } = useSoundSettings();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    // M - Toggle mute
    if (event.key === 'm' || event.key === 'M') {
      event.preventDefault();
      toggleMute();
      return;
    }

    // Space - Spin (if available)
    if (event.code === 'Space' && canSpin) {
      event.preventDefault();
      onSpin?.();
      return;
    }

    // F - Free spin
    if ((event.key === 'f' || event.key === 'F') && canSpin) {
      event.preventDefault();
      onFreeSpin?.();
      return;
    }

    // Number keys 1-4 for different spin types
    if (event.key >= '1' && event.key <= '4' && canSpin) {
      event.preventDefault();
      onSpin?.();
      return;
    }
  }, [toggleMute, onSpin, onFreeSpin, canSpin]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: [
      { key: 'Space', action: 'Spin the wheel' },
      { key: 'F', action: 'Use free spin' },
      { key: 'M', action: isMuted ? 'Unmute sounds' : 'Mute sounds' },
    ],
  };
}
