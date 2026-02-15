import { NextRequest } from 'next/server';
import { TasksService } from '@/lib/services/tasks.service';
import { updateTaskSchema } from '@/lib/validations/task';
import {
  successResponse,
  handleError,
  errorResponse,
  rateLimitResponse,
} from '@/lib/utils/api-response';
import { requireAuth } from '@/lib/utils/auth-helpers';
import { limitApiRequest } from '@/lib/utils/rate-limit';
import { getClientIp } from '@/lib/utils/auth-helpers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id] - Get a single task
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await limitApiRequest(ip);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // Require authentication
    const user = await requireAuth(request);

    // Get task ID from params
    const { id } = await context.params;

    // Get task
    const task = await TasksService.getTaskById(id, user.userId);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    return successResponse({ task });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/tasks/[id] - Update a task
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await limitApiRequest(ip);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // Require authentication
    const user = await requireAuth(request);

    // Get task ID from params
    const { id } = await context.params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Update task
    const task = await TasksService.updateTask(id, validatedData, user.userId);

    return successResponse({ task });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/tasks/[id] - Delete a task
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await limitApiRequest(ip);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.reset);
    }

    // Require authentication
    const user = await requireAuth(request);

    // Get task ID from params
    const { id } = await context.params;

    // Delete task
    await TasksService.deleteTask(id, user.userId);

    return successResponse({ message: 'Task deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}
