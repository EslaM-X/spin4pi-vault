import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
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
  const previousPriceRef = useRef<number | null>(null);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Fetch from Edge Function proxy
        const { data, error } = await supabase.functions.invoke('get-pi-price');
        
        if (error) {
          console.error('Edge function error:', error);
          return;
        }

        const newPrice = data?.price || 0;
        const change24h = data?.change24h || 0;
        
        // Determine trend based on 24h change (more stable than real-time)
        if (change24h > 0.1) {
          setTrend('up');
        } else if (change24h < -0.1) {
          setTrend('down');
        } else {
          setTrend('stable');
        }
        
        previousPriceRef.current = newPrice;
        setPriceData({
          price: newPrice,
          change24h: change24h,
          lastUpdated: new Date(),
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch Pi price:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchPrice();
    
    // Update every 30 seconds (much slower, more stable)
    fetchIntervalRef.current = setInterval(fetchPrice, 30000);

    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
        <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!priceData || priceData.price === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
        <span className="text-xs font-medium text-muted-foreground">π</span>
        <span className="text-xs text-muted-foreground">--</span>
      </div>
    );
  }

  const isPositive = priceData.change24h >= 0;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors duration-500 ${
        isPositive 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-red-500/10 border-red-500/30'
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <span className="text-xs font-medium text-muted-foreground">π</span>
      
      <AnimatePresence mode="wait">
        <motion.span
          key={priceData.price.toFixed(2)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}
        >
          ${priceData.price.toFixed(2)}
        </motion.span>
      </AnimatePresence>
      
      <div className={`flex items-center gap-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <TrendIcon className="w-3 h-3" />
        <span className="text-xs font-medium">
          {isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%
        </span>
      </div>
    </motion.div>
  );
}
