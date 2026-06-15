'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FollowButton from './FollowButton';
import { FollowUser } from '@/types/social';

interface UserCardProps {
  user: FollowUser;
  compatibilityScore?: number;
  showCompatibility?: boolean;
}

export default function UserCard({
  user,
  compatibilityScore,
  showCompatibility = false,
}: UserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4 hover:border-accent-blue/30 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <Link href={`/profile/${user.username}`}>
          <div className="relative">
            <img
              src={user.avatarUrl || 'https://via.placeholder.com/80'}
              alt={user.name || user.username}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-accent-blue/20 hover:ring-accent-blue/50 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent-success rounded-full border-2 border-background-secondary" />
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.username}`}>
            <h3 className="text-text-primary font-semibold truncate hover:text-accent-blue transition-colors">
              {user.name || user.username}
            </h3>
            <p className="text-text-tertiary text-sm truncate">@{user.username}</p>
          </Link>
          {user.bio && (
            <p className="text-text-secondary text-xs mt-1 line-clamp-1">{user.bio}</p>
          )}
          {showCompatibility && compatibilityScore !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-text-tertiary">DNA Match:</span>
              <span
                className={`text-xs font-semibold ${
                  compatibilityScore >= 90
                    ? 'text-accent-success'
                    : compatibilityScore >= 75
                    ? 'text-accent-blue'
                    : 'text-accent-gold'
                }`}
              >
                {compatibilityScore}%
              </span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <FollowButton userId={user.id} initialIsFollowing={user.isFollowing} size="sm" />
        </div>
      </div>
    </motion.div>
  );
}
