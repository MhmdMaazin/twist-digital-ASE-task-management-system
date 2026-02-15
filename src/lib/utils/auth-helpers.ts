import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyAccessToken } from '../auth/jwt';

/**
 * Get user from request (server-side)
 */
export async function getUserFromRequest(request: NextRequest) {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('accessToken')?.value || null;
  }

  if (!token) {
    return null;
  }

  // Verify token
  const payload = await verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
  };
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Get client IP for rate limiting
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0]!.trim();
  }

  if (real) {
    return real.trim();
  }

  return 'unknown';
}
