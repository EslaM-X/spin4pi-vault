import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export function PiPriceDisplay() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-pi-price');
        
        if (error) throw error;

        const newPrice = data?.price || 0;
        const change24h = data?.change24h || 0;
        
        if (change24h > 0.1) setTrend('up');
        else if (change24h < -0.1) setTrend('down');
        else setTrend('stable');
        
        setPriceData({
          price: newPrice,
          change24h: change24h,
          lastUpdated: new Date(),
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Imperial Radar Error:', error);
        setIsLoading(false);
      }
    };

    fetchPrice();
    fetchIntervalRef.current = setInterval(fetchPrice, 30000);

    return () => {
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-md">
        <RefreshCw className="w-3 h-3 animate-spin text-gold/50" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Syncing Market...</span>
      </div>
    );
  }

  const isPositive = priceData && priceData.change24h >= 0;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const statusColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const glowColor = isPositive ? 'shadow-emerald-500/20' : 'shadow-red-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex items-center gap-3 px-4 py-1.5 bg-[#0d0d12]/60 border border-white/10 rounded-full backdrop-blur-xl transition-all duration-500 hover:border-gold/30 ${glowColor} shadow-lg`}
    >
      {/* البادئة الإمبراطورية */}
      <div className="flex items-center gap-1.5 border-r border-white/10 pr-2">
        <Activity className={`w-3 h-3 ${isPositive ? 'text-emerald-500' : 'text-red-500'} animate-pulse`} />
        <span className="text-[10px] font-black text-gold uppercase tracking-tighter">Pi Index</span>
      </div>
      
      {/* عرض السعر مع حركة أنميشن عند التغيير */}
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={priceData?.price}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-[10px] font-bold text-white/30">$</span>
            <span className="text-sm font-black text-white italic tracking-tight leading-none" style={{ fontFamily: 'Cinzel, serif' }}>
              {priceData?.price.toFixed(2)}
            </span>
          </motion.div>
        </AnimatePresence>
        
        {/* النسبة المئوية */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] ${statusColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span className="text-[10px] font-black tracking-tighter">
            {isPositive ? '+' : ''}{priceData?.change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* تأثير التوهج عند التحويم */}
      <div className="absolute inset-0 rounded-full bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
