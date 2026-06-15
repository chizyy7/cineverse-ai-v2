'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ActivityItem } from '@/types/social';

interface ActivityCardProps {
  activity: ActivityItem;
}

function getActionText(activity: ActivityItem): string {
  switch (activity.actionType) {
    case 'follow':
      return 'started following';
    case 'rate':
      return `rated ${activity.contentTitle}`;
    case 'review':
      return `reviewed ${activity.contentTitle}`;
    case 'watchlist_add':
      return `added ${activity.contentTitle} to watchlist`;
    case 'collection_create':
      return `created a new collection`;
    case 'collection_add':
      return `added ${activity.contentTitle} to a collection`;
    default:
      return 'did something';
  }
}

function getActionIcon(actionType: string): string {
  switch (actionType) {
    case 'follow':
      return '👤';
    case 'rate':
      return '⭐';
    case 'review':
      return '✍️';
    case 'watchlist_add':
      return '📋';
    case 'collection_create':
      return '📁';
    case 'collection_add':
      return '➕';
    default:
      return '📌';
  }
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    // TODO: API call to save like
  };

  const actionText = getActionText(activity);
  const actionIcon = getActionIcon(activity.actionType);
  const timeAgo = getTimeAgo(activity.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 hover:border-accent-blue/20 transition-all duration-300"
    >
      <div className="flex gap-3">
        <Link href={`/profile/${activity.user.username}`}>
          <img
            src={activity.user.avatarUrl || 'https://via.placeholder.com/80'}
            alt={activity.user.name || activity.user.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-accent-blue/20 flex-shrink-0"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm">
                <Link
                  href={`/profile/${activity.user.username}`}
                  className="text-text-primary font-semibold hover:text-accent-blue transition-colors"
                >
                  {activity.user.name || activity.user.username}
                </Link>
                <span className="text-text-secondary ml-1">{actionText}</span>
              </p>
              <p className="text-text-tertiary text-xs mt-0.5">{timeAgo}</p>
            </div>

            {activity.contentPosterUrl && (
              <Link
                href={`/content/${activity.contentType}/${activity.contentId}`}
                className="flex-shrink-0"
              >
                <img
                  src={activity.contentPosterUrl}
                  alt={activity.contentTitle}
                  className="w-10 h-14 rounded-md object-cover"
                />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked ? 'text-accent-coral' : 'text-text-tertiary hover:text-accent-coral'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount > 0 ? likeCount : ''}</span>
            </button>

            <button className="flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-blue transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
