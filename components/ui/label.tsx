'use client';

import * as React from 'react';

interface LabelProps {
  className?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

export const Label = React.forwardRef<
  HTMLLabelElement,
  LabelProps
>(({ className, htmlFor, children, ...props }, ref) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        text-sm font-medium text-primary
        ${className}
      `}
      {...props}
      ref={ref}
    >
      {children}
    </label>
  );
});
Label.displayName = 'Label';