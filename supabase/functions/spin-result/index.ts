import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base reward probabilities (House Edge ~40%)
const BASE_REWARDS = [
  { label: "LOSE", chance: 45, amount: 0 },
  { label: "0.01_PI", chance: 25, amount: 0.01 },
  { label: "0.05_PI", chance: 15, amount: 0.05 },
  { label: "FREE_SPIN", chance: 8, amount: 0 },
  { label: "NFT_ENTRY", chance: 4, amount: 0 },
  { label: "JACKPOT_ENTRY", chance: 3, amount: 0 },
];

// Spin costs
const SPIN_COSTS: Record<string, number> = {
  free: 0,
  basic: 0.1,
  pro: 0.25,
  vault: 1,
};

// NFT boost effects by utility type
const NFT_BOOSTS: Record<string, { loseReduction: number; multiplier: number; jackpotBoost: number }> = {
  'luck_boost': { loseReduction: 5, multiplier: 1, jackpotBoost: 0 },        // Lucky Clover
  'multiplier': { loseReduction: 0, multiplier: 1.5, jackpotBoost: 0 },      // Golden Multiplier
  'vip_access': { loseReduction: 3, multiplier: 1.2, jackpotBoost: 1 },      // VIP Pass
  'discount': { loseReduction: 0, multiplier: 1, jackpotBoost: 0 },          // Discount Token (cost handled separately)
  'jackpot_boost': { loseReduction: 0, multiplier: 1, jackpotBoost: 2 },     // Jackpot Hunter
  'loss_protection': { loseReduction: 10, multiplier: 1, jackpotBoost: 0 },  // Pi Shield
};

interface EquippedBoosts {
  totalLoseReduction: number;
  totalMultiplier: number;
  totalJackpotBoost: number;
  hasDiscount: boolean;
}

async function getEquippedBoosts(supabase: any, profileId: string): Promise<EquippedBoosts> {
  const boosts: EquippedBoosts = {
    totalLoseReduction: 0,
    totalMultiplier: 1,
    totalJackpotBoost: 0,
    hasDiscount: false,
  };

  try {
    // Get equipped NFT ownership records
    const { data: equippedNfts } = await supabase
      .from('nft_ownership')
      .select('nft_asset_id')
      .eq('profile_id', profileId)
      .eq('is_equipped', true);

    if (equippedNfts && equippedNfts.length > 0) {
      // Get the NFT assets for equipped items
      const nftIds = equippedNfts.map((n: { nft_asset_id: string }) => n.nft_asset_id);
      const { data: nftAssets } = await supabase
        .from('nft_assets')
        .select('utility')
        .in('id', nftIds);

      if (nftAssets) {
        for (const nft of nftAssets) {
          const utility = nft.utility;
          if (utility && NFT_BOOSTS[utility]) {
            const boost = NFT_BOOSTS[utility];
            boosts.totalLoseReduction += boost.loseReduction;
            boosts.totalMultiplier *= boost.multiplier;
            boosts.totalJackpotBoost += boost.jackpotBoost;
            if (utility === 'discount') {
              boosts.hasDiscount = true;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching equipped NFTs:', error);
  }

  return boosts;
}

function applyBoostsToRewards(boosts: EquippedBoosts) {
  // Clone base rewards
  const rewards = BASE_REWARDS.map(r => ({ ...r }));
  
  // Apply lose reduction (cap at 30% reduction max)
  const loseReduction = Math.min(boosts.totalLoseReduction, 30);
  if (loseReduction > 0) {
    const loseIndex = rewards.findIndex(r => r.label === "LOSE");
    if (loseIndex !== -1) {
      const reducedChance = rewards[loseIndex].chance - loseReduction;
      rewards[loseIndex].chance = Math.max(reducedChance, 15); // Minimum 15% lose chance
      
      // Distribute reduced chance to winning outcomes
      const distribution = loseReduction / 3;
      rewards.forEach(r => {
        if (r.label.includes('_PI')) {
          r.chance += distribution;
        }
      });
    }
  }
  
  // Apply jackpot boost
  if (boosts.totalJackpotBoost > 0) {
    const jackpotIndex = rewards.findIndex(r => r.label === "JACKPOT_ENTRY");
    if (jackpotIndex !== -1) {
      rewards[jackpotIndex].chance += boosts.totalJackpotBoost;
    }
  }
  
  return rewards;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pi_username, spin_type } = await req.json();

    if (!pi_username || !spin_type) {
      return new Response(
        JSON.stringify({ error: "Missing pi_username or spin_type" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('pi_username', pi_username)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({ pi_username })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return new Response(
          JSON.stringify({ error: "Failed to create profile" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      profile = newProfile;
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Failed to get or create profile" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check free spin eligibility
    if (spin_type === 'free') {
      const lastFreeSpin = profile.last_free_spin ? new Date(profile.last_free_spin) : null;
      const now = new Date();
      
      if (lastFreeSpin && (now.getTime() - lastFreeSpin.getTime()) < 86400000) {
        const remainingMs = 86400000 - (now.getTime() - lastFreeSpin.getTime());
        return new Response(
          JSON.stringify({ 
            error: "Free spin not available yet",
            next_free_spin_in: remainingMs 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get equipped NFT boosts
    const boosts = await getEquippedBoosts(supabase, profile.id);
    const boostedRewards = applyBoostsToRewards(boosts);
    
    // Calculate result with boosted probabilities
    const roll = Math.random() * 100;
    let acc = 0;
    let result = boostedRewards[0];

    for (const r of boostedRewards) {
      acc += r.chance;
      if (roll <= acc) {
        result = r;
        break;
      }
    }

    // Apply cost (with discount if applicable)
    let cost = SPIN_COSTS[spin_type] || 0;
    if (boosts.hasDiscount && cost > 0) {
      cost = cost * 0.9; // 10% discount
    }
    
    // Apply multiplier to Pi rewards
    let finalRewardAmount = result.amount;
    if (result.amount > 0 && boosts.totalMultiplier > 1) {
      finalRewardAmount = result.amount * boosts.totalMultiplier;
    }

    // Record the spin
    const { error: spinError } = await supabase
      .from('spins')
      .insert({
        profile_id: profile.id,
        spin_type,
        cost,
        result: result.label,
        reward_amount: finalRewardAmount,
      });

    if (spinError) {
      console.error('Error recording spin:', spinError);
    }

    // Update profile
    const updates: Record<string, unknown> = {
      total_spins: (profile.total_spins || 0) + 1,
      total_winnings: (profile.total_winnings || 0) + finalRewardAmount,
    };

    if (spin_type === 'free') {
      updates.last_free_spin = new Date().toISOString();
    }

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    // Update jackpot (5% of paid spins go to jackpot)
    if (cost > 0) {
      const jackpotContribution = cost * 0.05;
      const { data: jackpot } = await supabase
        .from('jackpot')
        .select('*')
        .limit(1)
        .single();

      if (jackpot) {
        await supabase
          .from('jackpot')
          .update({ total_pi: (jackpot.total_pi || 0) + jackpotContribution })
          .eq('id', jackpot.id);
      }
    }

    console.log(`Spin result for ${pi_username}: ${result.label} (type: ${spin_type}, boosts: ${JSON.stringify(boosts)})`);

    return new Response(
      JSON.stringify({
        success: true,
        result: result.label,
        reward_amount: finalRewardAmount,
        profile_id: profile.id,
        boosts_applied: {
          multiplier: boosts.totalMultiplier,
          lose_reduction: boosts.totalLoseReduction,
          jackpot_boost: boosts.totalJackpotBoost,
          discount_applied: boosts.hasDiscount,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Spin result error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
