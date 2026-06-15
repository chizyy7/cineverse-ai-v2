export const ProblemSection = () => {
  return (
    <section className="py-20 bg-background-secondary">
      <div className="container mx-auto px-6">
        <h2 className="text-center font-outfit text-3xl md:text-4xl mb-12">
          You spend 30 minutes choosing what to watch.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Decision Fatigue */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-blue/10 rounded-xl flex items-center justify-center">
              {/* Placeholder for decision fatigue icon */}
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-outfit text-xl mb-3">Decision Fatigue</h3>
            <p className="text-secondary">
              Too many choices lead to paralysis. We spend endless time scrolling instead of watching.
            </p>
          </div>
          
          {/* Switching between apps */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-blue/10 rounded-xl flex items-center justify-center">
              {/* Placeholder for app switching icon */}
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-outfit text-xl mb-3">App Overload</h3>
            <p className="text-secondary">
              Jumping between Netflix, Spotify, Crunchyroll, and more kills the experience.
            </p>
          </div>
          
          {/* Generic recommendations */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-blue/10 rounded-xl flex items-center justify-center">
              {/* Placeholder for generic recommendations icon */}
              <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-outfit text-xl mb-3">Generic Suggestions</h3>
            <p className="text-secondary">
              One-size-fits-all algorithms miss your unique taste across different moods and genres.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};