// Unified content normalizer
// Normalize TMDB + Jikan + Spotify results into a single ContentItem type

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

// Normalize TMDB Movie
export function normalizeTMDBMovie(movie: any): ContentItem {
  return {
    id: movie.id.toString(),
    title: movie.title,
    type: 'movie',
    posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    rating: movie.vote_average,
    genres: [], // We'll need to map genre IDs to names - this would require a genre map
    platforms: [], // TMDB doesn't provide platforms directly in this endpoint; we'd need to use watch/providers endpoint
    streamingUrl: null, // Would need to be filled by watch/providers endpoint
    description: movie.overview,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
  };
}

// Normalize TMDB TV Show
export function normalizeTMDBShow(show: any): ContentItem {
  return {
    id: show.id.toString(),
    title: show.name,
    type: 'tv',
    posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
    rating: show.vote_average,
    genres: [],
    platforms: [],
    streamingUrl: null,
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
export function normalizeContent(rawData: any, type: ContentType): ContentItem {
  switch (type) {
    case 'movie':
      return normalizeTMDBMovie(rawData);
    case 'tv':
      return normalizeTMDBShow(rawData);
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