import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Shield, ChevronDown, ChevronUp, 
  AlertTriangle, Lock, CheckCircle2, Info, Scale, Fingerprint 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Legal = () => {
  const [termsOpen, setTermsOpen] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050507] p-4 text-white font-sans selection:bg-gold/30">
      <div className="max-w-4xl mx-auto pt-20 pb-12">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl bg-white/5 border border-white/10 hover:bg-gold/10 hover:text-gold transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
              LEGAL <span className="text-gold bg-clip-text text-transparent bg-gradient-to-r from-gold to-[#B8860B]">SYSTEM</span>
            </h1>
            <p className="text-[10px] text-white/40 font-bold tracking-[3px] uppercase mt-1">Imperial Security & Compliance Protocols</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* 1. Provably Fair & Technology */}
          <Card className="bg-gradient-to-br from-gold/10 via-transparent to-transparent border border-gold/20 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 size={80} />
             </div>
             <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4 text-gold">
                  <Shield size={20} className="animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Provably Fair Technology</h3>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  We implement high-tier <span className="text-gold font-bold">Provably Fair</span> cryptographic protocols. Every spin outcome is generated through a verifiable randomized system, ensuring 100% transparency. No party, including developers, can manipulate or predict the results.
                </p>
                <div className="flex gap-4">
                   <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-mono text-gold/80 uppercase tracking-tighter">Algorithm: SHA-256</div>
                   <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-mono text-gold/80 uppercase tracking-tighter">Status: Fully Verified</div>
                </div>
             </CardContent>
          </Card>

          {/* 2. Terms of Service */}
          <Card className="bg-[#0d0d12] border border-white/5 shadow-2xl overflow-hidden">
            <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gold" />
                      <span className="text-lg font-bold tracking-tight uppercase italic">Terms of Service</span>
                    </div>
                    {termsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-6 space-y-6 text-white/70 text-sm leading-relaxed">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Last Updated: January 18, 2026</p>

                  <section>
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
                      <Scale size={14} className="text-gold" /> 01. Entertainment & Probability
                    </h3>
                    <p>
                      Spin4Pi is an elite entertainment platform based on mathematical probabilities. All outcomes are randomized. This application does not guarantee financial gain and is not intended for investment or gambling purposes.
                    </p>
                  </section>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                    <h4 className="text-red-500 font-black flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
                      <AlertTriangle size={16} /> Responsible Participation
                    </h4>
                    <p className="text-red-400/80 text-[11px] italic leading-relaxed">
                      "Users are encouraged to participate responsibly. Never spend Pi utility tokens required for your essential needs. Entertainment must remain sustainable and safe."
                    </p>
                  </div>

                  <section>
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" /> 02. System Sustainability
                    </h3>
                    <p>
                      To maintain premium server infrastructure and ensure the longevity of the Imperial System, a mathematical "House Edge" of 35-45% is applied to randomized events.
                    </p>
                  </section>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 3. Privacy & Data Minimization */}
          <Card className="bg-[#0d0d12] border border-white/5 shadow-2xl overflow-hidden">
            <Collapsible open={privacyOpen} onOpenChange={setPrivacyOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-emerald-500" />
                      <span className="text-lg font-bold tracking-tight uppercase italic">Privacy Protocol</span>
                    </div>
                    {privacyOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-gold font-bold text-[10px] uppercase mb-3 flex items-center gap-2">
                        <Fingerprint size={12} /> Data Minimization
                      </h4>
                      <ul className="space-y-2 text-[11px] text-white/60">
                        <li className="flex justify-between"><span>Pi Username</span> <span className="text-white/20 italic italic">Minimal Access</span></li>
                        <li className="flex justify-between"><span>Pi UID</span> <span className="text-white/20 italic italic">Encrypted</span></li>
                        <li className="flex justify-between"><span>Auth Scopes</span> <span className="text-white/20 italic italic">Restricted</span></li>
                      </ul>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex flex-col justify-center">
                      <h4 className="text-emerald-500 font-bold text-[10px] uppercase mb-2">Zero-Access Security</h4>
                      <p className="text-[10px] text-white/40 leading-relaxed italic">
                        "We do not request, nor can we access, your Pi Wallet Passphrase or Private Keys. Your security is our highest imperial priority."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 4. Official Compliance Badge */}
          <Card className="bg-gradient-to-r from-[#13131a] to-black border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#050507] border border-gold/30 flex items-center justify-center text-gold text-3xl font-black shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                π
              </div>
              <div className="flex-1">
                <h3 className="font-black text-white uppercase italic tracking-tighter">Pi Network Compliant</h3>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  This application operates under official Pi SDK protocols. We adhere to all privacy, security, and ecosystem standards mandated by the Pi Core Team.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Legal Disclaimer */}
          <div className="pt-8 px-2 border-t border-white/5">
             <div className="flex items-start gap-3 opacity-30">
                <Info size={14} className="mt-1 flex-shrink-0" />
                <p className="text-[9px] leading-relaxed uppercase tracking-[1px] font-medium">
                  Spin4Pi is an independent ecosystem application. Pi Network and the Pi Logo are trademarks of the Pi Community Company. This application is not officially endorsed or developed by the Pi Core Team. All utility tokens are subject to Pi Network Mainnet terms and conditions.
                </p>
             </div>
          </div>

        </div>

        <div className="mt-12 text-center opacity-20">
          <p className="text-[8px] font-bold tracking-[5px] uppercase">
            Imperial System v2.0 &copy; 2026 | All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Legal;
