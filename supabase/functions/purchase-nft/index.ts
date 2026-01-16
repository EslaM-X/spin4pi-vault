import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PurchaseNFTRequestSchema = z.object({
  pi_username: z.string().min(1).max(50),
  nft_id: z.string().uuid(),
});

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
      requestData = PurchaseNFTRequestSchema.parse(JSON.parse(text));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pi_username, nft_id } = requestData;

    // Verify the authenticated user matches the requested username
    if (authResult.username?.toLowerCase() !== pi_username.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Cannot purchase for other users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing NFT purchase: ${nft_id} for user ${pi_username}`);

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile } = await supabase
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
    const { data: nft } = await supabase
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
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
