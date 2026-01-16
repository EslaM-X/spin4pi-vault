import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CheckAdminRequestSchema = z.object({
  pi_username: z.string().min(1).max(50),
});

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
        JSON.stringify({ error: authResult.error || 'Unauthorized', is_admin: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let requestData;
    try {
      const text = await req.text();
      if (text.length > 10240) {
        return new Response(
          JSON.stringify({ error: 'Request too large', is_admin: false }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requestData = CheckAdminRequestSchema.parse(JSON.parse(text));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data', is_admin: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { pi_username } = requestData;

    // Verify the authenticated user matches the requested username
    if (authResult.username?.toLowerCase() !== pi_username.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Username mismatch', is_admin: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('MY_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('pi_username', pi_username)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ is_admin: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('profile_id', profile.id)
      .maybeSingle();

    return new Response(
      JSON.stringify({ 
        is_admin: !!adminRole,
        role: adminRole?.role || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Check admin access error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred', is_admin: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
