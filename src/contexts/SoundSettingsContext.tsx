import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SoundSettingsContextType {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  getEffectiveVolume: () => number;
}

const SoundSettingsContext = createContext<SoundSettingsContextType | null>(null);

export function SoundSettingsProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem("spin4pi-volume");
    return saved ? parseFloat(saved) : 0.5;
  });
  
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem("spin4pi-muted");
    return saved === "true";
  });

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem("spin4pi-volume", clampedVolume.toString());
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      localStorage.setItem("spin4pi-muted", newMuted.toString());
      return newMuted;
    });
  }, []);

  const getEffectiveVolume = useCallback(() => {
    return isMuted ? 0 : volume;
  }, [isMuted, volume]);

  return (
    <SoundSettingsContext.Provider value={{ volume, isMuted, setVolume, toggleMute, getEffectiveVolume }}>
      {children}
    </SoundSettingsContext.Provider>
  );
}

export function useSoundSettings() {
  const context = useContext(SoundSettingsContext);
  if (!context) {
    throw new Error("useSoundSettings must be used within a SoundSettingsProvider");
  }
  return context;
}
