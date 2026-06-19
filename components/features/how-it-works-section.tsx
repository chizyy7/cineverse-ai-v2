'use client';

import { motion } from 'framer-motion';

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background-secondary">
      <div className="container mx-auto px-6">
        <h2 className="text-center font-outfit text-3xl md:text-4xl mb-16">
          How It Works
        </h2>
        
        <div className="relative h-96">
          {/* Animated connecting lines */}
          <div className="absolute inset-0">
            <div className="h-0.5 w-full bg-accent-blue/20"></div>
            {/* Dots for connection points */}
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-0.5 w-4 h-4 bg-accent-blue rounded-full"></div>
            <div className="absolute left-1/3 -translate-x-1/2 -translate-y-0.5 w-4 h-4 bg-accent-blue rounded-full"></div>
            <div className="absolute right-1/3 -translate-x-1/2 -translate-y-0.5 w-4 h-4 bg-accent-blue rounded-full"></div>
          </div>
          
          {/* Steps */}
          <div className="relative z-10 flex flex-col md:flex-row md:space-x-12 items-center">
            {/* Step 1 */}
            <motion.div
              key="step1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center flex-1 space-y-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-accent-blue/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-9 3a2 2 0 110-4 2 2 0 000 4zm12 3a2 2 0 110-4 2 2 0 000 4zM5 8h14" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl">Build your DNA</h3>
              <p className="text-secondary">
                Tell us what you love across movies, anime, TV, music, and podcasts.
              </p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div
              key="step2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center flex-1 space-y-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-accent-blue/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0-2C6.477 6 2 10.477 2 16s4.477 10 10 10 10-4.477 10-10S17.523 6 12 6zm0 12c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl">Get AI recommendations</h3>
              <p className="text-secondary">
                Our AI analyzes your DNA and serves personalized suggestions with match scores.
              </p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div
              key="step3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center flex-1 space-y-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-accent-blue/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl">Discover across platforms</h3>
              <p className="text-secondary">
                One-click to watch on Netflix, Spotify, Crunchyroll, and more.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};