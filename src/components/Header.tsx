import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Wallet, Sparkles, Plus, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/spin4pi-logo.png";
import { SoundControls } from "./SoundControls";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";
import { MobileMenu } from "./MobileMenu";
import { PiPriceDisplay } from "./PiPriceDisplay";
import { Button } from "./ui/button";

interface HeaderProps {
  isLoggedIn: boolean;
  username: string | null;
  balance: number;
  onLogin: () => void;
  onLogout?: () => void;
  onDepositSuccess?: () => void;
  isLoading?: boolean;
  shortcuts?: Array<{ key: string; action: string }>;
  isAdmin?: boolean;
}

export function Header({ 
  isLoggedIn, 
  username, 
  balance, 
  onLogin, 
  onLogout,
  onDepositSuccess, 
  isLoading, 
  shortcuts = [], 
  isAdmin = false 
}: HeaderProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Spin4Pi" className="h-10 sm:h-12 w-auto" />
            </Link>
          </motion.div>
          
          <div className={`hidden ${isLoggedIn ? 'lg:block' : 'sm:block'}`}>
            <PiPriceDisplay />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <SoundControls />
            
            {isLoggedIn ? (
              <>
                <motion.div
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-card to-muted rounded-full border border-gold/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <Wallet className="w-4 h-4 text-gold" />
                  <span className="font-display font-bold text-gold text-sm sm:text-base">
                    {(balance || 0).toFixed(2)} π
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 ml-1 hover:bg-gold/20"
                    onClick={() => setShowDeposit(true)}
                  >
                    <Plus className="w-3 h-3 text-gold" />
                  </Button>
                </motion.div>
                
                <Link to="/profile" className="hidden sm:block">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pi-purple/20 to-card rounded-full border border-pi-purple/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <User className="w-4 h-4 text-pi-purple" />
                    <span className="font-medium text-foreground">{username}</span>
                  </motion.div>
                </Link>
              </>
            ) : (
              <motion.button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onLogin();
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-pi-purple to-pi-purple-dark text-white font-display font-bold rounded-full shadow-lg shadow-pi-purple/20 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-5 h-5" />
                <span>{isLoading ? 'Connecting...' : 'Login'}</span>
              </motion.button>
            )}
            
            <MobileMenu 
              isLoggedIn={isLoggedIn} 
              isAdmin={isAdmin} 
              onLogout={onLogout}
            />
          </div>
        </div>
      </motion.header>

      {showDeposit && username && (
        <DepositModal
          isOpen={showDeposit}
          onClose={() => setShowDeposit(false)}
          username={username}
          onSuccess={() => onDepositSuccess?.()}
        />
      )}

      {showWithdraw && username && (
        <WithdrawModal
          isOpen={showWithdraw}
          onClose={() => setShowWithdraw(false)}
          piUsername={username}
          currentBalance={balance}
          onWithdrawSuccess={() => onDepositSuccess?.()}
        />
      )}
    </>
  );
}
