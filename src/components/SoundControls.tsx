import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { Slider } from "@/components/ui/slider";

export function SoundControls() {
  const { volume, isMuted, setVolume, toggleMute } = useSoundSettings();
  const [isOpen, setIsOpen] = useState(false);

  const VolumeIcon = isMuted ? VolumeX : volume > 0.5 ? Volume2 : Volume1;

  return (
    <div className="relative">
      {/* Mute/Volume button */}
      <motion.button
        onClick={toggleMute}
        onMouseEnter={() => setIsOpen(true)}
        className={`p-2 rounded-full transition-colors ${
          isMuted 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-gradient-to-r from-pi-purple/20 to-card text-pi-purple-glow'
        } border border-pi-purple/30 hover:border-pi-purple/50`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        <VolumeIcon className="w-5 h-5" />
      </motion.button>

      {/* Volume slider popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-xl shadow-xl z-50 min-w-[200px]"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Sound</span>
                <button
                  onClick={toggleMute}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isMuted 
                      ? 'bg-destructive/20 text-destructive' 
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {isMuted ? "Muted" : "On"}
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <VolumeX className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Slider
                  value={[volume * 100]}
                  onValueChange={([val]) => setVolume(val / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                  disabled={isMuted}
                />
                <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(volume * 100)}%
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
