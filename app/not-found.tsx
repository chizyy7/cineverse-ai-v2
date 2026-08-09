'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Page Not Found | CineVerse AI',
  description: 'The page you\'re looking for doesn\'t exist.',
};

export default function NotFound() {
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
            className="w-full h-full text-accent-blue/20"
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
          Lost in the multiverse?
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          It seems you\'ve stumbled into a wormhole. The page you\'re looking for
          doesn\'t exist or has been shifted to another dimension.
        </p>

        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors"
          >
            ← Return to Home
          </Link>
          <Button variant="outline">
            Report Issue
          </Button>
        </div>

        <p className="text-text-tertiary">
          If you believe this is an error, please let us know so we can fix it.
        </p>
      </motion.div>
    </div>
  );
}