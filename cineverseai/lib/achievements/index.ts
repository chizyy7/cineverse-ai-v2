export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
  condition: (stats: UserStats) => boolean;
  progress?: (stats: UserStats) => { current: number; target: number };
}

export interface UserStats {
  moviesRated: number;
  moviesWatched: number;
  animeCompleted: number;
  tvCompleted: number;
  musicRated: number;
  reviewsWritten: number;
  reviewLikes: number;
  watchlistItems: number;
  collectionsCreated: number;
  followersCount: number;
  followingCount: number;
  daysActive: number;
  consecutiveReviewDays: number;
  highRatedCount: number; // ratings >= 4 stars
  lowRatedCount: number; // ratings <= 2 stars
  genresExplored: number;
  platformsUsed: number;
  hiddenGemsRated: number; // content with <1000 ratings rated highly
  lateNightActivity: number; // activity between 12am-5am
  weekendActivity: number;
  xp: number;
  level: number;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // === CONTENT MILESTONES ===
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Rate your first piece of content',
    icon: '🌟',
    rarity: 'common',
    xpReward: 10,
    condition: (s) => s.moviesRated + s.animeCompleted + s.tvCompleted + s.musicRated >= 1,
  },
  {
    id: 'movie_explorer',
    title: 'Movie Explorer',
    description: 'Rate 10 movies',
    icon: '🎬',
    rarity: 'common',
    xpReward: 50,
    condition: (s) => s.moviesRated >= 10,
    progress: (s) => ({ current: s.moviesRated, target: 10 }),
  },
  {
    id: 'movie_buff',
    title: 'Movie Buff',
    description: 'Rate 50 movies',
    icon: '🎥',
    rarity: 'rare',
    xpReward: 100,
    condition: (s) => s.moviesRated >= 50,
    progress: (s) => ({ current: s.moviesRated, target: 50 }),
  },
  {
    id: 'cinema_legend',
    title: 'Cinema Legend',
    description: 'Rate 100 movies',
    icon: '🏆',
    rarity: 'legendary',
    xpReward: 250,
    condition: (s) => s.moviesRated >= 100,
    progress: (s) => ({ current: s.moviesRated, target: 100 }),
  },
  {
    id: 'anime_beginner',
    title: 'Anime Beginner',
    description: 'Complete 5 anime series',
    icon: '🎌',
    rarity: 'common',
    xpReward: 25,
    condition: (s) => s.animeCompleted >= 5,
    progress: (s) => ({ current: s.animeCompleted, target: 5 }),
  },
  {
    id: 'anime_master',
    title: 'Anime Master',
    description: 'Complete 20 anime series',
    icon: '⛩️',
    rarity: 'rare',
    xpReward: 100,
    condition: (s) => s.animeCompleted >= 20,
    progress: (s) => ({ current: s.animeCompleted, target: 20 }),
  },
  {
    id: 'anime_legend',
    title: 'Anime Legend',
    description: 'Complete 50 anime series',
    icon: '🐉',
    rarity: 'legendary',
    xpReward: 250,
    condition: (s) => s.animeCompleted >= 50,
    progress: (s) => ({ current: s.animeCompleted, target: 50 }),
  },
  {
    id: 'binge_watcher',
    title: 'Binge Watcher',
    description: 'Complete 10 TV shows',
    icon: '📺',
    rarity: 'common',
    xpReward: 50,
    condition: (s) => s.tvCompleted >= 10,
    progress: (s) => ({ current: s.tvCompleted, target: 10 }),
  },
  {
    id: 'music_lover',
    title: 'Music Lover',
    description: 'Rate 25 songs or albums',
    icon: '🎵',
    rarity: 'common',
    xpReward: 50,
    condition: (s) => s.musicRated >= 25,
    progress: (s) => ({ current: s.musicRated, target: 25 }),
  },
  {
    id: 'content_machine',
    title: 'Content Machine',
    description: 'Consume 100 pieces of content',
    icon: '🤖',
    rarity: 'epic',
    xpReward: 200,
    condition: (s) => s.moviesWatched + s.animeCompleted + s.tvCompleted + s.musicRated >= 100,
    progress: (s) => ({ current: s.moviesWatched + s.animeCompleted + s.tvCompleted + s.musicRated, target: 100 }),
  },

  // === GENRE SPECIALISTS ===
  {
    id: 'sci_fi_guru',
    title: 'Sci-Fi Guru',
    description: 'Rate 15 Sci-Fi movies or shows',
    icon: '🚀',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.genresExplored >= 5 && s.moviesRated >= 15,
  },
  {
    id: 'horror_connoisseur',
    title: 'Horror Connoisseur',
    description: 'Watch 10 horror movies',
    icon: '👻',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.moviesWatched >= 10,
  },
  {
    id: 'romance_expert',
    title: 'Romance Expert',
    description: 'Rate 10 romance movies',
    icon: '❤️',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.moviesRated >= 10,
  },
  {
    id: 'genre_explorer',
    title: 'Genre Explorer',
    description: 'Explore content across 8 different genres',
    icon: '🗺️',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.genresExplored >= 8,
    progress: (s) => ({ current: s.genresExplored, target: 8 }),
  },
  {
    id: 'genre_master',
    title: 'Genre Master',
    description: 'Explore content across all 12 genres',
    icon: '👑',
    rarity: 'epic',
    xpReward: 150,
    condition: (s) => s.genresExplored >= 12,
    progress: (s) => ({ current: s.genresExplored, target: 12 }),
  },

  // === SOCIAL ACHIEVEMENTS ===
  {
    id: 'first_follower',
    title: 'First Follower',
    description: 'Get your first follower',
    icon: '👋',
    rarity: 'common',
    xpReward: 25,
    condition: (s) => s.followersCount >= 1,
  },
  {
    id: 'popular_kid',
    title: 'Popular Kid',
    description: 'Get 10 followers',
    icon: '🌟',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.followersCount >= 10,
    progress: (s) => ({ current: s.followersCount, target: 10 }),
  },
  {
    id: 'influencer',
    title: 'Influencer',
    description: 'Get 50 followers',
    icon: '📱',
    rarity: 'epic',
    xpReward: 150,
    condition: (s) => s.followersCount >= 50,
    progress: (s) => ({ current: s.followersCount, target: 50 }),
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Follow 20 people',
    icon: '🦋',
    rarity: 'common',
    xpReward: 25,
    condition: (s) => s.followingCount >= 20,
    progress: (s) => ({ current: s.followingCount, target: 20 }),
  },
  {
    id: 'trusted_critic',
    title: 'Trusted Critic',
    description: 'Get 50 likes on your reviews',
    icon: '⭐',
    rarity: 'epic',
    xpReward: 200,
    condition: (s) => s.reviewLikes >= 50,
    progress: (s) => ({ current: s.reviewLikes, target: 50 }),
  },
  {
    id: 'review_royalty',
    title: 'Review Royalty',
    description: 'Get 100 likes on your reviews',
    icon: '💎',
    rarity: 'legendary',
    xpReward: 300,
    condition: (s) => s.reviewLikes >= 100,
    progress: (s) => ({ current: s.reviewLikes, target: 100 }),
  },

  // === REVIEW MILESTONES ===
  {
    id: 'first_review',
    title: 'First Review',
    description: 'Write your first review',
    icon: '✍️',
    rarity: 'common',
    xpReward: 25,
    condition: (s) => s.reviewsWritten >= 1,
  },
  {
    id: 'prolific_critic',
    title: 'Prolific Critic',
    description: 'Write 25 reviews',
    icon: '📝',
    rarity: 'rare',
    xpReward: 100,
    condition: (s) => s.reviewsWritten >= 25,
    progress: (s) => ({ current: s.reviewsWritten, target: 25 }),
  },
  {
    id: 'review_master',
    title: 'Review Master',
    description: 'Write 100 reviews',
    icon: '📚',
    rarity: 'legendary',
    xpReward: 250,
    condition: (s) => s.reviewsWritten >= 100,
    progress: (s) => ({ current: s.reviewsWritten, target: 100 }),
  },

  // === DISCOVERY ACHIEVEMENTS ===
  {
    id: 'hidden_gem_hunter',
    title: 'Hidden Gem Hunter',
    description: 'Rate a piece of content with less than 1000 ratings highly',
    icon: '💎',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.hiddenGemsRated >= 1,
  },
  {
    id: 'trendsetter',
    title: 'Trendsetter',
    description: 'Rate 10 trending titles',
    icon: '📈',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.highRatedCount >= 10,
  },
  {
    id: 'watchlist_queen',
    title: 'Watchlist Queen',
    description: 'Add 50 items to your watchlist',
    icon: '📋',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.watchlistItems >= 50,
    progress: (s) => ({ current: s.watchlistItems, target: 50 }),
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Create 5 collections',
    icon: '📁',
    rarity: 'common',
    xpReward: 25,
    condition: (s) => s.collectionsCreated >= 5,
    progress: (s) => ({ current: s.collectionsCreated, target: 5 }),
  },
  {
    id: 'curator',
    title: 'Curator',
    description: 'Create 15 collections',
    icon: '🎨',
    rarity: 'epic',
    xpReward: 150,
    condition: (s) => s.collectionsCreated >= 15,
    progress: (s) => ({ current: s.collectionsCreated, target: 15 }),
  },

  // === STREAK & DEDICATION ===
  {
    id: 'review_streak',
    title: 'Review Streak',
    description: 'Write reviews 7 days in a row',
    icon: '🔥',
    rarity: 'epic',
    xpReward: 150,
    condition: (s) => s.consecutiveReviewDays >= 7,
    progress: (s) => ({ current: s.consecutiveReviewDays, target: 7 }),
  },
  {
    id: 'dedicated_fan',
    title: 'Dedicated Fan',
    description: 'Be active for 30 days',
    icon: '📅',
    rarity: 'rare',
    xpReward: 100,
    condition: (s) => s.daysActive >= 30,
    progress: (s) => ({ current: s.daysActive, target: 30 }),
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: 'Be active for 100 days',
    icon: '🏅',
    rarity: 'legendary',
    xpReward: 300,
    condition: (s) => s.daysActive >= 100,
    progress: (s) => ({ current: s.daysActive, target: 100 }),
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Rate or review content between 12am and 5am',
    icon: '🦉',
    rarity: 'common',
    xpReward: 10,
    condition: (s) => s.lateNightActivity >= 1,
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Be active on 10 weekends',
    icon: '⚔️',
    rarity: 'rare',
    xpReward: 75,
    condition: (s) => s.weekendActivity >= 10,
    progress: (s) => ({ current: s.weekendActivity, target: 10 }),
  },

  // === OPINION ACHIEVEMENTS ===
  {
    id: 'honest_critic',
    title: 'Honest Critic',
    description: 'Give both 1-star and 5-star ratings',
    icon: '⚖️',
    rarity: 'common',
    xpReward: 15,
    condition: (s) => s.lowRatedCount >= 1 && s.highRatedCount >= 1,
  },
  {
    id: 'platform_hopper',
    title: 'Platform Hopper',
    description: 'Use 3 different streaming platforms',
    icon: ' hopping',
    rarity: 'common',
    xpReward: 25,
    condition: (s) => s.platformsUsed >= 3,
    progress: (s) => ({ current: s.platformsUsed, target: 3 }),
  },

  // === LEVEL ACHIEVEMENTS ===
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Reach Level 5',
    icon: '⭐',
    rarity: 'common',
    xpReward: 50,
    condition: (s) => s.level >= 5,
  },
  {
    id: 'level_10',
    title: 'Entertainment Enthusiast',
    description: 'Reach Level 10',
    icon: '🌟',
    rarity: 'rare',
    xpReward: 100,
    condition: (s) => s.level >= 10,
  },
  {
    id: 'level_20',
    title: 'CineVerse Master',
    description: 'Reach Level 20',
    icon: '🏆',
    rarity: 'legendary',
    xpReward: 500,
    condition: (s) => s.level >= 20,
  },
];

