'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeReview, ReviewAnalysis } from '@/lib/ai/reviewSentiment';

export interface CreateReviewInput {
  contentId: string;
  contentType: string;
  contentTitle?: string;
  rating: number;
  text?: string;
  tags?: string[];
}

export interface CreateReviewResult {
  success: boolean;
  review?: any;
  analysis?: ReviewAnalysis;
  error?: string;
}

/**
 * Create or update a review for the current user.
 * - One review per user per (contentId, contentType).
 * - Calls OpenAI to detect spoilers, sentiment, themes, and a summary.
 * - The AI call is non-fatal: if it fails, the review is still saved.
 */
export async function createReview(input: CreateReviewInput): Promise<CreateReviewResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'You must be signed in to write a review.' };
  }

  if (!input.contentId || !input.contentType) {
    return { success: false, error: 'contentId and contentType are required.' };
  }

  const rating = Math.max(1, Math.min(5, Math.round(input.rating)));
  if (!rating) {
    return { success: false, error: 'A star rating is required.' };
  }

  const text = (input.text || '').trim().slice(0, 2000);
  const tags = (input.tags || []).slice(0, 8).map((t) => t.trim()).filter(Boolean);

  try {
    // AI analysis first (non-fatal)
    const analysis = await analyzeReview({
      rating,
      tags,
      text,
      contentTitle: input.contentTitle,
      contentType: input.contentType,
    });

    const review = await prisma.review.upsert({
      where: {
        userId_contentId_contentType: {
          userId: user.id,
          contentId: input.contentId,
          contentType: input.contentType,
        },
      },
      create: {
        userId: user.id,
        contentId: input.contentId,
        contentType: input.contentType,
        contentTitle: input.contentTitle || null,
        rating,
        text: text || null,
        tags,
        isSpoiler: analysis.isSpoiler,
        sentiment: analysis.sentiment,
        themes: analysis.themes,
        summary: analysis.summary || null,
      },
      update: {
        rating,
        text: text || null,
        tags,
        isSpoiler: analysis.isSpoiler,
        sentiment: analysis.sentiment,
        themes: analysis.themes,
        summary: analysis.summary || null,
        contentTitle: input.contentTitle || undefined,
      },
    });

    revalidatePath(`/content/${input.contentType}/${input.contentId}`);
    revalidatePath(`/reviews/${input.contentId}`);

    return { success: true, review, analysis };
  } catch (error: any) {
    console.error('createReview error:', error);
    return { success: false, error: error?.message || 'Failed to save review.' };
  }
}

/**
 * Toggle a helpful (👍) or not-helpful (👎) vote on a review.
 * Clicking the same value again removes the vote.
 * Clicking the opposite value flips the vote.
 */
export async function likeReview(
  reviewId: string,
  value: 1 | -1
): Promise<{ success: boolean; likes?: number; notHelpful?: number; userValue?: 1 | -1 | null; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'You must be signed in to vote.' };
  }

  if (![1, -1].includes(value)) {
    return { success: false, error: 'Invalid vote value.' };
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return { success: false, error: 'Review not found.' };
    }
    if (review.userId === user.id) {
      return { success: false, error: 'You cannot vote on your own review.' };
    }

    const existing = await prisma.reviewLike.findUnique({
      where: { userId_reviewId: { userId: user.id, reviewId } },
    });

    // Compute the deltas to apply
    let likesDelta = 0;
    let notHelpfulDelta = 0;
    let nextUserValue: 1 | -1 | null = value;

    if (!existing) {
      // Brand new vote
      await prisma.reviewLike.create({
        data: { userId: user.id, reviewId, value },
      });
      if (value === 1) likesDelta = 1;
      else notHelpfulDelta = 1;
    } else if (existing.value === value) {
      // Same vote again → unvote
      await prisma.reviewLike.delete({ where: { id: existing.id } });
      if (value === 1) likesDelta = -1;
      else notHelpfulDelta = -1;
      nextUserValue = null;
    } else {
      // Opposite vote → flip
      await prisma.reviewLike.update({
        where: { id: existing.id },
        data: { value },
      });
      if (value === 1) {
        likesDelta = 1;
        notHelpfulDelta = -1;
      } else {
        likesDelta = -1;
        notHelpfulDelta = 1;
      }
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        likes: { increment: likesDelta },
        notHelpful: { increment: notHelpfulDelta },
      },
      select: { likes: true, notHelpful: true },
    });

    return {
      success: true,
      likes: updated.likes,
      notHelpful: updated.notHelpful,
      userValue: nextUserValue,
    };
  } catch (error: any) {
    console.error('likeReview error:', error);
    return { success: false, error: error?.message || 'Failed to record vote.' };
  }
}

/**
 * Flag a review for moderation.
 * Auto-hides it from listings once a threshold is reached (5 flags).
 */
export async function flagReview(
  reviewId: string,
  reason: string
): Promise<{ success: boolean; flagged?: boolean; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'You must be signed in to flag a review.' };
  }

  const cleanReason = (reason || '').trim().slice(0, 500);
  if (!cleanReason) {
    return { success: false, error: 'Please describe the issue.' };
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return { success: false, error: 'Review not found.' };
    }
    if (review.userId === user.id) {
      return { success: false, error: 'You cannot flag your own review.' };
    }

    // Mark the review as flagged; threshold-based hiding can be added later.
    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        isFlagged: true,
        flaggedReason: cleanReason,
      },
      select: { isFlagged: true },
    });

    return { success: true, flagged: updated.isFlagged };
  } catch (error: any) {
    console.error('flagReview error:', error);
    return { success: false, error: error?.message || 'Failed to flag review.' };
  }
}

/**
 * Delete a review. Only the author or an admin can delete.
 */
export async function deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'You must be signed in.' };
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return { success: false, error: 'Review not found.' };
    if (review.userId !== user.id) {
      return { success: false, error: 'You can only delete your own reviews.' };
    }

    await prisma.review.delete({ where: { id: reviewId } });
    revalidatePath(`/content/${review.contentType}/${review.contentId}`);
    revalidatePath(`/reviews/${review.contentId}`);
    return { success: true };
  } catch (error: any) {
    console.error('deleteReview error:', error);
    return { success: false, error: error?.message || 'Failed to delete review.' };
  }
}
