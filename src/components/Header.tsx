import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutDashboard, TrendingUp, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/spin4pi-logo.png";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";
import { MobileMenu } from "./MobileMenu";
import { PiPriceDisplay } from "./PiPriceDisplay"; 
import { Button } from "./ui/button";

export function Header({ isLoggedIn, username, balance, onLogin, onLogout, onDepositSuccess, isLoading, isAdmin = false }: any) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 flex items-center justify-between gap-2">
          
          {/* 1. Logo Section */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Spin4Pi" className="h-9 md:h-11 w-auto" />
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
            
            {/* 2. Pi Market Price (المكون الذي كان مفقوداً في الصورة) */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-2xl group">
              {/* Pi Official Coin Icon */}
              <div className="w-6 h-6 rounded-full bg-[#fed429] flex items-center justify-center shadow-[0_0_10px_rgba(254,212,41,0.2)] flex-shrink-0">
                <span className="text-black font-black text-[12px]">π</span>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-none mb-0.5">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Live Price</span>
                </div>
                {/* هنا يظهر السعر المتغير */}
                <div className="text-[11px] md:text-xs font-bold text-white tracking-tighter">
                  <PiPriceDisplay />
                </div>
              </div>
            </div>

            {/* 3. User Balance & Auth */}
            <AnimatePresence mode="wait">
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  {/* Pi Balance Capsule */}
                  <div className="flex items-center bg-[#13131a] border border-gold/30 rounded-2xl p-1 pr-3 md:pr-4 gap-2 md:gap-3 shadow-xl">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeposit(true)}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gold flex items-center justify-center text-black shadow-lg"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </motion.button>

                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gold uppercase tracking-wider leading-none mb-1">PI BALANCE</span>
                      <div className="flex items-baseline gap-0.5 leading-none">
                        <span className="text-sm md:text-lg font-black text-white italic">
                          {Number(balance).toFixed(2)}
                        </span>
                        <span className="text-[9px] font-black text-gold">π</span>
                      </div>
                    </div>
                  </div>

                  {/* Withdraw Button (Desktop) */}
                  <button 
                    onClick={() => setShowWithdraw(true)}
                    className="hidden lg:block text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors px-2"
                  >
                    Withdraw
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={onLogin} 
                  disabled={isLoading}
                  className="bg-gold hover:bg-gold/90 text-black font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-xl"
                >
                  {isLoading ? "..." : "Connect Pi"}
                </Button>
              )}
            </AnimatePresence>
            
            {/* 4. Menu */}
            <MobileMenu isLoggedIn={isLoggedIn} onLogout={onLogout} />
          </div>
        </div>
      </header>

      {/* Modals */}
      {showDeposit && username && (
        <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} username={username} onSuccess={onDepositSuccess} />
      )}
      {showWithdraw && username && (
        <WithdrawModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} piUsername={username} currentBalance={balance} onWithdrawSuccess={onDepositSuccess} />
      )}
    </>
  );
}
