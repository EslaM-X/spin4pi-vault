import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Wallet, ShieldCheck, User, LogOut, LayoutDashboard } from "lucide-react";
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
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="relative group">
            <motion.div 
              className="absolute -inset-2 bg-gold/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <img src={logo} alt="Spin4Pi" className="h-10 w-auto relative z-10 drop-shadow-lg" />
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Pi Price (Hidden on tiny screens) */}
            <div className="hidden sm:block">
              <PiPriceDisplay />
            </div>
            
            <AnimatePresence mode="wait">
              {isLoggedIn ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  {/* Wealth Capsule */}
                  <div className="flex items-center bg-white/[0.03] border border-gold/20 rounded-2xl p-1 pr-3 gap-3 shadow-inner">
                    <button 
                      onClick={() => setShowDeposit(true)}
                      className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center text-black hover:bg-gold-dark transition-colors shadow-lg shadow-gold/20"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] font-black text-gold uppercase tracking-tighter">Imperial Vault</span>
                      <span className="text-sm font-black text-white italic">
                        {Number(balance).toFixed(2)} <span className="text-[10px] text-gold/80">π</span>
                      </span>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden md:flex items-center gap-2 border-l border-white/10 ml-2 pl-2">
                    {isAdmin && (
                      <Link to="/admin">
                        <Button variant="ghost" size="icon" className="text-white/40 hover:text-gold hover:bg-gold/5 rounded-xl">
                          <LayoutDashboard size={20} />
                        </Button>
                      </Link>
                    )}
                    <Button 
                      onClick={() => setShowWithdraw(true)}
                      variant="ghost" 
                      className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                    >
                      Withdraw
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button 
                  onClick={onLogin} 
                  disabled={isLoading}
                  className="bg-gold hover:bg-gold/80 text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-2xl shadow-xl shadow-gold/10"
                >
                  {isLoading ? "Authenticating..." : "Establish Connection"}
                </Button>
              )}
            </AnimatePresence>
            
            {/* Royal Menu */}
            <MobileMenu isLoggedIn={isLoggedIn} onLogout={onLogout} />
          </div>
        </div>
      </header>

      {/* Modals Bridge */}
      {showDeposit && username && (
        <DepositModal 
          isOpen={showDeposit} 
          onClose={() => setShowDeposit(false)} 
          username={username} 
          onSuccess={onDepositSuccess} 
        />
      )}
      {showWithdraw && username && (
        <WithdrawModal 
          isOpen={showWithdraw} 
          onClose={() => setShowWithdraw(false)} 
          piUsername={username} 
          currentBalance={balance} 
          onWithdrawSuccess={onDepositSuccess} 
        />
      )}
    </>
  );
}
