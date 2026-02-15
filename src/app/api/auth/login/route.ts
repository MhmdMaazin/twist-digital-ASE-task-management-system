import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { loginSchema } from '@/lib/validations/auth';
import {
  successResponse,
  handleError,
  rateLimitResponse,
} from '@/lib/utils/api-response';
import { limitAuthRequest } from '@/lib/utils/rate-limit';
import { getClientIp } from '@/lib/utils/auth-helpers';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await limitAuthRequest(ip);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Login user
    const result = await AuthService.login(validatedData);

    // Set httpOnly cookies for tokens
    const cookieStore = await cookies();
    cookieStore.set('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    cookieStore.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return successResponse({
      user: result.user,
      accessToken: result.accessToken, // Also return in body for flexibility
    });
  } catch (error) {
    return handleError(error);
  }
}
