import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/utils/api-response';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // Clear auth cookies
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');

  return successResponse({ message: 'Logged out successfully' });
}
