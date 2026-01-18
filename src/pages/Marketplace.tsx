import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap, Shield, Crown, ShoppingBag, Lock, ShieldAlert } from "lucide-react";
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

  // مرجع لصوت الشراء
  const purchaseSfx = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));

  // الفحص الإمبراطوري (الدخول + الموافقة القانونية)
  useEffect(() => {
    const hasConsented = localStorage.getItem('imperial_legal_consent');
    if (!authLoading) {
      if (!isAuthenticated || !hasConsented) {
        navigate("/");
        if (!hasConsented && isAuthenticated) {
          toast.error("Access Denied: Accept Imperial Protocols first", {
            icon: <ShieldAlert className="text-gold" />
          });
        }
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user?.username) fetchNFTs();
  }, [user]);

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-nfts", {
        body: {},
      });
      if (error) throw error;
      setNfts(data.nfts || []);
      setOwned(data.owned || []);
      setEquipped(data.equipped || []);
    } catch (err: any) {
      toast.error("Failed to sync with Imperial Vault");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (nftId: string) => {
    if (!user?.username) return;
    setPurchasing(nftId);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-nft", {
        body: { pi_username: user.username, nft_id: nftId },
      });

      if (error || !data?.success) {
        toast.error(data?.error || "Transaction Declined");
      } else {
        purchaseSfx.current.play().catch(() => {});
        toast.success("Artifact Secured in your Vault!");
        setOwned([...owned, nftId]);
      }
    } catch (err: any) {
      toast.error("Transaction Error");
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
        setEquipped(equip ? [...equipped, nftId] : equipped.filter((id) => id !== nftId));
        toast.success(equip ? "Artifact Active" : "Artifact Holstered");
      }
    } catch (err: any) {
      toast.error("Equipment Failure");
    }
  };

  if (authLoading || loading) return <GlobalLoading isVisible={true} />;

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-gold/30">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[url('/stars-pattern.svg')] opacity-10 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors mb-12 group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[2px]">Return to Arena</span>
        </Link>

        <header className="mb-16 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                 <div className="h-[1px] w-8 bg-gold" />
                 <span className="text-[10px] font-black text-gold uppercase tracking-[4px]">Imperial Treasury</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                IMPERIAL <span className="text-gold">VAULT</span>
              </h1>
              <p className="text-white/40 mt-4 text-xs font-medium uppercase tracking-[1px]">Secure rare artifacts to dominate the Pi ecosystem</p>
            </div>
            
            <div className="flex items-center gap-3 px-6 py-3 bg-gold/5 border border-gold/20 rounded-2xl backdrop-blur-md self-center md:self-auto">
               <ShoppingBag className="text-gold w-5 h-5" />
               <span className="text-sm font-black italic">{owned.length} <span className="text-gold/50 not-italic uppercase text-[10px] ml-1">Items Secured</span></span>
            </div>
          </motion.div>
        </header>

        {nfts.length === 0 ? (
          <div className="text-center py-24 bg-[#0d0d12] rounded-[40px] border border-white/5 shadow-2xl">
            <Lock className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="text-xl font-black uppercase italic text-white/60 tracking-widest">Vault is Currently Sealed</h3>
            <p className="text-white/30 text-xs mt-2 uppercase">New artifacts arriving in the next cycle</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nfts.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-[#0d0d12] border border-white/5 rounded-[32px] p-6 hover:border-gold/30 transition-all duration-500 overflow-hidden shadow-xl"
              >
                {/* Glow behind image */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="aspect-square bg-white/[0.02] border border-white/5 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                  {nft.image_url ? (
                    <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="w-12 h-12 text-gold/20" />
                  )}
                  {owned.includes(nft.id) && (
                    <div className="absolute top-4 right-4 bg-gold text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                      Secured
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-colors">
                    {UTILITY_ICONS[nft.utility] || <Zap className="w-5 h-5 text-gold" />}
                  </div>
                  <h3 className="font-black italic text-xl uppercase tracking-tight">{nft.name}</h3>
                </div>

                <p className="text-[11px] text-white/40 leading-relaxed mb-8 h-12 overflow-hidden italic uppercase">
                  {nft.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-gold uppercase tracking-widest leading-none mb-1">Price</span>
                     <span className="text-xl font-black italic">{nft.price_pi} <span className="text-gold text-xs">π</span></span>
                  </div>

                  {owned.includes(nft.id) ? (
                    <Button
                      size="sm"
                      onClick={() => handleEquip(nft.id, !equipped.includes(nft.id))}
                      className={`rounded-xl px-6 h-10 font-black uppercase text-[10px] tracking-widest transition-all ${
                        equipped.includes(nft.id) 
                        ? "bg-gold text-black hover:bg-gold/80" 
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {equipped.includes(nft.id) ? "Active" : "Equip"}
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handlePurchase(nft.id)} 
                      disabled={purchasing === nft.id}
                      className="rounded-xl px-8 h-10 bg-gradient-to-r from-gold to-[#B8860B] text-black font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      {purchasing === nft.id ? "..." : "Buy"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
