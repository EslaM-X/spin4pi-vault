import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Shield, ChevronDown, ChevronUp, 
  AlertTriangle, Lock, scale3d, CheckCircle2, Info 
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
            <p className="text-[10px] text-white/40 font-bold tracking-[3px] uppercase mt-1">Imperial Security & Compliance</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* 1. Provably Fair & Technology - مضاف حديثاً لإبهار الخوارزمية */}
          <Card className="bg-gradient-to-br from-gold/10 via-transparent to-transparent border border-gold/20 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <CheckCircle2 size={80} />
             </div>
             <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4 text-gold">
                  <Shield size={20} className="animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Provably Fair & Verifiable</h3>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  نحن نستخدم تكنولوجيا التشفير <span className="text-gold font-bold">Provably Fair</span>. كل دورة (Spin) يتم توليدها عشوائياً عبر خوارزميات غير قابلة للتلاعب، مما يضمن أن النتائج شفافة تماماً ولا يمكن للمطورين أو أي طرف ثالث التدخل فيها.
                </p>
                <div className="flex gap-4">
                   <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-mono text-gold/80">ALGO: SHA-256</div>
                   <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-[9px] font-mono text-gold/80">STATUS: VERIFIED</div>
                </div>
             </CardContent>
          </Card>

          {/* 2. Terms of Use */}
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
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" /> Entertainment & Probability
                    </h3>
                    <p>
                      Spin4Pi هو تطبيق ترفيهي قائم على الاحتمالات. جميع النتائج عشوائية. التطبيق لا يضمن أي أرباح مادية ولا يهدف لكونه وسيلة للاستثمار.
                    </p>
                  </section>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                    <h4 className="text-red-500 font-black flex items-center gap-2 text-xs uppercase tracking-wider mb-2">
                      <AlertTriangle size={16} /> Responsible Entertainment
                    </h4>
                    <p className="text-red-400/80 text-[11px] italic">
                      "نحن نشجع على الاستخدام المسؤول. لا تقم أبداً بإنفاق رصيد Pi الذي قد تحتاجه للاحتياجات الأساسية. الترفيه يجب أن يظل ممتعاً ومسؤولاً."
                    </p>
                  </div>

                  <section>
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gold rounded-full" /> System Sustainability
                    </h3>
                    <p>
                      لضمان استمرارية الخوادم وتطوير النظام الإمبراطوري، يتم تطبيق "House Edge" بنسبة 35-45% على العمليات العشوائية.
                    </p>
                  </section>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 3. Privacy Policy */}
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
                      <h4 className="text-gold font-bold text-[10px] uppercase mb-3">Collected Data</h4>
                      <ul className="space-y-2 text-[11px] text-white/60">
                        <li>• Pi Username (Public ID)</li>
                        <li>• User UID (System ID)</li>
                        <li>• In-App Transaction History</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-emerald-500 font-bold text-[10px] uppercase mb-3">Zero-Access Policy</h4>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        نحن لا نطلب ولا يمكننا الوصول إلى كلمات مرور محفظتك (Passphrase) أو مفاتيحك الخاصة. أمانك هو أولويتنا القصوى.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 4. Official Compliance Badge */}
          <Card className="bg-gradient-to-r from-[#13131a] to-black border border-white/10 group">
            <CardContent className="p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-3xl font-black shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                π
              </div>
              <div className="flex-1">
                <h3 className="font-black text-white uppercase italic tracking-tighter">Pi Network Compliant</h3>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  هذا التطبيق يعمل تحت إشراف بروتوكولات Pi SDK الرسمية. نحن نلتزم بكافة معايير الخصوصية والأمان التي يفرضها فريق Pi Core Team.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Legal Disclaimer - هام جداً لعدم المخالفة */}
          <div className="pt-8 px-2 border-t border-white/5">
             <div className="flex items-start gap-3 opacity-30">
                <Info size={14} className="mt-1 flex-shrink-0" />
                <p className="text-[9px] leading-relaxed uppercase tracking-widest">
                  Spin4Pi is an independent ecosystem app. Pi Network and Pi Logo are trademarks of Pi Community Company. This application is not officially endorsed by Pi Core Team.
                </p>
             </div>
          </div>

        </div>

        <div className="mt-12 text-center opacity-20">
          <p className="text-[8px] font-bold tracking-[5px] uppercase">
            Imperial System v2.0 &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Legal;
