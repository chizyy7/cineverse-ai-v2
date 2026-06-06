import OpenAI from 'openai';
import { tmdb } from '@/lib/tmdb';
import { anime } from '@/lib/anime';
import { spotify } from '@/lib/spotify';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
}

export interface AIAssistantContext {
  userId: string;
  userDNA?: {
    action: number;
    sciFi: number;
    comedy: number;
    romance: number;
    crime: number;
    fantasy: number;
    documentary: number;
    thriller: number;
    adventure: number;
    horror: number;
    anime: number;
    music: number;
    podcast: number;
    emotional: number;
    funny: number;
    inspirational: number;
    dark: number;
    mindBlowing: number;
    relaxing: number;
    intense: number;
    familyFriendly: number;
  };
}

export interface ToolCall {
  name: string;
  arguments: any;
}

export interface AssistantResponse {
  message: string;
  toolCalls?: ToolCall[];
  recommendations?: any[];
}

const SYSTEM_PROMPT = `
You are CineVerse AI, a friendly and knowledgeable entertainment discovery assistant. You know the user's Entertainment DNA profile and have access to movies, anime, TV shows, music, and podcasts.

When recommending content, always:
1. Personalize based on their DNA
2. Explain WHY in 1 sentence  
3. Give match scores (e.g. 94% match)
4. Tell them where to watch/listen
5. Keep responses conversational and enthusiastic but concise

You have access to the following tools:
- search_content(query, type) — searches TMDB/Jikan/Spotify for content
- get_user_dna() — returns user's Entertainment DNA
- add_to_watchlist(contentId, contentType) — saves to DB
- get_trending(type, genre) — fetches trending content

Return recommendations as a mix of text and structured data. When you want to use a tool, respond with a JSON object containing "tool_calls" array.
`;

const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_content',
      description: 'Search for movies, anime, TV shows, music, or podcasts',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          type: { type: 'string', enum: ['movie', 'anime', 'tv', 'music', 'podcast'], description: 'Content type to search' },
          limit: { type: 'number', default: 5 }
        },
        required: ['query', 'type']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_user_dna',
      description: 'Get the current user\'s Entertainment DNA profile',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_to_watchlist',
      description: 'Add content to user\'s watchlist',
      parameters: {
        type: 'object',
        properties: {
          contentId: { type: 'string' },
          contentType: { type: 'string', enum: ['movie', 'anime', 'tv', 'music', 'podcast'] },
          title: { type: 'string' },
          posterUrl: { type: 'string' }
        },
        required: ['contentId', 'contentType', 'title']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_trending',
      description: 'Get trending content by type and genre',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['movie', 'anime', 'tv', 'music', 'podcast'] },
          genre: { type: 'string' }
        },
        required: ['type']
      }
    }
  }
];

export async function getUserDNA(userId: string) {
  try {
    const dna = await prisma.entertainmentDNA.findUnique({
      where: { userId }
    });
    return dna;
  } catch (error) {
    console.error('Error fetching user DNA:', error);
    return null;
  }
}

