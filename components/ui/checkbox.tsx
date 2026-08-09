'use client';

import * as React from 'react';

interface CheckboxProps {
  className?: string;
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ className, id, checked, onChange, disabled, ...props }, ref) => {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      ref={ref}
      className={`
        h-4 w-4 shrink-0
        border border-input
        bg-background
        rounded
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';