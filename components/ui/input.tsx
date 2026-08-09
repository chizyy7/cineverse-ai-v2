'use client';

import * as React from 'react';

interface InputProps {
  className?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}

export const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ className, id, value, onChange, placeholder, required, disabled, type = 'text', ...props }, ref) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      ref={ref}
      className={`
        flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
        file:border-0 file:bg-transparent file:text-sm file:font-medium
        placeholder:text-input-placeholder
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
});
Input.displayName = 'Input';