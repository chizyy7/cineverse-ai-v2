import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect dashboard, onboarding, and profile routes
  const protectedPaths = ['/dashboard', '/onboarding', '/profile'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    const session = await getSession();
    
    // If no session, redirect to login
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/(auth)/login';
      url.search = `callbackUrl=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }
  
  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (pathname.startsWith('/(auth)/')) {
    const session = await getSession();
    if (session) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/api (next.js API routes)
     * - _next/static (next.js static files)
     * - _next/image (next.js image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};