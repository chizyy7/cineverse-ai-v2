'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signUp(formData: {
  email: string;
  username: string;
  password: string;
}) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookies().set({ name, value, ...options });
          } catch {
            // Ignore errors in server actions
          }
        },
        remove(name: string, options: any) {
          try {
            cookies().set({ name, value: '', ...options });
          } catch {
            // Ignore errors in server actions
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Note: In a real app, you would also create a profile in your database here
  // For now, we rely on the auth system and will create the profile when needed
  // via a trigger or in the onboarding process.

  // Return success to let the client handle redirect
  return { success: true };
}

export async function signIn(formData: {
  email: string;
  password: string;
}) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookies().set({ name, value, ...options });
          } catch {
            // Ignore errors in server actions
          }
        },
        remove(name: string, options: any) {
          try {
            cookies().set({ name, value: '', ...options });
          } catch {
            // Ignore errors in server actions
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Return success to let the client handle redirect
  return { success: true };
}

export async function signOut() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookies().set({ name, value, ...options });
          } catch {
            // Ignore errors in server actions
          }
        },
        remove(name: string, options: any) {
          try {
            cookies().set({ name, value: '', ...options });
          } catch {
            // Ignore errors in server actions
          }
        },
      },
    }
  );

  await supabase.auth.signOut();
  // Redirect to home page after sign out
  redirect('/');
}