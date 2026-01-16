import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Spin4Pi <notifications@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pi_username, email, reminder_type } = await req.json();
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's streak info
    let streakInfo = { current_streak: 0, next_reward: 0.01 };
    if (pi_username) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('login_streak')
        .eq('pi_username', pi_username)
        .single();
      
      if (profile) {
        streakInfo.current_streak = profile.login_streak || 0;
        const STREAK_REWARDS = [0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.10];
        const nextDay = ((streakInfo.current_streak) % 7);
        streakInfo.next_reward = STREAK_REWARDS[nextDay] || 0.01;
      }
    }

    let subject = "";
    let htmlContent = "";

    if (reminder_type === 'streak_warning') {
      subject = "⚠️ Your Spin4Pi streak is about to break!";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 12px;">
          <h1 style="color: #ffd700; text-align: center;">🔥 Don't Lose Your Streak!</h1>
          <p style="font-size: 18px; text-align: center;">Your ${streakInfo.current_streak}-day streak is about to break!</p>
          <div style="background: rgba(255,215,0,0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; margin: 0; color: #ffd700;">🎁 Tomorrow's Reward: ${streakInfo.next_reward} π</p>
          </div>
          <p style="text-align: center;">Log in now to claim your daily reward and keep your streak alive!</p>
        </div>
      `;
    } else if (reminder_type === 'daily_reset') {
      subject = "🎁 Your Spin4Pi daily reward is ready!";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 12px;">
          <h1 style="color: #ffd700; text-align: center;">🎉 Daily Reward Available!</h1>
          <p style="font-size: 18px; text-align: center;">Your daily reward has reset and is ready to claim!</p>
          <div style="background: rgba(255,215,0,0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="font-size: 24px; margin: 0; color: #ffd700;">🔥 Current Streak: ${streakInfo.current_streak} days</p>
            <p style="font-size: 18px; margin-top: 10px;">Today's Reward: ${streakInfo.next_reward} π</p>
          </div>
          <p style="text-align: center;">Keep your streak going to earn bigger rewards!</p>
        </div>
      `;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid reminder_type" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailResponse = await sendEmail(resendApiKey, email, subject, htmlContent);
    console.log(`Reminder email sent to ${email}: ${reminder_type}`);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Email send error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
