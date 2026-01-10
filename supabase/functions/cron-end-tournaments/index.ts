import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cron job to automatically end expired tournaments and distribute prizes
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();

    // Find all active tournaments that have ended
    const { data: expiredTournaments, error: fetchError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .lt('end_time', now);

    if (fetchError) {
      throw fetchError;
    }

    const results = [];

    for (const tournament of expiredTournaments || []) {
      try {
        // Get top 3 players
        const { data: topPlayers, error: playersError } = await supabase
          .from('tournament_entries')
          .select('id, profile_id, total_winnings')
          .eq('tournament_id', tournament.id)
          .order('total_winnings', { ascending: false })
          .limit(3);

        if (playersError) throw playersError;

        const prizePool = tournament.prize_pool || 0;
        const prizeDistribution = [0.5, 0.3, 0.2]; // 50%, 30%, 20%
        const winners = [];

        // Distribute prizes to top 3
        for (let i = 0; i < (topPlayers?.length || 0); i++) {
          const player = topPlayers![i];
          const prizeAmount = prizePool * prizeDistribution[i];

          if (prizeAmount > 0) {
            // Get current wallet balance
            const { data: profileData } = await supabase
              .from('profiles')
              .select('pi_username, wallet_balance')
              .eq('id', player.profile_id)
              .single();

            if (profileData) {
              const currentBalance = Number(profileData.wallet_balance) || 0;
              
              // Update wallet balance
              await supabase
                .from('profiles')
                .update({ wallet_balance: currentBalance + prizeAmount })
                .eq('id', player.profile_id);

              winners.push({
                rank: i + 1,
                username: profileData.pi_username,
                prize: prizeAmount,
              });
            }
          }
        }

        // Mark tournament as completed
        await supabase
          .from('tournaments')
          .update({ status: 'completed' })
          .eq('id', tournament.id);

        results.push({
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          status: 'completed',
          winners,
        });

      } catch (tournamentError) {
        console.error(`Error processing tournament ${tournament.id}:`, tournamentError);
        results.push({
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          status: 'error',
          error: String(tournamentError),
        });
      }
    }

    // Also check for upcoming tournaments that should now be active
    const { data: upcomingTournaments, error: upcomingError } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('status', 'upcoming')
      .lte('start_time', now)
      .gte('end_time', now);

    if (!upcomingError && upcomingTournaments) {
      for (const tournament of upcomingTournaments) {
        await supabase
          .from('tournaments')
          .update({ status: 'active' })
          .eq('id', tournament.id);

        results.push({
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          status: 'activated',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_at: now,
        tournaments_processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
