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
    const { payment_id, pi_username, amount, memo } = await req.json();

    if (!payment_id || !pi_username || amount === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('pi_username', pi_username)
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({ pi_username })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return new Response(
          JSON.stringify({ error: "Failed to create profile" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      profile = newProfile;
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Failed to get or create profile" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        profile_id: profile.id,
        payment_id,
        amount,
        status: 'approved',
        memo: memo || 'Spin4Pi Payment',
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      // Check if it's a duplicate
      if (paymentError.code === '23505') {
        return new Response(
          JSON.stringify({ error: "Payment already processed" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to record payment" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Payment approved: ${payment_id} for ${pi_username} (${amount} Pi)`);

    return new Response(
      JSON.stringify({
        approved: true,
        payment_id,
        profile_id: profile.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment approval error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
