'use client';

import * as React from 'react';
import { Badge } from './Badge';

interface PremiumBadgeProps {
  isPremium: boolean;
  className?: string;
}

export const PremiumBadge = React.forwardRef<
  HTMLSpanElement,
  PremiumBadgeProps
>(({ isPremium, className, ...props }, ref) => {
  return (
    <Badge
      variant={isPremium ? 'default' : 'secondary'}
      className={className}
      ref={ref}
      {...props}
    >
      {isPremium ? 'Premium' : 'Free'}
    </Badge>
  );
});

PremiumBadge.displayName = 'PremiumBadge';