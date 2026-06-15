export interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  isPremium?: boolean;
}

export interface UserWithStats extends UserProfile {
  followersCount: number;
  followingCount: number;
  reviewsCount: number;
  watchlistCount: number;
  dna?: EntertainmentDNAPublic | null;
}

export interface EntertainmentDNAPublic {
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
}

export interface FollowUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
}

export interface ActivityItem {
  id: string;
  userId: string;
  user: UserProfile;
  actionType: 'follow' | 'rate' | 'review' | 'watchlist_add' | 'collection_create' | 'collection_add';
  contentId?: string;
  contentType?: string;
  contentTitle?: string;
  contentPosterUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SocialFeedResponse {
  activities: ActivityItem[];
  nextCursor?: string;
}

export interface TasteCompatibility {
  score: number;
  sharedGenres: string[];
  topMatch: string;
}
