import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pi_username, nft_id, equip } = await req.json();

    if (!pi_username || !nft_id || equip === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${equip ? 'Equipping' : 'Unequipping'} NFT: ${nft_id} for user ${pi_username}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('pi_username', pi_username)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check ownership
    const { data: ownership, error: ownershipError } = await supabase
      .from('nft_ownership')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('nft_asset_id', nft_id)
      .maybeSingle();

    if (!ownership) {
      return new Response(
        JSON.stringify({ error: 'You do not own this NFT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update equipped status
    const { error: updateError } = await supabase
      .from('nft_ownership')
      .update({ is_equipped: equip })
      .eq('id', ownership.id);

    if (updateError) {
      console.error('Error updating equip status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update equip status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`NFT ${equip ? 'equipped' : 'unequipped'} successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        is_equipped: equip
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Equip NFT error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
