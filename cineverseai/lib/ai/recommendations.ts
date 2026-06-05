import OpenAI from 'openai';
import { User } from '@prisma/client';

// Define the types based on the prompt
export type ContentType = 'movie' | 'anime' | 'tv' | 'music' | 'podcast';

export interface RecommendationContext {
  mood?: string;
  timeOfDay?: string;
  recentActivity?: string[];
  contentTypes?: ContentType[];
}

export interface UserWithDNA extends User {
  entertainmentDNA: {
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
  } | null;
}

export interface Recommendation {
  title: string;
  type: ContentType;
  matchScore: number; // 0-100
  explanation: string; // personalized, max 2 sentences
  searchQuery: string; // to find on TMDB/Jikan/Spotify
  platforms: string[];
  genres: string[];
  mood: string;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  insight: string; // one line about the user's taste pattern today
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for OpenAI
const SYSTEM_PROMPT = `
You are CineVerse AI's recommendation engine. You have deep knowledge of movies, anime, TV shows, music, and podcasts. Given a user's Entertainment DNA profile and context, recommend content they will love. Always explain WHY you're recommending each item based on their specific taste profile. Return structured JSON.
`;

/**
 * Generate recommendations using OpenAI GPT-4o
 */
export async function generateRecommendations(
  user: UserWithDNA,
  context: RecommendationContext
): Promise<RecommendationsResponse> {
  // Construct the user profile summary for the AI
  const userProfileSummary = `
User's Entertainment DNA Profile:
- Action: ${user.entertainmentDNA?.action || 0}%
- Sci-Fi: ${user.entertainmentDNA?.sciFi || 0}%
- Comedy: ${user.entertainmentDNA?.comedy || 0}%
- Romance: ${user.entertainmentDNA?.romance || 0}%
- Crime: ${user.entertainmentDNA?.crime || 0}%
- Fantasy: ${user.entertainmentDNA?.fantasy || 0}%
- Documentary: ${user.entertainmentDNA?.documentary || 0}%
- Thriller: ${user.entertainmentDNA?.thriller || 0}%
- Adventure: ${user.entertainmentDNA?.adventure || 0}%
- Horror: ${user.entertainmentDNA?.horror || 0}%
- Anime: ${user.entertainmentDNA?.anime || 0}%
- Music: ${user.entertainmentDNA?.music || 0}%
- Podcast: ${user.entertainmentDNA?.podcast || 0}%
- Emotional: ${user.entertainmentDNA?.emotional || 0}%
- Funny: ${user.entertainmentDNA?.funny || 0}%
- Inspirational: ${user.entertainmentDNA?.inspirational || 0}%
- Dark: ${user.entertainmentDNA?.dark || 0}%
- Mind-blowing: ${user.entertainmentDNA?.mindBlowing || 0}%
- Relaxing: ${user.entertainmentDNA?.relaxing || 0}%
- Intense: ${user.entertainmentDNA?.intense || 0}%
- Family-friendly: ${user.entertainmentDNA?.familyFriendly || 0}%
`;

  const contextSummary = `
Context:
- Mood: ${context.mood || 'Not specified'}
- Time of day: ${context.timeOfDay || 'Not specified'}
- Recent activity: ${context.recentActivity?.join(', ') || 'None'}
- Content types requested: ${context.contentTypes?.join(', ') || 'All'}
`;

  const userMessage = `
${userProfileSummary}
${contextSummary}

Based on the user's Entertainment DNA profile and context, provide personalized content recommendations. 

For each recommendation, provide:
1. Title
2. Type (movie, anime, tv, music, or podcast)
3. Match score (0-100)
4. Personalized explanation (max 2 sentences) explaining WHY based on their DNA
5. Search query (to find on TMDB/Jikan/Spotify)
6. Platforms (where to watch/listen)
7. Genres
8. Mood that this recommendation matches

Also provide one insight about the user's taste pattern today.

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "title": "string",
      "type": "movie|anime|tv|music|podcast",
      "matchScore": number (0-100),
      "explanation": "string (personalized, max 2 sentences)",
      "searchQuery": "string (to find on TMDB/Jikan/Spotify)",
      "platforms": ["string"],
      "genres": ["string"],
      "mood": "string"
    }
  ],
  "insight": "string (one line about the user's taste pattern today)"
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText) as RecommendationsResponse;
    
    // Validate the response structure
    if (!Array.isArray(parsedResponse.recommendations)) {
      throw new Error('Invalid recommendations format');
    }
    
    // Validate each recommendation
    for (const rec of parsedResponse.recommendations) {
      if (!rec.title || !rec.type || typeof rec.matchScore !== 'number' || 
          !rec.explanation || !rec.searchQuery || !Array.isArray(rec.platforms) || 
          !Array.isArray(rec.genres) || !rec.mood) {
        throw new Error('Invalid recommendation structure');
      }
      
      // Ensure matchScore is within bounds
      rec.matchScore = Math.max(0, Math.min(100, rec.matchScore));
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating recommendations with OpenAI:', error);
    
    // Fallback to a basic recommendation if OpenAI fails
    return getFallbackRecommendations(user, context);
  }
}

/**
 * Fallback recommendations when OpenAI is unavailable
 */
function getFallbackRecommendations(
  user: UserWithDNA,
  context: RecommendationContext
): RecommendationsResponse {
  // Simple fallback based on highest DNA scores
  const dna = user.entertainmentDNA;
  if (!dna) {
    // Return empty recommendations if no DNA
    return {
      recommendations: [],
      insight: 'Unable to generate recommendations without DNA profile'
    };
  }
  
  // Find top 3 DNA categories
  const dnaEntries = Object.entries(dna).filter(([_, value]): value is number => typeof value === 'number');
  const topCategories = dnaEntries
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
  
  const recommendations: Recommendation[] = [];
  
  // Generate a simple recommendation for each top category
  topCategories.forEach((category, index) => {
    let type: ContentType = 'movie';
    let title = 'Sample Recommendation';
    let searchQuery = 'sample';
    let platforms = ['Netflix'];
    let genres = [category];
    let mood = context.mood || 'neutral';
    
    // Map category to type and title
    switch (category) {
      case 'action':
        type = 'movie';
        title = 'Action Movie Recommendation';
        searchQuery = 'action movie';
        platforms = ['Netflix', 'Amazon Prime'];
        genres = ['Action'];
        break;
      case 'sciFi':
        type = 'movie';
        title = 'Sci-Fi Movie Recommendation';
        searchQuery = 'sci-fi movie';
        platforms = ['Netflix', 'Hulu'];
        genres = ['Sci-Fi'];
        break;
      case 'anime':
        type = 'anime';
        title = 'Anime Recommendation';
        searchQuery = 'popular anime';
        platforms = ['Crunchyroll'];
        genres = ['Anime'];
        break;
      case 'music':
        type = 'music';
        title = 'Music Recommendation';
        searchQuery = 'popular music';
        platforms = ['Spotify'];
        genres = ['Music'];
        break;
      // Add more mappings as needed
      default:
        type = 'movie';
        title = `${category} Recommendation`;
        searchQuery = `${category} content`;
        platforms = ['Netflix'];
        genres = [category];
    }
    
    // Calculate a match score based on the DNA value
    const matchScore = Math.min(95, Math.max(60, dna[category as keyof typeof dna] || 75));
    
    recommendations.push({
      title,
      type,
      matchScore,
      explanation: `Because you scored high in ${category}, we think you'll enjoy this ${type}.`,
      searchQuery,
      platforms,
      genres,
      mood,
    });
  });
  
  // Add a fallback insight
  const insight = `Your top DNA categories are ${topCategories.join(', ')}.`;
  
  return {
    recommendations,
    insight,
  };
}

export default { generateRecommendations };