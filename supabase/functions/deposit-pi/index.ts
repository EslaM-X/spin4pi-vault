import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id, pi_username, amount } = await req.json();

    if (!payment_id || !pi_username || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing deposit: ${amount} Pi for user ${pi_username}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('pi_username', pi_username)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ pi_username })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      profile = newProfile;
    }

    // Record the deposit as pending
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .insert({
        profile_id: profile.id,
        amount: amount,
        payment_id: payment_id,
        status: 'approved'
      })
      .select()
      .single();

    if (depositError) {
      if (depositError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Deposit already processed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('Error recording deposit:', depositError);
      return new Response(
        JSON.stringify({ error: 'Failed to record deposit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Deposit approved: ${deposit.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deposit_id: deposit.id,
        message: 'Deposit approved, awaiting blockchain confirmation'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Deposit error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
