import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X, Home, User, LogOut, ChevronRight, 
  Volume2, ShieldCheck, Trophy, Share2, Settings 
} from 'lucide-react';
import logoIcon from "@/assets/spin4pi-logo.png";

export function MobileMenu({ isLoggedIn, onLogout, isAdmin }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      {/* الزر الرئيسي (Trigger) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="relative flex flex-col gap-1 justify-center items-center active:scale-95 transition-all cursor-pointer"
        style={{ width: '44px', height: '44px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '12px' }}
      >
        <span className="h-[2px] w-5 bg-purple-400 rounded-full" />
        <span className="h-[2px] w-3 bg-pink-500 rounded-full self-end mr-3" />
        <span className="h-[2px] w-5 bg-purple-400 rounded-full" />
      </div>

      <AnimatePresence>
        {isOpen && createPortal(
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
            
            {/* طبقة التعتيم الزجاجية */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />

            {/* الحاوية الرئيسية للقائمة (أسطورية) */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-[400px] bg-[#0c0c0e] border border-white/10 rounded-[40px] p-8 shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden"
            >
              {/* تزيين علوي خلف الشعار */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full" />

              {/* الشعار المفقود (موجود الآن) */}
              <div className="flex flex-col items-center mb-8 relative">
                <button onClick={() => setIsOpen(false)} className="absolute -top-2 -right-2 text-white/20 hover:text-white"><X size={24} /></button>
                <img src={logoIcon} className="w-20 h-20 mb-3 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" alt="Logo" />
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-purple-500" />
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em]">Main Network</span>
                </div>
              </div>

              {/* شبكة الصفحات (Grid System) */}
              <div className="grid grid-cols-1 gap-3 mb-8">
                <MenuLink to="/" icon={<Home size={20} className="text-purple-400" />} label="The Arena" onClick={() => setIsOpen(false)} />
                <MenuLink to="/profile" icon={<User size={20} className="text-blue-400" />} label="Commander Profile" onClick={() => setIsOpen(false)} />
                <MenuLink to="/leaderboard" icon={<Trophy size={20} className="text-yellow-500" />} label="Global Rankings" onClick={() => setIsOpen(false)} />
                <MenuLink to="/referral" icon={<Share2 size={20} className="text-green-400" />} label="Affiliate Portal" onClick={() => setIsOpen(false)} />
                {isAdmin && <MenuLink to="/admin" icon={<Settings size={20} className="text-red-500" />} label="Admin Terminal" onClick={() => setIsOpen(false)} />}
              </div>

              {/* زر التحكم بالصوت (موجود الآن بشكل فخم) */}
              <div 
                onClick={() => setIsMuted(!isMuted)}
                className="w-full mb-8 p-4 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-pink-500/20 text-pink-500'}`}>
                    <Volume2 size={20} />
                  </div>
                  <span className="text-sm font-bold text-white/80">Audio Feedback</span>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-all ${isMuted ? 'bg-white/10' : 'bg-purple-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isMuted ? 'left-1' : 'left-7'}`} />
                </div>
              </div>

              {/* زر تسجيل الخروج الفخم */}
              {isLoggedIn && (
                <button 
                  onClick={() => { onLogout?.(); setIsOpen(false); }}
                  className="w-full py-5 bg-gradient-to-r from-red-500/10 to-red-600/20 border border-red-500/20 rounded-[28px] text-red-500 font-black text-xs uppercase tracking-[0.2em] hover:from-red-500 hover:to-red-600 hover:text-white transition-all shadow-lg shadow-red-500/5"
                >
                  Terminate session
                </button>
              )}
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
}

// مكون فرعي للروابط لتقليل تكرار الكود
function MenuLink({ to, icon, label, onClick }: any) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.05] rounded-[24px] hover:bg-purple-500/10 transition-all no-underline group">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white/[0.05] rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-white font-bold text-sm tracking-wide">{label}</span>
      </div>
      <ChevronRight size={18} className="text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
