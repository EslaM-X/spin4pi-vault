import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Achievement {
  id: string;
  name: string;
  requirement_type: string;
  requirement_value: number;
  reward_pi: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pi_username } = await req.json();

    if (!pi_username) {
      return new Response(
        JSON.stringify({ error: 'Missing pi_username' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, total_spins, total_winnings, login_streak, referral_count, wallet_balance')
      .eq('pi_username', pi_username)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');

    // Get user's existing achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('profile_id', profile.id);

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
    const newAchievements: Achievement[] = [];
    let totalReward = 0;

    // Check each achievement
    for (const achievement of (achievements || [])) {
      if (earnedIds.has(achievement.id)) continue;

      let earned = false;
      
      switch (achievement.requirement_type) {
        case 'total_spins':
          earned = (profile.total_spins || 0) >= achievement.requirement_value;
          break;
        case 'total_winnings':
          earned = (profile.total_winnings || 0) >= achievement.requirement_value;
          break;
        case 'login_streak':
          earned = (profile.login_streak || 0) >= achievement.requirement_value;
          break;
        case 'referral_count':
          earned = (profile.referral_count || 0) >= achievement.requirement_value;
          break;
      }

      if (earned) {
        // Award achievement
        await supabase
          .from('user_achievements')
          .insert({
            profile_id: profile.id,
            achievement_id: achievement.id
          });

        newAchievements.push(achievement);
        totalReward += achievement.reward_pi || 0;
      }
    }

    // Award Pi rewards
    if (totalReward > 0) {
      await supabase
        .from('profiles')
        .update({ 
          wallet_balance: (profile.wallet_balance || 0) + totalReward 
        })
        .eq('id', profile.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        new_achievements: newAchievements.map(a => ({
          name: a.name,
          reward_pi: a.reward_pi
        })),
        total_reward: totalReward
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Check achievements error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
