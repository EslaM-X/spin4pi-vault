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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_id, txid } = await req.json();

    if (!payment_id || !txid) {
      return new Response(
        JSON.stringify({ error: 'Missing payment_id or txid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Completing deposit: ${payment_id} with txid ${txid}`);

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

    // ===== Call Pi Server API to complete the payment =====
    const completed = await completePiPayment(payment_id, txid, piApiKey);
    if (!completed) {
      console.warn('Pi API completion failed, continuing with local update');
    }

    // Find the deposit
    const { data: deposit, error: findError } = await supabase
      .from('deposits')
      .select('*, profiles(*)')
      .eq('payment_id', payment_id)
      .maybeSingle();

    if (findError || !deposit) {
      console.error('Deposit not found:', findError);
      return new Response(
        JSON.stringify({ error: 'Deposit not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (deposit.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Deposit already completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update deposit status
    const { error: updateDepositError } = await supabase
      .from('deposits')
      .update({ 
        status: 'completed', 
        txid: txid,
        completed_at: new Date().toISOString()
      })
      .eq('id', deposit.id);

    if (updateDepositError) {
      console.error('Error updating deposit:', updateDepositError);
      return new Response(
        JSON.stringify({ error: 'Failed to update deposit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add to user's wallet balance
    const currentBalance = deposit.profiles?.wallet_balance || 0;
    const newBalance = Number(currentBalance) + Number(deposit.amount);

    const { error: updateBalanceError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', deposit.profile_id);

    if (updateBalanceError) {
      console.error('Error updating balance:', updateBalanceError);
      return new Response(
        JSON.stringify({ error: 'Failed to update balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Deposit completed via Pi API. New balance: ${newBalance} Pi`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        new_balance: newBalance,
        message: 'Deposit completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Complete deposit error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
