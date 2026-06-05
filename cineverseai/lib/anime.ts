import axios from 'axios';
import { getCache, setCache } from './cache';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

const jikanApi = axios.create({
  baseURL: JIKAN_BASE_URL,
});

// Types
export interface AnimeResult {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  title: string;
  title_english: string | null;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  aired: {
    from: string | null;
    to: string | null;
    prop: {
      from: { day: number; month: number; year: number } | null;
      to: { day: number; month: number; year: number } | null;
      string: string;
    };
  };
  duration: string | null;
  rating: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };
  producers: {
    mal_id: number;
    name: string;
    url: string;
  }[];
  licensors: {
    mal_id: number;
    name: string;
    url: string;
  }[];
  studios: {
    mal_id: number;
    name: string;
    url: string;
  }[];
  genres: {
    mal_id: number;
    name: string;
    type: string;
    url: string;
  }[];
  explicit_genres: {
    mal_id: number;
    name: string;
    type: string;
    url: string;
  }[];
  themes: {
    mal_id: number;
    name: string;
    type: string;
    url: string;
  }[];
}

export interface AnimeDetails extends AnimeResult {
  // Additional details if needed
}

// Cache keys
const CACHE_KEYS = {
  SEARCH_ANIME: (query: string) => `jikan:search:anime:${query}`,
  GET_ANIME_DETAILS: (id: number) => `jikan:anime:${id}`,
  GET_TOP_ANIME: (genre: string) => `jikan:top:anime:${genre || 'all'}`,
  GET_ANIME_RECOMMENDATIONS: (id: number) => `jikan:anime:${id}:recommendations`,
  GET_ANIME_GENRES: 'jikan:genres:anime',
};

// API Functions
export const anime = {
  searchAnime: async (query: string): Promise<AnimeResult[]> => {
    const cacheKey = CACHE_KEYS.SEARCH_ANIME(query);
    
    // Try to get from cache first
    const cached = await getCache<AnimeResult[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await jikanApi.get('/anime', {
        params: { q: query, limit: 20 },
      });
      const result = response.data.data;
      
      // Cache for 1 hour
      await setCache(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw new Error('Failed to search anime');
    }
  },

  getAnimeDetails: async (id: number): Promise<AnimeDetails> => {
    const cacheKey = CACHE_KEYS.GET_ANIME_DETAILS(id);
    
    // Try to get from cache first
    const cached = await getCache<AnimeDetails>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await jikanApi.get(`/anime/${id}`);
      const result = response.data.data;
      
      // Cache for 6 hours (anime details don't change often)
      await setCache(cacheKey, result, 21600);
      
      return result;
    } catch (error) {
      console.error(`Error getting anime details for ID ${id}:`, error);
      throw new Error(`Failed to get anime details for ID ${id}`);
    }
  },

  getTopAnime: async (genre: string): Promise<AnimeResult[]> => {
    const cacheKey = CACHE_KEYS.GET_TOP_ANIME(genre);
    
    // Try to get from cache first
    const cached = await getCache<AnimeResult[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      // Note: Jikan API doesn't have a direct genre filter for top anime
      // We'll get top anime and filter by genre client-side for demo
      const response = await jikanApi.get('/top/anime', {
        params: { limit: 50 },
      });
      
      // Filter by genre if genre is specified
      let result = response.data.data;
      if (genre) {
        result = result.filter((anime: AnimeResult) => 
          anime.genres.some((g: any) => g.name.toLowerCase() === genre.toLowerCase())
        ).slice(0, 20);
      } else {
        result = result.slice(0, 20);
      }
      
      // Cache for 3 hours
      await setCache(cacheKey, result, 10800);
      
      return result;
    } catch (error) {
      console.error(`Error getting top anime for genre ${genre}:`, error);
      throw new Error(`Failed to get top anime for genre ${genre}`);
    }
  },

  getAnimeRecommendations: async (id: number): Promise<AnimeResult[]> => {
    const cacheKey = CACHE_KEYS.GET_ANIME_RECOMMENDATIONS(id);
    
    // Try to get from cache first
    const cached = await getCache<AnimeResult[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await jikanApi.get(`/anime/${id}/recommendations`);
      const result = response.data.data.map((rec: any) => rec.entry);
      
      // Cache for 3 hours
      await setCache(cacheKey, result, 10800);
      
      return result;
    } catch (error) {
      console.error(`Error getting anime recommendations for ID ${id}:`, error);
      throw new Error(`Failed to get anime recommendations for ID ${id}`);
    }
  },

  getAnimeGenres: async (): Promise<{ mal_id: number; name: string }[]> => {
    const cacheKey = CACHE_KEYS.GET_ANIME_GENRES;
    
    // Try to get from cache first
    const cached = await getCache<{ mal_id: number; name: string }[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await jikanApi.get('/genres/anime');
      const result = response.data.data;
      
      // Cache for 24 hours (genres rarely change)
      await setCache(cacheKey, result, 86400);
      
      return result;
    } catch (error) {
      console.error('Error getting anime genres:', error);
      throw new Error('Failed to get anime genres');
    }
  },
};

export default anime;