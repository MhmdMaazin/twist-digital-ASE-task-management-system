import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import {
  successResponse,
  handleError,
  errorResponse,
} from '@/lib/utils/api-response';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const cookieStore = await cookies();
    let refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      const body = await request.json();
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return errorResponse('Refresh token required', 401);
    }

    // Refresh tokens
    const result = await AuthService.refresh(refreshToken);

    // Set new tokens in cookies
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
      accessToken: result.accessToken,
    });
  } catch (error) {
    return handleError(error);
  }
}
