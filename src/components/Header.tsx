import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Wallet, ShieldCheck, User, LogOut, LayoutDashboard, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/spin4pi-logo.png";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";
import { MobileMenu } from "./MobileMenu";
import { PiPriceDisplay } from "./PiPriceDisplay"; // تأكد من وجود هذا المكون
import { Button } from "./ui/button";

export function Header({ isLoggedIn, username, balance, onLogin, onLogout, onDepositSuccess, isLoading, isAdmin = false }: any) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-20 flex items-center bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="relative group flex items-center gap-2">
            <div className="absolute -inset-2 bg-gold/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src={logo} alt="Spin4Pi" className="h-10 w-auto relative z-10" />
            <span className="hidden lg:block font-black text-xl italic tracking-tighter text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              SPIN4<span className="text-gold">PI</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3 md:gap-6">
            
            {/* Pi Network Live Price - السعر المتغير مع الشعار */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-gold/20 transition-all">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-[#fed429] flex items-center justify-center shadow-[0_0_10px_rgba(254,212,41,0.3)]">
                  <span className="text-black font-black text-[14px]">π</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#0a0a0c] animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Live Market</span>
                <PiPriceDisplay />
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  {/* Pi Balance - الرصيد الواضح والفخم */}
                  <div className="flex items-center bg-white/[0.03] border border-gold/30 rounded-2xl p-1 pr-4 gap-3 shadow-lg backdrop-blur-md group">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDeposit(true)}
                      className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-black shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </motion.button>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 leading-none mb-0.5">
                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.1em]">Pi Balance</span>
                      </div>
                      <div className="flex items-baseline gap-1 leading-none">
                        <span className="text-lg font-black text-white italic tracking-tighter group-hover:text-gold transition-colors">
                          {Number(balance).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-black text-gold">π</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Icons */}
                  <div className="hidden md:flex items-center gap-1">
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="ghost" size="icon" className="text-white/40 hover:text-gold rounded-xl">
                          <LayoutDashboard size={18} />
                        </Button>
                      </Link>
                    )}
                    <Button 
                      onClick={() => setShowWithdraw(true)}
                      variant="ghost" 
                      className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={onLogin} 
                  disabled={isLoading}
                  className="bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 rounded-2xl shadow-xl shadow-gold/10"
                >
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </AnimatePresence>
            
            {/* Mobile Navigation */}
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
