import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EndTournamentRequestSchema = z.object({
  tournament_id: z.string().uuid(),
  pi_username: z.string().min(1).max(50),
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

Deno.serve(async (req) => {
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
      requestData = EndTournamentRequestSchema.parse(JSON.parse(text));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tournament_id, pi_username } = requestData;

    // Verify the authenticated user matches the requested username
    if (authResult.username?.toLowerCase() !== pi_username.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Username mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('pi_username', pi_username)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    const prizeDistribution = [0.5, 0.3, 0.2];
    const winners = [];

    // Distribute prizes
    for (let i = 0; i < (topPlayers?.length || 0); i++) {
      const player = topPlayers![i];
      const prizeAmount = prizePool * prizeDistribution[i];
      
      if (prizeAmount > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('pi_username, wallet_balance')
          .eq('id', player.profile_id)
          .single();

        if (profileData) {
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

    console.log(`Tournament ${tournament.name} ended by admin ${pi_username}`);

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
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
