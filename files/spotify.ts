import axios from 'axios';
import { getCache, setCache } from './cache';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.warn('⚠️  SPOTIFY_CLIENT_ID/SECRET not set — music recommendations will be skipped');
}

// Token cache
let accessToken: string | null = null;
let expiresAt: number = 0;

// Get access token using client credentials flow
async function getAccessToken(): Promise<string> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured');
  }
  // If we have a valid token, return it
  if (accessToken && Date.now() < expiresAt) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    const { access_token, expires_in } = response.data;
    accessToken = access_token;
    // Set expiration to 5 minutes before actual expiration to account for clock skew
    expiresAt = Date.now() + (expires_in - 300) * 1000;
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw new Error('Failed to get Spotify access token');
  }
}

// Create axios instance with token interception
const spotifyApi = axios.create({
  baseURL: SPOTIFY_API_URL,
});

spotifyApi.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Types
export interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  followers: {
    total: number;
  };
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  genres: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
  };
  artists: {
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }[];
}

// Cache keys
const CACHE_KEYS = {
  SEARCH_ARTISTS: (query: string) => `spotify:search:artists:${query}`,
  GET_ARTIST_TOP_TRACKS: (id: string) => `spotify:artist:${id}:top-tracks`,
  SEARCH_PLAYLISTS: (mood: string) => `spotify:search:playlists:${mood}`,
  GET_RECOMMENDATIONS: (seedArtists: string[], seedGenres: string[]) => `spotify:recommendations:${seedArtists.join(',')}:${seedGenres.join(',')}`,
  GET_ARTIST_GENRES: (id: string) => `spotify:artist:${id}:genres`,
};

// API Functions
export const spotify = {
  searchArtists: async (query: string): Promise<SpotifyArtist[]> => {
    const cacheKey = CACHE_KEYS.SEARCH_ARTISTS(query);
    
    // Try to get from cache first
    const cached = await getCache<SpotifyArtist[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await spotifyApi.get('/search', {
        params: {
          q: query,
          type: 'artist',
          limit: 20,
        },
      });
      const result = response.data.artists.items;
      
      // Cache for 1 hour
      await setCache(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error('Error searching Spotify artists:', error);
      throw new Error('Failed to search Spotify artists');
    }
  },

  getArtistTopTracks: async (id: string): Promise<SpotifyTrack[]> => {
    const cacheKey = CACHE_KEYS.GET_ARTIST_TOP_TRACKS(id);
    
    // Try to get from cache first
    const cached = await getCache<SpotifyTrack[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await spotifyApi.get(`/artists/${id}/top-tracks`, {
        params: {
          market: 'US', // Required parameter
        },
      });
      const result = response.data.tracks;
      
      // Cache for 3 hours (top tracks don't change often)
      await setCache(cacheKey, result, 10800);
      
      return result;
    } catch (error) {
      console.error(`Error getting top tracks for artist ${id}:`, error);
      throw new Error(`Failed to get top tracks for artist ${id}`);
    }
  },

  searchPlaylists: async (mood: string): Promise<any> => {
    // Note: We don't have a specific type for playlists in the prompt, so we'll return any for now
    const cacheKey = CACHE_KEYS.SEARCH_PLAYLISTS(mood);
    
    // Try to get from cache first
    const cached = await getCache<any[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await spotifyApi.get('/search', {
        params: {
          q: `${mood} playlist`,
          type: 'playlist',
          limit: 10,
        },
      });
      const result = response.data.playlists.items;
      
      // Cache for 1 hour
      await setCache(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      console.error(`Error searching playlists for mood ${mood}:`, error);
      throw new Error(`Failed to search playlists for mood ${mood}`);
    }
  },

  getRecommendations: async (seedArtists: string[], seedGenres: string[]): Promise<any> => {
    // Note: We don't have a specific type for recommendations in the prompt, so we'll return any for now
    const cacheKey = CACHE_KEYS.GET_RECOMMENDATIONS(seedArtists, seedGenres);
    
    // Try to get from cache first
    const cached = await getCache<any[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await spotifyApi.get('/recommendations', {
        params: {
          seed_artists: seedArtists.join(','),
          seed_genres: seedGenres.join(','),
          limit: 20,
        },
      });
      const result = response.data.tracks;
      
      // Cache for 30 minutes (recommendations can change)
      await setCache(cacheKey, result, 1800);
      
      return result;
    } catch (error) {
      console.error('Error getting Spotify recommendations:', error);
      throw new Error('Failed to get Spotify recommendations');
    }
  },

  getArtistGenres: async (id: string): Promise<string[]> => {
    const cacheKey = CACHE_KEYS.GET_ARTIST_GENRES(id);
    
    // Try to get from cache first
    const cached = await getCache<string[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const response = await spotifyApi.get(`/artists/${id}`);
      const result = response.data.genres;
      
      // Cache for 6 hours (artist genres don't change often)
      await setCache(cacheKey, result, 21600);
      
      return result;
    } catch (error) {
      console.error(`Error getting genres for artist ${id}:`, error);
      throw new Error(`Failed to get genres for artist ${id}`);
    }
  },
};

export default spotify;