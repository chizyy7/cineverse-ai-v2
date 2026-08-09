import axios from 'axios';
// Dummy cache functions for client-side to avoid ioredis bundling issues
const getCache = async <T>(_key: string): Promise<T | null> => {
  return null;
};
const setCache = async <T>(_key: string, _value: string | object, _ttlSeconds?: number): Promise<boolean> => {
  return false;
};

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('⚠️  TMDB_API_KEY is not set — movie/TV recommendations will be skipped');
}

const tmdbApi = TMDB_API_KEY
  ? axios.create({
      baseURL: TMDB_BASE_URL,
      params: { api_key: TMDB_API_KEY },
    })
  : null;

// Guard helper — returns empty array when tmdbApi is unavailable
async function tmdbGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  if (!tmdbApi) return [] as unknown as T;
  const response = await tmdbApi.get(path, params ? { params } : undefined);
  return response.data.results ?? response.data;
}



// Types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
  popularity: number;
  video: boolean;
  adult: boolean;
  original_language: string;
}

// TMDB API response interface
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// For endpoints that return a single object instead of a list
export interface TMDBMovieResponse extends TMDBResponse<TMDBMovie> {}

export interface TMDBShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  first_air_date: string;
  genre_ids: number[];
  popularity: number;
  original_language: string;
  origin_country: string[];
}

