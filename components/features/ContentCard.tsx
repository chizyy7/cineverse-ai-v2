'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ContentCardProps {
  content: any; // In a real app, we'd type this properly
  isFeatured?: boolean;
  onSave?: () => void;
}

export const ContentCard = ({ content, isFeatured = false, onSave }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Determine match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-accent-success';
    if (score >= 80) return 'bg-accent-blue';
    if (score >= 70) return 'bg-accent-gold';
    return 'bg-accent-blue/20';
  };

  // Get platform icons (simplified)
  const getPlatformIcons = (platforms: string[]) => {
    const platformMap: Record<string, string> = {
      Netflix: 'https://via.placeholder.com/20x20/000000/E50914?text=N',
      Spotify: 'https://via.placeholder.com/20x20/1ED760/000000?text=S',
      Crunchyroll: 'https://via.placeholder.com/20x20/F47521/FFFFFF?text=C',
      YouTube: 'https://via.placeholder.com/20x20/FF0000/FFFFFF?text=YT',
    };
    return platforms.map(p => platformMap[p] || `https://via.placeholder.com/20x20/6B7280/F9FAFB?text=${p[0]}`).slice(0, 3);
  };

  return (
    <motion.div
      whileHover={{ scale: isFeatured ? 1.02 : 1.03 }}
      whileTap={{ scale: isFeatured ? 0.98 : 0.97 }}
      transition={{ duration: 0.2 }}
      className={`relative group ${isFeatured ? 'w-full mb-6' : 'w-72'}`}
    >
      {/* Poster Image */}
      <div className="relative w-full h-[calc(100%_*1.5)] max-h-[400px] rounded-xl overflow-hidden">
        {content.posterUrl ? (
          <img 
            src={content.posterUrl} 
            alt={content.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-background-tertiary flex items-center justify-center text-accent-blue/50">
            No Poster
          </div>
        )}
        
        {/* Match Score Badge */}
        {content.matchScore !== undefined && (
          <div className={`absolute top-3 left-3 ${getMatchScoreColor(content.matchScore)} text-white text-xs font-medium px-2 py-1 rounded-md z-10`}
          >
            {content.matchScore}% Match
          </div>
        )}
        
        {/* Play Button Overlay (on hover) */}
        {isHovered && !isFeatured && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="w-10 h-10 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-all"
              onClick={() => {
                // In a real app, this would play a trailer or open a modal
                console.log('Play trailer for', content.title);
              }}
            >
              <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5l14 11-14 11V5z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-outfit text-primary line-clamp-2 max-w-[80%]">
            {content.title}
          </h3>
          {!isFeatured && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
                onSave?.();
              }}
              className={`p-1.5 ${isSaved 
                ? 'bg-accent-success/20 text-accent-success hover:bg-accent-success/10' 
                : 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20'
              } rounded-lg transition-colors`}
            >
              {isSaved ? '✓' : '+'}
            </button>
          )}
        </div>
        
        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1">
          {content.genres?.slice(0, 2).map((genre: string, index: number) => (
            <span key={index} className="px-2 py-0.5 text-xs bg-accent-blue/10 text-accent-blue rounded">
              {genre}
            </span>
          ))}
        </div>
        
        {/* Platform Logos */}
        <div className="flex gap-1 mt-1">
          {getPlatformIcons(content.platforms || []).map((iconUrl, index) => (
            <img key={index} src={iconUrl} alt="" className="w-5 h-5" />
          ))}
        </div>
        
        {/* Description (only for featured) */}
        {isFeatured && content.description && (
          <p className="text-sm text-secondary line-clamp-2">
            {content.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Simple skeleton loader component
const SkeletonLoader = () => {
  return (
    <div className="w-72 h-[calc(100%_*1.5)] max-h-[400px] rounded-xl bg-background-tertiary animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center text-accent-blue/50 text-sm">
        Loading...
      </div>
    </div>
  );
};

export default ContentCard;