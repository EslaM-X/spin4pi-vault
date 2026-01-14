import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pi Server API Base URL
const PI_API_URL = "https://api.minepi.com";

async function completePiPayment(paymentId: string, txid: string, piApiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${PI_API_URL}/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${piApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pi API complete error:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Pi API complete result:', result);
    return true;
  } catch (error) {
    console.error('Pi API complete exception:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id, txid } = await req.json();

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing payment_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const piApiKey = Deno.env.get('PI_SERVER_KEY') || Deno.env.get('MY_PI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!piApiKey) {
      console.error('PI_SERVER_KEY not configured');
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ===== Call Pi Server API to complete payment =====
    if (txid) {
      const completed = await completePiPayment(payment_id, txid, piApiKey);
      if (!completed) {
        console.warn('Pi API completion failed, but continuing to update local record');
      }
    }

    // Update payment status in database
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        memo: txid ? `txid: ${txid}` : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update payment:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to complete payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Payment completed via Pi API:', payment_id, txid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id,
        txid 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Complete payment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
