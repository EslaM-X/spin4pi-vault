// Shared authentication helper for Pi Network verification
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schemas
export const UsernameSchema = z.string().min(1).max(50).regex(/^[a-zA-Z0-9_.-]+$/);
export const SpinTypeSchema = z.enum(['free', 'basic', 'pro', 'vault']);
export const AmountSchema = z.number().positive().min(0.01).max(10000);
export const WithdrawAmountSchema = z.number().positive().min(0.1).max(1000);
export const UUIDSchema = z.string().uuid();
export const PaymentIdSchema = z.string().min(1).max(200);
export const MemoSchema = z.string().max(500).optional();
export const EmailSchema = z.string().email().max(255);
export const ReminderTypeSchema = z.enum(['streak_warning', 'daily_reset']);

// Request body size limit (10KB)
const MAX_BODY_SIZE = 10 * 1024;

export interface PiUser {
  uid: string;
  username: string;
}

export interface AuthResult {
  success: boolean;
  user?: PiUser;
  error?: string;
  status?: number;
}

/**
 * Verify Pi Network access token and return authenticated user
 */
export async function verifyPiToken(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      success: false, 
      error: 'Missing or invalid authorization header',
      status: 401
    };
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token || token.length < 10) {
    return {
      success: false,
      error: 'Invalid token format',
      status: 401
    };
  }

  try {
    // Verify token with Pi Network API
    const response = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('Pi Network auth failed:', response.status);
      return {
        success: false,
        error: 'Invalid or expired token',
        status: 401
      };
    }

    const userData = await response.json();
    
    if (!userData.username) {
      return {
        success: false,
        error: 'Invalid user data from Pi Network',
        status: 401
      };
    }

    return {
      success: true,
      user: {
        uid: userData.uid,
        username: userData.username
      }
    };
  } catch (error) {
    console.error('Pi auth error:', error);
    return {
      success: false,
      error: 'Authentication service unavailable',
      status: 503
    };
  }
}

/**
 * Verify that authenticated user matches the requested username
 */
export function verifyUserMatch(authenticatedUser: PiUser, requestedUsername: string): boolean {
  return authenticatedUser.username.toLowerCase() === requestedUsername.toLowerCase();
}

/**
 * Parse and validate request body with size limit
 */
export async function parseRequestBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<{ data?: T; error?: string }> {
  try {
    // Check content length
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return { error: 'Request body too large' };
    }

    const text = await req.text();
    
    if (text.length > MAX_BODY_SIZE) {
      return { error: 'Request body too large' };
    }

    const json = JSON.parse(text);
    const result = schema.safeParse(json);
    
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { error: `Validation failed: ${errors}` };
    }

    return { data: result.data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { error: 'Invalid JSON' };
    }
    return { error: 'Failed to parse request body' };
  }
}

/**
 * Create standardized error response
 */
export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Create standardized success response
 */
export function successResponse(data: unknown): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Handle errors safely without leaking internal details
 */
export function safeErrorResponse(error: unknown): Response {
  console.error('Internal error:', error);
  return new Response(
    JSON.stringify({ error: 'An error occurred processing your request' }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

export { corsHeaders };
