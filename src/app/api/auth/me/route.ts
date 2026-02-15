import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import {
  successResponse,
  handleError,
  errorResponse,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/utils/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Get full user details
    const userDetails = await AuthService.getUserById(user.userId);

    if (!userDetails) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user: userDetails });
  } catch (error) {
    return handleError(error);
  }
}
