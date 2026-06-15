'use client';

import { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface DNAChartProps {
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
}

export default function DNAChart({ dna }: DNAChartProps) {
  const [showAll, setShowAll] = useState(false);

  const allData = [
    { genre: 'Action', value: dna.action, fullMark: 100 },
    { genre: 'Sci-Fi', value: dna.sciFi, fullMark: 100 },
    { genre: 'Comedy', value: dna.comedy, fullMark: 100 },
    { genre: 'Romance', value: dna.romance, fullMark: 100 },
    { genre: 'Crime', value: dna.crime, fullMark: 100 },
    { genre: 'Fantasy', value: dna.fantasy, fullMark: 100 },
    { genre: 'Documentary', value: dna.documentary, fullMark: 100 },
    { genre: 'Thriller', value: dna.thriller, fullMark: 100 },
    { genre: 'Adventure', value: dna.adventure, fullMark: 100 },
    { genre: 'Horror', value: dna.horror, fullMark: 100 },
    { genre: 'Anime', value: dna.anime, fullMark: 100 },
    { genre: 'Music', value: dna.music, fullMark: 100 },
  ];

  const topData = allData.sort((a, b) => b.value - a.value).slice(0, 8);

  const chartData = showAll ? allData : topData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background-secondary/95 backdrop-blur-sm border border-accent-blue/20 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-text-primary font-medium">{payload[0].payload.genre}</p>
          <p className="text-accent-blue text-sm">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-secondary">Genre affinity scores based on your activity</p>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
        >
          {showAll ? 'Show Top 8' : 'Show All'}
        </button>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#1E2A3A" />
            <PolarAngleAxis
              dataKey="genre"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#6B7280', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="DNA"
              dataKey="value"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={1000}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.slice(0, 6).map((item) => (
          <div key={item.genre} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <div className="w-2 h-2 rounded-full bg-accent-blue" />
            <span>{item.genre}</span>
            <span className="text-accent-blue font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
