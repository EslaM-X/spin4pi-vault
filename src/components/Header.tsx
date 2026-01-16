import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, Wallet, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/spin4pi-logo.png";
import { SoundControls } from "./SoundControls";
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
  isLoggedIn, username, balance, onLogin, onLogout, onDepositSuccess, isLoading, isAdmin = false 
}: HeaderProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <>
      <motion.header
        // تم رفع الـ z-index إلى 100 لضمان السيادة فوق جميع عناصر الصفحة
        className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-xl border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Spin4Pi" className="h-10 w-auto" />
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <PiPriceDisplay className="hidden md:block" />
            <SoundControls />
            
            {isLoggedIn ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-yellow-500/30">
                <Wallet className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-bold text-sm">{(balance || 0).toFixed(2)} π</span>
                <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-yellow-500/20" onClick={() => setShowDeposit(true)}>
                  <Plus className="w-3 h-3 text-yellow-500" />
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 rounded-full px-6">
                {isLoading ? '...' : 'Login'}
              </Button>
            )}
            
            <MobileMenu isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={onLogout} />
          </div>
        </div>
      </motion.header>

      {showDeposit && username && (
        <DepositModal isOpen={showDeposit} onClose={() => setShowDeposit(false)} username={username} onSuccess={onDepositSuccess} />
      )}
      {showWithdraw && username && (
        <WithdrawModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} piUsername={username} currentBalance={balance} onWithdrawSuccess={onDepositSuccess} />
      )}
    </>
  );
}
