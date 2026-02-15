import { NextRequest } from 'next/server';
import { TasksService } from '@/lib/services/tasks.service';
import {
  successResponse,
  handleError,
  rateLimitResponse,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { limitApiRequest } from '@/lib/utils/rate-limit';
import { getClientIp } from '@/lib/utils/auth-helpers';

/**
 * GET /api/tasks/stats - Get task statistics for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await limitApiRequest(ip);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // Require authentication
    const user = await requireAuth(request);

    // Get stats
    const stats = await TasksService.getTaskStats(user.userId);

    return successResponse({ stats });
  } catch (error) {
    return handleError(error);
  }
}
