import { motion } from "framer-motion";
import { FileText, Shield, MessageCircle, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-gold">About Spin4Pi</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Spin4Pi is an entertainment-based spin wheel game integrated with Pi Network. 
              All rewards are probabilistic. This is not a gambling service.
            </p>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-gold">Legal</h4>
            <div className="space-y-3">
              <Link to="/legal" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <FileText className="w-4 h-4" />
                Terms of Use
              </Link>
              <Link to="/legal" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <Shield className="w-4 h-4" />
                Privacy Policy
              </Link>
            </div>
          </div>
          
          {/* Social */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-gold">Community</h4>
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-pi-purple transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-pi-purple transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> Spin4Pi is an entertainment application. All rewards are probabilistic 
            and not guaranteed. Participation is voluntary. Spins may result in no rewards. Digital items have 
            utility only inside the app. No promise of profit or income is made. This application is not a gambling service.
          </p>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Spin4Pi. Built on Pi Network.
          </p>
        </div>
      </div>
    </footer>
  );
}
