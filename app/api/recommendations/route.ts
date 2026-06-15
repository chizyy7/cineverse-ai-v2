import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { tmdb } from '@/lib/tmdb';
import { anime } from '@/lib/anime';
import { spotify } from '@/lib/spotify';
import { normalizeContent } from '@/lib/content';
import { generateRecommendations } from '@/lib/ai/recommendations';
import { getCache, setCache } from '@/lib/cache';

async function getRecommendationsForUser(
  userId: string,
  mood: string | undefined,
  contentTypes: string[] | undefined,
  limit: number | undefined
) {
  const results: any[] = [];

  try {
    const popularMovies = await tmdb.getPopularMovies(28);
    results.push(...popularMovies.slice(0, 3).map(movie => normalizeContent(movie, 'movie')));
  } catch (error) {
    console.error('Error getting popular movies:', error);
  }

  try {
    const topAnime = await anime.getTopAnime('action');
    results.push(...topAnime.slice(0, 3).map(item => normalizeContent(item, 'anime')));
  } catch (error) {
    console.error('Error getting top anime:', error);
  }

  try {
    const artists = await spotify.searchArtists('rock');
    results.push(...artists.slice(0, 3).map(item => normalizeContent(item, 'music')));
  } catch (error) {
    console.error('Error searching artists:', error);
  }

  return results.slice(0, limit || 10);
}

export async function POST(request: NextRequest) {
  try {
    const { userId, mood, contentTypes, limit } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const cacheKey = `recommendations:${userId}:${mood || 'none'}:${contentTypes?.join(',') || 'all'}:${limit || 10}`;

    const cached = await getCache<any[]>(cacheKey);
    if (cached !== null) {
      return NextResponse.json({ recommendations: cached });
    }

    const recommendations = await getRecommendationsForUser(
      userId,
      mood,
      contentTypes,
      limit
    );

    await setCache(cacheKey, recommendations, 1800);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
