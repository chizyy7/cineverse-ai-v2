'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentCard } from '@/components/features/ContentCard';
import { normalizeContent, ContentType } from '@/lib/content';
import { tmdb, TMDBMovie, TMDBShow } from '@/lib/tmdb';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardClientProps {
  user: any;
}

// Define row types
interface ContentRow {
  title: string;
  type: ContentType; // 'movie' or 'tv' for TMDB, we'll keep generic
  fetchFunction: () => Promise<any[]>; // fetches raw data from TMDB
  slug: string; // unique key for state
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [rows, setRows] = useState<ContentRow[]>([
    {
      title: 'Trending Movies',
      type: 'movie',
      fetchFunction: async () => {
        const res = await tmdb.get<TMDBMovie>('/trending/movie/day');
        return res.results.slice(0, 10);
      },
      slug: 'trending-movies',
    },
    {
      title: 'Top Rated Movies',
      type: 'movie',
      fetchFunction: async () => {
        const res = await tmdb.get<TMDBMovie>('/movie/top_rated', { params: { page: 1 } });
        return res.results.slice(0, 10);
      },
      slug: 'top-rated-movies',
    },
    {
      title: 'Popular Movies',
      type: 'movie',
      fetchFunction: async () => {
        const res = await tmdb.get<TMDBMovie>('/movie/popular', { params: { page: 1 } });
        return res.results.slice(0, 10);
      },
      slug: 'popular-movies',
    },
    {
      title: 'Trending TV',
      type: 'tv',
      fetchFunction: async () => {
        const res = await tmdb.get<TMDBShow>('/trending/tv/day');
        return res.results.slice(0, 10);
      },
      slug: 'trending-tv',
    },
    {
      title: 'Popular TV',
      type: 'tv',
      fetchFunction: async () => {
        const res = await tmdb.get<TMDBShow>('/tv/popular', { params: { page: 1 } });
        return res.results.slice(0, 10);
      },
      slug: 'popular-tv',
    },
    {
      title: 'Action Movies',
      type: 'movie',
      fetchFunction: async () => {
        // We'll need to get genre id for action (28)
        const res = await tmdb.get<TMDBMovie>('/discover/movie', {
          params: { with_genres: 28, sort_by: 'popularity.desc', page: 1 },
        });
        return res.results.slice(0, 10);
      },
      slug: 'action-movies',
    },
    {
      title: 'Comedy Movies',
      type: 'movie',
      fetchFunction: async () => {
        const res = await tmdb.get<TMDBMovie>('/discover/movie', {
          params: { with_genres: 35, sort_by: 'popularity.desc', page: 1 },
        });
        return res.results.slice(0, 10);
      },
      slug: 'comedy-movies',
    },
  ]);

  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for each row
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const results: Record<string, any[]> = {};

      try {
        // Fetch all rows concurrently
        const promises = rows.map(async (row) => {
          try {
            const rawData = await row.fetchFunction();
            // Normalize each item
            const normalized = await Promise.all(
              rawData.map((item: any) =>
                normalizeContent(item, row.type as ContentType)
              )
            );
            if (!cancelled) {
              results[row.slug] = normalized;
            }
          } catch (err) {
            console.error(`Failed to fetch ${row.title}:`, err);
            // Keep empty array for this row
            if (!cancelled) {
              results[row.slug] = [];
            }
          }
        });

        await Promise.all(promises);
        if (!cancelled) {
          setData(results);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load dashboard data');
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [rows]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Loading your dashboard...
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <div key={row.slug} className="bg-background-secondary rounded-xl p-4">
                <h3 className="font-semibold text-primary mb-2">{row.title}</h3>
                <div className="space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-5 w-[80px]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold text-primary mb-6">
            Something went wrong
          </h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Welcome back, {user.username || user.name}!
        </h1>
        <nav className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/watchlist"
            className="px-3 py-1.5 bg-accent-blue/10 text-accent-blue rounded hover:bg-accent-blue/20 transition-colors"
          >
            My Watchlist
          </Link>
          <Link
            href="/social"
            className="px-3 py-1.5 bg-accent-blue/10 text-accent-blue rounded hover:bg-accent-blue/20 transition-colors"
          >
            Social
          </Link>
          <Link
            href="/analytics"
            className="px-3 py-1.5 bg-accent-blue/10 text-accent-blue rounded hover:bg-accent-blue/20 transition-colors"
          >
            Analytics
          </Link>
        </nav>

        <div className="space-y-8">
          {rows.map((row) => {
            const items = data[row.slug] || [];
            return (
              <div key={row.slug}>
                <h2 className="text-xl font-semibold text-primary mb-4">
                  {row.title}
                </h2>
                <div className="relative">
                  {/* Scroll buttons */}
                  <button
                    onClick={() => {
                      const container = document.getElementById(
                        `row-${row.slug}-container`
                      );
                      if (container) {
                        container.scrollBy({ left: -320, behavior: 'smooth' });
                      }
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-background-secondary/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-accent-blue/20 transition-colors z-10"
                    aria-label="Scroll left"
                  >
                    <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const container = document.getElementById(
                        `row-${row.slug}-container`
                      );
                      if (container) {
                        container.scrollBy({ left: 320, behavior: 'smooth' });
                      }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-background-secondary/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center hover:bg-accent-blue/20 transition-colors z-10"
                    aria-label="Scroll right"
                  >
                    <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Scrollable container */}
                  <div
                    id={`row-${row.slug}-container`}
                    className="pt-1 pb-4 overflow-x-hidden"
                  >
                    <div className="flex-1 flex space-x-3">
                      <AnimatePresence>
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id || index}
                            initial={{ x: 0 }}
                            animate={{ x: 0 }}
                            className="flex-1 flex space-x-3"
                          >
                            <ContentCard
                              key={item.id || index}
                              content={item}
                              onSave={() => {
                                // TODO: implement save to watchlist
                                console.log('Save content:', item.title);
                              }}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}