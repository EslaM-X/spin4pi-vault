import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ApplyReferralRequestSchema = z.object({
  pi_username: z.string().min(1).max(50),
  referral_code: z.string().max(20).optional(),
});

const REFERRAL_REWARD_PI = 0.5;
const NEW_USER_BONUS_PI = 0.25;

function generateReferralCode(username: string): string {
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const userPart = username.substring(0, 4).toUpperCase();
  return `${userPart}${randomPart}`;
}

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
      requestData = ApplyReferralRequestSchema.parse(JSON.parse(text));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pi_username, referral_code } = requestData;

    // Verify the authenticated user matches the requested username
    if (authResult.username?.toLowerCase() !== pi_username.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Cannot apply referral for other users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing referral for user ${pi_username} with code ${referral_code || 'none'}`);

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create profile for the new user
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('pi_username', pi_username)
      .maybeSingle();

    const isNewUser = !profile;

    if (!profile) {
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
      const { data: referrer } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', referral_code)
        .maybeSingle();

      if (referrer && referrer.id !== profile.id) {
        const { error: updateUserError } = await supabase
          .from('profiles')
          .update({ 
            referred_by: referrer.id,
            wallet_balance: Number(profile.wallet_balance || 0) + NEW_USER_BONUS_PI
          })
          .eq('id', profile.id);

        if (!updateUserError) {
          await supabase
            .from('profiles')
            .update({ 
              referral_count: (referrer.referral_count || 0) + 1,
              referral_earnings: Number(referrer.referral_earnings || 0) + REFERRAL_REWARD_PI,
              wallet_balance: Number(referrer.wallet_balance || 0) + REFERRAL_REWARD_PI
            })
            .eq('id', referrer.id);

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
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
