import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('range') || '30d';

    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch user's DNA
    const dna = await prisma.entertainmentDNA.findUnique({
      where: { userId: user.id },
    });

    // Fetch watchlist stats
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: { userId: user.id },
      select: { contentType: true, completed: true, addedAt: true },
    });

    // Fetch ratings
    const ratings = await prisma.rating.findMany({
      where: { userId: user.id },
      select: { score: true, contentType: true, createdAt: true },
    });

    // Fetch reviews
    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      select: { rating: true, createdAt: true },
    });

    // Calculate stats
    const totalContent = watchlistItems.length;
    const moviesWatched = watchlistItems.filter(
      (w) => w.contentType === 'movie' && w.completed
    ).length;
    const animeCompleted = watchlistItems.filter(
      (w) => w.contentType === 'anime' && w.completed
    ).length;
    const tvCompleted = watchlistItems.filter(
      (w) => w.contentType === 'tv' && w.completed
    ).length;

    // Find favorite genre from DNA
    const dnaData = dna
      ? {
          action: dna.action,
          sciFi: dna.sciFi,
          comedy: dna.comedy,
          romance: dna.romance,
          crime: dna.crime,
          fantasy: dna.fantasy,
          documentary: dna.documentary,
          thriller: dna.thriller,
          adventure: dna.adventure,
          horror: dna.horror,
          anime: dna.anime,
          music: dna.music,
        }
      : null;

    const favoriteGenre = dnaData
      ? Object.entries(dnaData).sort(([, a], [, b]) => b - a)[0][0]
      : 'Sci-Fi';

    // Content breakdown
    const contentBreakdown = [
      { name: 'Movies', value: Math.round((moviesWatched / Math.max(totalContent, 1)) * 100), color: '#3B82F6' },
      { name: 'Anime', value: Math.round((animeCompleted / Math.max(totalContent, 1)) * 100), color: '#8B5CF6' },
      { name: 'TV Shows', value: Math.round((tvCompleted / Math.max(totalContent, 1)) * 100), color: '#10B981' },
      { name: 'Music', value: Math.round((ratings.filter((r) => r.contentType === 'music').length / Math.max(ratings.length, 1)) * 100), color: '#F59E0B' },
    ];

    // Mock platform usage (in production, track from watchlist items)
    const platformUsage = [
      { name: 'Netflix', hours: Math.floor(moviesWatched * 2.5 + tvCompleted * 8), color: '#E50914' },
      { name: 'Crunchyroll', hours: Math.floor(animeCompleted * 8), color: '#F47521' },
      { name: 'Spotify', hours: Math.floor(ratings.filter((r) => r.contentType === 'music').length * 0.5), color: '#1DB954' },
      { name: 'YouTube', hours: Math.floor(totalContent * 0.5), color: '#FF0000' },
    ];

    // Mock DNA history (in production, store and fetch historical data)
    const dnaHistory = [
      { month: 'Jan', action: Math.max(0, (dna?.action || 80) - 12), sciFi: Math.max(0, (dna?.sciFi || 75) - 13), comedy: Math.max(0, (dna?.comedy || 55) - 10), anime: Math.max(0, (dna?.anime || 80) - 10) },
      { month: 'Feb', action: Math.max(0, (dna?.action || 80) - 10), sciFi: Math.max(0, (dna?.sciFi || 75) - 11), comedy: Math.max(0, (dna?.comedy || 55) - 8), anime: Math.max(0, (dna?.anime || 80) - 8) },
      { month: 'Mar', action: Math.max(0, (dna?.action || 80) - 8), sciFi: Math.max(0, (dna?.sciFi || 75) - 9), comedy: Math.max(0, (dna?.comedy || 55) - 6), anime: Math.max(0, (dna?.anime || 80) - 6) },
      { month: 'Apr', action: Math.max(0, (dna?.action || 80) - 5), sciFi: Math.max(0, (dna?.sciFi || 75) - 6), comedy: Math.max(0, (dna?.comedy || 55) - 4), anime: Math.max(0, (dna?.anime || 80) - 4) },
      { month: 'May', action: Math.max(0, (dna?.action || 80) - 2), sciFi: Math.max(0, (dna?.sciFi || 75) - 3), comedy: Math.max(0, (dna?.comedy || 55) - 2), anime: Math.max(0, (dna?.anime || 80) - 2) },
      { month: 'Jun', action: dna?.action || 80, sciFi: dna?.sciFi || 75, comedy: dna?.comedy || 55, anime: dna?.anime || 80 },
    ];

    // Top content (mock - in production, aggregate from ratings)
    const topMovies = [
      { title: 'Interstellar', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
      { title: 'Blade Runner 2049', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
      { title: 'Dune', posterUrl: 'https://via.placeholder.com/60x90', rating: 4 },
      { title: 'The Matrix', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
      { title: 'Inception', posterUrl: 'https://via.placeholder.com/60x90', rating: 4 },
    ];

    const topAnime = [
      { title: 'Attack on Titan', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
      { title: 'Steins;Gate', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
      { title: 'Cowboy Bebop', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
      { title: 'Fullmetal Alchemist: Brotherhood', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
      { title: 'Neon Genesis Evangelion', posterUrl: 'https://via.placeholder.com/60x90', rating: 4 },
    ];

    const topArtists = [
      { title: 'Hans Zimmer', posterUrl: 'https://via.placeholder.com/60x60', rating: 5 },
      { title: 'Radiohead', posterUrl: 'https://via.placeholder.com/60x60', rating: 5 },
      { title: 'Daft Punk', posterUrl: 'https://via.placeholder.com/60x60', rating: 4 },
      { title: 'Tame Impala', posterUrl: 'https://via.placeholder.com/60x60', rating: 4 },
      { title: 'Pink Floyd', posterUrl: 'https://via.placeholder.com/60x60', rating: 5 },
    ];

    return NextResponse.json({
      stats: {
        totalContent,
        favoriteGenre: favoriteGenre.charAt(0).toUpperCase() + favoriteGenre.slice(1),
        hoursWatched: Math.floor(totalContent * 2.5),
        reviewsWritten: reviews.length,
      },
      dna: dnaData || {
        action: 0, sciFi: 0, comedy: 0, romance: 0, crime: 0,
        fantasy: 0, documentary: 0, thriller: 0, adventure: 0,
        horror: 0, anime: 0, music: 0,
      },
      dnaHistory,
      contentBreakdown,
      platformUsage,
      topMovies,
      topAnime,
      topArtists,
      monthlyReport: `This month you explored ${totalContent} pieces of content. Your taste for ${favoriteGenre} continues to grow. Keep discovering new gems!`,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
