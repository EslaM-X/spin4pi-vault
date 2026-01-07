import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  vip: <Crown className="w-5 h-5 text-pi-purple" />,
  discount: <Shield className="w-5 h-5 text-green-400" />,
};

export default function Marketplace() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const username = localStorage.getItem("pi_username");

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    const { data, error } = await supabase.functions.invoke("get-nfts", {
      body: {},
    });
    if (!error && data) {
      setNfts(data.nfts || []);
      setOwned(data.owned || []);
      setEquipped(data.equipped || []);
    }
    setLoading(false);
  };

  const handlePurchase = async (nftId: string) => {
    if (!username) {
      toast.error("Please login first");
      return;
    }
    setPurchasing(nftId);
    const { data, error } = await supabase.functions.invoke("purchase-nft", {
      body: { pi_username: username, nft_id: nftId },
    });
    if (error || !data?.success) {
      toast.error(data?.error || "Purchase failed");
    } else {
      toast.success("NFT purchased!");
      setOwned([...owned, nftId]);
    }
    setPurchasing(null);
  };

  const handleEquip = async (nftId: string, equip: boolean) => {
    if (!username) return;
    const { data, error } = await supabase.functions.invoke("equip-nft", {
      body: { pi_username: username, nft_id: nftId, equip },
    });
    if (!error && data?.success) {
      setEquipped(equip ? [...equipped, nftId] : equipped.filter((id) => id !== nftId));
      toast.success(equip ? "NFT equipped!" : "NFT unequipped");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Game
        </Link>
        <motion.h1 className="text-4xl font-display font-bold mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Sparkles className="inline w-8 h-8 text-gold mr-2" />
          NFT Marketplace
        </motion.h1>
        <p className="text-muted-foreground mb-8">Boost your rewards with powerful NFT power-ups</p>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading NFTs...</div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No NFTs available yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <motion.div key={nft.id} className="bg-card border border-border rounded-xl p-6 hover:border-pi-purple/50 transition-colors" whileHover={{ y: -4 }}>
                <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                  {nft.image_url ? <img src={nft.image_url} alt={nft.name} className="w-full h-full object-cover rounded-lg" /> : <Sparkles className="w-16 h-16 text-pi-purple/30" />}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {UTILITY_ICONS[nft.utility] || <Zap className="w-5 h-5 text-muted-foreground" />}
                  <h3 className="font-display font-bold text-lg">{nft.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{nft.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gold">{nft.price_pi} π</span>
                  {owned.includes(nft.id) ? (
                    <Button size="sm" variant={equipped.includes(nft.id) ? "default" : "outline"} onClick={() => handleEquip(nft.id, !equipped.includes(nft.id))}>
                      {equipped.includes(nft.id) ? "Equipped" : "Equip"}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handlePurchase(nft.id)} disabled={purchasing === nft.id}>
                      {purchasing === nft.id ? "Buying..." : "Buy"}
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
