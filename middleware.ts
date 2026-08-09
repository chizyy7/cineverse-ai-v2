import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getEnv } from './lib/env';

// Premium-protected paths that require subscription
const premiumPaths = [
  '/analytics',           // Deep analytics + monthly reports
  '/chat',               // AI Chat Assistant (unlimited messages)
  '/collections',        // Unlimited collections (if we implement this route)
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value);
          supabaseResponse = NextResponse.next({ request });
          supabaseResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          request.cookies.set(name, '');
          supabaseResponse = NextResponse.next({ request });
          supabaseResponse.cookies.set(name, '', options);
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Authentication check for protected paths
  const protectedPaths = ['/dashboard', '/onboarding', '/profile'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Premium feature gating
  const isPremiumPath = premiumPaths.some(path => pathname.startsWith(path));
  if (isPremiumPath) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has premium subscription
    try {
      const { data: premiumUser } = await supabase
        .from('User')
        .select('stripeSubscriptionId, stripeCurrentPeriodEnd')
        .eq('id', user.id)
        .single();

      const isSubscribed = !!premiumUser?.stripeSubscriptionId &&
                          !!premiumUser?.stripeCurrentPeriodEnd &&
                          new Date(premiumUser.stripeCurrentPeriodEnd) > new Date();

      if (!isSubscribed) {
        const url = request.nextUrl.clone();
        url.pathname = '/pricing';
        url.searchParams.set('upgrade', 'true');
        url.searchParams.set('message', 'This is a Premium feature');
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      // If there's an error checking subscription, allow access to avoid blocking users
      // In production, you might want to be more restrictive
    }
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};