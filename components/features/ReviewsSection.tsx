'use client';

import { useState } from 'react';
import { ReviewsList } from '@/components/features/ReviewsList';
import { RatingModal } from '@/components/features/RatingModal';
import { useToast } from '@/components/ui/Toast';
import type { SortKey } from './ReviewsList';

interface ReviewsSectionProps {
  contentId: string;
  contentType: string;
  contentTitle?: string;
  currentUserId?: string | null;
  initialSort?: SortKey;
  showTitle?: boolean;
  pageSize?: number;
  showWriteButton?: boolean;
}

export function ReviewsSection(props: ReviewsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { success } = useToast();

  return (
    <>
      <ReviewsList
        key={refreshKey}
        contentId={props.contentId}
        contentType={props.contentType}
        contentTitle={props.contentTitle}
        currentUserId={props.currentUserId}
        initialSort={props.initialSort}
        showTitle={props.showTitle}
        pageSize={props.pageSize}
        showWriteButton={props.showWriteButton}
        onWriteReview={() => setModalOpen(true)}
      />
      <RatingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={props.contentTitle}
        contentType={props.contentType}
        contentId={props.contentId}
        contentTitle={props.contentTitle}
        onSubmitted={() => {
          setRefreshKey((k) => k + 1);
          success('Your review is live! 🎉');
        }}
      />
    </>
  );
}
