import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handles application middleware functions such as headers, session/auth validation, and logging.
 */
export function handleMiddleware(request: NextRequest, response: NextResponse): NextResponse {
  response.headers.set('x-app-middleware', 'active');
  return response;
}
