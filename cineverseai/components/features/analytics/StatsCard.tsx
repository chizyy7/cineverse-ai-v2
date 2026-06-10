'use client';

import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  negative?: boolean;
  neutral?: boolean;
}

export default function StatsCard({
  icon,
  label,
  value,
  change,
  positive,
  negative,
  neutral,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary/80 backdrop-blur-sm border border-accent-blue/10 rounded-xl p-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary mb-1">{value}</p>
      {change && (
        <p
          className={`text-xs ${
            positive
              ? 'text-accent-success'
              : negative
              ? 'text-accent-coral'
              : 'text-text-tertiary'
          }`}
        >
          {positive && '+'}
          {change}
        </p>
      )}
    </motion.div>
  );
}
