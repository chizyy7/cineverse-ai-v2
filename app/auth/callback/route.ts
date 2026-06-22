import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth callback error:', error.message);
      return NextResponse.redirect(`${origin}?error=${encodeURIComponent(error.message)}`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${origin}?error=no_user`);
    }

    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          username: user.user_metadata?.username || user.email!.split('@')[0],
        },
      });
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}?error=no_code`);
}
