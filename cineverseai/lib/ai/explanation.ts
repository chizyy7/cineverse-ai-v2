/**
 * Generate personalized explanation: "Because you gave Interstellar 5 stars and love Sci-Fi (91% DNA match), you'll love this mind-bending journey through..."
 */

export type ContentType = 'movie' | 'anime' | 'tv' | 'music' | 'podcast';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  genres: string[];
  // In a real implementation, this would have more fields like rating, year, etc.
}

export interface UserDNA {
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
}

/**
 * Generate a personalized explanation for why a content item is recommended
 */
export function generateExplanation(
  content: ContentItem,
  userDNA: UserDNA,
  userName: string = "there"
): string {
  // Find the top matching genre between content and user DNA
  const topMatch = findTopGenreMatch(content, userDNA);
  
  if (!topMatch) {
    return `Because you're exploring new tastes, we think you'll enjoy ${content.title}.`;
  }
  
  const { genre, dnaScore, dnaField } = topMatch;
  
  // Get a sample high-rated item the user might have liked (in real app, this would come from their ratings)
  const sampleItem = getSampleHighRatedItem(dnaField, userName);
  
  // Generate explanation based on the match
  return `${sampleItem} and love ${genre} (${dnaScore}% DNA match), you'll love this ${getContentTypeDescription(content.type)}`;
}

/**
 * Find the top matching genre between content and user DNA
 */
function findTopGenreMatch(
  content: ContentItem,
  userDNA: UserDNA
): { genre: string; dnaScore: number; dnaField: keyof UserDNA } | null {
  // Map content genres to DNA fields
  const genreToDnaMap: Record<string, keyof UserDNA> = {
    // Movie genres
    'Action': 'action',
    'Adventure': 'adventure',
    'Comedy': 'comedy',
    'Crime': 'crime',
    'Documentary': 'documentary',
    'Drama': 'sciFi', // Approximation
    'Fantasy': 'fantasy',
    'Horror': 'horror',
    'Mystery': 'sciFi', // Approximation
    'Romance': 'romance',
    'Sci-Fi': 'sciFi',
    'Thriller': 'thriller',
    // Anime genres
    'Action': 'anime',
    'Adventure': 'anime',
    'Comedy': 'anime',
    'Drama': 'anime',
    'Fantasy': 'anime',
    'Horror': 'anime',
    'Magic': 'anime',
    'Mecha': 'anime',
    'Music': 'anime',
    'Psychological': 'anime',
    'Romance': 'anime',
    'Samurai': 'anime',
    'School': 'anime',
    'Shounen': 'anime',
    'Slice of Life': 'anime',
    'Supernatural': 'anime',
    // Music genres
    'Hip Hop': 'music',
    'Jazz': 'music',
    'Pop': 'music',
    'Rock': 'music',
    'Electronic': 'music',
  };

  let bestMatch: { genre: string; dnaScore: number; dnaField: keyof UserDNA } | null = null;
  
  content.genres.forEach(genre => {
    const dnaField = genreToDnaMap[genre];
    if (dnaField) {
      const dnaScore = userDNA[dnaField];
      // Only consider matches with score > 30 to avoid weak matches
      if (dnaScore > 30) {
        if (!bestMatch || dnaScore > bestMatch.dnaScore) {
          bestMatch = { genre, dnaScore, dnaField };
        }
      }
    }
  });
  
  return bestMatch;
}

/**
 * Get a sample high-rated item the user might have liked for the explanation
 */
function getSampleHighRatedItem(
  dnaField: keyof UserDNA,
  userName: string
): string {
  // Map DNA fields to sample items
  const sampleItems: Record<keyof UserDNA, string> = {
    action: `Because you gave Mad Max: Fury Road 5 stars`,
    sciFi: `Because you gave Interstellar 5 stars`,
    comedy: `Because you gave The Grand Budapest Hotel 5 stars`,
    romance: `Because you gave Titanic 5 stars`,
    crime: `Because you gave The Godfather 5 stars`,
    fantasy: `Because you gave The Lord of the Rings 5 stars`,
    documentary: `Because you gave Planet Earth 5 stars`,
    thriller: `Because you gave Gone Girl 5 stars`,
    adventure: `Because you gave Indiana Jones 5 stars`,
    horror: `Because you got The Conjuring 5 stars`,
    anime: `Because you gave Attack on Titan 5 stars`,
    music: `Because you gave Bohemian Rhapsody 5 stars`,
    podcast: `Because you gave Serial 5 stars`,
    emotional: `Because you gave The Shawshank Redemption 5 stars`,
    funny: `Because you gave Superbad 5 stars`,
    inspirational: `Because you gave Rocky 5 stars`,
    dark: `Because you gave Se7en 5 stars`,
    mindBlowing: `Because you gave Inception 5 stars`,
    relaxing: `Because you gave Studio Ghibli films 5 stars`,
    intense: `Because you gave Mad Max: Fury Road 5 stars`,
    familyFriendly: `Because you gave Finding Nemo 5 stars`,
  };
  
  return sampleItems[dnaField] || `Because you enjoy ${dnaField.toLowerCase()}-related content`;
}

/**
 * Get a content type description for the explanation
 */
function getContentTypeDescription(type: ContentType): string {
  const descriptions: Record<ContentType, string> = {
    movie: 'movie',
    anime: 'anime',
    tv: 'TV show',
    music: 'song',
    podcast: 'podcast',
  };
  
  return descriptions[type];
}

export default { generateExplanation };