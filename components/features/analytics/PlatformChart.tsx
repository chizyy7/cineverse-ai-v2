'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PlatformChartProps {
  data: { name: string; hours: number; color: string }[];
}

export default function PlatformChart({ data }: PlatformChartProps) {
  const maxHours = Math.max(...data.map((d) => d.hours));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background-secondary/95 backdrop-blur-sm border border-accent-blue/20 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-text-primary font-medium">{item.name}</p>
          <p className="text-sm" style={{ color: item.color }}>
            {item.hours} hours
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-2xl p-6">
      <p className="text-sm text-text-secondary mb-4">Time spent on each platform</p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6B7280', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#1E2A3A' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#1E2A3A' }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
            <Bar
              dataKey="hours"
              radius={[0, 6, 6, 0]}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-accent-blue/10 flex items-center justify-between">
        <span className="text-sm text-text-secondary">Total Hours</span>
        <span className="text-lg font-bold text-accent-blue">
          {data.reduce((sum, d) => sum + d.hours, 0)}h
        </span>
      </div>
    </div>
  );
}
