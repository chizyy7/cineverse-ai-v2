'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

export const Skeleton = ({
  width = '100%',
  height = '16px',
  radius = '4px',
  className = '',
}: SkeletonProps) => {
  return (
    <motion.div
      className={`bg-background-tertiary rounded ${radius} ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="h-full w-full bg-gradient-to-r from-background-tertiary via-accent-blue/10 to-background-tertiary bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
        style={{
          backgroundPosition: '-200% 0',
          backgroundSize: '200% 100%',
        }}
      />
    </motion.div>
  );
};

interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

export const SkeletonText = ({
  lines = 3,
  width = '100%',
  height = '16px',
  radius = '4px',
  className = '',
}: SkeletonTextProps) => {
  return (
    <div className={className} style={{ width }}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={`mb-2 ${index === lines - 1 ? 'mb-0' : ''}`}
          style={{ height, width }}
        >
          <Skeleton width={index === lines - 1 ? '60%' : '100%'} height={height} radius={radius} />
        </motion.div>
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  className?: string;
}

export const SkeletonCard = ({
  width = '100%',
  height = '200px',
  radius = '8px',
  className = '',
}: SkeletonCardProps) => {
  return (
    <motion.div
      className={`bg-background-tertiary rounded-xl overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <div style={{ height: '60%' }}>
        <Skeleton width='100%' height='100%' radius={radius} />
      </div>
      <div style={{ height: '40%', padding: '12px' }}>
        <SkeletonText lines={3} width='100%' height='16px' radius={radius} />
      </div>
    </motion.div>
  );
};