export interface TMDBCredits {
  id: number;
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    profile_path: string | null;
  }[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface TMDBWatchResults {
  link: string;
  flatrate: TMDBWatchProvider[];
  rent: TMDBWatchProvider[];
  buy: TMDBWatchProvider[];
  free: TMDBWatchProvider[];
}

// Cache keys
const CACHE_KEYS = {
  SEARCH_MOVIES: (query: string) => `tmdb:search:movies:${query}`,
  GET_MOVIE_DETAILS: (id: number) => `tmdb:movie:${id}`,
  GET_MOVIE_RECOMMENDATIONS: (id: number) => `tmdb:movie:${id}:recommendations`,
  SEARCH_TV: (query: string) => `tmdb:search:tv:${query}`,
  GET_TV_DETAILS: (id: number) => `tmdb:tv:${id}`,
  GET_TV_RECOMMENDATIONS: (id: number) => `tmdb:tv:${id}:recommendations`,
  GET_POPULAR_MOVIES: (genreId: number) => `tmdb:popular:movies:${genreId}`,
  DISCOVER_MOVIES: (filters: { genreIds?: number[]; releaseDateGte?: string; releaseDateLte?: string; voteAverageGte?: number; sortBy?: string; page?: number; }) => `tmdb:discover:movies:${JSON.stringify(filters)}`,
  GET_GENRES: 'tmdb:genres:list',
  GET_WATCH_PROVIDERS_MOVIE: (id: number) => `tmdb:movie:${id}:watch/providers`,
  GET_WATCH_PROVIDERS_TV: (id: number) => `tmdb:tv:${id}:watch/providers`,
};

// API Functions
export const tmdb = {
  // Core API method
  get: async <T = any>(path: string, params?: Record<string, unknown>): Promise<TMDBResponse<T>> => {
    if (!tmdbApi) return ({ page: 1, results: [], total_pages: 0, total_results: 0 } as unknown) as TMDBResponse<T>;
    const response = await tmdbApi.get(path, params ? { params } : undefined);
    return response.data as TMDBResponse<T>;
  },

  // Movie functions
  searchMovies: async (query: string): Promise<TMDBMovie[]> => {
    const cacheKey = CACHE_KEYS.SEARCH_MOVIES(query);
    
    // Try to get from cache first
    const cached = await getCache<TMDBMovie[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: { query, language: 'en-US', page: 1 },
      });
      const result = response.data.results;
      
      // Cache for 1 hour
      await setCache(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
    }
  },

  getMovieDetails: async (id: number): Promise<TMDBMovie> => {
    const cacheKey = CACHE_KEYS.GET_MOVIE_DETAILS(id);
    
    // Try to get from cache first
    const cached = await getCache<TMDBMovie>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get(`/movie/${id}`, {
        params: { language: 'en-US' },
      });
      const result = response.data;
      
      // Cache for 6 hours (movie details don't change often)
      await setCache(cacheKey, result, 21600);
      
      return result;
    } catch (error) {
      console.error(`Error getting movie details for ID ${id}:`, error);
      throw new Error(`Failed to get movie details for ID ${id}`);
    }
  },

  getMovieRecommendations: async (id: number): Promise<TMDBMovie[]> => {
    const cacheKey = CACHE_KEYS.GET_MOVIE_RECOMMENDATIONS(id);
    
    // Try to get from cache first
    const cached = await getCache<TMDBMovie[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get(`/movie/${id}/recommendations`, {
        params: { language: 'en-US', page: 1 },
      });
      const result = response.data.results;
      
      // Cache for 3 hours
      await setCache(cacheKey, result, 10800);
      
      return result;
    } catch (error) {
      console.error(`Error getting movie recommendations for ID ${id}:`, error);
      throw new Error(`Failed to get movie recommendations for ID ${id}`);
    }
  },

  // TV functions
  searchTV: async (query: string): Promise<TMDBShow[]> => {
    const cacheKey = CACHE_KEYS.SEARCH_TV(query);
    
    // Try to get from cache first
    const cached = await getCache<TMDBShow[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get('/search/tv', {
        params: { query, language: 'en-US', page: 1 },
      });
      const result = response.data.results;
      
      // Cache for 1 hour
      await setCache(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error('Error searching TV shows:', error);
      throw new Error('Failed to search TV shows');
    }
  },

  getTVDetails: async (id: number): Promise<TMDBShow> => {
    const cacheKey = CACHE_KEYS.GET_TV_DETAILS(id);
    
    // Try to get from cache first
    const cached = await getCache<TMDBShow>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get(`/tv/${id}`, {
        params: { language: 'en-US' },
      });
      const result = response.data;
      
      // Cache for 6 hours
      await setCache(cacheKey, result, 21600);
      
      return result;
    } catch (error) {
      console.error(`Error getting TV details for ID ${id}:`, error);
      throw new Error(`Failed to get TV details for ID ${id}`);
    }
  },

  getTVRecommendations: async (id: number): Promise<TMDBShow[]> => {
    const cacheKey = `tmdb:tv:${id}:recommendations`;
    
    // Try to get from cache first
    const cached = await getCache<TMDBShow[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get(`/tv/${id}/recommendations`, {
        params: { language: 'en-US', page: 1 },
      });
      const result = response.data.results;
      
      // Cache for 3 hours
      await setCache(cacheKey, result, 10800);
      
      return result;
    } catch (error) {
      console.error(`Error getting TV recommendations for ID ${id}:`, error);
      throw new Error(`Failed to get TV recommendations for ID ${id}`);
    }
  },

  // Genre functions
  getPopularMovies: async (genreId: number): Promise<TMDBMovie[]> => {
    const cacheKey = CACHE_KEYS.GET_POPULAR_MOVIES(genreId);
    
    // Try to get from cache first
    const cached = await getCache<TMDBMovie[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get('/discover/movie', {
        params: {
          with_genres: genreId,
          sort_by: 'popularity.desc',
          language: 'en-US',
          page: 1,
        },
      });
      const result = response.data.results;
      
      // Cache for 3 hours
      await setCache(cacheKey, result, 10800);
      
      return result;
    } catch (error) {
      console.error(`Error getting popular movies for genre ${genreId}:`, error);
      throw new Error(`Failed to get popular movies for genre ${genreId}`);
    }
  },

  discoverMovies: async (filters: {
    genreIds?: number[];
    releaseDateGte?: string;
    releaseDateLte?: string;
    voteAverageGte?: number;
    sortBy?: string;
    page?: number;
  }): Promise<{ results: TMDBMovie[]; total_pages: number; total_results: number }> => {
    const cacheKey = CACHE_KEYS.DISCOVER_MOVIES(filters);
    
    // Try to get from cache first
    const cached = await getCache<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await tmdbApi.get('/discover/movie', {
        params: {
          with_genres: filters.genreIds?.join(','),
          'release_date.gte': filters.releaseDateGte,
          'release_date.lte': filters.releaseDateLte,
          'vote_average.gte': filters.voteAverageGte,
          sort_by: filters.sortBy || 'popularity.desc',
          language: 'en-US',
          page: filters.page || 1,
        },
      });
      const result = response.data;
      
      // Cache for 30 minutes (discover results can change more frequently)
      await setCache(cacheKey, result, 1800);
      
      return result;
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw new Error('Failed to discover movies');
    }
  },

  // Genre list
  getGenres: async (): Promise<{ genres: TMDBGenre[] }> => {
    const cacheKey = CACHE_KEYS.GET_GENRES;

    // Try to get from cache first
    const cached = await getCache<{ genres: TMDBGenre[] }>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await tmdbApi.get('/genre/movie/list', {
        params: { language: 'en-US' },
      });
      const result = response.data;

      // Cache for 24 hours (genres rarely change)
      await setCache(cacheKey, result, 86400);

      return result;
    } catch (error) {
      console.error('Error getting genres:', error);
      throw new Error('Failed to get genres');
    }
  },

  // Get TV genres
  getTVGenres: async (): Promise<{ genres: TMDBGenre[] }> => {
    const cacheKey = `tmdb:genres:tv:list`;

    // Try to get from cache first
    const cached = await getCache<{ genres: TMDBGenre[] }>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await tmdbApi.get('/genre/tv/list', {
        params: { language: 'en-US' },
      });
      const result = response.data;

      // Cache for 24 hours (genres rarely change)
      await setCache(cacheKey, result, 86400);

      return result;
    } catch (error) {
      console.error('Error getting TV genres:', error);
      throw new Error('Failed to get TV genres');
    }
  },

  // Watch providers
  getMovieWatchProviders: async (id: number): Promise<TMDBWatchResults | null> => {
    const cacheKey = CACHE_KEYS.GET_WATCH_PROVIDERS_MOVIE(id);

    // Try to get from cache first
    const cached = await getCache<TMDBWatchResults | null>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await tmdbApi.get(`/movie/${id}/watch/providers`, {
        params: { language: 'en-US' },
      });
      const result = response.data.results?.US || null;

      // Cache for 8 hours (providers can change but not too frequently)
      await setCache(cacheKey, result, 28800);

      return result;
    } catch (error) {
      console.error(`Error getting watch providers for movie ${id}:`, error);
      // Return null instead of throwing to allow graceful degradation
      return null;
    }
  },

  getTVWatchProviders: async (id: number): Promise<{ [countryCode: string]: TMDBWatchResults } | null> => {
    const cacheKey = CACHE_KEYS.GET_WATCH_PROVIDERS_TV(id);

    // Try to get from cache first
    const cached = await getCache<{ [countryCode: string]: TMDBWatchResults } | null>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await tmdbApi.get(`/tv/${id}/watch/providers`, {
        params: { language: 'en-US' },
      });
      const result = response.data.results || null;

      // Cache for 8 hours (providers can change but not too frequently)
      await setCache(cacheKey, result, 28800);

      return result;
    } catch (error) {
      console.error(`Error getting watch providers for TV show ${id}:`, error);
      // Return null instead of throwing to allow graceful degradation
      return null;
    }
  },
};

export default tmdb;
