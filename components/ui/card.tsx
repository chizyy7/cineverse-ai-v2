'use client';

import * as React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const classes = `
      bg-background border border-accent-blue/20 rounded-xl
      ${className}
    `;

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    const classes = `
      flex flex-col space-y-2 pb-6
      ${className}
    `;

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'CardHeader';

interface CardContentProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    const classes = `
      flex flex-col space-y-4
      ${className}
    `;

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);
CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    const classes = `
      flex items-center space-x-2 pt-6
      ${className}
    `;

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    const classes = `
      text-2xl font-semibold text-primary
      ${className}
    `;

    return (
      <h2
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    const classes = `
      text-muted-foreground mt-2
      ${className}
    `;

    return (
      <p
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);
CardDescription.displayName = 'CardDescription';