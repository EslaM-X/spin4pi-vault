import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    console.log(`Deposit completed. New balance: ${newBalance} Pi`);

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
