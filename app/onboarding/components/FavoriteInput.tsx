import { useState } from 'react';
import { motion } from 'framer-motion';

interface FavoriteInputProps {
  label: string;
  placeholder: string;
  max: number;
  value: string[];
  onChange: (value: string[]) => void;
}

export const FavoriteInput = ({ label, placeholder, max, value, onChange }: FavoriteInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed) && value.length < max) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <label className="block text-sm font-medium text-primary mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
        />
        {/* Search icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-blue/50 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 10.5a6 6 0 100-8.49 6 6 0 000 8.49z" />
          </svg>
        </div>
        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim() || value.length >= max || value.includes(inputValue.trim())}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-accent-blue/10 text-accent-blue rounded hover:bg-accent-blue/20 transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </div>
      
      {/* Selected items as chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {value.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-accent-blue/20 text-accent-blue rounded-full"
          >
            <span>{item}</span>
            <button
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="text-accent-blue/50 hover:text-accent-blue hover:underline"
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </motion.div>
        ))}
        {/* Show remaining slots if not full */}
        {value.length < max && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: value.length * 0.05 }}
            className="flex items-center space-x-2 px-3 py-1.5 bg-background-tertiary/50 text-accent-blue/50 rounded-full"
          >
            <span className="italic">Add more ({max - value.length} left)</span>
          </motion.div>
        )}
      </div>
      
      {/* Hint text */}
      <p className="text-xs text-secondary mt-1">
        {value.length >= max 
          ? `Maximum of ${max} ${label.toLowerCase()} reached` 
          : `You can add up to ${max} ${label.toLowerCase()}`}
      </p>
    </motion.div>
  );
};