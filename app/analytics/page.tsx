'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DNAChart from '@/components/features/analytics/DNAChart';
import TasteTimeline from '@/components/features/analytics/TasteTimeline';
import ContentTypeChart from '@/components/features/analytics/ContentTypeChart';
import PlatformChart from '@/components/features/analytics/PlatformChart';
import TopContent from '@/components/features/analytics/TopContent';
import MonthlyReport from '@/components/features/analytics/MonthlyReport';
import StatsCard from '@/components/features/analytics/StatsCard';

export type DateRange = '7d' | '30d' | '90d' | 'all';

interface AnalyticsData {
  stats: {
    totalContent: number;
    favoriteGenre: string;
    hoursWatched: number;
    reviewsWritten: number;
  };
  dna: {
    action: number;
    sciFi: number;
    comedy: number;
    romance: number;
    crime: number;
    fantasy: number;
    documentary: number;
    thriller: number;
    adventure: number;
    horror: number;
    anime: number;
    music: number;
  };
  dnaHistory: { month: string; [key: string]: string | number }[];
  contentBreakdown: { name: string; value: number; color: string }[];
  platformUsage: { name: string; hours: number; color: string }[];
  topMovies: { title: string; posterUrl: string; rating: number }[];
  topAnime: { title: string; posterUrl: string; rating: number }[];
  topArtists: { title: string; posterUrl: string; rating: number }[];
  monthlyReport: string;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data for now - in production, fetch from API
      const mockData: AnalyticsData = {
        stats: {
          totalContent: 247,
          favoriteGenre: 'Sci-Fi',
          hoursWatched: 184,
          reviewsWritten: 47,
        },
        dna: {
          action: 92,
          sciFi: 88,
          comedy: 65,
          romance: 35,
          crime: 72,
          fantasy: 78,
          documentary: 45,
          thriller: 80,
          adventure: 85,
          horror: 55,
          anime: 90,
          music: 60,
        },
        dnaHistory: [
          { month: 'Jan', action: 85, sciFi: 82, comedy: 60, anime: 85 },
          { month: 'Feb', action: 87, sciFi: 84, comedy: 62, anime: 87 },
          { month: 'Mar', action: 88, sciFi: 85, comedy: 63, anime: 88 },
          { month: 'Apr', action: 90, sciFi: 86, comedy: 64, anime: 89 },
          { month: 'May', action: 91, sciFi: 87, comedy: 64, anime: 90 },
          { month: 'Jun', action: 92, sciFi: 88, comedy: 65, anime: 90 },
        ],
        contentBreakdown: [
          { name: 'Movies', value: 45, color: '#3B82F6' },
          { name: 'Anime', value: 30, color: '#8B5CF6' },
          { name: 'TV Shows', value: 15, color: '#10B981' },
          { name: 'Music', value: 10, color: '#F59E0B' },
        ],
        platformUsage: [
          { name: 'Netflix', hours: 72, color: '#E50914' },
          { name: 'Crunchyroll', hours: 48, color: '#F47521' },
          { name: 'Spotify', hours: 36, color: '#1DB954' },
          { name: 'YouTube', hours: 28, color: '#FF0000' },
        ],
        topMovies: [
          { title: 'Interstellar', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
          { title: 'Blade Runner 2049', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
          { title: 'Dune', posterUrl: 'https://via.placeholder.com/60x90', rating: 4 },
          { title: 'The Matrix', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
          { title: 'Inception', posterUrl: 'https://via.placeholder.com/60x90', rating: 4 },
        ],
        topAnime: [
          { title: 'Attack on Titan', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
          { title: 'Steins;Gate', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
          { title: 'Cowboy Bebop', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
          { title: 'Fullmetal Alchemist: Brotherhood', posterUrl: 'https://via.placeholder.com/60x90', rating: 5 },
          { title: 'Neon Genesis Evangelion', posterUrl: 'https://via.placeholder.com/60x90', rating: 4 },
        ],
        topArtists: [
          { title: 'Hans Zimmer', posterUrl: 'https://via.placeholder.com/60x60', rating: 5 },
          { title: 'Radiohead', posterUrl: 'https://via.placeholder.com/60x60', rating: 5 },
          { title: 'Daft Punk', posterUrl: 'https://via.placeholder.com/60x60', rating: 4 },
          { title: 'Tame Impala', posterUrl: 'https://via.placeholder.com/60x60', rating: 4 },
          { title: 'Pink Floyd', posterUrl: 'https://via.placeholder.com/60x60', rating: 5 },
        ],
        monthlyReport:
          "You went deep on psychological anime this month, watched 3 Satoshi Kon films, and your taste for dark themes grew from 78% to 85%. Your sci-fi obsession continues with Interstellar earning your 5th rewatch. Consider exploring Cyberpunk: Edgerunners to feed both your anime and sci-fi cravings.",
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background-primary/80 backdrop-blur-sm border-b border-accent-blue/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary font-outfit">Analytics</h1>
              <p className="text-sm text-text-secondary">Your entertainment consumption insights</p>
            </div>

            {/* Date Range Picker */}
            <div className="flex gap-1 bg-background-secondary/80 border border-accent-blue/10 rounded-lg p-1">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    dateRange === option.value
                      ? 'bg-accent-blue text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon="🎬"
            label="Total Content"
            value={data.stats.totalContent.toString()}
            change="+23 this month"
            positive
          />
          <StatsCard
            icon="🏆"
            label="Favorite Genre"
            value={data.stats.favoriteGenre}
            change="Sci-Fi dominant"
            neutral
          />
          <StatsCard
            icon="⏱️"
            label="Hours Watched"
            value={`${data.stats.hoursWatched}h`}
            change="+18h this month"
            positive
          />
          <StatsCard
            icon="✍️"
            label="Reviews Written"
            value={data.stats.reviewsWritten.toString()}
            change="+8 this month"
            positive
          />
        </div>

        {/* Entertainment DNA - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">Entertainment DNA</h2>
          <DNAChart dna={data.dna} />
        </motion.div>

        {/* Taste Timeline - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">Taste Timeline</h2>
          <TasteTimeline history={data.dnaHistory} />
        </motion.div>

        {/* Two Column: Content Type + Platform Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Content Type Breakdown</h2>
            <ContentTypeChart data={data.contentBreakdown} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Platform Usage</h2>
            <PlatformChart data={data.platformUsage} />
          </motion.div>
        </div>

        {/* Top Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">Top Content</h2>
          <TopContent
            movies={data.topMovies}
            anime={data.topAnime}
            artists={data.topArtists}
          />
        </motion.div>

        {/* Monthly Report Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">Monthly Report</h2>
          <MonthlyReport report={data.monthlyReport} month="June 2025" />
        </motion.div>
      </div>
    </div>
  );
}
