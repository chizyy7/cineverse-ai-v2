'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function saveDNA(dnaData: {
  contentTypes: string[];
  genres: string[];
  favoriteMovies: string[];
  favoriteAnime: string[];
  favoriteArtists: string[];
  favoriteActors: string[];
  moodPreferences: string[];
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

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Calculate DNA scores based on selections (simplified for example)
  const dnaScores = {
    action: dnaData.genres.includes('action') ? 95 : 0,
    sciFi: dnaData.genres.includes('sci-fi') ? 91 : 0,
    comedy: dnaData.genres.includes('comedy') ? 40 : 0,
    romance: dnaData.genres.includes('romance') ? 15 : 0,
    crime: dnaData.genres.includes('crime') ? 0 : 0,
    fantasy: dnaData.genres.includes('fantasy') ? 0 : 0,
    documentary: dnaData.genres.includes('documentary') ? 0 : 0,
    thriller: dnaData.genres.includes('thriller') ? 0 : 0,
    adventure: dnaData.genres.includes('adventure') ? 76 : 0,
    horror: dnaData.genres.includes('horror') ? 0 : 0,
    anime: dnaData.contentTypes.includes('anime') ? 80 : 0,
    music: dnaData.contentTypes.includes('music') ? 60 : 0,
    podcast: dnaData.contentTypes.includes('podcasts') ? 50 : 0,
    emotional: dnaData.moodPreferences.includes('emotional') ? 70 : 0,
    funny: dnaData.moodPreferences.includes('funny') ? 80 : 0,
    inspirational: dnaData.moodPreferences.includes('inspirational') ? 75 : 0,
    dark: dnaData.moodPreferences.includes('dark') ? 82 : 0,
    mindBlowing: dnaData.moodPreferences.includes('mind-blowing') ? 90 : 0,
    relaxing: dnaData.moodPreferences.includes('relaxing') ? 65 : 0,
    intense: dnaData.moodPreferences.includes('intense') ? 85 : 0,
    familyFriendly: dnaData.moodPreferences.includes('family-friendly') ? 60 : 0,
  };

  // Save to the entertainment_dna table
  const { error } = await supabase
    .from('entertainment_dna')
    .upsert({
      user_id: user.id,
      ...dnaScores,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }

  // Return success to let the client handle redirect
  return { success: true };
}