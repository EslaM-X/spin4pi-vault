import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CreateTournamentRequestSchema = z.object({
  pi_username: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  entry_fee: z.number().min(0).max(100),
  prize_pool: z.number().min(0).max(10000),
  duration_hours: z.number().min(1).max(720), // 1 hour to 30 days
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
      requestData = CreateTournamentRequestSchema.parse(JSON.parse(text));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pi_username, name, description, entry_fee, prize_pool, duration_hours } = requestData;

    // Verify the authenticated user matches the requested username
    if (authResult.username?.toLowerCase() !== pi_username.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Username mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Create tournament
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration_hours * 60 * 60 * 1000);

    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        name,
        description: description || null,
        entry_fee,
        prize_pool,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('Error creating tournament:', tournamentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create tournament' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Tournament ${name} created by admin ${pi_username}`);

    return new Response(
      JSON.stringify({
        success: true,
        tournament
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create tournament error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
