'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRarityColor, AchievementRarity } from '@/lib/achievements';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onComplete?: () => void;
}

export default function AchievementToast({ achievement, onComplete }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onComplete?.(), 500);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  const getRarityLabel = (rarity: AchievementRarity): string => {
    switch (rarity) {
      case 'common':
        return 'Common';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Epic';
      case 'legendary':
        return 'Legendary';
    }
  };

  if (!achievement) return null;

  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50vw',
                  y: '50vh',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>

          {/* Achievement Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative bg-background-secondary border-2 rounded-2xl p-8 shadow-2xl max-w-sm mx-4 pointer-events-auto"
            style={{ borderColor: rarityColor }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
              style={{ backgroundColor: rarityColor }}
            />

            <div className="relative text-center">
              {/* "Achievement Unlocked!" heading */}
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: rarityColor }}
              >
                Achievement Unlocked!
              </motion.p>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.4 }}
                className="text-6xl mb-4"
              >
                {achievement.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-text-primary mb-2"
              >
                {achievement.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-text-secondary mb-4"
              >
                {achievement.description}
              </motion.p>

              {/* Rarity badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4"
                style={{
                  backgroundColor: `${rarityColor}20`,
                  color: rarityColor,
                }}
              >
                {achievement.rarity === 'legendary' && '👑 '}
                {achievement.rarity === 'epic' && '💜 '}
                {achievement.rarity === 'rare' && '💙 '}
                {getRarityLabel(achievement.rarity)}
              </motion.div>

              {/* XP Reward */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 text-accent-gold"
              >
                <span className="text-lg font-bold">+{achievement.xpReward} XP</span>
                <span className="text-text-tertiary">earned</span>
              </motion.div>

              {/* Share button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={() => setIsVisible(false)}
                className="mt-6 px-6 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/90 transition-colors"
              >
                Awesome!
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage achievement toasts
export function useAchievementToast() {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  const addAchievement = useCallback((achievement: Achievement) => {
    setQueue((prev) => [...prev, achievement]);
  }, []);

  const addAchievements = useCallback((achievements: Achievement[]) => {
    setQueue((prev) => [...prev, ...achievements]);
  }, []);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [current, queue]);

  const handleComplete = useCallback(() => {
    setCurrent(null);
  }, []);

  return {
    currentAchievement: current,
    addAchievement,
    addAchievements,
    handleComplete,
  };
}
