import { NextRequest } from 'next/server';
import { TasksService } from '@/lib/services/tasks.service';
import { createTaskSchema } from '@/lib/validations/task';
import {
  successResponse,
  handleError,
  rateLimitResponse,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { limitApiRequest } from '@/lib/utils/rate-limit';
import { getClientIp } from '@/lib/utils/auth-helpers';

/**
 * GET /api/tasks - Get all tasks for authenticated user
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

    // Get tasks
    const tasks = await TasksService.getUserTasks(user.userId);

    return successResponse({ tasks });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await limitApiRequest(ip);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // Require authentication
    const user = await requireAuth(request);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Create task
    const task = await TasksService.createTask(validatedData, user.userId);

    return successResponse({ task }, 201);
  } catch (error) {
    return handleError(error);
  }
}
