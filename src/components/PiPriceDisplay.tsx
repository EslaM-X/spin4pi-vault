import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface PriceData {
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export function PiPriceDisplay() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Use a proxy or simulated price for demo
        // In production, use your Supabase Edge Function as proxy
        const mockPrice = 30 + (Math.random() * 5 - 2.5); // Simulate price around $30
        const mockChange = (Math.random() * 10 - 5); // -5% to +5%
        
        const newPrice = parseFloat(mockPrice.toFixed(4));
        
        if (previousPrice !== null) {
          if (newPrice > previousPrice) {
            setTrend('up');
          } else if (newPrice < previousPrice) {
            setTrend('down');
          } else {
            setTrend('stable');
          }
        }
        
        setPreviousPrice(priceData?.price ?? null);
        setPriceData({
          price: newPrice,
          change24h: mockChange,
          lastUpdated: new Date(),
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch Pi price:', error);
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [priceData?.price, previousPrice]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
        <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!priceData) return null;

  const isPositive = priceData.change24h >= 0;
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
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
          key={priceData.price}
          initial={{ opacity: 0, y: trend === 'up' ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: trend === 'up' ? -10 : 10 }}
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
