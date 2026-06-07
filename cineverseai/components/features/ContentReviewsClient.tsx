'use client';

import { useState } from 'react';
import { RatingModal } from '@/components/features/RatingModal';
import { ReviewsSection } from '@/components/features/ReviewsSection';
import { useToast } from '@/components/ui/Toast';

interface ContentReviewsClientProps {
  contentId: string;
  contentType: string;
  contentTitle: string;
  currentUserId: string | null;
  initialOpenModal?: boolean;
}

/**
 * Client island that bundles the "Rate" trigger button, the
 * RatingModal, and the full ReviewsSection together so it can be
 * dropped into the (server-rendered) content detail page.
 */
export function ContentReviewsClient({
  contentId,
  contentType,
  contentTitle,
  currentUserId,
  initialOpenModal = false,
}: ContentReviewsClientProps) {
  const [modalOpen, setModalOpen] = useState(initialOpenModal);
  const [refreshKey, setRefreshKey] = useState(0);
  const { success } = useToast();

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
          </svg>
          Rate this
        </button>
        <a
          href={`/reviews/${contentId}?type=${contentType}&title=${encodeURIComponent(contentTitle)}`}
          className="text-sm text-text-secondary hover:text-accent-blue transition-colors"
        >
          See all reviews →
        </a>
      </div>

      <ReviewsSection
        key={refreshKey}
        contentId={contentId}
        contentType={contentType}
        contentTitle={contentTitle}
        currentUserId={currentUserId}
        showTitle={false}
        pageSize={5}
      />

      <RatingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={contentTitle}
        contentId={contentId}
        contentType={contentType}
        contentTitle={contentTitle}
        onSubmitted={() => {
          setRefreshKey((k) => k + 1);
          success('Your review is live! 🎉');
        }}
      />
    </>
  );
}
