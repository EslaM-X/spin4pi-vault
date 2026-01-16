import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SpinTypeSchema = z.enum(['free', 'basic', 'pro', 'vault']);
const SpinRequestSchema = z.object({
  pi_username: z.string().min(1).max(50),
  spin_type: SpinTypeSchema,
});

const BASE_REWARDS = [
  { label: "LOSE", chance: 45, amount: 0 },
  { label: "0.01_PI", chance: 25, amount: 0.01 },
  { label: "0.05_PI", chance: 15, amount: 0.05 },
  { label: "FREE_SPIN", chance: 8, amount: 0 },
  { label: "NFT_ENTRY", chance: 4, amount: 0 },
  { label: "JACKPOT_ENTRY", chance: 3, amount: 0 },
];

const SPIN_COSTS: Record<string, number> = {
  free: 0,
  basic: 0.1,
  pro: 0.25,
  vault: 1,
};

const NFT_BOOSTS: Record<string, { loseReduction: number; multiplier: number; jackpotBoost: number }> = {
  'luck_boost': { loseReduction: 5, multiplier: 1, jackpotBoost: 0 },
  'multiplier': { loseReduction: 0, multiplier: 1.5, jackpotBoost: 0 },
  'vip_access': { loseReduction: 3, multiplier: 1.2, jackpotBoost: 1 },
  'discount': { loseReduction: 0, multiplier: 1, jackpotBoost: 0 },
  'jackpot_boost': { loseReduction: 0, multiplier: 1, jackpotBoost: 2 },
  'loss_protection': { loseReduction: 10, multiplier: 1, jackpotBoost: 0 },
};

async function verifyPiAuth(req: Request): Promise<{ success: boolean; username?: string; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return { success: false, error: 'Missing authorization' };
  const token = authHeader.replace('Bearer ', '');
  try {
    const response = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return { success: false, error: 'Invalid token' };
    const userData = await response.json();
    return { success: true, username: userData.username };
  } catch (error) {
    return { success: false, error: 'Auth service unavailable' };
  }
}

async function getEquippedBoosts(supabase: any, profileId: string) {
  const boosts = { totalLoseReduction: 0, totalMultiplier: 1, totalJackpotBoost: 0, hasDiscount: false };
  const { data: equippedNfts } = await supabase.from('nft_ownership').select('nft_asset_id').eq('profile_id', profileId).eq('is_equipped', true);
  if (equippedNfts?.length > 0) {
    const nftIds = equippedNfts.map((n: any) => n.nft_asset_id);
    const { data: nftAssets } = await supabase.from('nft_assets').select('utility').in('id', nftIds);
    if (nftAssets) {
      for (const nft of nftAssets) {
        const boost = NFT_BOOSTS[nft.utility];
        if (boost) {
          boosts.totalLoseReduction += boost.loseReduction;
          boosts.totalMultiplier *= boost.multiplier;
          boosts.totalJackpotBoost += boost.jackpotBoost;
          if (nft.utility === 'discount') boosts.hasDiscount = true;
        }
      }
    }
  }
  return boosts;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await verifyPiAuth(req);
    if (!authResult.success) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const requestData = SpinRequestSchema.parse(await req.json());
    const { pi_username, spin_type } = requestData;

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    let { data: profile } = await supabase.from('profiles').select('*').eq('pi_username', pi_username).maybeSingle();
    if (!profile) return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });

    // التحقق من اللفة المجانية
    if (spin_type === 'free') {
      const lastFree = profile.last_free_spin ? new Date(profile.last_free_spin) : null;
      if (lastFree && (new Date().getTime() - lastFree.getTime()) < 86400000) {
        return new Response(JSON.stringify({ error: "Free spin not ready" }), { status: 400, headers: corsHeaders });
      }
    }

    const boosts = await getEquippedBoosts(supabase, profile.id);
    const roll = Math.random() * 100;
    let acc = 0;
    let result = BASE_REWARDS[0];

    for (const r of BASE_REWARDS) {
      acc += r.chance;
      if (roll <= acc) { result = r; break; }
    }

    let finalReward = result.amount * boosts.totalMultiplier;
    
    // تسجيل اللفة
    await supabase.from('spins').insert({
      profile_id: profile.id,
      spin_type,
      cost: SPIN_COSTS[spin_type],
      result: result.label,
      reward_amount: finalReward
    });

    // تحديث البروفايل (إضافة الجائزة فقط لأن الخصم تم عبر باي)
    const updates: any = {
      total_spins: (profile.total_spins || 0) + 1,
      total_winnings: (profile.total_winnings || 0) + finalReward,
      wallet_balance: (profile.wallet_balance || 0) + finalReward,
    };
    if (spin_type === 'free') updates.last_free_spin = new Date().toISOString();

    await supabase.from('profiles').update(updates).eq('id', profile.id);

    return new Response(JSON.stringify({
      success: true,
      result: result.label,
      reward_amount: finalReward,
      new_balance: updates.wallet_balance
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
