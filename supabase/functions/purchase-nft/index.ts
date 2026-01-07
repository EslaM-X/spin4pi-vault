import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pi_username, nft_id } = await req.json();

    if (!pi_username || !nft_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing NFT purchase: ${nft_id} for user ${pi_username}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('pi_username', pi_username)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get NFT details
    const { data: nft, error: nftError } = await supabase
      .from('nft_assets')
      .select('*')
      .eq('id', nft_id)
      .maybeSingle();

    if (!nft) {
      return new Response(
        JSON.stringify({ error: 'NFT not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already owns this NFT
    const { data: existingOwnership } = await supabase
      .from('nft_ownership')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('nft_asset_id', nft_id)
      .maybeSingle();

    if (existingOwnership) {
      return new Response(
        JSON.stringify({ error: 'You already own this NFT' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check wallet balance
    const walletBalance = Number(profile.wallet_balance) || 0;
    const nftPrice = Number(nft.price_pi);

    if (walletBalance < nftPrice) {
      return new Response(
        JSON.stringify({ error: 'Insufficient wallet balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct from wallet
    const newBalance = walletBalance - nftPrice;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to process purchase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create ownership record
    const { data: ownership, error: ownershipError } = await supabase
      .from('nft_ownership')
      .insert({
        profile_id: profile.id,
        nft_asset_id: nft_id,
        is_equipped: false
      })
      .select()
      .single();

    if (ownershipError) {
      // Refund the balance
      await supabase
        .from('profiles')
        .update({ wallet_balance: walletBalance })
        .eq('id', profile.id);
      
      console.error('Error creating ownership:', ownershipError);
      return new Response(
        JSON.stringify({ error: 'Failed to record ownership' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`NFT purchased successfully: ${ownership.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ownership_id: ownership.id,
        new_balance: newBalance,
        nft: nft
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Purchase NFT error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
