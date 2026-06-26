/**
 * Ensures a Prisma User record exists for the given Supabase user.
 * Call this at the start of any API route that touches the DB.
 */
import { prisma } from '@/lib/prisma'
import { User } from '@supabase/supabase-js'

export async function ensurePrismaUser(supabaseUser: User): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { id: true },
  })

  if (!existing) {
    const email = supabaseUser.email ?? ''
    const baseUsername = (
      supabaseUser.user_metadata?.preferred_username ||
      supabaseUser.user_metadata?.name ||
      email.split('@')[0]
    )
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 30)

    // Make username unique
    let username = baseUsername
    const conflict = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    if (conflict) {
      username = `${baseUsername.slice(0, 25)}_${Math.floor(Math.random() * 9000) + 1000}`
    }

    await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email,
        username,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
      },
    })
  }
}
