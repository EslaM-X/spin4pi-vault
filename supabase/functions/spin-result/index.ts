import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reward probabilities (House Edge ~40%)
const REWARDS = [
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

serve(async (req) => {
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

    // Calculate result
    const roll = Math.random() * 100;
    let acc = 0;
    let result = REWARDS[0];

    for (const r of REWARDS) {
      acc += r.chance;
      if (roll <= acc) {
        result = r;
        break;
      }
    }

    const cost = SPIN_COSTS[spin_type] || 0;

    // Record the spin
    const { error: spinError } = await supabase
      .from('spins')
      .insert({
        profile_id: profile.id,
        spin_type,
        cost,
        result: result.label,
        reward_amount: result.amount,
      });

    if (spinError) {
      console.error('Error recording spin:', spinError);
    }

    // Update profile
    const updates: Record<string, unknown> = {
      total_spins: (profile.total_spins || 0) + 1,
      total_winnings: (profile.total_winnings || 0) + result.amount,
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

    console.log(`Spin result for ${pi_username}: ${result.label} (type: ${spin_type})`);

    return new Response(
      JSON.stringify({
        success: true,
        result: result.label,
        reward_amount: result.amount,
        profile_id: profile.id,
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
