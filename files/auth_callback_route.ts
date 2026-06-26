import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server component cookie setting can throw — safe to ignore
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const supabaseUser = data.user

    // Check if this user already has a Prisma record (= has onboarded before)
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
        select: { id: true, entertainmentDNA: { select: { id: true } } },
      })

      if (existingUser?.entertainmentDNA) {
        // Returning user — go straight to dashboard
        return NextResponse.redirect(`${origin}/dashboard`)
      } else if (existingUser) {
        // Has account but no DNA yet — resume onboarding
        return NextResponse.redirect(`${origin}/onboarding`)
      } else {
        // Brand new user — create Prisma record then onboard
        const email = supabaseUser.email ?? ''
        const username = (
          supabaseUser.user_metadata?.preferred_username ||
          supabaseUser.user_metadata?.name ||
          email.split('@')[0]
        )
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .slice(0, 30)

        // Ensure username is unique by appending random suffix if needed
        const finalUsername = await ensureUniqueUsername(username)

        await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email,
            username: finalUsername,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
          },
        })

        return NextResponse.redirect(`${origin}/onboarding`)
      }
    } catch (dbError) {
      console.error('DB error in auth callback:', dbError)
      // Don't block the user — send to onboarding and let it handle the edge case
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  // No code — probably a direct hit, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}

async function ensureUniqueUsername(base: string): Promise<string> {
  const exists = await prisma.user.findUnique({ where: { username: base }, select: { id: true } })
  if (!exists) return base
  const suffix = Math.floor(Math.random() * 9000) + 1000
  return `${base.slice(0, 25)}_${suffix}`
}
