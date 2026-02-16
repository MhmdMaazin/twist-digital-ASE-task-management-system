import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Standard API error response (prevents stack trace leaks)
 */
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: any
) {
  const response: any = {
    success: false,
    error: {
      message,
    },
  };

  // Only include errors in development or if they're validation errors
  if (errors && (process.env.NODE_ENV === 'development' || errors.details)) {
    response.error.details = errors.details || errors;
  }

  return NextResponse.json(response, { status });
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError) {
  const issues = error.issues;
  const details = issues.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return errorResponse('Validation failed', 400, { details });
}

/**
 * Handle generic errors safely (no stack trace leaks)
 */
export function handleError(error: unknown) {
  // Log error for debugging (server-side only)
  console.error('API Error:', error);

  // Zod validation error
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  // Known error with message
  if (error instanceof Error) {
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      // Only expose safe error messages
      const safeErrors = [
        'Invalid email or password',
        'Email already registered',
        'Task not found or unauthorized',
        'Invalid refresh token',
        'User not found',
        'Unauthorized',
        'Invalid task ID',
      ];

      if (safeErrors.some((msg) => error.message.includes(msg))) {
        return errorResponse(error.message, 400);
      }

      // Generic error for production
      return errorResponse('An error occurred', 500);
    }

    // Development: show actual error
    return errorResponse(error.message, 400);
  }

  // Unknown error type
  return errorResponse('An unexpected error occurred', 500);
}

/**
 * Rate limit exceeded response
 */
export function rateLimitResponse(reset: Date | number) {
  const resetDate = reset instanceof Date ? reset : new Date(reset);
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        reset: resetDate.toISOString(),
      },
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((resetDate.getTime() - Date.now()) / 1000)),
      },
    }
  );
}
