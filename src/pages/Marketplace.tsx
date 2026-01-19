import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap, Shield, Crown, ShoppingBag, Lock, ShieldAlert, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePiAuth } from "@/hooks/usePiAuth";
import GlobalLoading from "@/components/GlobalLoading";

interface NFT {
  id: string;
  name: string;
  description: string;
  price_pi: number;
  utility: string;
  image_url: string;
}

const UTILITY_ICONS: Record<string, React.ReactNode> = {
  boost: <Zap className="w-5 h-5 text-gold" />,
  vip: <Crown className="w-5 h-5 text-gold" />,
  discount: <Shield className="w-5 h-5 text-emerald-400" />,
};

export default function Marketplace() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = usePiAuth();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const purchaseSfx = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));

  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!authLoading && (!isAuthenticated || !hasConsented)) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user?.username) fetchNFTs();
  }, [user]);

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-nfts", { body: {} });
      if (error) throw error;
      setNfts(data.nfts || []);
      setOwned(data.owned || []);
      setEquipped(data.equipped || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNfts = useMemo(() => {
    if (activeFilter === "all") return nfts;
    return nfts.filter(nft => nft.utility === activeFilter);
  }, [nfts, activeFilter]);

  const handlePurchase = async (nftId: string) => {
    if (!user?.username) return;
    setPurchasing(nftId);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-nft", {
        body: { pi_username: user.username, nft_id: nftId },
      });
      if (!error && data?.success) {
        purchaseSfx.current.play().catch(() => {});
        toast.success("Artifact Secured!");
        setOwned(prev => [...prev, nftId]);
      } else {
        toast.error(data?.error || "Transaction Declined");
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (nftId: string, equip: boolean) => {
    if (!user?.username) return;
    try {
      const { data, error } = await supabase.functions.invoke("equip-nft", {
        body: { pi_username: user.username, nft_id: nftId, equip },
      });
      if (!error && data?.success) {
        setEquipped(prev => equip ? [...prev, nftId] : prev.filter(id => id !== nftId));
        toast.success(equip ? "Artifact Active" : "Artifact Holstered");
      }
    } catch (err) {
      toast.error("Equipment Failure");
    }
  };

  if (authLoading || loading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-24 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-tr from-gold/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="mb-12">
          <Link to="/profile" className="inline-flex items-center gap-2 text-white/40 hover:text-gold mb-8 group">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Identity</span>
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-[10px] font-black text-gold uppercase tracking-[4px] mb-2">Spin4Pi Treasury</p>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">ARTIFACT <span className="text-gold">VAULT</span></h1>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-[#0d0d12] border border-white/5 rounded-2xl">
               <ShoppingBag className="text-gold w-5 h-5" />
               <span className="text-sm font-black">{owned.length} <span className="text-white/20 text-[10px] ml-1">ITEMS</span></span>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-10 bg-[#0d0d12]/50 p-2 rounded-2xl border border-white/5 w-fit">
          {[
            { id: 'all', label: 'All Artifacts', icon: <Filter className="w-3 h-3" /> },
            { id: 'boost', label: 'Boosters', icon: <Zap className="w-3 h-3" /> },
            { id: 'vip', label: 'VIP Pass', icon: <Crown className="w-3 h-3" /> },
            { id: 'discount', label: 'Shields', icon: <Shield className="w-3 h-3" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === tab.id ? "bg-gold text-black shadow-lg shadow-gold/20" : "hover:bg-white/5 text-white/40"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredNfts.map((nft) => (
              <motion.div
                key={nft.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-[#0d0d12] border border-white/5 rounded-[40px] p-8 hover:border-gold/20 transition-all shadow-2xl relative overflow-hidden"
              >
                <div className="aspect-square bg-white/[0.01] border border-white/5 rounded-[32px] mb-6 overflow-hidden relative">
                  {nft.image_url ? (
                    <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Sparkles className="w-16 h-16" /></div>
                  )}
                  {owned.includes(nft.id) && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-black text-[8px] font-black px-3 py-1 rounded-full uppercase">Owned</div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-colors">
                    {UTILITY_ICONS[nft.utility] || <Zap className="w-5 h-5 text-gold" />}
                  </div>
                  <h3 className="font-black italic text-xl uppercase tracking-tighter">{nft.name}</h3>
                </div>

                <p className="text-xs text-white/40 leading-relaxed mb-8 h-10 italic">"{nft.description}"</p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <span className="text-[8px] font-black text-gold uppercase block mb-1">Price</span>
                    <span className="text-xl font-black italic">{nft.price_pi} <span className="text-gold text-xs font-black">π</span></span>
                  </div>

                  {owned.includes(nft.id) ? (
                    <Button
                      onClick={() => handleEquip(nft.id, !equipped.includes(nft.id))}
                      className={`rounded-xl px-6 h-10 font-black uppercase text-[10px] tracking-widest transition-all ${
                        equipped.includes(nft.id) ? "bg-gold text-black hover:bg-gold/80" : "bg-white/5 text-white border border-white/10"
                      }`}
                    >
                      {equipped.includes(nft.id) ? "Active" : "Equip"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handlePurchase(nft.id)} 
                      disabled={purchasing === nft.id}
                      className="rounded-xl px-8 h-10 bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all"
                    >
                      {purchasing === nft.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Purchase"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
