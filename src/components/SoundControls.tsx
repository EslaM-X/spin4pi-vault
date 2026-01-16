import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

// استخدمنا forwardRef لكي نتمكن من مناداة وظيفة التلاشي من خارج المكون (من زر الخروج)
export const SoundControls = forwardRef((props, ref) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showSlider, setShowSlider] = useState(false);
  
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // وظيفة التلاشي (Fade Out)
  const fadeOutAndPause = () => {
    if (!bgMusic.current) return;
    
    const fadeInterval = setInterval(() => {
      if (bgMusic.current && bgMusic.current.volume > 0.05) {
        bgMusic.current.volume -= 0.05; // خفض الصوت تدريجياً
      } else {
        if (bgMusic.current) {
          bgMusic.current.pause();
          bgMusic.current.volume = volume / 100; // إعادة ضبط الصوت للمرة القادمة
        }
        clearInterval(fadeInterval);
      }
    }, 100); // سرعة التلاشي (كل 100 مللي ثانية)
  };

  // تسمح لنا هذه الدالة بمناداة fadeOutAndPause من المكون الأب
  useImperativeHandle(ref, () => ({
    fadeOut: fadeOutAndPause
  }));

  useEffect(() => {
    const musicUrl = "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3";
    bgMusic.current = new Audio(musicUrl);
    bgMusic.current.loop = true;
    bgMusic.current.volume = volume / 100;

    const playMusic = () => {
      if (!isMuted && bgMusic.current) {
        bgMusic.current.play().catch(() => {});
      }
    };

    document.addEventListener('click', playMusic, { once: true });
    
    return () => {
      bgMusic.current?.pause();
      document.removeEventListener('click', playMusic);
    };
  }, []);

  useEffect(() => {
    if (bgMusic.current) {
      bgMusic.current.volume = isMuted ? 0 : volume / 100;
      if (isMuted) bgMusic.current.pause();
      else bgMusic.current.play().catch(() => {});
    }
  }, [volume, isMuted]);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowSlider(false), 10000);
  };

  return (
    <div className="relative flex items-center gap-2">
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-full mr-4 flex items-center gap-3 bg-black/90 backdrop-blur-2xl border border-purple-500/30 p-3 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            <Zap size={14} className="text-yellow-500 animate-pulse" />
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              onValueChange={(val) => { setVolume(val[0]); setIsMuted(val[0] === 0); resetTimer(); }}
              className="w-24 cursor-pointer"
            />
            <span className="text-[10px] font-black text-purple-400 w-8">{isMuted ? 0 : volume}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setShowSlider(!showSlider); if(!showSlider) resetTimer(); }}
        className={`h-10 w-10 rounded-xl transition-all ${
          showSlider ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-purple-400 hover:bg-white/10'
        }`}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setIsMuted(!isMuted); resetTimer(); }}
        className={`h-10 w-10 rounded-xl border transition-all ${
          isMuted ? 'border-red-500/40 bg-red-500/10 text-red-500' : 'border-white/5 text-white/20 hover:text-white'
        }`}
      >
        <Music size={16} className={!isMuted ? "animate-spin-slow" : ""} />
      </Button>
    </div>
  );
});