export const XP_VALUES = {
  RATE_CONTENT: 10,
  WRITE_REVIEW: 25,
  EARN_ACHIEVEMENT: 50, // Base, varies by rarity
  FOLLOW_USER: 5,
  ADD_TO_WATCHLIST: 2,
  CREATE_COLLECTION: 10,
  DAILY_LOGIN: 5,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000, // Levels 1-10
  7000, 9500, 12500, 16000, 20000, 25000, 31000, 38000, 46000, 55000, // Levels 11-20
  65000, 76000, 88000, 101000, 115000, // Levels 21-25
];

export const LEVEL_NAMES = [
  'Casual Viewer', // Level 1
  'Casual Viewer',
  'Casual Viewer',
  'Casual Viewer',
  'Casual Viewer',
  'Enthusiast', // Level 6
  'Enthusiast',
  'Enthusiast',
  'Enthusiast',
  'Enthusiast',
  'Critic', // Level 11
  'Critic',
  'Critic',
  'Critic',
  'Critic',
  'Guru', // Level 16
  'Guru',
  'Guru',
  'Guru',
  'Guru',
  'Legend', // Level 21+
];

export function getLevelForXP(xp: number): { level: number; name: string; currentXP: number; nextThreshold: number; progress: number } {
  let level = 1;
  let prevThreshold = 0;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      prevThreshold = LEVEL_THRESHOLDS[i];
    } else {
      break;
    }
  }

  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 20000;
  const currentXP = xp - prevThreshold;
  const xpNeeded = nextThreshold - prevThreshold;
  const progress = Math.min(100, (currentXP / xpNeeded) * 100);

  return {
    level,
    name: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
    currentXP,
    nextThreshold: xpNeeded,
    progress,
  };
}

export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return '#6B7280';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#8B5CF6';
    case 'legendary':
      return '#F59E0B';
  }
}

export function getRarityOrder(rarity: AchievementRarity): number {
  switch (rarity) {
    case 'legendary':
      return 0;
    case 'epic':
      return 1;
    case 'rare':
      return 2;
    case 'common':
      return 3;
  }
}
