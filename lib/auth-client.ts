import { createClientBrowser } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';

export async function getUserClient(): Promise<User | null> {
  const supabase = createClientBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function signOutClient() {
  const supabase = createClientBrowser();
  await supabase.auth.signOut();
}

export async function requireAuthClient(): Promise<User> {
  const user = await getUserClient();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}