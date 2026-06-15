'use client';

interface StarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  max?: number;
}

const SIZE_MAP = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function Stars({ rating, size = 'sm', max = 5 }: StarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <svg
            key={i}
            className={`${SIZE_MAP[size]} ${filled || half ? 'text-accent-gold' : 'text-text-tertiary'}`}
            viewBox="0 0 20 20"
            fill={filled ? 'currentColor' : half ? 'url(#half)' : 'none'}
            stroke="currentColor"
            strokeWidth={1}
          >
            <defs>
              <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
          </svg>
        );
      })}
    </div>
  );
}
