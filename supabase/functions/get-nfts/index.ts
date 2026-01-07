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
    const url = new URL(req.url);
    const pi_username = url.searchParams.get('pi_username');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all NFT assets
    const { data: nfts, error: nftError } = await supabase
      .from('nft_assets')
      .select('*')
      .order('price_pi', { ascending: true });

    if (nftError) {
      console.error('Error fetching NFTs:', nftError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch NFTs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let ownedNfts: string[] = [];
    let equippedNfts: string[] = [];

    // If user is provided, get their owned NFTs
    if (pi_username) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('pi_username', pi_username)
        .maybeSingle();

      if (profile) {
        const { data: ownership } = await supabase
          .from('nft_ownership')
          .select('nft_asset_id, is_equipped')
          .eq('profile_id', profile.id);

        if (ownership) {
          ownedNfts = ownership.map(o => o.nft_asset_id);
          equippedNfts = ownership.filter(o => o.is_equipped).map(o => o.nft_asset_id);
        }
      }
    }

    console.log(`Fetched ${nfts?.length || 0} NFTs. User owns ${ownedNfts.length}`);

    return new Response(
      JSON.stringify({ 
        nfts: nfts || [],
        owned: ownedNfts,
        equipped: equippedNfts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get NFTs error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
