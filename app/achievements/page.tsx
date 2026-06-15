'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ACHIEVEMENTS,
  AchievementDefinition,
  AchievementRarity,
  getRarityColor,
  getRarityOrder,
  getLevelForXP,
  LEVEL_NAMES,
} from '@/lib/achievements';

interface EarnedAchievement {
  achievementId: string;
  earnedAt: string;
}

export default function AchievementsPage() {
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<AchievementRarity | 'all'>('all');
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      // Mock data for now - in production, fetch from API
      const mockEarned: EarnedAchievement[] = [
        { achievementId: 'first_steps', earnedAt: '2024-01-20T00:00:00Z' },
        { achievementId: 'movie_explorer', earnedAt: '2024-02-15T00:00:00Z' },
        { achievementId: 'first_review', earnedAt: '2024-01-25T00:00:00Z' },
        { achievementId: 'first_follower', earnedAt: '2024-02-01T00:00:00Z' },
        { achievementId: 'night_owl', earnedAt: '2024-02-10T00:00:00Z' },
        { achievementId: 'honest_critic', earnedAt: '2024-02-20T00:00:00Z' },
      ];
      setEarned(mockEarned);
      setUserXP(1250); // Mock XP
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEarned = (achievementId: string) => {
    return earned.some((e) => e.achievementId === achievementId);
  };

  const getEarnedDate = (achievementId: string) => {
    const found = earned.find((e) => e.achievementId === achievementId);
    return found ? new Date(found.earnedAt).toLocaleDateString() : null;
  };

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (selectedRarity === 'all') return true;
    return a.rarity === selectedRarity;
  }).sort((a, b) => getRarityOrder(a.rarity) - getRarityOrder(b.rarity));

  const groupedByRarity = {
    legendary: filteredAchievements.filter((a) => a.rarity === 'legendary'),
    epic: filteredAchievements.filter((a) => a.rarity === 'epic'),
    rare: filteredAchievements.filter((a) => a.rarity === 'rare'),
    common: filteredAchievements.filter((a) => a.rarity === 'common'),
  };

  const levelInfo = getLevelForXP(userXP);
  const earnedCount = earned.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercent = Math.round((earnedCount / totalCount) * 100);

  const rarityFilters: { value: AchievementRarity | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'legendary', label: '👑 Legendary' },
    { value: 'epic', label: '💜 Epic' },
    { value: 'rare', label: '💙 Rare' },
    { value: 'common', label: '⚪ Common' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background-primary/80 backdrop-blur-sm border-b border-accent-blue/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-text-primary font-outfit">Achievements</h1>
          <p className="text-sm text-text-secondary">Track your entertainment milestones</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level & XP */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="text-2xl font-bold text-text-primary">Level {levelInfo.level}</p>
                  <p className="text-sm text-text-secondary">{levelInfo.name}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-text-tertiary mb-1">
                  <span>{levelInfo.currentXP} XP</span>
                  <span>{levelInfo.nextThreshold} XP needed</span>
                </div>
                <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Completion */}
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-background-tertiary"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-accent-blue"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * completionPercent) / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-text-primary">{completionPercent}%</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {earnedCount} of {totalCount} unlocked
              </p>
            </div>

            {/* XP Summary */}
            <div className="text-center md:text-right">
              <p className="text-sm text-text-tertiary mb-1">Total XP Earned</p>
              <p className="text-3xl font-bold text-accent-gold">{userXP.toLocaleString()}</p>
              <div className="flex items-center justify-center md:justify-end gap-2 mt-2">
                {['common', 'rare', 'epic', 'legendary'].map((rarity) => {
                  const count = earned.filter((e) => {
                    const def = ACHIEVEMENTS.find((a) => a.id === e.achievementId);
                    return def?.rarity === rarity;
                  }).length;
                  return (
                    <div
                      key={rarity}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: getRarityColor(rarity as AchievementRarity) }}
                    >
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rarity Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {rarityFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedRarity(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedRarity === filter.value
                  ? 'bg-accent-blue text-white'
                  : 'bg-background-secondary/80 text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRarity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedRarity === 'all' ? (
              // Grouped by rarity
              Object.entries(groupedByRarity).map(([rarity, achievements]) => {
                if (achievements.length === 0) return null;
                return (
                  <div key={rarity} className="mb-8">
                    <h2
                      className="text-lg font-semibold mb-4 flex items-center gap-2"
                      style={{ color: getRarityColor(rarity as AchievementRarity) }}
                    >
                      {rarity === 'legendary' && '👑 '}
                      {rarity === 'epic' && '💜 '}
                      {rarity === 'rare' && '💙 '}
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          earned={isEarned(achievement.id)}
                          earnedDate={getEarnedDate(achievement.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Filtered by rarity
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    earned={isEarned(achievement.id)}
                    earnedDate={getEarnedDate(achievement.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AchievementCard({
  achievement,
  earned,
  earnedDate,
}: {
  achievement: AchievementDefinition;
  earned: boolean;
  earnedDate: string | null;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative bg-background-secondary/80 backdrop-blur-sm border rounded-xl p-4 transition-all cursor-pointer ${
        earned ? 'border-opacity-50' : 'border-accent-blue/10 opacity-60 grayscale hover:opacity-80 hover:grayscale-0'
      }`}
      style={earned ? { borderColor: `${rarityColor}50` } : {}}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Earned indicator */}
      {earned && (
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: rarityColor }}
        >
          ✓
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className={`text-3xl ${!earned ? 'grayscale' : ''}`}>{achievement.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${earned ? 'text-text-primary' : 'text-text-secondary'}`}>
            {achievement.title}
          </h3>
          <p className="text-xs text-text-tertiary mt-1">{achievement.description}</p>

          {/* Rarity badge */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${rarityColor}20`,
                color: rarityColor,
              }}
            >
              {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
            </span>
            <span className="text-xs text-accent-gold">+{achievement.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Progress bar for unearned */}
      {!earned && achievement.progress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-text-tertiary mb-1">
            <span>Progress</span>
            <span>
              {achievement.progress({} as any).current}/{achievement.progress({} as any).target}
            </span>
          </div>
          <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  (achievement.progress({} as any).current / achievement.progress({} as any).target) * 100
                )}%`,
                backgroundColor: rarityColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Earned date */}
      {earned && earnedDate && (
        <p className="text-xs text-text-tertiary mt-2">Earned {earnedDate}</p>
      )}

      {/* Details on expand */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-accent-blue/10 text-xs text-text-secondary">
              <p>{achievement.description}</p>
              <p className="mt-1">Reward: {achievement.xpReward} XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
