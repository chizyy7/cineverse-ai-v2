'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Something Went Wrong | CineVerse AI',
  description: 'We encountered an unexpected error.',
};

export default function Error({
  reset,
  errorInfo,
}: {
  reset: () => void;
  errorInfo?: {
    digest?: string;
    componentStack?: string;
  };
}) {
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    // Log error to console or external service in production
    console.error('Unexpected error:', errorInfo);
  }, [errorInfo]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8"
      >
        <div className="w-24 h-24 mx-auto">
          <svg
            className="w-full h-full text-accent-coral/20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-primary">
          Something broke in the matrix
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          We encountered an unexpected error. Our team has been notified and
          is working to fix it.
        </p>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => reset()}
          >
            Try Again
          </Button>
          <Link
            href="/"
            className="flex items-center space-x-2 px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors"
          >
            ← Return to Home
          </Link>
        </div>

        {errorInfo?.digest && (
          <div className="mt-4 text-xs text-text-tertiary">
            Error ID: {errorInfo.digest}
          </div>
        )}
      </motion.div>
    </div>
  );
}