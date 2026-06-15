import { motion } from 'framer-motion';

export const PricingSection = () => {
  return (
    <section className="py-20 bg-background-secondary">
      <div className="container mx-auto px-6">
        <h2 className="text-center font-outfit text-3xl md:text-4xl mb-16">
          Choose Your Plan
        </h2>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <motion.div
            key="free"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8"
          >
            <h3 className="font-outfit text-xl mb-4">Free Plan</h3>
            <p className="text-secondary mb-6">
              Perfect for getting started with personalized entertainment discovery.
            </p>
            
            <ul className="space-y-4 text-left">
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic AI recommendations
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Watchlists (up to 3 collections)
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ratings & reviews
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic analytics
              </li>
            </ul>
            
            <div className="mt-8">
              <a href="#" className="w-full flex items-center justify-center px-6 py-3 bg-transparent border border-accent-blue text-accent-blue rounded-lg font-medium hover:bg-accent-blue/10">
                Current plan
              </a>
            </div>
          </motion.div>
          
          {/* Premium Plan */}
          <motion.div
            key="premium"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-8 border-2 border-accent-gold hover:border-accent-gold/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-accent-gold/20 text-accent-gold px-3 py-1 rounded text-sm font-medium">Most Popular</span>
              <span className="text-accent-gold">Premium Plan</span>
            </div>
            <h3 className="font-outfit text-xl mb-4">$9.99/month</h3>
            <p className="text-secondary mb-6">
              Unlock the full CineVerse AI experience with advanced features.
            </p>
            
            <ul className="space-y-4 text-left">
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced AI recommendations (more personalized, cross-domain)
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited collections
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI Chat Assistant (unlimited messages)
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Deep analytics + monthly reports
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Entertainment DNA insights
              </li>
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Early access to new features
              </li>
            </ul>
            
            <div className="mt-8">
              <a href="#" className="w-full flex items-center justify-center px-6 py-3 bg-accent-gold/10 text-accent-gold rounded-lg font-medium hover:bg-accent-gold/20">
                Upgrade to Premium
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};