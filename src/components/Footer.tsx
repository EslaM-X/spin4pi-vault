import { motion } from "framer-motion";
import { FileText, Shield, MessageCircle, Twitter, Globe, Cpu } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-32 relative border-t border-gold/10 bg-[#08080c]">
      {/* تأثير إضاءة خفي خلف الفوتر */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              {/* استبدال التاج بشعار التطبيق */}
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)] overflow-hidden p-1">
                <img 
                  src="/spin4pi-logo.png" 
                  alt="Spin4Pi Logo" 
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    // في حال لم يجد المسار، يضع خلفية بديلة ليظل التصميم سليماً
                    e.currentTarget.src = "https://api.dicebear.com/7.x/initials/svg?seed=S4P&backgroundColor=fbbf24";
                  }}
                />
              </div>
              <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter" style={{ fontFamily: 'Cinzel, serif' }}>
                Spin4<span className="text-gold">Pi</span>
              </h4>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm font-medium">
              The premier entertainment destination within the Pi Network ecosystem. 
              We blend decentralized technology with the thrill of the hunt for fortune. 
              Experience the next generation of Web3 gaming.
            </p>
          </div>
          
          {/* Imperial Links */}
          <div>
            <h4 className="text-gold font-black uppercase tracking-[0.2em] text-xs mb-6">Imperial Library</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/legal" className="group flex items-center gap-3 text-white/40 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest">
                  <FileText className="w-4 h-4 text-gold/20 group-hover:text-gold transition-colors" />
                  Terms of Sovereignty
                </Link>
              </li>
              <li>
                <Link to="/legal" className="group flex items-center gap-3 text-white/40 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest">
                  <Shield className="w-4 h-4 text-gold/20 group-hover:text-gold transition-colors" />
                  Privacy Scroll
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Social Command Center */}
          <div>
            <h4 className="text-gold font-black uppercase tracking-[0.2em] text-xs mb-6">Social Command</h4>
            <div className="flex gap-4">
              {[
                { icon: MessageCircle, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Globe, href: "#" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-gold hover:text-black transition-all duration-300"
                  whileHover={{ y: -5, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Important Disclaimer - crucial for Pi Network compliance */}
        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold/20 group-hover:bg-gold transition-colors" />
          <p className="text-[10px] text-white/30 text-center leading-loose font-medium uppercase tracking-wider max-w-4xl mx-auto">
            <span className="text-gold/50 font-black block mb-2 tracking-[0.3em]">Imperial Proclamation</span>
            Spin4Pi is a probabilistic entertainment interface. All digital rewards are determined by secure random algorithms. 
            This is <span className="text-white/60">not a gambling service</span>, but a skill and luck-based ecosystem within the Pi Network. 
            Participation is voluntary. We make no guarantees of financial gain. Digital assets held within this domain 
            have utility only for internal progression and rewards.
          </p>
        </div>
        
        {/* Copyright & Infrastructure */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
            © {currentYear} Spin4Pi Empire. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-gold/40 uppercase tracking-widest">
            <Cpu className="w-3 h-3" />
            Built on Pi Network Core
          </div>
        </div>
      </div>
    </footer>
  );
}
