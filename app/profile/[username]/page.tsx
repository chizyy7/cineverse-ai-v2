'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FollowButton from '@/components/features/FollowButton';

interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  isPremium: boolean;
  followersCount: number;
  followingCount: number;
  reviewsCount: number;
  watchlistCount: number;
  dna: {
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
  } | null;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

interface Review {
  id: string;
  contentTitle: string;
  contentType: string;
  rating: number;
  text: string | null;
  createdAt: string;
}

interface Collection {
  id: string;
  name: string;
  emoji: string;
  _count: { watchlistItems: number };
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'collections'>('overview');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Mock data for now - in production, fetch from API
      const mockProfile: UserProfile = {
        id: 'user-1',
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        avatarUrl: 'https://via.placeholder.com/150',
        bio: 'Movie enthusiast and anime lover. Sci-Fi is life.',
        createdAt: '2024-01-15T00:00:00Z',
        isPremium: true,
        followersCount: 234,
        followingCount: 89,
        reviewsCount: 47,
        watchlistCount: 156,
        dna: {
          action: 92,
          sciFi: 88,
          comedy: 65,
          romance: 35,
          crime: 72,
          fantasy: 78,
          documentary: 45,
          thriller: 80,
          adventure: 85,
          horror: 55,
          anime: 90,
          music: 60,
          podcast: 30,
        },
        isFollowing: false,
        isOwnProfile: false,
      };

      const mockReviews: Review[] = [
        {
          id: 'r1',
          contentTitle: 'Interstellar',
          contentType: 'movie',
          rating: 5,
          text: 'A masterpiece of science fiction cinema. The emotional depth combined with hard sci-fi concepts is breathtaking.',
          createdAt: '2024-03-15T00:00:00Z',
        },
        {
          id: 'r2',
          contentTitle: 'Attack on Titan',
          contentType: 'anime',
          rating: 5,
          text: 'The best anime of the decade. Incredible storytelling and character development.',
          createdAt: '2024-02-20T00:00:00Z',
        },
        {
          id: 'r3',
          contentTitle: 'Blade Runner 2049',
          contentType: 'movie',
          rating: 4,
          text: 'Visually stunning sequel that honors the original while telling its own story.',
          createdAt: '2024-01-10T00:00:00Z',
        },
      ];

      const mockCollections: Collection[] = [
        { id: 'c1', name: 'Sci-Fi Essentials', emoji: '🚀', _count: { watchlistItems: 24 } },
        { id: 'c2', name: 'Anime Masterpiece', emoji: '🎌', _count: { watchlistItems: 18 } },
        { id: 'c3', name: 'Weekend Binge', emoji: '🍿', _count: { watchlistItems: 12 } },
        { id: 'c4', name: 'Mind-Bending Movies', emoji: '🧠', _count: { watchlistItems: 8 } },
      ];

      setProfile(mockProfile);
      setReviews(mockReviews);
      setCollections(mockCollections);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDNAColor = (value: number): string => {
    if (value >= 80) return '#10B981';
    if (value >= 60) return '#3B82F6';
    if (value >= 40) return '#F59E0B';
    return '#6B7280';
  };

  const getDNAIcon = (genre: string): string => {
    const icons: Record<string, string> = {
      action: '💥',
      sciFi: '🚀',
      comedy: '😂',
      romance: '❤️',
      crime: '🔍',
      fantasy: '🧙',
      documentary: '📽️',
      thriller: '😱',
      adventure: '🗺️',
      horror: '👻',
      anime: '🎌',
      music: '🎵',
      podcast: '🎙️',
    };
    return icons[genre] || '📌';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">User not found</h1>
          <p className="text-text-secondary">The user @{username} does not exist.</p>
          <Link
            href="/social"
            className="mt-4 inline-block px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Browse Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-b from-accent-blue/20 to-background-primary">
        <div className="absolute inset-0 bg-[url('/images/profile-bg.jpg')] bg-cover bg-center opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img
                src={profile.avatarUrl || 'https://via.placeholder.com/150'}
                alt={profile.name || profile.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-accent-blue/30"
              />
              {profile.isPremium && (
                <div className="absolute -bottom-1 -right-1 bg-accent-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  PRO
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">
                  {profile.name || profile.username}
                </h1>
                <span className="text-text-tertiary">@{profile.username}</span>
              </div>

              {profile.bio && (
                <p className="text-text-secondary mt-2">{profile.bio}</p>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                <span className="text-text-tertiary">
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{profile.followersCount}</p>
                  <p className="text-xs text-text-tertiary">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{profile.followingCount}</p>
                  <p className="text-xs text-text-tertiary">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{profile.reviewsCount}</p>
                  <p className="text-xs text-text-tertiary">Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">{profile.watchlistCount}</p>
                  <p className="text-xs text-text-tertiary">Watchlist</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {profile.isOwnProfile ? (
                <Link
                  href="/settings"
                  className="px-4 py-2 bg-background-tertiary text-text-primary rounded-lg hover:bg-accent-blue/20 transition-colors"
                >
                  Edit Profile
                </Link>
              ) : (
                <FollowButton
                  userId={profile.id}
                  initialIsFollowing={profile.isFollowing}
                  size="md"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* DNA Section */}
        {profile.dna && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Entertainment DNA</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(profile.dna)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([genre, value]) => (
                  <div
                    key={genre}
                    className="bg-background-tertiary/50 rounded-xl p-3 flex items-center gap-3"
                  >
                    <span className="text-xl">{getDNAIcon(genre)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-tertiary capitalize">
                        {genre.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-background-primary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${value}%`,
                              backgroundColor: getDNAColor(value),
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: getDNAColor(value) }}>
                          {value}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mt-6 flex gap-1 bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-1">
          {(['overview', 'reviews', 'collections'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-12">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-accent-blue">🎬</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {Math.floor(profile.watchlistCount * 0.6)}
                  </p>
                  <p className="text-xs text-text-tertiary">Movies Watched</p>
                </div>
                <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-accent-purple">🎌</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {Math.floor(profile.watchlistCount * 0.3)}
                  </p>
                  <p className="text-xs text-text-tertiary">Anime Completed</p>
                </div>
                <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-accent-gold">⭐</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {profile.reviewsCount}
                  </p>
                  <p className="text-xs text-text-tertiary">Reviews Written</p>
                </div>
                <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-accent-success">🏆</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {Math.floor(Math.random() * 10) + 5}
                  </p>
                  <p className="text-xs text-text-tertiary">Achievements</p>
                </div>
              </div>

              {/* Recent Activity Preview */}
              <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center gap-3 p-3 bg-background-tertiary/50 rounded-lg"
                    >
                      <span className="text-lg">⭐</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">
                          Rated <span className="font-semibold">{review.contentTitle}</span>{' '}
                          {'⭐'.repeat(review.rating)}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-text-primary">{review.contentTitle}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-accent-gold">{'⭐'.repeat(review.rating)}</span>
                        <span className="text-xs text-text-tertiary capitalize">
                          {review.contentType}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.text && (
                    <p className="mt-3 text-sm text-text-secondary">{review.text}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 hover:border-accent-blue/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{collection.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text-primary">{collection.name}</h3>
                      <p className="text-xs text-text-tertiary">
                        {collection._count.watchlistItems} items
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
