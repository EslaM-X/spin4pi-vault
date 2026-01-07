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
    const { payment_id, txid } = await req.json();

    if (!payment_id) {
      return new Response(
        JSON.stringify({ error: 'Missing payment_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update payment status
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

    console.log('Payment completed:', payment_id, txid);

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
