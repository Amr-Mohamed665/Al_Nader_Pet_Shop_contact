import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handles proxy functions such as API request forwarding, backend routing, or URL rewrites.
 */
export function handleProxy(request: NextRequest): NextResponse {
  // Pass-through by default; customize proxying or rewrites here
  return NextResponse.next();
}
