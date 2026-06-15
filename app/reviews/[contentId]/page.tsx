'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReviewsList } from '@/components/features/ReviewsList';
import { RatingModal } from '@/components/features/RatingModal';
import { createClientBrowser } from '@/lib/supabase-client';

const VALID_CONTENT_TYPES = ['movie', 'anime', 'tv', 'music', 'podcast'];

export default function ContentReviewsPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const contentType = searchParams.get('type') || 'movie';
  const contentTitle = searchParams.get('title') || '';
  const posterUrl = searchParams.get('poster') || '';
  const backHref = searchParams.get('back') || `/content/${contentType}/${contentId}`;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClientBrowser();
      const { data: { user: u } } = await supabase.auth.getUser();
      setCurrentUserId(u?.id || null);
    })();
  }, []);

  // If the URL has no type, redirect to a sane default so the page is usable
  useEffect(() => {
    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      router.replace(`/reviews/${contentId}?type=movie`);
    }
  }, [contentType, contentId, router]);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Content header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 mb-8"
        >
          {posterUrl && (
            <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-background-tertiary">
              <img src={posterUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
              All reviews for
            </p>
            <h1 className="font-outfit text-2xl md:text-3xl text-primary truncate" title={contentTitle}>
              {contentTitle || `Content ${contentId}`}
            </h1>
            <p className="text-sm text-text-secondary mt-1 capitalize">
              {contentType} · Community reviews
            </p>
          </div>
        </motion.div>

        <ReviewsList
          contentId={contentId}
          contentType={contentType}
          contentTitle={contentTitle}
          currentUserId={currentUserId}
          onWriteReview={() => setModalOpen(true)}
          pageSize={50}
          showWriteButton={true}
        />
      </div>

      <RatingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={contentTitle}
        contentId={contentId}
        contentType={contentType}
        contentTitle={contentTitle}
      />
    </div>
  );
}
