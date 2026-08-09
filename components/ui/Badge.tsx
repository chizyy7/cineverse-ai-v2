'use client';

import * as React from 'react';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<
  HTMLSpanElement,
  BadgeProps
>(({ variant = 'default', className, children, ...props }, ref) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${variantClasses[variant || 'default']}
        ${className}
      `}
      {...props}
      ref={ref}
    >
      {children}
    </span>
  );
});
Badge.displayName = 'Badge';