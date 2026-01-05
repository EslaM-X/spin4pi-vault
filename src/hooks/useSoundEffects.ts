import { useCallback, useRef } from "react";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";

// Web Audio API-based sound effects
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const { getEffectiveVolume } = useSoundSettings();

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    // Update volume
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = getEffectiveVolume();
    }
    return { ctx: audioContextRef.current, masterGain: masterGainRef.current! };
  }, [getEffectiveVolume]);

  // Generate a spinning/whoosh sound
  const playSpinSound = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 3);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 4);
  }, [getAudioContext]);

  // Generate a tick sound for wheel segments
  const playTickSound = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  // Generate a win sound with ascending tones
  const playWinSound = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
      
      oscillator.start(ctx.currentTime + i * 0.15);
      oscillator.stop(ctx.currentTime + i * 0.15 + 0.5);
    });
  }, [getAudioContext]);

  // Generate a big win/jackpot sound
  const playJackpotSound = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    
    // Fanfare-style ascending notes
    const notes = [
      { freq: 392, time: 0 },      // G4
      { freq: 523.25, time: 0.1 }, // C5
      { freq: 659.25, time: 0.2 }, // E5
      { freq: 783.99, time: 0.3 }, // G5
      { freq: 1046.50, time: 0.5 }, // C6
    ];
    
    notes.forEach(({ freq, time }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + time + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.8);
      
      oscillator.start(ctx.currentTime + time);
      oscillator.stop(ctx.currentTime + time + 1);
    });
    
    // Add shimmer effect
    for (let i = 0; i < 8; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(2000 + Math.random() * 2000, ctx.currentTime + 0.6 + i * 0.1);
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime + 0.6 + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6 + i * 0.1 + 0.2);
      
      oscillator.start(ctx.currentTime + 0.6 + i * 0.1);
      oscillator.stop(ctx.currentTime + 0.6 + i * 0.1 + 0.3);
    }
  }, [getAudioContext]);

  // Generate a lose sound
  const playLoseSound = useCallback(() => {
    const { ctx, masterGain } = getAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }, [getAudioContext]);

  // Play sound based on result
  const playResultSound = useCallback((result: string) => {
    if (result === "LOSE") {
      playLoseSound();
    } else if (result === "JACKPOT_ENTRY") {
      playJackpotSound();
    } else {
      playWinSound();
    }
  }, [playLoseSound, playJackpotSound, playWinSound]);

  return {
    playSpinSound,
    playTickSound,
    playWinSound,
    playJackpotSound,
    playLoseSound,
    playResultSound,
  };
}
