'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ReviewCard, ReviewData } from '@/components/features/ReviewCard';
import { Stars } from '@/components/ui/Stars';
import { useToast } from '@/components/ui/Toast';

type SortKey = 'most-liked' | 'most-recent' | 'highest-rated' | 'lowest-rated' | 'most-helpful';
export type { SortKey };

const SORTS: { key: SortKey; label: string; emoji: string }[] = [
  { key: 'most-liked', label: 'Most liked', emoji: '❤️' },
  { key: 'most-recent', label: 'Most recent', emoji: '🕐' },
  { key: 'highest-rated', label: 'Highest rated', emoji: '⭐' },
  { key: 'lowest-rated', label: 'Lowest rated', emoji: '👎' },
  { key: 'most-helpful', label: 'Most helpful', emoji: '👍' },
];

interface ReviewsListProps {
  contentId: string;
  contentType: string;
  contentTitle?: string;
  initialSort?: SortKey;
  currentUserId?: string | null;
  onWriteReview?: () => void;
  showTitle?: boolean;
  pageSize?: number;
  showWriteButton?: boolean;
  className?: string;
}

interface FetchedReviews {
  reviews: (Omit<ReviewData, 'userVote'> & { userVote: 1 | -1 | null })[];
  ownReview: any;
  total: number;
  stats: { average: number; count: number };
}

export function ReviewsList({
  contentId,
  contentType,
  contentTitle,
  initialSort = 'most-liked',
  currentUserId,
  onWriteReview,
  showTitle = true,
  pageSize = 20,
  showWriteButton = true,
  className = '',
}: ReviewsListProps) {
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [data, setData] = useState<FetchedReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError } = useToast();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        contentId,
        contentType,
        sort,
        limit: String(pageSize),
      });
      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to load reviews');
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to load reviews');
      toastError(e?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType, sort, pageSize, toastError]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  function handleLocalChange(updated: ReviewData) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.id === updated.id ? { ...r, ...updated } : r
        ),
      };
    });
  }

  function handleLocalDelete(id: string) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== id),
        total: Math.max(0, prev.total - 1),
      };
    });
  }

  const reviews = data?.reviews || [];
  const ownReview = data?.ownReview;
  const stats = data?.stats || { average: 0, count: 0 };
  const currentSortLabel = SORTS.find((s) => s.key === sort)?.label || 'Sort';

  return (
    <div className={className}>
      {/* Header */}
      {showTitle && (
        <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-outfit text-2xl text-primary mb-1">Reviews</h2>
            {stats.count > 0 ? (
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Stars rating={stats.average} size="md" />
                  <span className="font-medium text-primary">
                    {stats.average.toFixed(1)}
                  </span>
                </div>
                <span>·</span>
                <span>{stats.count} {stats.count === 1 ? 'review' : 'reviews'}</span>
                {contentTitle && (
                  <>
                    <span>·</span>
                    <span className="text-text-tertiary truncate max-w-[200px]" title={contentTitle}>
                      for "{contentTitle}"
                    </span>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No reviews yet — be the first.</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showWriteButton && (
              <button
                onClick={onWriteReview}
                className="px-3 py-1.5 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sort bar */}
      {stats.count > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-background-secondary border border-accent-blue/10 hover:border-accent-blue/30 text-primary text-sm rounded-lg transition-colors"
            >
              <span className="text-text-tertiary">Sort:</span>
              <span>{currentSortLabel}</span>
              <svg className={`w-3 h-3 transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {sortMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 w-48 bg-background-secondary border border-accent-blue/20 rounded-lg shadow-2xl z-20 py-1"
                  >
                    {SORTS.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => { setSort(s.key); setSortMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-background-tertiary ${
                          sort === s.key ? 'text-accent-blue' : 'text-primary'
                        }`}
                      >
                        <span>{s.emoji}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs text-text-tertiary">
            Showing {reviews.length} of {stats.count}
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-background-secondary border border-accent-blue/10 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background-tertiary animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-32 bg-background-tertiary rounded animate-pulse" />
                  <div className="h-2 w-20 bg-background-tertiary rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-background-tertiary rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-background-tertiary rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-background-tertiary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-10 text-text-secondary">
          <p>{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-2 text-accent-blue hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && stats.count === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-primary font-medium mb-1">No reviews yet</p>
          <p className="text-sm text-text-secondary mb-4">Be the first to share your thoughts.</p>
          {showWriteButton && currentUserId && (
            <button
              onClick={onWriteReview}
              className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/90 transition-colors"
            >
              Write the first review
            </button>
          )}
        </div>
      )}

      {/* Reviews list — own review first if it exists, then the rest */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {ownReview && !reviews.find((r) => r.id === ownReview.id) && (
            <ReviewCard
              key={ownReview.id}
              review={{ ...ownReview, userVote: null }}
              currentUserId={currentUserId}
              onDeleted={handleLocalDelete}
              onChanged={handleLocalChange}
            />
          )}
          <AnimatePresence initial={false}>
            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                currentUserId={currentUserId}
                onDeleted={handleLocalDelete}
                onChanged={handleLocalChange}
              />
            ))}
          </AnimatePresence>

          {stats.count > pageSize && (
            <div className="text-center pt-2">
              <Link
                href={`/reviews/${contentId}?type=${contentType}&title=${encodeURIComponent(contentTitle || '')}`}
                className="text-sm text-accent-blue hover:underline"
              >
                See all {stats.count} reviews →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
