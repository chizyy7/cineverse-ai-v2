'use client';

import * as React from 'react';

interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  className?: string;
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'default',
  className,
  asChild = false,
  children,
  onClick,
  type = 'button',
  disabled = false,
  ...props
}, ref) => {
  const variantClasses = {
    default: 'bg-accent-gold text-primary hover:bg-accent-gold/90',
    destructive: 'bg-accent-coral text-white hover:bg-accent-coral/90',
    outline: 'border border-accent-blue/20 hover:border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10',
    secondary: 'bg-background-secondary/50 text-primary hover:bg-accent-blue/10',
  };

  const baseClasses = `
    inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium
    transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
    ${variantClasses[variant || 'default']}
    ${className}
  `;

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ref: ref as React.Ref<any>,
      className: baseClasses,
      ...props,
    });
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
      className={baseClasses}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';