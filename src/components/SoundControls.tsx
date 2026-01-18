import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Zap, SlidersHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export const SoundControls = forwardRef((props, ref) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showSlider, setShowSlider] = useState(false);
  
  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // وظيفة التلاشي (Fade Out) الاحترافية عند الخروج
  const fadeOutAndPause = () => {
    if (!bgMusic.current) return;
    
    const fadeInterval = setInterval(() => {
      if (bgMusic.current && bgMusic.current.volume > 0.05) {
        bgMusic.current.volume -= 0.05;
      } else {
        if (bgMusic.current) {
          bgMusic.current.pause();
          bgMusic.current.volume = volume / 100;
        }
        clearInterval(fadeInterval);
      }
    }, 100);
  };

  useImperativeHandle(ref, () => ({
    fadeOut: fadeOutAndPause
  }));

  useEffect(() => {
    // موسيقى فخمة (Tech House تناسب أجواء العملات الرقمية)
    const musicUrl = "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3";
    bgMusic.current = new Audio(musicUrl);
    bgMusic.current.loop = true;
    bgMusic.current.volume = volume / 100;

    const playMusic = () => {
      if (!isMuted && bgMusic.current) {
        bgMusic.current.play().catch(() => {});
      }
    };

    // تشغيل الموسيقى عند أول تفاعل للمستخدم (شرط المتصفحات)
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
    timerRef.current = setTimeout(() => setShowSlider(false), 8000);
  };

  return (
    <div className="relative flex items-center gap-1.5 p-1 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-md">
      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="absolute right-full mr-3 flex items-center gap-3 bg-[#0d0d12]/95 border border-gold/20 p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50"
          >
            <div className="p-1.5 bg-gold/10 rounded-lg">
              <Zap size={12} className="text-gold animate-pulse" />
            </div>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(val) => { 
                setVolume(val[0]); 
                setIsMuted(val[0] === 0); 
                resetTimer(); 
              }}
              className="w-24 cursor-pointer"
            />
            <span className="text-[10px] font-black text-gold italic w-8 text-center">{isMuted ? 0 : volume}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* زر التحكم في عرض المنزلق */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setShowSlider(!showSlider); if(!showSlider) resetTimer(); }}
        className={`h-9 w-9 rounded-xl transition-all duration-500 ${
          showSlider 
          ? 'bg-gold text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
          : 'bg-white/5 text-gold/60 hover:bg-gold/10 hover:text-gold'
        }`}
      >
        {isMuted ? <VolumeX size={18} /> : <SlidersHorizontal size={18} className={showSlider ? "rotate-90 transition-transform" : ""} />}
      </Button>

      {/* زر الموسيقى / كتم الصوت السريع */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setIsMuted(!isMuted); resetTimer(); }}
        className={`h-9 w-9 rounded-xl border transition-all duration-500 ${
          isMuted 
          ? 'border-red-500/20 bg-red-500/10 text-red-500' 
          : 'border-white/5 bg-white/5 text-white/40 hover:text-gold hover:border-gold/20'
        }`}
      >
        <Music size={14} className={!isMuted ? "animate-spin-slow text-gold shadow-gold" : ""} />
      </Button>
    </div>
  );
});

SoundControls.displayName = "SoundControls";
