import { prisma } from '@/lib/prisma';
import { ACHIEVEMENTS, UserStats, XP_VALUES, getLevelForXP } from './index';

export interface EarnedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          reviews: true,
          reviewLikes: true,
          watchlistItems: true,
          collections: true,
          followers: true,
          following: true,
          interactions: true,
        },
      },
      reviews: {
        select: {
          rating: true,
          createdAt: true,
        },
      },
      ratings: {
        select: {
          score: true,
          contentType: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Calculate movies rated
  const moviesRated = user.ratings.filter((r) => r.contentType === 'movie').length;

  // Calculate movies watched (completed watchlist items)
  const watchlistItems = await prisma.watchlistItem.findMany({
    where: { userId, completed: true },
    select: { contentType: true },
  });
  const moviesWatched = watchlistItems.filter((w) => w.contentType === 'movie').length;

  // Calculate anime completed
  const animeCompleted = watchlistItems.filter((w) => w.contentType === 'anime').length;

  // Calculate TV completed
  const tvCompleted = watchlistItems.filter((w) => w.contentType === 'tv').length;

  // Calculate music rated
  const musicRated = user.ratings.filter((r) => r.contentType === 'music').length;

  // Calculate reviews written
  const reviewsWritten = user._count.reviews;

  // Calculate review likes
  const reviewLikes = user._count.reviewLikes;

  // Calculate watchlist items
  const watchlistCount = user._count.watchlistItems;

  // Calculate collections created
  const collectionsCreated = user._count.collections;

  // Calculate followers/following
  const followersCount = user._count.followers;
  const followingCount = user._count.following;

  // Calculate days active (from interactions)
  const firstInteraction = await prisma.userInteraction.findFirst({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });
  const daysActive = firstInteraction
    ? Math.floor((now.getTime() - firstInteraction.createdAt.getTime()) / (24 * 60 * 60 * 1000)) + 1
    : 1;

  // Calculate consecutive review days
  const consecutiveReviewDays = await calculateConsecutiveReviewDays(userId);

  // Calculate high rated count (>= 4 stars out of 5, so >= 8 out of 10)
  const highRatedCount = user.ratings.filter((r) => r.score >= 8).length;

  // Calculate low rated count (<= 2 stars out of 5, so <= 4 out of 10)
  const lowRatedCount = user.ratings.filter((r) => r.score <= 4).length;

  // Calculate genres explored (unique genres from ratings and watchlist)
  const genresExplored = await calculateGenresExplored(userId);

  // Calculate platforms used (mock - in production, track from watchlist items)
  const platformsUsed = Math.min(5, Math.floor(watchlistCount / 5) + 1);

  // Calculate hidden gems rated (mock - in production, check TMDB rating count)
  const hiddenGemsRated = Math.floor(moviesRated * 0.1);

  // Calculate late night activity
  const lateNightActivity = user.reviews.filter((r) => {
    const hour = new Date(r.createdAt).getHours();
    return hour >= 0 && hour < 5;
  }).length;

  // Calculate weekend activity
  const weekendActivity = user.reviews.filter((r) => {
    const day = new Date(r.createdAt).getDay();
    return day === 0 || day === 6;
  }).length;

  // Get XP and level
  const xp = (user as any).xp || 0;
  const { level } = getLevelForXP(xp);

  return {
    moviesRated,
    moviesWatched,
    animeCompleted,
    tvCompleted,
    musicRated,
    reviewsWritten,
    reviewLikes,
    watchlistItems: watchlistCount,
    collectionsCreated,
    followersCount,
    followingCount,
    daysActive,
    consecutiveReviewDays,
    highRatedCount,
    lowRatedCount,
    genresExplored,
    platformsUsed,
    hiddenGemsRated,
    lateNightActivity,
    weekendActivity,
    xp,
    level,
  };
}

async function calculateConsecutiveReviewDays(userId: string): Promise<number> {
  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (reviews.length === 0) return 0;

  let streak = 1;
  const now = new Date();
  let currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const review of reviews) {
    const reviewDate = new Date(review.createdAt);
    const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());

    const diffDays = Math.floor((currentDate.getTime() - reviewDay.getTime()) / (24 * 60 * 60 * 1000));

    if (diffDays <= 1) {
      if (diffDays === 1) streak++;
      currentDate = reviewDay;
    } else {
      break;
    }
  }

  return streak;
}

async function calculateGenresExplored(userId: string): Promise<number> {
  // Get unique genres from user's DNA
  const dna = await prisma.entertainmentDNA.findUnique({
    where: { userId },
  });

  if (!dna) return 0;

  const genres = [
    dna.action, dna.sciFi, dna.comedy, dna.romance, dna.crime,
    dna.fantasy, dna.documentary, dna.thriller, dna.adventure, dna.horror,
  ];

  return genres.filter((g) => g > 20).length;
}

export async function checkAndAwardAchievements(userId: string): Promise<EarnedAchievement[]> {
  const stats = await getUserStats(userId);
  const newlyEarned: EarnedAchievement[] = [];

  // Get existing achievements
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const existingIds = new Set(existingAchievements.map((a) => a.achievementId));

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    if (existingIds.has(achievement.id)) continue;

    if (achievement.condition(stats)) {
      // Award the achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Add XP
      await addUserXP(userId, achievement.xpReward);

      newlyEarned.push({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward,
      });
    }
  }

  return newlyEarned;
}

export async function addUserXP(userId: string, amount: number): Promise<{ newLevel: number; leveledUp: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) throw new Error('User not found');

  // Get current XP (using a metadata field or separate table)
  // For now, we'll use a simple approach with the interactions table
  const currentXP = await calculateUserXP(userId);
  const newXP = currentXP + amount;

  const oldLevel = getLevelForXP(currentXP);
  const newLevelInfo = getLevelForXP(newXP);

  // Store XP in a UserMetadata table or similar
  // For now, we'll track it via interactions
  await prisma.userInteraction.create({
    data: {
      userId,
      contentId: 'xp-award',
      contentType: 'system',
      actionType: 'xp_gain',
      metadata: { amount, total: newXP },
    },
  });

  return {
    newLevel: newLevelInfo.level,
    leveledUp: newLevelInfo.level > oldLevel.level,
  };
}

async function calculateUserXP(userId: string): Promise<number> {
  const xpInteractions = await prisma.userInteraction.findMany({
    where: {
      userId,
      actionType: 'xp_gain',
    },
    select: { metadata: true },
  });

  return xpInteractions.reduce((total, interaction) => {
    const meta = interaction.metadata as any;
    return total + (meta?.amount || 0);
  }, 0);
}
