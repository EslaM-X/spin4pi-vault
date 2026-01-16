import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ClaimAdSpinRequestSchema = z.object({
  pi_username: z.string().min(1).max(50),
  ads_watched: z.number().min(3).max(5), // Must watch 3-5 ads (value > basic spin cost 0.1 Pi)
});

// Minimum ads required to earn a free spin (ensures profit for developer)
const MIN_ADS_FOR_FREE_SPIN = 3;
const S4P_REWARD_PER_AD = 10; // S4P tokens per ad watched

async function verifyPiAuth(req: Request): Promise<{ success: boolean; username?: string; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing authorization' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const response = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return { success: false, error: 'Invalid token' };
    }

    const userData = await response.json();
    return { success: true, username: userData.username };
  } catch (error) {
    console.error('Pi auth error:', error);
    return { success: false, error: 'Auth service unavailable' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify Pi Network authentication
    const authResult = await verifyPiAuth(req);
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: authResult.error || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let requestData;
    try {
      const text = await req.text();
      if (text.length > 10240) {
        return new Response(
          JSON.stringify({ error: 'Request too large' }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requestData = ClaimAdSpinRequestSchema.parse(JSON.parse(text));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: `Invalid request. You must watch at least ${MIN_ADS_FOR_FREE_SPIN} ads.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pi_username, ads_watched } = requestData;

    // Verify the authenticated user matches the requested username
    if (authResult.username?.toLowerCase() !== pi_username.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Cannot claim for other users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    // Check if user already claimed ad spin today
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingClaim } = await supabase
      .from('ad_spin_claims')
      .select('id')
      .eq('profile_id', profile.id)
      .gte('claimed_at', `${today}T00:00:00.000Z`)
      .maybeSingle();

    if (existingClaim) {
      return new Response(
        JSON.stringify({ 
          error: 'Ad spin already claimed today',
          next_available: 'tomorrow'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate minimum ads watched
    if (ads_watched < MIN_ADS_FOR_FREE_SPIN) {
      return new Response(
        JSON.stringify({ 
          error: `Must watch at least ${MIN_ADS_FOR_FREE_SPIN} ads`,
          ads_watched,
          required: MIN_ADS_FOR_FREE_SPIN
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the claim
    const { error: claimError } = await supabase
      .from('ad_spin_claims')
      .insert({
        profile_id: profile.id,
        ads_watched,
        s4p_reward: ads_watched * S4P_REWARD_PER_AD
      });

    if (claimError) {
      console.error('Error recording claim:', claimError);
      return new Response(
        JSON.stringify({ error: 'Failed to record claim' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user's S4P token balance
    const s4pReward = ads_watched * S4P_REWARD_PER_AD;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        s4p_balance: (profile.s4p_balance || 0) + s4pReward
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating S4P balance:', updateError);
    }

    console.log(`Ad spin claimed for ${pi_username}: ${ads_watched} ads watched, ${s4pReward} S4P earned`);

    return new Response(
      JSON.stringify({
        success: true,
        free_spin_earned: true,
        ads_watched,
        s4p_reward: s4pReward,
        message: `Congratulations! You earned a free spin and ${s4pReward} S4P tokens!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Claim ad spin error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
