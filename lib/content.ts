// Unified content normalizer
// Normalize TMDB + Jikan + Spotify results into a single ContentItem type

import { tmdb } from './tmdb';

export type ContentType = 'movie' | 'anime' | 'tv' | 'music' | 'podcast';

export interface ContentItem {
  id: string; // External ID from TMDB, Jikan, Spotify, etc.
  title: string;
  type: ContentType;
  posterUrl: string | null;
  rating: number | null; // Average rating (e.g., vote_average from TMDB, score from Jikan, etc.)
  genres: string[]; // Array of genre names
  platforms: string[]; // Array of platform names (e.g., Netflix, Spotify, etc.)
  streamingUrl: string | null; // URL to stream/watch (if available)
  description: string | null;
  year: number | null; // Release year
  matchScore?: number; // Optional: AI-generated match score (0-100)
}

// Cache for genre maps to avoid repeated API calls
let movieGenreMap: Record<number, string> = {};
let tvGenreMap: Record<number, string> = {};
let genresLoaded = false;

// Load genre maps from TMDB
async function loadGenreMaps(): Promise<void> {
  if (genresLoaded) return;

  try {
    const genresData = await tmdb.getGenres();
    const movieGenres = genresData.genres.filter((g: any) => g.id > 0); // TMDB returns both movie and TV genres in one call
    const tvGenres = genresData.genres.filter((g: any) => g.id > 0); // In reality, we'd need to separate them, but TMDB's genre endpoint returns both

    // Create maps for quick lookup
    movieGenres.forEach((genre: { id: number; name: string }) => {
      movieGenreMap[genre.id] = genre.name;
    });

    tvGenres.forEach((genre: { id: number; name: string }) => {
      tvGenreMap[genre.id] = genre.name;
    });

    genresLoaded = true;
  } catch (error) {
    console.error('Failed to load genre maps:', error);
    // Continue with empty maps - will show empty genres array
  }
}

// Get genre names from genre IDs
function getGenreNames(genreIds: number[], type: ContentType): string[] {
  if (genreIds.length === 0) return [];

  // Ensure genres are loaded (fire and forget)
  if (!genresLoaded) {
    loadGenreMaps().catch(console.error);
  }

  const genreMap = type === 'movie' ? movieGenreMap : tvGenreMap;
  return genreIds
    .map(id => genreMap[id])
    .filter((name): name is string => name !== undefined);
}

// Get watch providers (streaming platforms) for a movie or TV show
async function getWatchProviders(id: number, type: ContentType): Promise<{ platforms: string[]; streamingUrl: string | null }> {
  // Ensure genres are loaded (fire and forget)
  if (!genresLoaded) {
    loadGenreMaps().catch(console.error);
  }

  try {
    if (type === 'movie') {
      const results = await tmdb.getMovieWatchProviders(id);
      if (results && results.flatrate) {
        // Get up to 3 streaming platforms for display
        const platforms = results.flatrate
          .slice(0, 3)
          .map(provider => provider.provider_name);

        // Get the deep link for streaming
        const streamingUrl = results.link || null;

        return { platforms, streamingUrl };
      }
    } else if (type === 'tv') {
      const results = await tmdb.getTVWatchProviders(id);
      if (results && results.US && results.US.flatrate) {
        // Get up to 3 streaming platforms for display (US region)
        const platforms = results.US.flatrate
          .slice(0, 3)
          .map(provider => provider.provider_name);

        // Get the deep link for streaming
        const streamingUrl = results.US.link || null;

        return { platforms, streamingUrl };
      }
    }
  } catch (error) {
    console.error(`Error getting watch providers for ${type} ${id}:`, error);
  }

  // Return empty arrays if no providers found or error occurred
  return { platforms: [], streamingUrl: null };
}

