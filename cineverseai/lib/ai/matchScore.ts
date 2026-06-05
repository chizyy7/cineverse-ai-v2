/**
 * Calculate match score using:
 * - Genre overlap with DNA profile (weighted)
 * - Mood alignment
 * - Collaborative signal (other users with similar DNA loved this)
 * - Recency boost (trending content gets +5%)
 * Return 0-100 score.
 */

export type ContentType = 'movie' | 'anime' | 'tv' | 'music' | 'podcast';

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  genres: string[];
  // In a real implementation, this would have more fields
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
 * Calculate match score for a content item based on user's DNA
 */
export function calculateMatchScore(
  content: ContentItem,
  userDNA: UserDNA,
  mood: string | null = null,
  isTrending: boolean = false
): number {
  let score = 0;
  let maxPossibleScore = 0;

  // 1. Genre overlap with DNA profile (weighted) - 70% of score
  const genreScore = calculateGenreScore(content, userDNA);
  score += genreScore * 0.7;
  maxPossibleScore += 70;

  // 2. Mood alignment - 20% of score
  const moodScore = calculateMoodScore(content, userDNA, mood);
  score += moodScore * 0.2;
  maxPossibleScore += 20;

  // 3. Collaborative signal - 5% of score (simplified)
  // In a real app, this would look at what similar users liked
  const collaborativeScore = 5; // Placeholder
  score += collaborativeScore;
  maxPossibleScore += 5;

  // 4. Recency boost - up to 5% bonus
  const recencyBoost = isTrending ? 5 : 0;
  score += recencyBoost;
  // Note: recency boost is bonus, so we don't add to maxPossibleScore

  // Ensure score is within 0-100 range
  const finalScore = Math.min(100, Math.max(0, score));
  
  return Math.round(finalScore);
}

/**
 * Calculate genre overlap score
 */
function calculateGenreScore(
  content: ContentItem,
  userDNA: UserDNA
): number {
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
    // Anime genres (often map to broader categories)
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
    // For simplicity, we'll map any unrecognized genre to a default
  };

  if (content.genres.length === 0) {
    return 50; // Neutral score if no genres
  }

  let totalMatch = 0;
  let matchedGenres = 0;

  content.genres.forEach(genre => {
    const dnaField = genreToDnaMap[genre];
    if (dnaField) {
      const userScore = userDNA[dnaField];
      totalMatch += userScore;
      matchedGenres++;
    }
    // For unrecognized genres, we could give a neutral score or skip
    // For now, we'll skip them in the calculation but still count them
  });

  if (matchedGenres === 0) {
    return 50; // Neutral if no recognizable genres
  }

  // Average the matched genres' DNA scores
  const averageMatch = totalMatch / matchedGenres;
  
  // Convert to a 0-100 scale (assuming DNA scores are already 0-100)
  return averageMatch;
}

/**
 * Calculate mood alignment score
 */
function calculateMoodScore(
  content: ContentItem,
  userDNA: UserDNA,
  mood: string | null
): number {
  if (!mood) {
    return 50; // Neutral if no mood specified
  }

  // Map moods to DNA fields
  const moodToDnaMap: Record<string, keyof UserDNA> = {
    'Emotional': 'emotional',
    'Funny': 'funny',
    'Inspirational': 'inspirational',
    'Dark': 'dark',
    'Mind-blowing': 'mindBlowing',
    'Relaxing': 'relaxing',
    'Intense': 'intense',
    'Family-friendly': 'familyFriendly',
    'Sad': 'emotional',
    'Happy': 'funny',
    'Excited': 'inspirational',
    'Scary': 'dark',
    'Thoughtful': 'inspirational',
    'Calm': 'relaxing',
    'Energetic': 'intense',
    'Romantic': 'romance',
  };

  const dnaField = moodToDnaMap[mood];
  if (dnaField) {
    return userDNA[dnaField];
  }
  
  // For unrecognized moods, return neutral
  return 50;
}

export default { calculateMatchScore };