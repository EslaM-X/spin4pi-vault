import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pi Server API Base URL
const PI_API_URL = "https://api.minepi.com";

async function approvePiPayment(paymentId: string, piApiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${PI_API_URL}/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${piApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pi API approve error:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Pi API approve result:', result);
    return true;
  } catch (error) {
    console.error('Pi API approve exception:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
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

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const piApiKey = Deno.env.get('MY_PI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!piApiKey) {
      console.error('MY_PI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "Server configuration error: PI API key missing" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== Call Pi Server API to approve payment =====
    const approved = await approvePiPayment(payment_id, piApiKey);
    if (!approved) {
      return new Response(
        JSON.stringify({ error: "Pi Network payment approval failed" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    console.log(`Payment approved via Pi API: ${payment_id} for ${pi_username} (${amount} Pi)`);

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