// Normalize TMDB Movie
export async function normalizeTMDBMovie(movie: any): Promise<ContentItem> {
  // Ensure genre maps are loaded
  if (!genresLoaded) {
    await loadGenreMaps();
  }

  const { platforms, streamingUrl } = await getWatchProviders(movie.id, 'movie');

  return {
    id: movie.id.toString(),
    title: movie.title,
    type: 'movie',
    posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    rating: movie.vote_average,
    genres: getGenreNames(movie.genre_ids || [], 'movie'),
    platforms, // Now populated with actual streaming platforms
    streamingUrl, // Now populated with actual streaming URL
    description: movie.overview,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
  };
}

// Normalize TMDB TV Show
export async function normalizeTMDBShow(show: any): Promise<ContentItem> {
  // Ensure genre maps are loaded
  if (!genresLoaded) {
    await loadGenreMaps();
  }

  const { platforms, streamingUrl } = await getWatchProviders(show.id, 'tv');

  return {
    id: show.id.toString(),
    title: show.name,
    type: 'tv',
    posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
    rating: show.vote_average,
    genres: getGenreNames(show.genre_ids || [], 'tv'),
    platforms, // Now populated with actual streaming platforms
    streamingUrl, // Now populated with actual streaming URL
    description: show.overview,
    year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
  };
}

// Normalize Jikan Anime
export function normalizeJikanAnime(anime: any): ContentItem {
  return {
    id: anime.mal_id.toString(),
    title: anime.title_english || anime.title,
    type: 'anime',
    posterUrl: anime.images.jpg.image_url,
    rating: anime.score,
    genres: anime.genres.map((g: any) => g.name),
    platforms: [], // Jikan doesn't provide streaming platforms
    streamingUrl: null,
    description: anime.synopsis,
    year: anime.year,
  };
}

// Normalize Spotify Artist
export function normalizeSpotifyArtist(artist: any): ContentItem {
  return {
    id: artist.id,
    title: artist.name,
    type: 'music',
    posterUrl: artist.images[0]?.url || null,
    rating: artist.popularity / 10, // Convert 0-100 to 0-10 scale for consistency
    genres: artist.genres,
    platforms: ['Spotify'],
    streamingUrl: artist.external_urls.spotify,
    description: null, // Artists don't have a description in this context
    year: null,
  };
}

// Normalize Spotify Track (if we were to use tracks, but the prompt says search for artists and playlists)
// We might not need this for the content normalizer as per the prompt, but let's have it for completeness.
export function normalizeSpotifyTrack(track: any): ContentItem {
  return {
    id: track.id,
    title: track.name,
    type: 'music',
    posterUrl: track.album.images[0]?.url || null,
    rating: track.popularity / 10,
    genres: [], // Tracks don't have genres directly; we'd need to get from album/artist
    platforms: ['Spotify'],
    streamingUrl: track.external_urls.spotify,
    description: null,
    year: track.album.release_date ? new Date(track.album.release_date).getFullYear() : null,
  };
}

// We don't have a podcast normalizer in the prompt, but we can add a placeholder if needed.
// For now, we'll assume podcasts are handled similarly to music or we can extend later.

// Main normalization function that dispatches based on type
export async function normalizeContent(rawData: any, type: ContentType): Promise<ContentItem> {
  switch (type) {
    case 'movie':
      return await normalizeTMDBMovie(rawData);
    case 'tv':
      return await normalizeTMDBShow(rawData);
    case 'anime':
      return normalizeJikanAnime(rawData);
    case 'music':
      // Assuming we are normalizing an artist for music type
      return normalizeSpotifyArtist(rawData);
    case 'podcast':
      // Placeholder for podcast normalization
      return {
        id: rawData.id || '',
        title: rawData.title || rawData.name || 'Unknown Podcast',
        type: 'podcast',
        posterUrl: rawData.image || null,
        rating: null,
        genres: [],
        platforms: [],
        streamingUrl: rawData.url || null,
        description: rawData.description || null,
        year: null,
      };
    default:
      throw new Error(`Unsupported content type: ${type}`);
  }
}