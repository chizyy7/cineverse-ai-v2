import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getUser } from '@/lib/auth';
import tmdb from '@/lib/tmdb';
import anime from '@/lib/anime';
import spotify from '@/lib/spotify';
import { normalizeTMDBMovie, normalizeTMDBShow, normalizeJikanAnime, normalizeSpotifyArtist } from '@/lib/content';
import { calculateMatchScore, ContentItem } from '@/lib/ai/matchScore';
import { generateExplanation } from '@/lib/ai/explanation';
import { ContentCard } from '@/components/features/ContentCard';

// We'll define a helper to fetch content based on type and id
async function fetchContentByTypeAndId(type: string, id: string): Promise<any> {
  switch (type) {
    case 'movie':
      try {
        const movie = await tmdb.getMovieDetails(parseInt(id));
        return normalizeTMDBMovie(movie);
      } catch (error) {
        console.error(`Error fetching movie ${id}:`, error);
        return null;
      }
    case 'tv':
      try {
        const show = await tmdb.getTVDetails(parseInt(id));
        return normalizeTMDBShow(show);
      } catch (error) {
        console.error(`Error fetching TV show ${id}:`, error);
        return null;
      }
    case 'anime':
      try {
        const animeData = await anime.getAnimeDetails(parseInt(id));
        return normalizeJikanAnime(animeData);
      } catch (error) {
        console.error(`Error fetching anime ${id}:`, error);
        return null;
      }
    case 'music':
    case 'podcast':
      // For music and podcast, we'll treat them as artists from Spotify for simplicity
      // In a real app, we might have separate endpoints for tracks, albums, etc.
      // We don't have a function to get artist by ID in our spotify.ts, so we'll return mock data for now.
      // TODO: Implement getArtistById in spotify.ts
      return null;
    default:
      return null;
  }
}

// Similar content fetching - we'll use the recommendation API or fetch similar from the same source
async function fetchSimilarContent(type: string, id: string, limit: number = 6): Promise<any[]> {
  switch (type) {
    case 'movie':
      try {
        const recommendations = await tmdb.getMovieRecommendations(parseInt(id));
        return recommendations.slice(0, limit).map(normalizeTMDBMovie);
      } catch (error) {
        console.error(`Error getting similar movies for ${id}:`, error);
        return [];
      }
    case 'tv':
      try {
        const recommendations = await tmdb.getTVRecommendations(parseInt(id));
        return recommendations.slice(0, limit).map(normalizeTMDBShow);
      } catch (error) {
        console.error(`Error getting similar TV shows for ${id}:`, error);
        return [];
      }
    case 'anime':
      try {
        const recommendations = await anime.getAnimeRecommendations(parseInt(id));
        return recommendations.slice(0, limit).map(normalizeJikanAnime);
      } catch (error) {
        console.error(`Error getting similar anime for ${id}:`, error);
        return [];
      }
    case 'music':
    case 'podcast':
      // For music, we could get related artists or top tracks
      // We'll skip for now and return mock
      return [];
    default:
      return [];
  }
}

