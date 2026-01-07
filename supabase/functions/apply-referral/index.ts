import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REFERRAL_REWARD_PI = 0.5; // Referrer gets 0.5 Pi
const NEW_USER_BONUS_PI = 0.25; // New user gets 0.25 Pi bonus

function generateReferralCode(username: string): string {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const userPart = username.substring(0, 4).toUpperCase();
  return `${userPart}${randomPart}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pi_username, referral_code } = await req.json();

    if (!pi_username) {
      return new Response(
        JSON.stringify({ error: 'Missing pi_username' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing referral for user ${pi_username} with code ${referral_code || 'none'}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create profile for the new user
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('pi_username', pi_username)
      .maybeSingle();

    const isNewUser = !profile;

    if (!profile) {
      // Generate unique referral code for new user
      const newReferralCode = generateReferralCode(pi_username);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ 
          pi_username,
          referral_code: newReferralCode,
          wallet_balance: 0
        })
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

    // If the user already has a referrer, skip referral processing
    if (profile.referred_by) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          referral_code: profile.referral_code,
          already_referred: true,
          message: 'User already has a referrer'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If a referral code was provided, apply it
    if (referral_code && isNewUser) {
      // Find the referrer
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', referral_code)
        .maybeSingle();

      if (referrer && referrer.id !== profile.id) {
        // Update the new user with referrer info and bonus
        const { error: updateUserError } = await supabase
          .from('profiles')
          .update({ 
            referred_by: referrer.id,
            wallet_balance: Number(profile.wallet_balance || 0) + NEW_USER_BONUS_PI
          })
          .eq('id', profile.id);

        if (updateUserError) {
          console.error('Error updating user referral:', updateUserError);
        } else {
          // Update referrer with reward
          const { error: updateReferrerError } = await supabase
            .from('profiles')
            .update({ 
              referral_count: (referrer.referral_count || 0) + 1,
              referral_earnings: Number(referrer.referral_earnings || 0) + REFERRAL_REWARD_PI,
              wallet_balance: Number(referrer.wallet_balance || 0) + REFERRAL_REWARD_PI
            })
            .eq('id', referrer.id);

          if (updateReferrerError) {
            console.error('Error updating referrer:', updateReferrerError);
          }

          // Record the referral reward
          await supabase
            .from('referral_rewards')
            .insert({
              referrer_id: referrer.id,
              referred_id: profile.id,
              reward_type: 'signup_bonus',
              reward_amount: REFERRAL_REWARD_PI
            });

          console.log(`Referral applied: ${referrer.pi_username} referred ${pi_username}`);
        }
      }
    }

    // Get updated profile
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        referral_code: updatedProfile?.referral_code || profile.referral_code,
        wallet_balance: updatedProfile?.wallet_balance || profile.wallet_balance,
        is_new_user: isNewUser,
        referral_applied: isNewUser && referral_code ? true : false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Apply referral error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
