import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { saveDNA } from '@/lib/actions/dna';

interface ResultsStepProps {
  dnaData: {
    contentTypes: string[];
    genres: string[];
    favoriteMovies: string[];
    favoriteAnime: string[];
    favoriteArtists: string[];
    favoriteActors: string[];
    moodPreferences: string[];
  };
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const ResultsStep = ({ dnaData, onSubmit }: ResultsStepProps) => {
  // In a real app, we would calculate DNA scores based on the selections.
  // For this example, we'll generate mock scores.
  const calculateDNAScores = () => {
    const scores: Record<string, number> = {};
    // We'll assign some weights based on the user's selections for demonstration.
    // In reality, this would be more complex and might involve a backend service.
    const genreWeights: Record<string, number> = {
      action: 0, sciFi: 0, horror: 0, comedy: 0, romance: 0, crime: 0, fantasy: 0, 
      documentary: 0, thriller: 0, adventure: 0, anime: 0, music: 0, podcast: 0
    };
    const moodWeights: Record<string, number> = {
      emotional: 0, funny: 0, inspirational: 0, dark: 0, mindBlowing: 0, relaxing: 0, intense: 0, familyFriendly: 0
    };

    // Simple mapping from genre names to our DNA model fields (just for demo)
    const genreMap: Record<string, keyof typeof genreWeights> = {
      'action': 'action',
      'sci-fi': 'sciFi',
      'horror': 'horror',
      'comedy': 'comedy',
      'romance': 'romance',
      'crime': 'crime',
      'fantasy': 'fantasy',
      'documentary': 'documentary',
      'thriller': 'thriller',
      'adventure': 'adventure',
      // Anime genres
      'shonen': 'anime',
      'seinen': 'anime',
      'isekai': 'anime',
      'sports': 'anime',
      // Music genres
      'hip-hop': 'music',
      'rap': 'music',
      'r-b': 'music',
      'pop': 'music',
      'rock': 'music',
      'edm': 'music',
      'afrobeats': 'music',
      'classical': 'music',
      'lo-fi': 'music'
    };

    // Mood mapping (just for demo, we don't have mood in the DNA model in the schema, but we can store it separately or ignore)
    // For now, we'll just not use mood in the DNA score calculation for simplicity.

    // Count selected genres and assign points
    dnaData.genres.forEach(genre => {
      const mapped = genreMap[genre];
      if (mapped) {
        genreWeights[mapped] = (genreWeights[mapped] || 0) + 20; // Each selected genre adds 20 points, up to 100
      }
    });

    // Cap at 100 and ensure minimum 0
    Object.keys(genreWeights).forEach(key => {
      scores[key] = Math.min(Math.max(genreWeights[key], 0), 100);
    });

    // For mood, we don't have fields in the DNA model, so we skip for now.
    // In a real app, we might have a separate mood profile or extend the DNA model.

    return scores;
  };

  const dnaScores = calculateDNAScores();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="font-outfit text-2xl md:text-3xl mb-4">
        Your Entertainment DNA
      </h2>
      <p className="text-secondary mb-6">
        Here's your unique entertainment profile based on your selections.
      </p>

      {/* Radar Chart Placeholder */}
      <motion.div
        key="dna-chart"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-64 bg-background-tertiary rounded-xl relative overflow-hidden"
      >
        {/* In a real app, we would render a radar chart here using a library like Recharts or Chart.js */}
        <div className="absolute inset-0 flex items-center justify-center text-accent-blue/50 text-2xl">
          📊 Radar Chart Placeholder
        </div>
        {/* Pulsing glow animation */}
        <div className="absolute inset-0 rounded-xl animate-pulse bg-accent-blue/10"></div>
      </motion.div>

      {/* DNA Breakdown */}
      <motion.div
        key="dna-breakdown"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="font-outfit text-xl mb-3">Your Top Traits</h3>
        <div className="space-y-2">
          {/* Sort scores and take top 5 */}
          {Object.entries(dnaScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([trait, score], index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center space-x-3"
              >
                <div className="w-3 h-3 bg-accent-blue rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-medium text-primary">
                    {trait
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                    }
                  </p>
                  <p className="text-xs text-secondary">
                    {score}% Match
                  </p>
                </div>
                <div className="w-10">
                  <div className="bg-background-tertiary rounded-full h-2.5 w-full">
                    <div
                      className={`h-full bg-accent-blue transition-all duration-300`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Summary and CTA */}
      <motion.div
        key="summary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center"
      >
        <p className="text-primary mb-4">
          Your profile is ready!
        </p>
        <p className="text-secondary mb-6">
          Based on your selections, we've built your unique Entertainment DNA. 
          Get ready for personalized recommendations across movies, anime, TV, music, and podcasts.
        </p>
        <form onSubmit={onSubmit} className="flex justify-center">
          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-accent-gold text-white font-medium rounded-lg hover:bg-accent-gold/90 transition-colors"
          >
            Start Discovering →
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};