import axios from 'axios';
import { getCache, setCache } from './cache';

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
async function tmdbGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  if (!tmdbApi) return [] as any;
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

// Cache keys
const CACHE_KEYS = {
  SEARCH_MOVIES: (query: string) => `tmdb:search:movies:${query}`,
  GET_MOVIE_DETAILS: (id: number) => `tmdb:movie:${id}`,
  GET_MOVIE_RECOMMENDATIONS: (id: number) => `tmdb:movie:${id}:recommendations`,
  SEARCH_TV: (query: string) => `tmdb:search:tv:${query}`,
  GET_TV_DETAILS: (id: number) => `tmdb:tv:${id}`,
  GET_TV_RECOMMENDATIONS: (id: number) => `tmdb:tv:${id}:recommendations`,
  GET_POPULAR_MOVIES: (genreId: number) => `tmdb:popular:movies:${genreId}`,
  DISCOVER_MOVIES: (filters: any) => `tmdb:discover:movies:${JSON.stringify(filters)}`,
  GET_GENRES: 'tmdb:genres:list',
};

// API Functions
export const tmdb = {
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
};

export default tmdb;