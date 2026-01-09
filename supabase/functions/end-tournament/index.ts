import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tournament_id } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournament_id)
      .single();

    if (tournamentError || !tournament) {
      return new Response(
        JSON.stringify({ error: 'Tournament not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if tournament has ended
    const now = new Date();
    const endTime = new Date(tournament.end_time);
    
    if (now < endTime) {
      return new Response(
        JSON.stringify({ error: 'Tournament has not ended yet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tournament.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Tournament already completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get top 3 players
    const { data: topPlayers, error: playersError } = await supabase
      .from('tournament_entries')
      .select('id, profile_id, total_winnings')
      .eq('tournament_id', tournament_id)
      .order('total_winnings', { ascending: false })
      .limit(3);

    if (playersError) {
      throw playersError;
    }

    const prizePool = tournament.prize_pool || 0;
    const prizeDistribution = [0.5, 0.3, 0.2]; // 50%, 30%, 20%
    const winners = [];

    // Distribute prizes
    for (let i = 0; i < topPlayers.length; i++) {
      const player = topPlayers[i];
      const prizeAmount = prizePool * prizeDistribution[i];
      
      if (prizeAmount > 0) {
        // Get profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('pi_username, wallet_balance')
          .eq('id', player.profile_id)
          .single();

        if (profileData) {
          // Update player's wallet
          const currentBalance = Number(profileData.wallet_balance) || 0;
          await supabase
            .from('profiles')
            .update({ wallet_balance: currentBalance + prizeAmount })
            .eq('id', player.profile_id);

          winners.push({
            rank: i + 1,
            username: profileData.pi_username,
            winnings: player.total_winnings,
            prize: prizeAmount
          });
        }
      }
    }

    // Mark tournament as completed
    await supabase
      .from('tournaments')
      .update({ status: 'completed' })
      .eq('id', tournament_id);

    return new Response(
      JSON.stringify({
        success: true,
        tournament_name: tournament.name,
        prize_pool: prizePool,
        winners
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('End tournament error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
