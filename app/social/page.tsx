'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityCard from '@/components/features/ActivityCard';
import UserCard from '@/components/features/UserCard';
import NotificationBell from '@/components/ui/NotificationBell';
import { ActivityItem, FollowUser } from '@/types/social';

type TabType = 'following' | 'discover' | 'trending';

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<FollowUser[]>([]);
  const [trendingLists, setTrendingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState('current-user-id'); // Mock current user ID

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'following') {
        await fetchActivities();
      } else if (activeTab === 'discover') {
        await fetchSuggestedUsers();
      } else {
        await fetchTrendingLists();
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    // Mock activities data
    const mockActivities: ActivityItem[] = [
      {
        id: 'a1',
        userId: 'user-2',
        user: {
          id: 'user-2',
          username: 'scififan42',
          name: 'SciFi Fan',
          avatarUrl: 'https://via.placeholder.com/80',
          bio: 'Hardcore sci-fi enthusiast',
          createdAt: '2024-01-01T00:00:00Z',
        },
        actionType: 'rate',
        contentId: 'movie-123',
        contentType: 'movie',
        contentTitle: 'Interstellar',
        contentPosterUrl: 'https://via.placeholder.com/60x90',
        metadata: { rating: 5 },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'a2',
        userId: 'user-3',
        user: {
          id: 'user-3',
          username: 'animelover',
          name: 'Anime Lover',
          avatarUrl: 'https://via.placeholder.com/80',
          bio: 'Watching anime since 2005',
          createdAt: '2024-01-01T00:00:00Z',
        },
        actionType: 'review',
        contentId: 'anime-456',
        contentType: 'anime',
        contentTitle: 'Attack on Titan',
        contentPosterUrl: 'https://via.placeholder.com/60x90',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'a3',
        userId: 'user-4',
        user: {
          id: 'user-4',
          username: 'movienight',
          name: 'Movie Night',
          avatarUrl: 'https://via.placeholder.com/80',
          bio: 'Weekly movie marathon host',
          createdAt: '2024-01-01T00:00:00Z',
        },
        actionType: 'watchlist_add',
        contentId: 'movie-789',
        contentType: 'movie',
        contentTitle: 'Blade Runner 2049',
        contentPosterUrl: 'https://via.placeholder.com/60x90',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'a4',
        userId: 'user-5',
        user: {
          id: 'user-5',
          username: 'gamergirl',
          name: 'Gamer Girl',
          avatarUrl: 'https://via.placeholder.com/80',
          bio: 'Gaming & anime crossover',
          createdAt: '2024-01-01T00:00:00Z',
        },
        actionType: 'follow',
        contentId: currentUserId,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    setActivities(mockActivities);
  };

  const fetchSuggestedUsers = async () => {
    // Mock suggested users based on DNA similarity
    const mockUsers: FollowUser[] = [
      {
        id: 'user-6',
        username: 'cyberpunkfan',
        name: 'Cyberpunk Fan',
        avatarUrl: 'https://via.placeholder.com/80',
        bio: 'Loves cyberpunk aesthetics and sci-fi',
        isFollowing: false,
      },
      {
        id: 'user-7',
        username: 'animeotaku',
        name: 'Anime Otaku',
        avatarUrl: 'https://via.placeholder.com/80',
        bio: '100+ anime completed this year',
        isFollowing: false,
      },
      {
        id: 'user-8',
        username: 'moviecritic',
        name: 'Movie Critic',
        avatarUrl: 'https://via.placeholder.com/80',
        bio: 'Professional movie reviewer',
        isFollowing: false,
      },
      {
        id: 'user-9',
        username: 'musichead',
        name: 'Music Head',
        avatarUrl: 'https://via.placeholder.com/80',
        bio: 'Soundtrack enthusiast',
        isFollowing: false,
      },
      {
        id: 'user-10',
        username: 'podcastlover',
        name: 'Podcast Lover',
        avatarUrl: 'https://via.placeholder.com/80',
        bio: 'True crime & tech podcasts',
        isFollowing: false,
      },
      {
        id: 'user-11',
        username: 'bingewatcher',
        name: 'Binge Watcher',
        avatarUrl: 'https://via.placeholder.com/80',
        bio: 'Can finish a series in one night',
        isFollowing: false,
      },
    ];
    setSuggestedUsers(mockUsers);
  };

  const fetchTrendingLists = async () => {
    // Mock trending lists
    const mockLists = [
      {
        id: 'tl1',
        name: 'Best Sci-Fi Movies of 2024',
        creator: 'SciFi Fan',
        creatorUsername: 'scififan42',
        itemCount: 24,
        followers: 156,
        emoji: '🚀',
      },
      {
        id: 'tl2',
        name: 'Must-Watch Anime',
        creator: 'Anime Lover',
        creatorUsername: 'animelover',
        itemCount: 48,
        followers: 234,
        emoji: '🎌',
      },
      {
        id: 'tl3',
        name: 'Date Night Movies',
        creator: 'Movie Night',
        creatorUsername: 'movienight',
        itemCount: 18,
        followers: 89,
        emoji: '❤️',
      },
      {
        id: 'tl4',
        name: 'Mind-Bending Thrillers',
        creator: 'Movie Critic',
        creatorUsername: 'moviecritic',
        itemCount: 32,
        followers: 167,
        emoji: '🧠',
      },
    ];
    setTrendingLists(mockLists);
  };

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background-primary/80 backdrop-blur-sm border-b border-accent-blue/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary font-outfit">Social</h1>
              <p className="text-sm text-text-secondary">Discover & connect with entertainment fans</p>
            </div>
            <NotificationBell userId={currentUserId} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-1 bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-1">
          {(['following', 'discover', 'trending'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-accent-blue text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
              }`}
            >
              {tab === 'following' && '👥 Following'}
              {tab === 'discover' && '🔍 Discover'}
              {tab === 'trending' && '🔥 Trending'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background-tertiary rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-background-tertiary rounded w-1/3 mb-2" />
                      <div className="h-3 bg-background-tertiary rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'following' && (
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-text-secondary mb-4">
                        No activity from people you follow yet.
                      </p>
                      <button
                        onClick={() => setActiveTab('discover')}
                        className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                      >
                        Discover People
                      </button>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'discover' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-2">
                      People with similar taste
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Users with high Entertainment DNA match
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestedUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        showCompatibility
                        compatibilityScore={Math.floor(Math.random() * 20) + 80}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'trending' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-2">
                      Trending Lists
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Popular collections from the community
                    </p>
                  </div>
                  <div className="space-y-4">
                    {trendingLists.map((list) => (
                      <motion.div
                        key={list.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 hover:border-accent-blue/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{list.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary">{list.name}</h3>
                            <p className="text-sm text-text-secondary">
                              by @{list.creatorUsername}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                              <span>{list.itemCount} items</span>
                              <span>•</span>
                              <span>{list.followers} followers</span>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 text-sm font-medium text-accent-blue border border-accent-blue/30 rounded-lg hover:bg-accent-blue/10 transition-colors">
                            Follow
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
