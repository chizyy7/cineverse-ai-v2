'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentItem {
  title: string;
  posterUrl: string;
  rating: number;
}

interface TopContentProps {
  movies: ContentItem[];
  anime: ContentItem[];
  artists: ContentItem[];
}

type TabType = 'movies' | 'anime' | 'artists';

export default function TopContent({ movies, anime, artists }: TopContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('movies');

  const tabs: { value: TabType; label: string; icon: string }[] = [
    { value: 'movies', label: 'Top Movies', icon: '🎬' },
    { value: 'anime', label: 'Top Anime', icon: '🎌' },
    { value: 'artists', label: 'Top Artists', icon: '🎵' },
  ];

  const contentMap: Record<TabType, ContentItem[]> = {
    movies,
    anime,
    artists,
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-background-tertiary/50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-accent-blue text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {contentMap[activeTab].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-3 bg-background-tertiary/50 rounded-xl hover:bg-background-tertiary transition-colors"
            >
              {/* Rank */}
              <span
                className={`text-lg font-bold w-6 text-center ${
                  index === 0
                    ? 'text-accent-gold'
                    : index === 1
                    ? 'text-text-secondary'
                    : index === 2
                    ? 'text-accent-gold/60'
                    : 'text-text-tertiary'
                }`}
              >
                {index + 1}
              </span>

              {/* Poster */}
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-10 h-14 rounded-md object-cover"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-text-primary truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-accent-gold">{renderStars(item.rating)}</p>
              </div>

              {/* Rating badge */}
              <div className="flex-shrink-0 px-2 py-1 bg-accent-gold/10 rounded-md">
                <span className="text-xs font-semibold text-accent-gold">{item.rating}/5</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
