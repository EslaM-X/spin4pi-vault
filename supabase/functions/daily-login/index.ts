import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Streak bonus rewards (Pi amount)
const STREAK_REWARDS: Record<number, number> = {
  1: 0.01,   // Day 1
  2: 0.02,   // Day 2
  3: 0.03,   // Day 3
  4: 0.04,   // Day 4
  5: 0.05,   // Day 5
  6: 0.07,   // Day 6
  7: 0.10,   // Day 7 - Weekly bonus!
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pi_username } = await req.json();

    if (!pi_username) {
      return new Response(
        JSON.stringify({ error: "Missing pi_username" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create profile
    let { data: profile } = await supabase
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
        return new Response(
          JSON.stringify({ error: "Failed to create profile" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      profile = newProfile;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastLoginDate = profile.last_login_date;
    const currentStreak = profile.login_streak || 0;

    // Check if already claimed today
    if (lastLoginDate === today) {
      return new Response(
        JSON.stringify({
          success: false,
          already_claimed: true,
          current_streak: currentStreak,
          next_reward: STREAK_REWARDS[Math.min((currentStreak % 7) + 1, 7)] || 0.01,
          message: "Daily reward already claimed today"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new streak
    let newStreak = 1;
    if (lastLoginDate) {
      const lastDate = new Date(lastLoginDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - continue streak
        newStreak = currentStreak + 1;
      } else if (diffDays > 1) {
        // Streak broken - reset to 1
        newStreak = 1;
      }
    }

    // Calculate reward based on streak (cycles every 7 days)
    const streakDay = ((newStreak - 1) % 7) + 1;
    const reward = STREAK_REWARDS[streakDay] || 0.01;

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        last_login_date: today,
        login_streak: newStreak,
        total_login_rewards: (profile.total_login_rewards || 0) + reward,
        wallet_balance: (profile.wallet_balance || 0) + reward
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to claim reward" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Daily login reward for ${pi_username}: ${reward} Pi (streak: ${newStreak})`);

    return new Response(
      JSON.stringify({
        success: true,
        reward_amount: reward,
        current_streak: newStreak,
        streak_day: streakDay,
        next_reward: STREAK_REWARDS[Math.min(streakDay + 1, 7)] || STREAK_REWARDS[1],
        new_balance: (profile.wallet_balance || 0) + reward
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Daily login error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
