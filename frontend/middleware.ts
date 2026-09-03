import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleMiddleware } from './lib/middleware';
import { handleProxy } from './lib/proxy';

export function middleware(request: NextRequest) {
  // 1. Run Proxy handling (e.g. rewrites, forwarding)
  let response = handleProxy(request);

  // 2. Run Middleware handling (e.g. headers, auth, logging)
  response = handleMiddleware(request, response);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
