import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Wallet, Sparkles, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/spin4pi-logo.png";
import { SoundControls } from "./SoundControls";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { DepositModal } from "./DepositModal";
import { Button } from "./ui/button";

interface HeaderProps {
  isLoggedIn: boolean;
  username: string | null;
  balance: number;
  onLogin: () => void;
  onDepositSuccess?: () => void;
  isLoading?: boolean;
  shortcuts?: Array<{ key: string; action: string }>;
}

export function Header({ isLoggedIn, username, balance, onLogin, onDepositSuccess, isLoading, shortcuts = [] }: HeaderProps) {
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 bg-dark-space/80 backdrop-blur-lg border-b border-border"
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
            <Link to="/">
              <img src={logo} alt="Spin4Pi" className="h-12 w-auto" />
            </Link>
          </motion.div>
          
          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Navigation Links */}
            {isLoggedIn && (
              <Link to="/marketplace">
                <motion.div
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pi-purple/20 to-card rounded-full border border-pi-purple/30 cursor-pointer hover:border-pi-purple/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <Sparkles className="w-4 h-4 text-pi-purple-glow" />
                  <span className="text-sm font-medium text-foreground">NFTs</span>
                </motion.div>
              </Link>
            )}
            
            {/* Keyboard Shortcuts */}
            {shortcuts.length > 0 && <KeyboardShortcutsHelp shortcuts={shortcuts} />}
            
            {/* Sound Controls */}
            <SoundControls />
            
            {isLoggedIn ? (
              <>
                {/* Balance with Deposit Button */}
                <motion.div
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-card to-muted rounded-full border border-gold/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <Wallet className="w-4 h-4 text-gold" />
                  <span className="font-display font-bold text-gold">{balance.toFixed(2)} π</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 ml-1 hover:bg-gold/20"
                    onClick={() => setShowDeposit(true)}
                  >
                    <Plus className="w-3 h-3 text-gold" />
                  </Button>
                </motion.div>
                
                {/* User - Links to Profile */}
                <Link to="/profile">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pi-purple/20 to-card rounded-full border border-pi-purple/30 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <User className="w-4 h-4 text-pi-purple-glow" />
                    <span className="hidden sm:inline font-medium text-foreground">{username}</span>
                  </motion.div>
                </Link>
              </>
            ) : (
              <motion.button
                onClick={onLogin}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pi-purple to-pi-purple-dark text-foreground font-display font-bold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-5 h-5" />
                <span>{isLoading ? 'Connecting...' : 'Login with Pi'}</span>
              </motion.button>
            )}
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
    </>
  );
}
