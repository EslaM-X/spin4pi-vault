import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  User,
  Trophy,
  Crown,
  ShoppingBag,
  Wallet,
  BarChart3,
  FileText,
  Zap,
  Gift,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  isAdmin?: boolean;
  description?: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home, description: 'Main game area' },
  { label: 'My Profile', href: '/profile', icon: User, requiresAuth: true, description: 'Stats & history' },
  { label: 'Achievements', href: '/achievements', icon: Trophy, requiresAuth: true, description: 'Badges & rewards' },
  { label: 'VIP Benefits', href: '/vip', icon: Crown, description: 'Exclusive perks' },
  { label: 'NFT Marketplace', href: '/marketplace', icon: ShoppingBag, requiresAuth: true, description: 'Power-ups & boosts' },
  { label: 'Withdrawals', href: '/withdrawals', icon: Wallet, requiresAuth: true, description: 'Transaction history' },
  { label: 'Admin Panel', href: '/admin', icon: BarChart3, isAdmin: true, description: 'Manage app' },
  { label: 'Terms & Privacy', href: '/legal', icon: FileText, description: 'Legal documents' },
];

interface MobileMenuProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export function MobileMenu({ isLoggedIn, isAdmin = false, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredItems = navItems.filter((item) => {
    if (item.isAdmin && !isAdmin) return false;
    if (item.requiresAuth && !isLoggedIn) return false;
    return true;
  });

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative z-50 hover:bg-primary/10"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </Button>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Menu Panel - Slide from right */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 300,
                mass: 0.8
              }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 max-w-full z-[101] flex flex-col"
            >
              {/* Glass panel effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-card via-card/95 to-background border-l border-primary/20 shadow-2xl" />
              
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-pi-purple/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gold/10 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="relative flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="text-2xl font-display font-bold">
                      <span className="text-gradient-gold">Spin</span>
                      <span className="text-foreground">4</span>
                      <span className="text-gradient-purple">Pi</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Navigation Menu</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                {isLoggedIn && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 border-b border-border/30"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/"
                        onClick={() => setIsOpen(false)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-pi-purple/20 to-pi-purple/5 border border-pi-purple/30 hover:border-pi-purple/50 transition-all hover:scale-[1.02]"
                      >
                        <Zap className="w-6 h-6 text-pi-purple" />
                        <span className="text-sm font-medium">Quick Spin</span>
                      </Link>
                      <Link
                        to="/vip"
                        onClick={() => setIsOpen(false)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 hover:border-gold/50 transition-all hover:scale-[1.02]"
                      >
                        <Gift className="w-6 h-6 text-gold" />
                        <span className="text-sm font-medium">VIP Rewards</span>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1">
                    {filteredItems.map((item, index) => {
                      const isActive = location.pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <motion.li
                          key={item.href}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <Link
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                              isActive
                                ? 'bg-primary/15 border border-primary/40 shadow-lg shadow-primary/5'
                                : 'hover:bg-muted/50 border border-transparent hover:border-border/50'
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-primary/20' 
                                : 'bg-muted/50 group-hover:bg-muted'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                {item.label}
                              </span>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {item.isAdmin && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-pi-purple/20 text-pi-purple px-2 py-1 rounded-full">
                                Admin
                              </span>
                            )}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent"
                >
                  {isLoggedIn && onLogout && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      className="w-full mb-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Powered by <span className="text-pi-purple font-medium">Pi Network</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      v1.0.0 • Testnet
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
