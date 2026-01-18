import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Home, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // تسجيل الخطأ في السجل الإمبراطوري
    console.error(
      "Imperial Security Alert: Unauthorized path access attempted:", 
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050507] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/stars-pattern.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center px-6">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <Ghost className="w-24 h-24 text-gold opacity-20 animate-pulse" />
            <ShieldAlert className="w-16 h-16 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
          </div>
        </motion.div>

        {/* Error Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-8xl font-black italic tracking-tighter text-white mb-2">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-[1px] w-8 bg-gold/50" />
            <span className="text-[10px] font-black text-gold uppercase tracking-[4px]">
              Sector Not Found
            </span>
            <div className="h-[1px] w-8 bg-gold/50" />
          </div>
          
          <p className="max-w-md mx-auto text-white/40 text-sm uppercase font-bold leading-relaxed mb-10 tracking-widest">
            The coordinates <span className="text-gold/60">"{location.pathname}"</span> do not exist within the Imperial Vault records.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all gap-2"
          >
            <Link to={-1 as any}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Link>
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase tracking-[3px] text-xs shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:scale-105 active:scale-95 transition-all gap-2"
          >
            <Link to="/">
              <Home className="w-4 h-4 fill-current" />
              Return to Arena
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Decorative Bottom Text */}
      <div className="absolute bottom-10 left-0 w-full text-center">
        <p className="text-[8px] font-black text-white/10 uppercase tracking-[10px]">
          Spin4Pi Security Protocol v2.0
        </p>
      </div>
    </div>
  );
};

export default NotFound;
