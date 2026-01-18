import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutDashboard, TrendingUp } from "lucide-react";
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
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="Spin4Pi" className="h-10 w-auto drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            <span className="hidden sm:block font-black text-xl italic tracking-tighter text-white">
              SPIN4<span className="text-gold">PI</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* --- إضافة سعر Pi المباشر هنا --- */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-2xl border-dashed">
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-2 h-2 text-emerald-500" />
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Live Market</span>
                </div>
                {/* استدعاء مكون السعر */}
                <div className="text-xs font-bold text-white tracking-tight">
                  <PiPriceDisplay />
                </div>
              </div>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Pi Balance Capsule (كما في الصورة) */}
                <div className="flex items-center bg-[#13131a] border border-gold/30 rounded-2xl p-1 pr-4 gap-3 shadow-2xl">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeposit(true)}
                    className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center text-black shadow-lg shadow-gold/10"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </motion.button>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gold uppercase tracking-wider leading-none mb-1">PI BALANCE</span>
                    <div className="flex items-baseline gap-1 leading-none">
                      <span className="text-lg font-black text-white italic">
                        {Number(balance).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-black text-gold">π</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Admin/Withdraw */}
                <div className="hidden lg:flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="text-white/40 hover:text-gold">
                        <LayoutDashboard size={18} />
                      </Button>
                    </Link>
                  )}
                  <button 
                    onClick={() => setShowWithdraw(true)}
                    className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors ml-2"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={onLogin} 
                disabled={isLoading}
                className="bg-gold hover:bg-gold/90 text-black font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-2xl"
              >
                {isLoading ? "Connecting..." : "Connect Pi Wallet"}
              </Button>
            )}
            
            <MobileMenu isLoggedIn={isLoggedIn} onLogout={onLogout} />
          </div>
        </div>
      </header>

      {showDeposit && username && (
        <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} username={username} onSuccess={onDepositSuccess} />
      )}
      {showWithdraw && username && (
        <WithdrawModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} piUsername={username} currentBalance={balance} onWithdrawSuccess={onDepositSuccess} />
      )}
    </>
  );
}
