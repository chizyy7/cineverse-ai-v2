'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
  fullWidth = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFollowing) {
        const res = await fetch(`/api/follow?followingId=${userId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingId: userId }),
        });
        if (res.ok) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleToggleFollow}
      disabled={loading}
      className={`
        font-medium rounded-lg transition-all duration-200
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${
          isFollowing
            ? 'bg-background-tertiary text-text-primary border border-text-tertiary/30 hover:border-accent-coral/50 hover:text-accent-coral'
            : 'bg-accent-blue text-white hover:bg-accent-blue/90'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </span>
      ) : isFollowing ? (
        <span className="flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Following
        </span>
      ) : (
        <span className="flex items-center justify-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Follow
        </span>
      )}
    </motion.button>
  );
}
