'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stars } from '@/components/ui/Stars';
import { useToast } from '@/components/ui/Toast';

export interface ReviewUser {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  entertainmentDNA?: {
    sciFi: number;
    action: number;
    comedy: number;
    romance: number;
    anime: number;
    music: number;
  } | null;
}

export interface ReviewData {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  contentTitle: string | null;
  rating: number;
  text: string | null;
  tags: string[];
  isSpoiler: boolean;
  sentiment: string | null;
  themes: string[];
  summary: string | null;
  likes: number;
  notHelpful: number;
  createdAt: string;
  user: ReviewUser;
  userVote: 1 | -1 | null;
}

interface ReviewCardProps {
  review: ReviewData;
  currentUserId?: string | null;
  onDeleted?: (id: string) => void;
  onChanged?: (review: ReviewData) => void;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'text-accent-success bg-accent-success/10',
  negative: 'text-accent-coral bg-accent-coral/10',
  mixed: 'text-accent-gold bg-accent-gold/10',
  neutral: 'text-text-secondary bg-background-tertiary',
};

function dnaSnippet(dna: ReviewUser['entertainmentDNA']): string | null {
  if (!dna) return null;
  const traits: { label: string; value: number }[] = [
    { label: 'Sci-Fi', value: dna.sciFi },
    { label: 'Action', value: dna.action },
    { label: 'Comedy', value: dna.comedy },
    { label: 'Romance', value: dna.romance },
    { label: 'Anime', value: dna.anime },
    { label: 'Music', value: dna.music },
  ];
  const top = traits.sort((a, b) => b.value - a.value)[0];
  if (!top || top.value < 30) return null;
  return `${top.label} enthusiast ${top.value}%`;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function ReviewCard({ review, currentUserId, onDeleted, onChanged }: ReviewCardProps) {
  const [likes, setLikes] = useState(review.likes);
  const [notHelpful, setNotHelpful] = useState(review.notHelpful);
  const [userVote, setUserVote] = useState<1 | -1 | null>(review.userVote);
  const [spoilerRevealed, setSpoilerRevealed] = useState(!review.isSpoiler);
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [busy, setBusy] = useState(false);
  const { success, error: toastError, info } = useToast();

  const isOwn = currentUserId === review.userId;
  const snippet = dnaSnippet(review.user.entertainmentDNA);
  const showSpoilerToggle = review.isSpoiler && review.text;

  async function vote(value: 1 | -1) {
    if (isOwn) {
      toastError("You can't vote on your own review");
      return;
    }
    if (!currentUserId) {
      info('Sign in to vote on reviews');
      return;
    }
    if (busy) return;
    setBusy(true);

    // Compute optimistic new state
    let likesDelta = 0;
    let notHelpfulDelta = 0;
    let nextVote: 1 | -1 | null = value;

    if (userVote === value) {
      // unvote
      if (value === 1) likesDelta = -1;
      else notHelpfulDelta = -1;
      nextVote = null;
    } else if (userVote && userVote !== value) {
      // flip
      if (value === 1) {
        likesDelta = 1;
        notHelpfulDelta = -1;
      } else {
        likesDelta = -1;
        notHelpfulDelta = 1;
      }
    } else {
      // new
      if (value === 1) likesDelta = 1;
      else notHelpfulDelta = 1;
    }

    const prevLikes = likes;
    const prevNotHelpful = notHelpful;
    const prevVote = userVote;
    setLikes(likes + likesDelta);
    setNotHelpful(notHelpful + notHelpfulDelta);
    setUserVote(nextVote);

    try {
      const res = await fetch(`/api/reviews/${review.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to vote');
      }
      const data = await res.json();
      setLikes(data.likes ?? likes + likesDelta);
      setNotHelpful(data.notHelpful ?? notHelpful + notHelpfulDelta);
      setUserVote((data.userValue as 1 | -1 | null | undefined) ?? nextVote);

      onChanged?.({
        ...review,
        likes: data.likes ?? likes + likesDelta,
        notHelpful: data.notHelpful ?? notHelpful + notHelpfulDelta,
        userVote: data.userValue ?? nextVote,
      });
    } catch (e: any) {
      // Rollback
      setLikes(prevLikes);
      setNotHelpful(prevNotHelpful);
      setUserVote(prevVote);
      toastError(e?.message || 'Failed to record vote');
    } finally {
      setBusy(false);
    }
  }

  async function flag(reason: string) {
    setShowFlagMenu(false);
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to flag');
      }
      success('Review reported. Thank you.');
    } catch (e: any) {
      toastError(e?.message || 'Failed to flag review');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this review permanently?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews?id=${review.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      success('Review deleted');
      onDeleted?.(review.id);
    } catch (e: any) {
      toastError(e?.message || 'Failed to delete review');
    } finally {
      setBusy(false);
    }
  }

  const initials = (review.user.name || review.user.username).slice(0, 2).toUpperCase();
  const text = review.text || '';
  const longText = text.length > 280;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-background-secondary border border-accent-blue/10 rounded-xl p-4 md:p-5 hover:border-accent-blue/20 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center font-outfit text-sm font-semibold flex-shrink-0 overflow-hidden">
          {review.user.avatarUrl ? (
            <img src={review.user.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-primary truncate">
              {review.user.name || `@${review.user.username}`}
            </p>
            {snippet && (
              <span className="text-xs text-text-tertiary px-2 py-0.5 bg-accent-purple/10 text-accent-purple rounded-full">
                {snippet}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars rating={review.rating} size="sm" />
            <span className="text-xs text-text-tertiary">·</span>
            <span className="text-xs text-text-tertiary">{timeAgo(review.createdAt)}</span>
            {review.sentiment && (
              <>
                <span className="text-xs text-text-tertiary">·</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${SENTIMENT_COLORS[review.sentiment] || SENTIMENT_COLORS.neutral}`}>
                  {review.sentiment}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowFlagMenu(!showFlagMenu)}
            className="p-1.5 text-text-tertiary hover:text-primary transition-colors rounded-lg hover:bg-background-tertiary"
            aria-label="More actions"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <AnimatePresence>
            {showFlagMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFlagMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-background-tertiary border border-accent-blue/20 rounded-lg shadow-2xl z-20 py-1"
                >
                  {isOwn ? (
                    <button
                      onClick={() => { setShowFlagMenu(false); handleDelete(); }}
                      className="w-full px-3 py-1.5 text-left text-sm text-accent-coral hover:bg-background-secondary"
                    >
                      Delete review
                    </button>
                  ) : (
                    <>
                      <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-text-tertiary">Report review</p>
                      {['Spam', 'Hate speech', 'Spoilers without warning', 'Off-topic', 'Other'].map((r) => (
                        <button
                          key={r}
                          onClick={() => flag(r)}
                          className="w-full px-3 py-1.5 text-left text-sm text-primary hover:bg-background-secondary"
                        >
                          {r}
                        </button>
                      ))}
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI summary preview */}
      {review.summary && (
        <p className="mt-3 text-sm italic text-text-secondary border-l-2 border-accent-blue/30 pl-3">
          {review.summary}
        </p>
      )}

      {/* Spoiler toggle */}
      {showSpoilerToggle && (
        <div className="mt-3">
          {!spoilerRevealed ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs bg-accent-coral/10 text-accent-coral rounded font-medium">⚠ Spoiler</span>
              <button
                onClick={() => setSpoilerRevealed(true)}
                className="text-xs text-accent-blue hover:underline"
              >
                Tap to reveal
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Review text */}
      {text && (
        <div className="mt-3">
          {showSpoilerToggle && !spoilerRevealed ? (
            <p className="text-sm text-text-tertiary italic select-none">Review hidden — contains spoilers.</p>
          ) : (
            <>
              <p className={`text-sm text-primary whitespace-pre-wrap leading-relaxed ${!showFullText && longText ? 'line-clamp-4' : ''}`}>
                {text}
              </p>
              {longText && (
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="mt-1 text-xs text-accent-blue hover:underline"
                >
                  {showFullText ? 'Show less' : 'Read more'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-accent-blue/10 text-accent-blue rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Themes */}
      {review.themes && review.themes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.themes.map((t) => (
            <span key={t} className="px-2 py-0.5 text-xs bg-accent-purple/10 text-accent-purple rounded-md">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-4 flex items-center gap-1 -ml-2">
        {/* Heart / Like */}
        <button
          onClick={() => vote(1)}
          disabled={busy || isOwn}
          className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
            userVote === 1
              ? 'text-accent-coral bg-accent-coral/10'
              : 'text-text-secondary hover:text-accent-coral hover:bg-accent-coral/5'
          } ${isOwn ? 'opacity-40 cursor-not-allowed' : ''}`}
          aria-label="Like this review"
          title={isOwn ? "Can't vote on your own review" : 'Helpful'}
        >
          <svg
            className="w-4 h-4"
            fill={userVote === 1 ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span>{likes}</span>
        </button>

        {/* Helpful up */}
        <button
          onClick={() => vote(1)}
          disabled={busy || isOwn}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
            userVote === 1
              ? 'text-accent-success bg-accent-success/10'
              : 'text-text-tertiary hover:text-accent-success hover:bg-accent-success/5'
          } ${isOwn ? 'opacity-40 cursor-not-allowed' : ''}`}
          title="Helpful"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20v-9" />
          </svg>
          <span>Helpful</span>
        </button>

        {/* Not helpful down */}
        <button
          onClick={() => vote(-1)}
          disabled={busy || isOwn}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
            userVote === -1
              ? 'text-accent-coral bg-accent-coral/10'
              : 'text-text-tertiary hover:text-accent-coral hover:bg-accent-coral/5'
          } ${isOwn ? 'opacity-40 cursor-not-allowed' : ''}`}
          title="Not helpful"
        >
          <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20v-9" />
          </svg>
          {notHelpful > 0 && <span>{notHelpful}</span>}
        </button>

        <div className="flex-1" />

        {isOwn && (
          <span className="text-xs text-text-tertiary italic">Your review</span>
        )}
      </div>
    </motion.article>
  );
}
