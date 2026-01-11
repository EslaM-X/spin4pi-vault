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
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Spin4Pi" className="h-10 sm:h-12 w-auto" />
            </Link>
          </motion.div>
          
          {/* Center - Pi Price (hidden on mobile when logged in) */}
          <div className={`hidden ${isLoggedIn ? 'lg:block' : 'sm:block'}`}>
            <PiPriceDisplay />
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* NFT Link - Desktop only */}
            {isLoggedIn && (
              <Link to="/marketplace" className="hidden md:block">
                <motion.div
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pi-purple/20 to-card rounded-full border border-pi-purple/30 cursor-pointer hover:border-pi-purple/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <Sparkles className="w-4 h-4 text-pi-purple" />
                  <span className="text-sm font-medium text-foreground">NFTs</span>
                </motion.div>
              </Link>
            )}
            
            {/* Keyboard Shortcuts */}
            {shortcuts.length > 0 && (
              <div className="hidden sm:block">
                <KeyboardShortcutsHelp shortcuts={shortcuts} />
              </div>
            )}
            
            {/* Sound Controls */}
            <SoundControls />
            
            {isLoggedIn ? (
              <>
                {/* Balance with Deposit/Withdraw Buttons */}
                <motion.div
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-card to-muted rounded-full border border-gold/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <Wallet className="w-4 h-4 text-gold" />
                  <span className="font-display font-bold text-gold text-sm sm:text-base">
                    {balance.toFixed(2)} π
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 ml-1 hover:bg-gold/20"
                    onClick={() => setShowDeposit(true)}
                    title="Deposit Pi"
                  >
                    <Plus className="w-3 h-3 text-gold" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:bg-primary/20"
                    onClick={() => setShowWithdraw(true)}
                    title="Withdraw Pi"
                    disabled={balance <= 0}
                  >
                    <ArrowUpRight className="w-3 h-3 text-primary" />
                  </Button>
                </motion.div>
                
                {/* User - Links to Profile (hidden on mobile) */}
                <Link to="/profile" className="hidden sm:block">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pi-purple/20 to-card rounded-full border border-pi-purple/30 cursor-pointer hover:border-pi-purple/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <User className="w-4 h-4 text-pi-purple" />
                    <span className="font-medium text-foreground">{username}</span>
                  </motion.div>
                </Link>
              </>
            ) : (
              <motion.button
                onClick={onLogin}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-pi-purple to-pi-purple-dark text-foreground font-display font-bold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">{isLoading ? 'Connecting...' : 'Login with Pi'}</span>
                <span className="sm:hidden">{isLoading ? '...' : 'Login'}</span>
              </motion.button>
            )}
            
            {/* Mobile Menu - Always visible */}
            <MobileMenu 
              isLoggedIn={isLoggedIn} 
              isAdmin={isAdmin} 
              onLogout={onLogout}
            />
          </div>
        </div>
      </motion.header>

      {/* Deposit Modal */}
      {username && (
        <DepositModal
          isOpen={showDeposit}
          onClose={() => setShowDeposit(false)}
          username={username}
          onSuccess={() => {
            onDepositSuccess?.();
          }}
        />
      )}

      {/* Withdraw Modal */}
      {username && (
        <WithdrawModal
          isOpen={showWithdraw}
          onClose={() => setShowWithdraw(false)}
          piUsername={username}
          currentBalance={balance}
          onWithdrawSuccess={() => {
            onDepositSuccess?.();
          }}
        />
      )}
    </>
  );
}
