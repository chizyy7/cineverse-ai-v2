import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0F1E', // Main dark background
          secondary: '#111827', // Card backgrounds
          tertiary: '#1E2A3A', // Hover states
        },
        accent: {
          blue: '#3B82F6', // Primary CTA, links
          gold: '#F59E0B', // Premium, ratings, highlights
          coral: '#EF4444', // Warnings, remove actions
          success: '#10B981', // Completed, success states
          purple: '#8B5CF6', // Anime category
        },
        text: {
          primary: '#F9FAFB', // Main text
          secondary: '#9CA3AF', // Muted text
          tertiary: '#6B7280', // Placeholder text
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'], // Headings
        inter: ['Inter', 'sans-serif'], // Body
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          from: { boxShadow: '0 0 5px #3B82F6' },
          to: { boxShadow: '0 0 20px #3B82F6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;