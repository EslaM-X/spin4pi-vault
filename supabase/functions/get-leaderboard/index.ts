import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const primaryUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL');
    const primaryKey =
      Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const fallbackUrl = Deno.env.get('SUPABASE_URL') || primaryUrl;
    const fallbackKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || primaryKey;

    if (!primaryUrl || !primaryKey) {
      throw new Error('Backend environment variables are missing (URL / service role key)');
    }

    const makeClient = (url: string, key: string, label: 'primary' | 'fallback') => {
      let host = url;
      try {
        host = new URL(url).hostname;
      } catch {
        // ignore
      }
      console.log(`[get-leaderboard] using ${label} backend host: ${host}`);

      return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    };

    const fetchLeaderboardAndJackpot = async (supabase: any) => {
      // Get top 10 players by total winnings
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('profiles')
        .select('pi_username, total_winnings, total_spins')
        .order('total_winnings', { ascending: false })
        .limit(10);

      if (leaderboardError) return { leaderboardError };

      // Get current jackpot
      const { data: jackpot, error: jackpotError } = await supabase
        .from('jackpot')
        .select('total_pi')
        .limit(1)
        .single();

      return {
        leaderboard: leaderboard || [],
        jackpot: jackpot?.total_pi || 0,
        jackpotError,
      };
    };

    // Primary attempt (prefers MY_* as requested)
    let result = await fetchLeaderboardAndJackpot(makeClient(primaryUrl, primaryKey, 'primary'));

    // If MY_* points to a different project, PostgREST returns PGRST205 (table not found).
    // In that case, retry using the platform-provided SUPABASE_* variables.
    if (
      result.leaderboardError?.code === 'PGRST205' &&
      fallbackUrl &&
      fallbackKey &&
      (fallbackUrl !== primaryUrl || fallbackKey !== primaryKey)
    ) {
      result = await fetchLeaderboardAndJackpot(makeClient(fallbackUrl, fallbackKey, 'fallback'));
    }

    if (result.leaderboardError || result.jackpotError) {
      console.error('Leaderboard error:', result.leaderboardError || result.jackpotError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch leaderboard' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ leaderboard: result.leaderboard || [], jackpot: result.jackpot || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );


  } catch (error) {
    console.error('Leaderboard error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
