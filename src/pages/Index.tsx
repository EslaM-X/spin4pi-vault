import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SpinWheel } from "@/components/SpinWheel";
import { JackpotCounter } from "@/components/JackpotCounter";
import { SpinButtons } from "@/components/SpinButtons";
import { ResultModal } from "@/components/ResultModal";
import { Leaderboard } from "@/components/Leaderboard";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [jackpot, setJackpot] = useState(156.78);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [canFreeSpin, setCanFreeSpin] = useState(true);
  const [freeSpinTimer, setFreeSpinTimer] = useState("Available!");

  // Simulate Pi login
  const handleLogin = () => {
    // In production, this would use Pi.authenticate
    toast.success("Connecting to Pi Network...");
    setTimeout(() => {
      setIsLoggedIn(true);
      setUsername("PiUser_" + Math.floor(Math.random() * 10000));
      setBalance(5.25);
      toast.success("Welcome to Spin4Pi!");
    }, 1500);
  };

  // Handle spin completion
  const handleSpinComplete = (result: string) => {
    setLastResult(result);
    setShowResult(true);
    
    // Update jackpot
    setJackpot(prev => prev + 0.005);
    
    // Handle rewards
    if (result === "0.01_PI") {
      setBalance(prev => prev + 0.01);
    } else if (result === "0.05_PI") {
      setBalance(prev => prev + 0.05);
    }
  };

  // Handle spin button click
  const handleSpin = (type: string, cost: number) => {
    if (!isLoggedIn) {
      toast.error("Please login with Pi first!");
      return;
    }
    
    if (type === "free") {
      if (!canFreeSpin) {
        toast.error("Daily free spin not available yet!");
        return;
      }
      setCanFreeSpin(false);
      setFreeSpinTimer("23:59:59");
      toast.info("Using daily free spin!");
    } else {
      if (balance < cost) {
        toast.error("Insufficient Pi balance!");
        return;
      }
      setBalance(prev => prev - cost);
      setJackpot(prev => prev + cost * 0.05);
      toast.info(`Spinning for ${cost} π...`);
    }
  };

  // Timer effect for free spin
  useEffect(() => {
    if (!canFreeSpin) {
      const interval = setInterval(() => {
        setFreeSpinTimer(prev => {
          const parts = prev.split(':');
          let hours = parseInt(parts[0]);
          let mins = parseInt(parts[1]);
          let secs = parseInt(parts[2]);
          
          if (secs > 0) secs--;
          else if (mins > 0) { mins--; secs = 59; }
          else if (hours > 0) { hours--; mins = 59; secs = 59; }
          else {
            setCanFreeSpin(true);
            return "Available!";
          }
          
          return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [canFreeSpin]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-stars opacity-50 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-pi-purple/10 via-transparent to-transparent pointer-events-none" />
      
      <Header 
        isLoggedIn={isLoggedIn} 
        username={username} 
        balance={balance} 
        onLogin={handleLogin} 
      />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <motion.section
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gradient-gold">Spin</span>
            <span className="text-foreground">4</span>
            <span className="text-gradient-purple">Pi</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Spin Smart. Unlock Pi Value.
          </motion.p>
        </motion.section>

        {/* Jackpot */}
        <div className="max-w-lg mx-auto mb-12">
          <JackpotCounter amount={jackpot} />
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 mb-16">
          {/* Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SpinWheel 
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </motion.div>
          
          {/* Leaderboard */}
          <Leaderboard />
        </div>

        {/* Spin Options */}
        <div className="mb-20">
          <SpinButtons 
            onSpin={handleSpin}
            disabled={isSpinning}
            canFreeSpin={canFreeSpin}
            freeSpinTimer={freeSpinTimer}
          />
        </div>

        {/* Features */}
        <Features />
      </main>

      <Footer />

      {/* Result Modal */}
      <ResultModal 
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        result={lastResult}
      />
    </div>
  );
};

export default Index;
