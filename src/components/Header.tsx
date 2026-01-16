import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet } from "lucide-react";
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
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0a0b] border-b border-white/10 h-16 flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Spin4Pi" className="h-9 w-auto" />
          </Link>
          
          <div className="flex items-center gap-3">
            <PiPriceDisplay className="hidden md:block" />
            
            {isLoggedIn && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-yellow-500/30">
                <span className="text-yellow-500 font-bold text-xs">{Number(balance).toFixed(2)} π</span>
                <button onClick={() => setShowDeposit(true)} className="text-yellow-500"><Plus size={16} /></button>
              </div>
            )}

            {!isLoggedIn && (
              <Button onClick={onLogin} disabled={isLoading} size="sm" className="bg-purple-600 rounded-full text-xs">
                Login
              </Button>
            )}
            
            {/* القائمة الذكية هنا */}
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
