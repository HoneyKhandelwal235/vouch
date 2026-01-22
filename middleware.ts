import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // For now, allow all requests - we'll handle auth client-side
    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/auth/:path*', '/workspaces/:path*'],
}
