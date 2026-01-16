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
    const { pi_username } = await req.json();

    if (!pi_username) {
      return new Response(
        JSON.stringify({ error: "Missing pi_username" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_free_spin')
      .eq('pi_username', pi_username)
      .maybeSingle();

    if (!profile) {
      // New user, can spin
      return new Response(
        JSON.stringify({
          can_spin: true,
          next_spin_in: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lastFreeSpin = profile.last_free_spin ? new Date(profile.last_free_spin) : null;
    const now = new Date();
    
    if (!lastFreeSpin) {
      return new Response(
        JSON.stringify({
          can_spin: true,
          next_spin_in: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const timeSinceLast = now.getTime() - lastFreeSpin.getTime();
    const canSpin = timeSinceLast >= 86400000; // 24 hours

    return new Response(
      JSON.stringify({
        can_spin: canSpin,
        next_spin_in: canSpin ? 0 : 86400000 - timeSinceLast,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Daily spin check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
