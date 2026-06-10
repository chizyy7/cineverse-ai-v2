'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TasteTimelineProps {
  history: { month: string; [key: string]: string | number }[];
}

const GENRE_COLORS: Record<string, string> = {
  action: '#3B82F6',
  sciFi: '#8B5CF6',
  comedy: '#10B981',
  anime: '#F59E0B',
  romance: '#EF4444',
  thriller: '#6366F1',
};

const GENRE_LABELS: Record<string, string> = {
  action: 'Action',
  sciFi: 'Sci-Fi',
  comedy: 'Comedy',
  anime: 'Anime',
  romance: 'Romance',
  thriller: 'Thriller',
};

export default function TasteTimeline({ history }: TasteTimelineProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([
    'action',
    'sciFi',
    'comedy',
    'anime',
  ]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const availableGenres = Object.keys(GENRE_COLORS);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background-secondary/95 backdrop-blur-sm border border-accent-blue/20 rounded-lg px-4 py-3 shadow-xl">
          <p className="text-text-primary font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary">
                {GENRE_LABELS[entry.dataKey] || entry.dataKey}:
              </span>
              <span className="text-text-primary font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6">
      <p className="text-sm text-text-secondary mb-4">How your taste evolved over time</p>

      {/* Genre Toggle */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableGenres.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'text-white'
                  : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
              }`}
              style={isSelected ? { backgroundColor: GENRE_COLORS[genre] } : {}}
            >
              {GENRE_LABELS[genre]}
            </button>
          );
        })}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#1E2A3A' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#1E2A3A' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedGenres.map((genre) => (
              <Line
                key={genre}
                type="monotone"
                dataKey={genre}
                stroke={GENRE_COLORS[genre]}
                strokeWidth={2}
                dot={{ fill: GENRE_COLORS[genre], strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