export default async function ContentDetailPage({
  params,
}: {
  params: { type: string; id: string };
}) {
  const { type, id } = params;
  
  // Validate type
  const validTypes = ['movie', 'tv', 'anime', 'music', 'podcast'];
  if (!validTypes.includes(type)) {
    notFound();
  }

  // Fetch user data
  const user = await getUser();
  if (!user) {
    // Redirect to login if not authenticated
    // In Next.js, we can use redirect, but in server component we can't.
    // We'll return a redirect component or handle it differently.
    // For simplicity, we'll show a message and link.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please <Link href="/(auth)/login">log in</Link> to view content details.</p>
      </div>
    );
  }

  // Fetch content data
  const [content, similarContent] = await Promise.all([
    fetchContentByTypeAndId(type, id),
    fetchSimilarContent(type, id, 6),
  ]);

  if (!content) {
    notFound();
  }

  // Calculate match score and explanation
  const userDNA = user.entertainmentDNA;
  let matchScore = 50; // default
  let explanation = 'We think you\'ll enjoy this content based on your taste.';
  
  if (userDNA) {
    // We need to convert our content to a ContentItem for the matchScore function
    const contentItem: ContentItem = {
      id: content.id,
      title: content.title,
      type: type as any, // We'll assume the type matches
      posterUrl: content.posterUrl || '',
      rating: content.rating || 0,
      genres: content.genres || [],
      platforms: content.platforms || [],
      streamingUrl: content.streamingUrl || '',
      description: content.description || '',
      year: content.year || 0,
    };

    matchScore = calculateMatchScore(contentItem, userDNA, null, false);
    explanation = generateExplanation(contentItem, userDNA, user.name || user.email?.split('@')[0] || 'there');
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[40vh]">
        {/* Backdrop Image */}
        {content.posterUrl ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${content.posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background-primary to-transparent/90"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-background-tertiary">
            <div className="absolute inset-0 bg-gradient-to-t from-background-primary to-transparent/90"></div>
          </div>
        )}
        
        {/* Poster Thumbnail */}
        <div className="relative mt-6 ml-6">
          {content.posterUrl ? (
            <img
              src={content.posterUrl}
              alt={`${content.title} poster`}
              className="w-48 h-72 object-cover rounded-lg shadow-lg ring-2 ring-accent-blue/20"
            />
          ) : (
            <div className="w-48 h-72 bg-background-tertiary flex items-center justify-center rounded-lg shadow-lg">
              Poster
            </div>
          )}
        </div>
        
        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-x-6">
            <div className="flex-1">
              <h1 className="font-outfit text-3xl md:text-4xl text-primary mb-2">
                {content.title}
              </h1>
              <div className="flex flex-wrap space-x-3 text-sm text-secondary">
                <span>{content.year}</span>
                <span>•</span>
                <span>{content.type}</span>
                {content.genres?.slice(0, 3).map((genre: string, index: number) => (
                  <span key={index}>
                    {index > 0 && '•'}
                    {genre}
                  >
                  </span>
                ))}
              </div>
              {content.rating && (
                <div className="mt-2">
                  <span className="text-accent-gold">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill={i < content.rating ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-1.18-6.88 5-4.87L6.09 9.27l-5.91 6.88z" />
                      </svg>
                    ))}</span>
                  <span className="ml-2 text-sm">{content.rating}/10</span>
                </div>
              )}
            </div>
            
            {/* Match Score and Explanation */}
            <div className="flex-1 space-x-4">
              <div className="text-center">
                <div className={`${matchScore >= 90 ? 'bg-accent-success' : matchScore >= 80 ? 'bg-accent-blue' : matchScore >= 70 ? 'bg-accent-gold' : 'bg-accent-blue/20'} text-white text-xl font-bold px-4 py-2 rounded-lg w-20 h-20 flex items-center justify-center`}>
                  {matchScore}%
                </div>
                <p className="mt-2 text-sm text-secondary">Match</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-secondary italic">
                  🤖 {explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {/* Watch/Listen Button */}
            <Link
              href={content.streamingUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-5 py-3 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors"
            >
              {content.type === 'music' ? 'Listen on Spotify' : 'Watch on Netflix'}
            </Link>
            
            {/* Save to Watchlist Button */}
            <button
              onClick={() => {
                // TODO: Implement save to watchlist
                console.log('Saved to watchlist');
              }}
              className="flex items-center space-x-2 px-5 py-3 bg-background-tertiary border border-accent-blue/20 text-accent-blue font-medium rounded-lg hover:bg-accent-blue/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3m0 0l3-3m-3 3v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
              Save to Watchlist
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Rate Button */}
            <button
              className="flex items-center space-x-2 px-4 py-3 bg-background-tertiary border border-accent-blue/20 text-accent-blue font-medium rounded-lg hover:bg-accent-blue/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-1.18-6.88 5-4.87L6.09 9.27l-5.91 6.88z" />
              </svg>
              Rate
            </button>
            
            {/* Review Button */}
            <button
              className="flex items-center space-x-2 px-4 py-3 bg-background-tertiary border border-accent-blue/20 text-accent-blue font-medium rounded-lg hover:bg-accent-blue/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V5h-1.26a2.26 2.26 0 00-2.26 2.26v6.88c0 1.02.42 1.94 1.06 2.46l1.42 1.42a8.96 8.96 0 00-2.23 6.58 6.42 6.42 0 006.42 6.42v6.88a2.26 2.26 0 002.26 2.26h6.88c1.02 0 1.94-.42 2.46-1.06l1.42-1.42a6.42 6.42 0 006.42-6.42 6.42 6.42 0 006.42-6.42z" />
              </svg>
              Review
            </button>
            
            {/* Share Button */}
            <button
              className="flex items-center space-x-2 px-4 py-3 bg-background-tertiary border border-accent-blue/20 text-accent-blue font-medium rounded-lg hover:bg-accent-blue/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 16.08c-1.1 0-2.06.43-2.59 1.06l-.71 1.06a5.5 5.5 0 01-1.06 1.78l-.29.56a2.25 2.25 0 00-1.43 1.27V14a2 2 0 01-4 0V9a2 2 0 014 0v2.31l.3-.36a2.25 2.25 0 001.43-1.27l.29-.56a5.5 5.5 0 001.06-1.78l.71-1.06A5.5 5.5 0 0018 12.08v4z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-8">
        <div className="flex space-x-4 mb-6 border-b border-accent-blue/10">
          <button
            onclick={() => { /* Set active tab to overview */ }}
            className={`flex-1 py-3 text-center font-medium ${/* active tab styling */ 'text-accent-blue border-b-2 border-accent-blue'}`}
          >
            Overview
          </button>
          <button
            onclick={() => { /* Set active tab to similar */ }}
            className="flex-1 py-3 text-center font-medium text-accent-blue/50 hover:text-accent-blue"
          >
            Similar Content
          </button>
          <button
            onclick={() => { /* Set active tab to reviews */ }}
            className="flex-1 py-3 text-center font-medium text-accent-blue/50 hover:text-accent-blue"
          >
            Reviews
          </button>
          <button
            onclick={() => { /* Set active tab to where to watch */ }}
            className="flex-1 py-3 text-center font-medium text-accent-blue/50 hover:text-accent-blue"
          >
            Where to Watch
          </button>
        </div>
        
        {/* Tab Content - Overview (active by default) */}
        <div className="space-y-6">
          <div className="mb-4">
            <h3 className="font-outfit text-xl text-primary mb-2">Overview</h3>
            <p className="text-secondary">
              {content.description || 'No description available.'}
            </p>
          </div>
          
          {/* Similar Content */}
          <div className="mb-4">
            <h3 className="font-outfit text-xl text-primary mb-2">Similar Content</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similarContent.length > 0 ? (
                similarContent.map((contentItem: any, index: number) => (
                  <ContentCard
                    key={contentItem.id || index}
                    content={contentItem}
                    onSave={() => console.log('Saved to watchlist')}
                  />
                ))
              ) : (
                <p className="text-secondary">No similar content found.</p>
              )}
            </div>
          </div>
          
          {/* Reviews - Placeholder */}
          <div className="mb-4">
            <h3 className="font-outfit text-xl text-primary mb-2">Reviews</h3>
            <p className="text-secondary">No reviews yet. Be the first to review!</p>
          </div>
          
          {/* Where to Watch - Placeholder */}
          <div className="mb-4">
            <h3 className="font-outfit text-xl text-primary mb-2">Where to Watch</h3>
            <p className="text-secondary">Platform availability information would be shown here.</p>
          </div>
        </div>
      </div>

      {/* Entertainment DNA Match Section */}
      <div className="px-6 pb-8">
        <div className="space-y-6">
          <h3 className="font-outfit text-xl text-primary mb-4">Entertainment DNA Match</h3>
          <div className="relative h-64 bg-background-tertiary rounded-xl">
            {/* Radar Chart Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-accent-blue/50 text-2xl">
              📊 Radar Chart Placeholder
            </div>
            {/* Pulsing glow animation */}
            <div className="absolute inset-0 rounded-xl animate-pulse bg-accent-blue/10"></div>
          </div>
          <p className="text-sm text-secondary mt-4 text-center">
            This matches your {getTopDnaTraits(userDNA || {}, 3).join(', ')} profile.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to get top DNA traits
function getTopDnaTraits(dna: any, count: number): string[] {
  const dnaArray = Object.entries(dna).filter(([, value]): value is number => typeof value === 'number');
  return dnaArray
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([trait]) => trait
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
    );
}

// Add animations to globals.css if not already present
// We'll assume the pulse animation is already defined from earlier

export async function generateMetadata({
  params,
}: {
  params: { type: string; id: string };
}) {
  const { type, id } = params;
  // In a real app, we would fetch the content to get the title
  // For now, we'll return a placeholder
  return {
    title: `${type.toUpperCase()} ${id} — CineVerse AI`,
    description: `Details for ${type} ${id}`,
  };
}