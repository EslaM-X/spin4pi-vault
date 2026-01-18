import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// استيراد شعار باي
import piLogo from "@/assets/pinetwork.jpg";

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
        console.error('Price Sync Error:', error);
        setIsLoading(false);
      }
    };

    fetchPrice();
    fetchIntervalRef.current = setInterval(fetchPrice, 30000);
    return () => { if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current); };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center px-2 py-1 bg-white/5 border border-white/5 rounded-lg">
        <RefreshCw className="w-3 h-3 animate-spin text-gold/40" />
      </div>
    );
  }

  const isPositive = priceData && priceData.change24h >= 0;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const statusColor = isPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 px-2 py-1 bg-[#0d0d12]/80 border border-white/10 rounded-xl shadow-sm group hover:border-gold/30 transition-all"
    >
      {/* شعار باي المصغر بدل النص */}
      <div className="w-5 h-5 rounded-full overflow-hidden border border-gold/20 flex-shrink-0">
        <img src={piLogo} alt="Pi" className="w-full h-full object-cover" />
      </div>
      
      {/* عرض السعر بحجم أصغر */}
      <div className="flex items-center gap-1.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={priceData?.price}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="flex items-baseline"
          >
            <span className="text-[10px] font-bold text-white/30 mr-0.5">$</span>
            <span className="text-xs font-black text-white italic leading-none">
              {priceData?.price.toFixed(2)}
            </span>
          </motion.div>
        </AnimatePresence>
        
        {/* نسبة التغير مصغرة جداً */}
        <div className={`flex items-center gap-0.5 ${statusColor} bg-white/5 px-1 rounded-md`}>
          <TrendIcon className="w-2.5 h-2.5" />
          <span className="text-[9px] font-black tracking-tighter">
            {Math.abs(priceData?.change24h || 0).toFixed(1)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