export async function searchContent(query: string, type: string, limit = 5) {
  try {
    switch (type) {
      case 'movie':
      case 'tv':
        const tmdbResults = type === 'movie' 
          ? await tmdb.searchMovies(query)
          : await tmdb.searchTV(query);
        return tmdbResults.slice(0, limit).map(item => ({
          id: item.id.toString(),
          title: type === 'movie' ? item.title : item.name,
          type,
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: item.vote_average,
          year: type === 'movie' ? item.release_date?.split('-')[0] : item.first_air_date?.split('-')[0],
          overview: item.overview
        }));
      
      case 'anime':
        const animeResults = await anime.searchAnime(query);
        return animeResults.slice(0, limit).map(item => ({
          id: item.mal_id.toString(),
          title: item.title,
          type: 'anime',
          posterUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
          rating: item.score,
          year: item.year,
          synopsis: item.synopsis
        }));
      
      case 'music':
        const artistResults = await spotify.searchArtists(query);
        return artistResults.slice(0, limit).map(item => ({
          id: item.id,
          title: item.name,
          type: 'music',
          posterUrl: item.images[0]?.url,
          rating: item.popularity,
          genres: item.genres
        }));
      
      case 'podcast':
        const playlistResults = await spotify.searchPlaylists(query);
        return (playlistResults.playlists?.items || []).slice(0, limit).map(item => ({
          id: item.id,
          title: item.name,
          type: 'podcast',
          posterUrl: item.images[0]?.url,
          description: item.description
        }));
      
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error searching ${type}:`, error);
    return [];
  }
}

export async function getTrending(type: string, genre?: string) {
  try {
    switch (type) {
      case 'movie':
        const movies = await tmdb.discoverMovies({
          genreIds: genre ? [getGenreId(genre)] : undefined,
          sortBy: 'popularity.desc'
        });
        return movies.results.slice(0, 10).map(item => ({
          id: item.id.toString(),
          title: item.title,
          type: 'movie',
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: item.vote_average
        }));
      
      case 'anime':
        const animeResults = await anime.getTopAnime(genre || '');
        return animeResults.slice(0, 10).map(item => ({
          id: item.mal_id.toString(),
          title: item.title,
          type: 'anime',
          posterUrl: item.images?.jpg?.large_image_url,
          rating: item.score
        }));
      
      case 'music':
        return [];
      
      default:
        return [];
    }
  } catch (error) {
    console.error('Error getting trending:', error);
    return [];
  }
}

function getGenreId(genre: string): number {
  const genreMap: Record<string, number> = {
    'action': 28,
    'adventure': 12,
    'animation': 16,
    'comedy': 35,
    'crime': 80,
    'documentary': 99,
    'drama': 18,
    'family': 10751,
    'fantasy': 14,
    'history': 36,
    'horror': 27,
    'music': 10402,
    'mystery': 9648,
    'romance': 10749,
    'science fiction': 878,
    'tv movie': 10770,
    'thriller': 53,
    'war': 10752,
    'western': 37
  };
  return genreMap[genre.toLowerCase()] || 28;
}

export async function addToWatchlist(userId: string, contentId: string, contentType: string, title: string, posterUrl?: string) {
  try {
    await prisma.watchlistItem.create({
      data: {
        userId,
        contentId,
        contentType,
        title,
        posterUrl
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, error: 'Failed to add to watchlist' };
  }
}

export async function processAssistantMessage(
  messages: ChatMessage[],
  context: AIAssistantContext
): Promise<AssistantResponse> {
  const userDNA = context.userDNA || await getUserDNA(context.userId);
  
  const dnaSummary = userDNA ? `
User's Entertainment DNA:
- Action: ${userDNA.action}%, Sci-Fi: ${userDNA.sciFi}%, Comedy: ${userDNA.comedy}%, Romance: ${userDNA.romance}%
- Anime: ${userDNA.anime}%, Music: ${userDNA.music}%, Podcast: ${userDNA.podcast}%
- Mood preferences: Emotional: ${userDNA.emotional}%, Funny: ${userDNA.funny}%, Dark: ${userDNA.dark}%, Mind-blowing: ${userDNA.mindBlowing}%
` : 'User has not completed onboarding yet.';

  const systemPromptWithDNA = `${SYSTEM_PROMPT}\n\n${dnaSummary}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPromptWithDNA },
        ...messages
      ],
      tools: TOOLS,
      tool_choice: 'auto',
      max_tokens: 1000,
      temperature: 0.7,
    });

    const message = completion.choices[0].message;
    
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          
          switch (toolCall.function.name) {
            case 'search_content':
              const results = await searchContent(args.query, args.type, args.limit);
              return { name: toolCall.function.name, result: results };
            
            case 'get_user_dna':
              const dna = await getUserDNA(context.userId);
              return { name: toolCall.function.name, result: dna };
            
            case 'add_to_watchlist':
              const added = await addToWatchlist(context.userId, args.contentId, args.contentType, args.title, args.posterUrl);
              return { name: toolCall.function.name, result: added };
            
            case 'get_trending':
              const trending = await getTrending(args.type, args.genre);
              return { name: toolCall.function.name, result: trending };
            
            default:
              return { name: toolCall.function.name, result: { error: 'Unknown tool' } };
          }
        })
      );

      // Send tool results back to OpenAI
      const toolMessages = toolResults.map((tr, i) => ({
        role: 'tool' as const,
        tool_call_id: message.tool_calls[i].id,
        content: JSON.stringify(tr.result)
      }));

      const finalCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPromptWithDNA },
          ...messages,
          message,
          ...toolMessages
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return {
        message: finalCompletion.choices[0].message.content || 'I had trouble generating a response.',
        toolCalls: message.tool_calls.map(tc => ({
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments)
        }))
      };
    }

    return {
      message: message.content || 'I had trouble generating a response.',
      toolCalls: []
    };
  } catch (error) {
    console.error('Error processing assistant message:', error);
    return {
      message: 'Sorry, I encountered an error. Please try again!',
      toolCalls: []
    };
  }
}

export async function saveChatMessage(userId: string, role: string, content: string, metadata?: any) {
  try {
    await prisma.chatMessage.create({
      data: {
        userId,
        role,
        content,
        metadata
      }
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

/**
 * Stream the assistant response as an async generator of text chunks.
 * Internally runs the non-streaming tool-calling flow, then yields the
 * final text in small chunks so the client gets a "character by character"
 * streaming effect.
 */
export async function* streamAssistantMessage(
  messages: ChatMessage[],
  context: AIAssistantContext
): AsyncGenerator<string, void, void> {
  const response = await processAssistantMessage(messages, context);
  const text = response.message || '';

  const chunkSize = 12;
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
}

/**
 * Build a server-sent event (SSE) string for a given data payload.
 */
export function sseEvent(data: unknown, event = 'message'): string {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return `event: ${event}\ndata: ${payload}\n\n`;
}

export async function getChatHistory(userId: string, limit = 50) {
  try {
    return await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}